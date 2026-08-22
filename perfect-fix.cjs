const fs = require('fs');

const cleanCode = fs.readFileSync('clean22.jsx', 'utf8');
const currCode = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');

const thaiRegex = /[^\x00-\x7F]+/g;
const cleanLines = cleanCode.replace(/\r/g, '').split('\n');

let fixedCode = currCode.replace(/\r/g, '');

let matchCount = 0;

for (let i = 0; i < cleanLines.length; i++) {
  const line = cleanLines[i];
  const match = line.match(thaiRegex);
  
  if (match) {
    let firstIdx = -1;
    let lastIdx = -1;
    for (let c = 0; c < line.length; c++) {
      if (line.charCodeAt(c) > 127) {
        if (firstIdx === -1) firstIdx = c;
        lastIdx = c;
      }
    }
    
    const cleanPhrase = line.substring(firstIdx, lastIdx + 1);
    let prefix = line.substring(Math.max(0, firstIdx - 20), firstIdx);
    let suffix = line.substring(lastIdx + 1, Math.min(line.length, lastIdx + 1 + 20));
    
    let searchStart = 0;
    while (true) {
      let pIdx = fixedCode.indexOf(prefix, searchStart);
      if (pIdx === -1) break;
      
      let sIdx = fixedCode.indexOf(suffix, pIdx + prefix.length);
      if (sIdx !== -1 && sIdx - (pIdx + prefix.length) < 200) { 
         let corruptedPhrase = fixedCode.substring(pIdx + prefix.length, sIdx);
         
         if (/[^\x00-\x7F]/.test(corruptedPhrase)) {
            fixedCode = fixedCode.substring(0, pIdx + prefix.length) + cleanPhrase + fixedCode.substring(sIdx);
            matchCount++;
            searchStart = pIdx + prefix.length + cleanPhrase.length;
         } else {
            searchStart = pIdx + 1;
         }
      } else {
         searchStart = pIdx + 1;
      }
    }
  }
}

console.log('Fixed', matchCount, 'phrases from clean22.');

// We also manually fix a few strings that might have been added/changed AFTER 22e3e2f
// which are still corrupted in HEAD. (I extracted these earlier).
const map = {
  'เน€เธ˜เธ…เน€เธ™ย‰เน€เธ˜เธ’เน€เธ˜ย‡เน€เธ™โ‚ฌเน€เธ˜เธŠเน€เธ™ย‰เน€เธ˜ย™เน€เธ˜โ€”เน€เธ˜เธ‘เน€เธ™ย‰เน€เธ˜ย‡เน€เธ˜เธ‹เน€เธ˜เธ เน€เธ˜โ€ เน€เธ™ย เน€เธ˜เธ…เน€เธ™ย‰เน€เธ˜เธ‡': 'ล้างเส้นทั้งหมดแล้ว',
  'เน€เธ˜เธ…เน€เธ˜ยšเน€เธ˜เธ‹เน€เธ˜ย™เน€เธ™ย‰เน€เธ˜เธ’เน€เธ˜ย เน€เธ˜เธƒเน€เธ˜เธ เน€เธ˜โ€ เน€เธ˜เธ’เน€เธ˜เธ‰เน€เธ™ย เน€เธ˜เธ…เน€เธ™ย‰เน€เธ˜เธ‡': 'ลบหน้ากระดาษเรียบร้อยแล้ว',
  'เน€เธ˜เธ…เน€เธ˜ยšเน€เธ˜ยšเน€เธ˜เธ˜เน€เธ™ยŠเน€เธ˜ย„เน€เธ˜เธ เน€เธ˜เธ’เน€เธ˜เธƒเน€เธ™ยŒเน€เธ˜ย เน€เธ™ย เน€เธ˜เธ…เน€เธ™ย‰เน€เธ˜เธ‡': 'ลบบุ๊กมาร์กแล้ว',
  'เน€เธ™โ‚ฌเน€เธ˜ยžเน€เธ˜เธ”เน€เธ™ยˆเน€เธ˜เธ เน€เธ˜ยšเน€เธ˜เธ˜เน€เธ™ยŠเน€เธ˜ย„เน€เธ˜เธ เน€เธ˜เธ’เน€เธ˜เธƒเน€เธ™ยŒเน€เธ˜ย เน€เธ™ย เน€เธ˜เธ…เน€เธ™ย‰เน€เธ˜เธ‡': 'เพิ่มบุ๊กมาร์กแล้ว',
  'เน€เธ˜โ€ขเน€เธ˜เธƒเน€เธ˜เธ‡เน€เธ˜ยˆเน€เธ˜ยžเน€เธ˜ยšเน€เธ˜ย›เน€เธ˜เธ’เน€เธ˜ย เน€เธ˜ย เน€เธ˜เธ’เน€เธ˜เธŠเน€เธ™ย„เน€เธ˜โ€ขเน€เธ˜เธ…เน€เธ˜เธ‘เน€เธ˜เธŠ: ปิดเน€เธ˜ย เน€เธ˜เธ’เน€เธ˜เธƒเน€เธ™โ‚ฌเน€เธ˜ย‚เน€เธ˜เธ•เน€เธ˜เธ‚เน€เธ˜ย™เน€เธ˜โ€ เน€เธ™ย‰เน€เธ˜เธ‡เน€เธ˜เธ‚เน€เธ˜ย™เน€เธ˜เธ”เน€เธ™ย‰เน€เธ˜เธ‡เน€เธ™ย เน€เธ˜เธ…เน€เธ™ย‰เน€เธ˜เธ‡ เน€เธ™ยƒเน€เธ˜ยŠเน€เธ™ย‰เน€เธ˜ย™เน€เธ˜เธ”เน€เธ™ย‰เน€เธ˜เธ‡เน€เธ™โ‚ฌเน€เธ˜เธ…เน€เธ˜เธ—เน€เธ™ยˆเน€เธ˜เธ เน€เธ˜ย™/เน€เธ˜ย‹เน€เธ˜เธ™เน€เธ˜เธ เน€เธ˜เธ‹เน€เธ˜ย™เน€เธ™ย‰เน€เธ˜เธ’เน€เธ™ย„เน€เธ˜โ€ เน€เธ™ย‰เน€เธ™โ‚ฌเน€เธ˜เธ…เน€เธ˜เธ‚': 'ตรวจพบปากกาสไตลัส: ปิดการเขียนด้วยนิ้วแล้ว ใช้นิ้วเลื่อน/ซูมหน้าได้เลย',
  'เน€เธ˜เธ…เน€เธ˜เธ’เน€เธ˜ย เน€เธ˜ยˆเน€เธ˜เธ’เน€เธ˜ย เน€เธ˜เธ‡เน€เธ‘เน€เธ˜โ€ขเน€เธ˜โ€“เน€เธ˜เธ˜เน€เธ˜เธ‹เน€เธ˜ย™เน€เธ˜เธ–เน€เธ™ยˆเน€เธ˜ย‡เน€เธ™ย„เน€เธ˜ย›เน€เธ˜เธ‚เน€เธ˜เธ‘เน€เธ˜ย‡เน€เธ˜เธ เน€เธ˜เธ•เน€เธ˜ย เน€เธ˜เธ‡เน€เธ˜เธ‘เน€เธ˜โ€ขเน€เธ˜โ€“เน€เธ˜เธ˜เน€เธ™โ‚ฌเน€เธ˜ยžเน€เธ˜เธ—เน€เธ™ยˆเน€เธ˜เธ เน€เธ™โ‚ฌเน€เธ˜ยŠเน€เธ˜เธ—เน€เธ™ยˆเน€เธ˜เธ เน€เธ˜เธ ': 'ลากจากวัตถุหนึ่งไปยังอีกวัตถุเพื่อเชื่อม',
  'เน‚โ‚ฌโ€œ': '–',
  'เน‚โ‚ฌโ€ ': '—',
  'เธขเธ ': '°',
  'เน ยŸโ€ โ€”': '🔗',
  'เน‚ยœย เน เธ˜ย ': '🖊️',
  'เน ยŸยŽเธ„': '🎤',
  'เน ยŸโ€ เธ”': '🎙️',
  'เน ยŸเธ‡เธ™': '🧹',
  'เน ยŸเธ„ย ': '🖱️'
};
for (const [bad, good] of Object.entries(map)) {
  fixedCode = fixedCode.split(bad).join(good);
}

fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', fixedCode);
