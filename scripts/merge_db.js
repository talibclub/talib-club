import fs from 'fs';
import path from 'path';

// Months mapping
const monthsMap = {
  'มค': '01',
  'กพ': '02',
  'มีค': '03',
  'เมย': '04',
  'พค': '05',
  'มิย': '06',
  'กค': '07',
  'สค': '08',
  'กย': '09',
  'ตค': '10',
  'พย': '11',
  'ธค': '12'
};

function convertDate(thaiDateStr) {
  if (!thaiDateStr) return '';
  const cleaned = thaiDateStr.trim().replace(',', '');
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return '';
  
  const monthThai = parts[0].replace(/\./g, '');
  const month = monthsMap[monthThai] || '01';
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

function parseHtmlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sections = content.split('<section class="_a6-g">');
  sections.shift(); // remove header part
  
  const parsedItems = [];
  
  for (const sec of sections) {
    // Image URL
    const imgMatch = sec.match(/<a target="_blank" href="([^"]+)"|<img src="([^"]+)"/);
    let coverUrl = '';
    if (imgMatch) {
      const rawUrl = imgMatch[1] || imgMatch[2];
      coverUrl = '/' + cleanHtmlEntities(rawUrl);
    }
    
    // Body Text
    const textMatch = sec.match(/<div class="_3-95">([\s\S]*?)<\/div>/);
    let bodyText = '';
    if (textMatch) {
      bodyText = cleanHtmlEntities(textMatch[1].trim());
    }
    
    // Date
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
        date: formattedDate
      });
    }
  }
  
  return parsedItems;
}

// Extract title helper for books and journals
function extractTitle(bodyText, isBook) {
  const quoteMatch = bodyText.match(/(?:หนังสือ|วารสาร|ชื่อวารสารว่า|ชื่อหนังสือว่า)\s*["“'‘&](?:quot;)?([^"“”'’&\n]+)/i);
  if (quoteMatch) {
    let title = quoteMatch[1].trim();
    title = title.replace(/^(?:quot;)|^(?:amp;)|["“”'’&]+$/g, '').trim();
    title = title.replace(/&quot;/g, '').replace(/&#039;/g, "'").trim();
    if (title) return title;
  }
  
  const hashtags = (bodyText.match(/#[^\s#]+/g) || []).map(h => h.slice(1).trim());
  const genericTags = [
    "วารสารอัซซอลิฮีน", "หนังสือน่าอ่าน", "talib", "talibclub", "islam", 
    "muslim", "salafi", "salafithailand", "ศาสนาอิสลาม", "มุสลิม", 
    "ซะลาฟีย์", "แนวทางสลัฟ", "แนวทางสะลัฟ", "สะลัฟ", "สลัฟ", 
    "ซีรีย์เตาฮีด", "ซีรีย์บาปใหญ่", "อัตตัซกียะฮฺ"
  ];
  
  const specificHashtags = hashtags.filter(h => !genericTags.includes(h.toLowerCase()));
  if (specificHashtags.length > 0) {
    return specificHashtags[0];
  }
  
  const lines = bodyText.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('📕') && !l.startsWith('❝') && !l.startsWith('ดาวน์โหลด') && !l.startsWith('อ่านได้ที่') && !l.startsWith('________________'));
  if (lines.length > 0) {
    return lines[0];
  }
  
  return isBook ? "หนังสือน่าอ่าน" : "วารสารอัซซอลิฮีน";
}

// -------------------------------------------------------------
// 1. MERGE MEDIA (REELS)
// -------------------------------------------------------------
console.log("Processing Media...");
import { MEDIA } from '../src/data/media.js';
const parsedReels = JSON.parse(fs.readFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_reels.json', 'utf8'));

// Filter out duplicates (if any) and append
const existingMediaIds = new Set(MEDIA.map(m => m.id));
const newReels = parsedReels.filter(r => !existingMediaIds.has(r.id));
const mergedMedia = [...MEDIA, ...newReels];

const mediaContent = `// ============================================================
//  TALIB CLUB — ข้อมูลมีเดีย (YouTube / Spotify / คลิปสั้น)
// ============================================================

export const MEDIA = ${JSON.stringify(mergedMedia, null, 2)};
`;
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/src/data/media.js', mediaContent, 'utf8');
console.log(`Media merged: Total media items = ${mergedMedia.length}`);

// -------------------------------------------------------------
// 2. MERGE ARTICLES (TAZKIYAH, KABAIR, TAWHEED)
// -------------------------------------------------------------
console.log("Processing Articles...");
import { ARTICLES, SERIES, ARTICLE_CATEGORIES, ARTICLE_TYPES } from '../src/data/articles.js';

// Parse raw articles HTML files
const rawTazkiyah = parseHtmlFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/21.html');
const rawKabair = parseHtmlFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/11.html');
const rawTawheed = parseHtmlFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/22.html');

const mergedSeries = [...SERIES];
const seriesMap = {
  tazkiyah: "อัตตัซกียะฮฺ",
  kabair: "บาปใหญ่",
  tawheed: "เตาฮีด"
};

// Add new series if not present
Object.entries(seriesMap).forEach(([id, name]) => {
  if (!mergedSeries.some(s => s.id === id)) {
    mergedSeries.push({ id, name });
  }
});

let articleIdCounter = Math.max(...ARTICLES.map(a => a.id), 0) + 1;
if (articleIdCounter < 10) articleIdCounter = 10; // start new ones from 10

const newArticles = [];

// Process Tazkiyah (6 items)
const tazkiyahTeachers = {
  1: "ชัยค์อับดุลมุฮฺซิน อัลอับบาด",
  2: "ชัยค์ศอลิฮฺ อัลเฟาซาน",
  3: "ชัยค์มูฮัมหมัด บิน ฮาดี",
  4: "ชัยค์เซด อัลมัดคอลีย์",
  5: "ชัยค์อุษัยมีน",
  6: "ชัยค์อุบัยด์ อัลญาบีรีย์"
};

rawTazkiyah.forEach((item, index) => {
  const bodyText = item.bodyText;
  const partMatch = bodyText.match(/ตอนที่\s*(\d+)/i) || bodyText.match(/EP\s*(\d+)/i);
  const part = partMatch ? parseInt(partMatch[1], 10) : (index + 1);
  const teacher = tazkiyahTeachers[part] || "ผู้รู้สลัฟ";
  
  const title = `ใบรับรองจากผู้รู้ จำเป็นก่อนจะทำการสอนและดะวะฮฺหรือไม่? (${teacher})`;
  const excerpt = bodyText.split('\n').filter(l => l.trim() && !l.includes('อัตตัซกียะฮฺ')).slice(0, 2).join(' ').slice(0, 150) + '...';
  const readTime = Math.ceil(bodyText.length / 500);

  newArticles.push({
    id: articleIdCounter++,
    type: "series",
    seriesId: "tazkiyah",
    seriesName: "",
    part,
    title,
    category: "aqeedah",
    excerpt,
    author: "Talib Club",
    date: item.date || "2567-01-01",
    readTime,
    coverEmoji: "📖",
    coverUrl: item.coverUrl,
    tags: ["อัตตัซกียะฮฺ", "ความรู้", "ดะวะฮ์"],
    body: bodyText
  });
});

// Process Major Sins (3 items)
const kabairTitles = {
  1: "ชีริก (การตั้งภาคีต่อพระองค์อัลลอฮ์)",
  2: "การฆ่าผู้อื่น",
  3: "ไสยศาสตร์"
};

rawKabair.forEach((item, index) => {
  const bodyText = item.bodyText;
  const partMatch = bodyText.match(/EP\.?\s*(\d+)/i) || bodyText.match(/บาปใหญ่ที่\s*(\d+)/i);
  const part = partMatch ? parseInt(partMatch[1], 10) : (index + 1);
  const title = kabairTitles[part] || "บาปใหญ่";
  
  const excerpt = bodyText.split('\n').filter(l => l.trim() && !l.includes('Al-Kabair') && !l.includes('บาปใหญ่')).slice(0, 2).join(' ').slice(0, 150) + '...';
  const readTime = Math.ceil(bodyText.length / 500);

  newArticles.push({
    id: articleIdCounter++,
    type: "series",
    seriesId: "kabair",
    seriesName: "",
    part,
    title,
    category: "aqeedah",
    excerpt,
    author: "Talib Club",
    date: item.date || "2566-01-01",
    readTime,
    coverEmoji: "⚠️",
    coverUrl: item.coverUrl,
    tags: ["บาปใหญ่", "อากีดะฮ์", "ศีลธรรม"],
    body: bodyText
  });
});

// Process Tawheed (14 items)
rawTawheed.forEach((item, index) => {
  const bodyText = item.bodyText;
  const firstLine = bodyText.split('\n')[0].trim();
  const epMatch = firstLine.match(/Ep\.?\s*(\d+)/i);
  const part = epMatch ? parseInt(epMatch[1], 10) : (index + 1);
  
  const hashtagMatch = bodyText.match(/#([^\n\s#]+)/);
  const title = hashtagMatch ? hashtagMatch[1].trim() : 'เตาฮีดเบื้องต้น';
  
  const excerpt = bodyText.split('\n').filter(l => l.trim() && !l.includes('Tawheed')).slice(0, 2).join(' ').slice(0, 150) + '...';
  const readTime = Math.ceil(bodyText.length / 500);

  newArticles.push({
    id: articleIdCounter++,
    type: "series",
    seriesId: "tawheed",
    seriesName: "",
    part,
    title,
    category: "aqeedah",
    excerpt,
    author: "Talib Club",
    date: item.date || "2566-01-01",
    readTime,
    coverEmoji: "🕌",
    coverUrl: item.coverUrl,
    tags: ["เตาฮีด", "อากีดะฮ์", "ศรัทธา"],
    body: bodyText
  });
});

// Merge and save articles
const mergedArticles = [...ARTICLES];
newArticles.forEach(na => {
  // avoid duplicates by checking combination of seriesId and part
  if (!mergedArticles.some(a => a.seriesId === na.seriesId && a.part === na.part)) {
    mergedArticles.push(na);
  }
});

const articlesContent = `// ============================================================
//  TALIB CLUB — ข้อมูลบทความ
// ============================================================

export const ARTICLE_CATEGORIES = ${JSON.stringify(ARTICLE_CATEGORIES, null, 2)};

export const ARTICLE_TYPES = ${JSON.stringify(ARTICLE_TYPES, null, 2)};

export const SERIES = ${JSON.stringify(mergedSeries, null, 2)};

export const ARTICLES = ${JSON.stringify(mergedArticles, null, 2)};
`;
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/src/data/articles.js', articlesContent, 'utf8');
console.log(`Articles merged: Total articles = ${mergedArticles.length}`);

// -------------------------------------------------------------
// 3. MERGE BOOKS & JOURNALS (18.html, 20.html)
// -------------------------------------------------------------
console.log("Processing Books & Library...");
import { BOOKS, BOOK_TYPES } from '../src/data/books.js';

const rawJournals = parseHtmlFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/18.html');
const rawBooks = parseHtmlFile('C:/Users/HP/Documents/GitHub/talib-club/scripts/20.html');

let bookIdCounter = Math.max(...BOOKS.map(b => b.id), 0) + 1;
if (bookIdCounter < 10) bookIdCounter = 10; // start new ones from 10

const newBooksList = [];

// Helper to determine book/journal category
function determineCategory(bodyText, title) {
  const text = (bodyText + ' ' + title).toLowerCase();
  if (text.includes('บิดอะห์') || text.includes('บิดอะฮ์') || text.includes('อากีดะฮ์') || text.includes('อากีดะฮฺ') || text.includes('เตาฮีด') || text.includes('ชิรกฺ') || text.includes('ชีริก') || text.includes('วะฮาบีย์') || text.includes('อะกีดะฮฺ') || text.includes('ศรัทธา') || text.includes('พระเจ้า') || text.includes('ฏอฆูต') || text.includes('หลักศรัทธา')) {
    return 'อากีดะฮ์';
  }
  if (text.includes('ฟิกฮ์') || text.includes('ฟิกฮฺ') || text.includes('นิกะฮ์') || text.includes('นิกะฮฺ') || text.includes('ฮุก่ม') || text.includes('กฎหมาย') || text.includes('ละหมาดอีด') || text.includes('ละหมาด')) {
    return 'ฟิกฮ์';
  }
  if (text.includes('ประวัติศาสตร์') || text.includes('ไทม์ไลน์') || text.includes('ชีวประวัต')) {
    return 'ประวัติศาสตร์';
  }
  if (text.includes('ดุอาอ์') || text.includes('อิบาดะฮ์') || text.includes('อิบาดะฮฺ')) {
    return 'อิบาดะฮ์';
  }
  if (text.includes('สตรี') || text.includes('สังคม') || text.includes('การเมือง') || text.includes('ประชาธิปไตย') || text.includes('รักร่วมเพศ') || text.includes('สมัยใหม่')) {
    return 'สังคมศาสตร์';
  }
  return 'ทั่วไป';
}

// Process Journals
rawJournals.forEach((item) => {
  const bodyText = item.bodyText;
  const title = extractTitle(bodyText, false);
  const authorMatch = bodyText.match(/(?:เขียนโดย|เรียบเรียงโดย|จัดทำโดย|แปลโดย)\s*:\s*([^\n]+)/);
  const author = authorMatch ? authorMatch[1].trim() : "Talib Club";
  
  // Extract download link
  let fileUrl = '#';
  const driveMatch = bodyText.match(/(?:ดาวน์โหลดได้ที่|โหลดอ่านได้ที่|อ่านได้ที่|ไฟล์ PDF ได้ที่)\s*:\s*(https?:\/\/[^\s]+)/);
  if (driveMatch) {
    fileUrl = driveMatch[1].trim();
  } else {
    const urlMatch = bodyText.match(/https?:\/\/[^\s]+/);
    if (urlMatch) fileUrl = urlMatch[0].trim();
  }

  const category = determineCategory(bodyText, title);
  const year = item.date ? parseInt(item.date.split('-')[0], 10) : 2566;
  const desc = bodyText.split('\n').filter(l => l.trim() && !l.includes('วารสารอัซซอลิฮีน') && !l.startsWith('โหลดอ่าน') && !l.startsWith('ดาวน์โหลด')).slice(0, 3).join(' ').slice(0, 200) + '...';

  newBooksList.push({
    id: bookIdCounter++,
    title,
    author,
    type: "วารสาร",
    category,
    year,
    desc,
    fileUrl,
    coverUrl: item.coverUrl,
    isNew: false
  });
});

// Process Books
rawBooks.forEach((item) => {
  const bodyText = item.bodyText;
  const title = extractTitle(bodyText, true);
  const authorMatch = bodyText.match(/(?:เขียนโดย|เรียบเรียงโดย|จัดทำโดย|แปลโดย)\s*:\s*([^\n]+)/);
  const author = authorMatch ? authorMatch[1].trim() : "Talib Club";
  
  let fileUrl = '#';
  const driveMatch = bodyText.match(/(?:ดาวน์โหลดได้ที่|โหลดอ่านได้ที่|อ่านได้ที่|ไฟล์ PDF ได้ที่)\s*:\s*(https?:\/\/[^\s]+)/);
  if (driveMatch) {
    fileUrl = driveMatch[1].trim();
  } else {
    const urlMatch = bodyText.match(/https?:\/\/[^\s]+/);
    if (urlMatch) fileUrl = urlMatch[0].trim();
  }

  const category = determineCategory(bodyText, title);
  const year = item.date ? parseInt(item.date.split('-')[0], 10) : 2565;
  const desc = bodyText.split('\n').filter(l => l.trim() && !l.includes('หนังสือน่าอ่าน') && !l.startsWith('โหลดอ่าน') && !l.startsWith('ดาวน์โหลด')).slice(0, 3).join(' ').slice(0, 200) + '...';

  newBooksList.push({
    id: bookIdCounter++,
    title,
    author,
    type: "หนังสือ",
    category,
    year,
    desc,
    fileUrl,
    coverUrl: item.coverUrl,
    isNew: false
  });
});

// Merge and save books
const mergedBooks = [...BOOKS];
newBooksList.forEach(nb => {
  // Avoid duplicate books by title
  if (!mergedBooks.some(b => b.title.toLowerCase() === nb.title.toLowerCase())) {
    mergedBooks.push(nb);
  }
});

const booksContent = `// ============================================================
//  TALIB CLUB — ข้อมูลห้องสมุด
// ============================================================

export const BOOK_TYPES = ${JSON.stringify(BOOK_TYPES, null, 2)};

export const BOOKS = ${JSON.stringify(mergedBooks, null, 2)};
`;
fs.writeFileSync('C:/Users/HP/Documents/GitHub/talib-club/src/data/books.js', booksContent, 'utf8');
console.log(`Library merged: Total books/journals = ${mergedBooks.length}`);
console.log("Done!");
