import fs from 'fs';
import path from 'path';

const htmlPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\d8a0c82b-5177-46a1-940b-a31fcc62cb22\\.system_generated\\steps\\2852\\content.md';
const content = fs.readFileSync(htmlPath, 'utf8');

const regex = /<section class="_a6-g"[^>]*>.*?<video src="([^"]+)".*?<div class="_3-95">([\s\S]*?)<\/div>.*?<div class="_a72d">([^<]+)<\/div>/g;

const monthsMap = {
  'ม.ค.': '01',
  'ก.พ.': '02',
  'มี.ค.': '03',
  'เม.ย.': '04',
  'พ.ค.': '05',
  'มิ.ย.': '06',
  'ก.ค.': '07',
  'ส.ค.': '08',
  'ก.ย.': '09',
  'ต.ค.': '10',
  'พ.ย.': '11',
  'ธ.ค.': '12'
};

function convertDate(thaiDateStr) {
  // Example: "มิ.ย. 07, 2024 3:55:07 pm"
  const cleaned = thaiDateStr.trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return '';
  const monthThai = parts[0].replace(',', '');
  const day = parts[1].replace(',', '').padStart(2, '0');
  const yearGregorian = parseInt(parts[2], 10);
  
  const month = monthsMap[monthThai] || '01';
  const yearBuddhist = yearGregorian + 543;
  
  return `${yearBuddhist}-${month}-${day}`;
}

const mediaItems = [];
let match;
let id = 100; // start at 100 to avoid clash with existing items

while ((match = regex.exec(content)) !== null) {
  const videoPath = match[1].replace(/&#039;/g, "'");
  const fullText = match[2].trim();
  const dateStr = match[3].trim();
  
  // Title is the first line of text (split by | or newline, then clean hashtags)
  const lines = fullText.split('\n');
  let title = lines[0].split('|')[0].trim();
  
  // Remove trailing hashtag lines or clean title if it has hashtag
  title = title.replace(/#[a-zA-Z0-9ก-๙]+/g, '').trim();
  if (title.endsWith('|')) {
    title = title.slice(0, -1).trim();
  }
  
  // Channel or teacher from the title
  let teacher = 'Talib Club';
  if (lines[0].includes('|')) {
    const parts = lines[0].split('|');
    const teacherPart = parts[1].trim();
    // remove hashtags from teacher
    teacher = teacherPart.replace(/#[a-zA-Z0-9ก-๙]+/g, '').trim();
  }
  
  const formattedDate = convertDate(dateStr);
  
  mediaItems.push({
    id: id++,
    type: 'video',
    title: title,
    channel: teacher,
    duration: '',
    embedId: '',
    spotifyUrl: '',
    videoUrl: '/' + videoPath, // prefix with / for absolute public routing
    series: 'คลิปสั้น',
    date: formattedDate
  });
}

// Sort items by date descending (Buddhist dates are sorted alphabetically)
mediaItems.sort((a, b) => b.date.localeCompare(a.date));

// Save to JSON
fs.writeFileSync('C:\\Users\\HP\\Documents\\GitHub\\talib-club\\scripts\\parsed_reels.json', JSON.stringify(mediaItems, null, 2), 'utf8');
console.log(`Successfully parsed ${mediaItems.length} reels and saved to scripts/parsed_reels.json`);
