import fs from 'fs';
import path from 'path';

// Concurrency limit helper
async function pLimit(concurrency, items, fn) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// Extract benefits from HTML string
function extractBenefitsFromHtml(html) {
  const benefits = [];
  const startIdx = html.indexOf('Benefits of the Verses on this page:');
  if (startIdx === -1) return benefits;

  // We find the block containing the list items
  const blockStart = html.indexOf('<div class="my-3"><b>Benefits of the Verses on this page:</b></div>', startIdx - 100);
  if (blockStart === -1) return benefits;

  // Let's find the closing tag for the main container or search for individual benefits
  const endIdx = html.indexOf('</div>\n                                                        <div class="surah_name_container', blockStart);
  const blockHtml = html.substring(blockStart, endIdx !== -1 ? endIdx : blockStart + 20000);

  // Parse step-by-step to be robust
  const rtlRegex = /<div class="rtl text-info">([\s\S]*?)<\/div>/g;
  let match;
  while ((match = rtlRegex.exec(blockHtml)) !== null) {
    const arabic = match[1].trim();
    
    // Find the next aligner div after this index
    const searchFrom = rtlRegex.lastIndex;
    const alignerIndex = blockHtml.indexOf('<div class="aligner">', searchFrom);
    if (alignerIndex !== -1 && alignerIndex - searchFrom < 500) {
      const spanStart = blockHtml.indexOf('<span>', alignerIndex);
      const spanEnd = blockHtml.indexOf('</span>', spanStart);
      if (spanStart !== -1 && spanEnd !== -1) {
        let thai = blockHtml.substring(spanStart + 6, spanEnd).trim();
        // Clean bullet from Thai if present
        if (thai.startsWith('•')) {
          thai = thai.substring(1).trim();
        }
        benefits.push({ arabic, thai });
      }
    }
  }
  return benefits;
}

// Fetch helper with retry
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      console.warn(`[Retry ${i + 1}/${retries}] Failed to fetch ${url}: ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function scrapeSurah(sura) {
  console.log(`[Start] Surah ${sura}...`);
  const mainUrl = `https://quranenc.com/en/browse/thai_mokhtasar/${sura}`;
  let html;
  try {
    html = await fetchWithRetry(mainUrl);
  } catch (err) {
    console.error(`[Error] Failed to fetch Surah ${sura} main page:`, err.message);
    return { sura, benefits: [] };
  }

  // Parse page 1 benefits
  let benefits = extractBenefitsFromHtml(html);
  
  // Find subpage links
  const subpageLinks = new Set();
  const subpageRegex = new RegExp(`href="https://quranenc\\.com/en/browse/thai_mokhtasar/${sura}-(\\d+)"`, 'g');
  let match;
  while ((match = subpageRegex.exec(html)) !== null) {
    subpageLinks.add(parseInt(match[1]));
  }

  const subpages = Array.from(subpageLinks).sort((a, b) => a - b);
  console.log(`Surah ${sura} has subpages:`, subpages);

  if (subpages.length > 0) {
    // Fetch all subpages concurrently (concurrency 3 for subpages of this surah)
    await pLimit(3, subpages, async (page) => {
      const subUrl = `https://quranenc.com/en/browse/thai_mokhtasar/${sura}-${page}`;
      try {
        const subHtml = await fetchWithRetry(subUrl);
        const subBenefits = extractBenefitsFromHtml(subHtml);
        
        // Add only unique benefits (by Arabic text)
        subBenefits.forEach(sb => {
          if (!benefits.some(b => b.arabic === sb.arabic)) {
            benefits.push(sb);
          }
        });
      } catch (err) {
        console.error(`[Error] Failed to fetch Surah ${sura} Page ${page}:`, err.message);
      }
    });
  }

  console.log(`[Done] Surah ${sura}: Found ${benefits.length} benefits.`);
  return { sura, benefits };
}

async function run() {
  const suras = Array.from({ length: 114 }, (_, i) => i + 1);
  const allResults = {};

  console.log("Starting full benefits scraping for Surahs 1-114...");
  
  // Scrape Surahs with concurrency limit of 5
  await pLimit(5, suras, async (sura) => {
    const res = await scrapeSurah(sura);
    allResults[sura] = res.benefits;
  });

  const outPath = 'C:/Users/HP/Documents/GitHub/talib-club/src/data/quranBenefits.json';
  fs.writeFileSync(outPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`Scraping complete! Saved all benefits to ${outPath}`);
}

run();
