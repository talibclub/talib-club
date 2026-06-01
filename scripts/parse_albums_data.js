import fs from 'fs';
import path from 'path';

const monthsMap = {
  'ม.ค': '01', 'ม.ค.': '01',
  'ก.พ': '02', 'ก.พ.': '02',
  'มี.ค': '03', 'มี.ค.': '03',
  'เม.ย': '04', 'เม.ย.': '04',
  'พ.ค': '05', 'พ.ค.': '05',
  'มิ.ย': '06', 'มิ.ย.': '06',
  'ก.ค': '07', 'ก.ค.': '07',
  'ส.ค': '08', 'ส.ค.': '08',
  'ก.ย': '09', 'ก.ย.': '09',
  'ต.ค': '10', 'ต.ค.': '10',
  'พ.ย': '11', 'พ.ย.': '11',
  'ธ.ค': '12', 'ธ.ค.': '12'
};

function convertDate(thaiDateStr) {
  if (!thaiDateStr) return '';
  const cleaned = thaiDateStr.trim().replace(',', '');
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return '';
  
  const monthThai = parts[0].replace('.', '');
  // Try with dot and without dot
  const month = monthsMap[monthThai] || monthsMap[monthThai + '.'] || '01';
  const day = parts[1].padStart(2, '0');
  const yearGregorian = parseInt(parts[2], 10);
  if (isNaN(yearGregorian)) return '';
  const yearBuddhist = yearGregorian + 543;
  
  return `${yearBuddhist}-${month}-${day}`;
}

function cleanHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // split into sections
  const sections = content.split('<section class="_a6-g">');
  // first part before first section is the page header, ignore
  sections.shift();
  
  const parsedItems = [];
  
  for (const sec of sections) {
    // Extract image URL
    // Format: <a target="_blank" href="this_profile&#039;s_activity_across_facebook/posts/media/..."><img src="..." /></a>
    const imgMatch = sec.match(/<a target="_blank" href="([^"]+)"|<img src="([^"]+)"/);
    let coverUrl = '';
    if (imgMatch) {
      const rawUrl = imgMatch[1] || imgMatch[2];
      coverUrl = '/' + cleanHtmlEntities(rawUrl);
    }
    
    // Extract text content inside class "_3-95"
    const textMatch = sec.match(/<div class="_3-95">([\s\S]*?)<\/div>/);
    let bodyText = '';
    if (textMatch) {
      bodyText = cleanHtmlEntities(textMatch[1].trim());
    }
    
    // Extract date
    // Usually inside the footer, e.g. <div class="_a72d">พ.ค. 24, 2023 7:12:54 pm</div>
    // Let's search specifically for the date inside the footer element
    const footerMatch = sec.match(/<footer class="_3-94 _a6-o">.*?<div class="_a72d">([^<]+)<\/div>.*?<\/footer>/s);
    let dateStr = '';
    if (footerMatch) {
      dateStr = footerMatch[1].trim();
    } else {
      const altMatch = sec.match(/<div class="_a72d">([^<]+)<\/div>/);
      if (altMatch) {
        dateStr = altMatch[1].trim();
      }
    }
    
    const formattedDate = convertDate(dateStr);
    
    if (bodyText) {
      parsedItems.push({
        coverUrl,
        bodyText,
        rawDate: dateStr,
        date: formattedDate
      });
    }
  }
  
  return parsedItems;
}

// 1. Parse Tazkiyah (21.html)
const tazkiyahItems = parseFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/21.html');
console.log(`Parsed ${tazkiyahItems.length} Tazkiyah items`);

// 2. Parse Major Sins (11.html)
const kabairItems = parseFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/11.html');
console.log(`Parsed ${kabairItems.length} Kabair items`);

// 3. Parse Tawheed (22.html)
const tawheedItems = parseFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/22.html');
console.log(`Parsed ${tawheedItems.length} Tawheed items`);

// 4. Parse Journals (18.html)
const journalItems = parseFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/18.html');
console.log(`Parsed ${journalItems.length} Journal items`);

// 5. Parse Recommended Books (20.html)
const bookItems = parseFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/20.html');
console.log(`Parsed ${bookItems.length} Book items`);

// Save temporary JSONs for verification
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_tazkiyah.json', JSON.stringify(tazkiyahItems, null, 2), 'utf8');
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_kabair.json', JSON.stringify(kabairItems, null, 2), 'utf8');
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_tawheed.json', JSON.stringify(tawheedItems, null, 2), 'utf8');
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_journals.json', JSON.stringify(journalItems, null, 2), 'utf8');
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_books.json', JSON.stringify(bookItems, null, 2), 'utf8');
