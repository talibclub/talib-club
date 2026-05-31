import fs from 'fs';

const rawText = fs.readFileSync('C:/Users/HP/.gemini/antigravity/scratch/user_scholars_list.txt', 'utf8');
const lines = rawText.split(/[\r\n,;]+/);

const prefixRegex = /^[.\-\s]*\b(Imam|Shaykh|Alamah|Mufti|Alama|Iman|Caliph|Saint|Dr|Dr\.|Professor|Molana|Shayk|Alama|Caliph)\b\s+/i;
const dateRegex = /\s*\(?(d\.?\s*)?\d{3,4}\s*[-–]\s*\d{3,4}\s*(H|AH|G|CE)?\)?/i;
const singleDateRegex = /\s*\(?(d\.?\s*)?\d{3,4}\s*(H|AH|G|CE)?\)?/i;

console.log("Analyzing first 30 parsed items:");
let count = 0;
lines.forEach((line) => {
  let cleaned = line.trim();
  if (!cleaned) return;
  
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(prefixRegex, '');
  } while (cleaned !== prev);
  
  const dateMatch = cleaned.match(dateRegex);
  const singleDateMatch = cleaned.match(singleDateRegex);
  
  let parsedBirthYear = null;
  let parsedDeathYear = null;
  let isHijri = true;
  
  if (dateMatch) {
    const years = dateMatch[0].match(/\d{3,4}/g);
    if (years && years.length >= 2) {
      parsedBirthYear = parseInt(years[0]);
      parsedDeathYear = parseInt(years[1]);
      if (dateMatch[0].toLowerCase().includes('g') || dateMatch[0].toLowerCase().includes('ce')) {
        isHijri = false;
      }
    }
  } else if (singleDateMatch) {
    const year = singleDateMatch[0].match(/\d{3,4}/);
    if (year) {
      parsedDeathYear = parseInt(year[0]);
      if (singleDateMatch[0].toLowerCase().includes('g') || singleDateMatch[0].toLowerCase().includes('ce')) {
        isHijri = false;
      }
    }
  }
  
  let era = 4;
  if (isHijri) {
    if (parsedDeathYear) {
      const toCE = (ah) => Math.round(ah / 1.03 + 622);
      const ceDeath = toCE(parsedDeathYear);
      if (ceDeath <= 900) era = 1;
      else if (ceDeath <= 1500) era = 2;
      else if (ceDeath <= 1800) era = 3;
      else era = 4;
    }
  }
  
  cleaned = cleaned.replace(dateRegex, '').replace(singleDateRegex, '').trim();
  
  if (count < 30) {
    console.log({
      raw: line.trim().slice(0, 50),
      cleaned,
      parsedBirthYear,
      parsedDeathYear,
      isHijri,
      era
    });
    count++;
  }
});
