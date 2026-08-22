const fs = require('fs');

const cleanCode = fs.readFileSync('clean22.jsx', 'utf8');
const currCode = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');

const thaiRegex = /[^\x00-\x7F]+/g;
const cleanLines = cleanCode.replace(/\r/g, '').split('\n');
const currLines = currCode.replace(/\r/g, '').split('\n');

let fixedCode = currCode.replace(/\r/g, '');

let matchCount = 0;

for (let i = 0; i < cleanLines.length; i++) {
  const line = cleanLines[i];
  const match = line.match(thaiRegex);
  
  if (match) {
    // Extract the whole string containing non-ascii chars.
    // e.g. "ลบหน้ากระดาษแล้ว"
    let fullPhrase = match.join('.*?'); // not perfect if separated
    
    // Better: just find the index of the first and last non-ascii char in the line
    let firstIdx = -1;
    let lastIdx = -1;
    for (let c = 0; c < line.length; c++) {
      if (line.charCodeAt(c) > 127) {
        if (firstIdx === -1) firstIdx = c;
        lastIdx = c;
      }
    }
    
    const cleanPhrase = line.substring(firstIdx, lastIdx + 1);
    
    // Now get a solid prefix and suffix (e.g. 15 chars before and after)
    let prefix = line.substring(Math.max(0, firstIdx - 20), firstIdx);
    let suffix = line.substring(lastIdx + 1, Math.min(line.length, lastIdx + 1 + 20));
    
    // Now search for this prefix and suffix in currCode!
    let searchStart = 0;
    while (true) {
      let pIdx = fixedCode.indexOf(prefix, searchStart);
      if (pIdx === -1) break;
      
      let sIdx = fixedCode.indexOf(suffix, pIdx + prefix.length);
      if (sIdx !== -1 && sIdx - (pIdx + prefix.length) < 200) { // arbitrary max length of corrupted string
         let corruptedPhrase = fixedCode.substring(pIdx + prefix.length, sIdx);
         
         // If corruptedPhrase contains non-ascii, replace it!
         if (/[^\x00-\x7F]/.test(corruptedPhrase)) {
            // Replace only this occurrence!
            fixedCode = fixedCode.substring(0, pIdx + prefix.length) + cleanPhrase + fixedCode.substring(sIdx);
            matchCount++;
            break;
         }
      }
      searchStart = pIdx + 1;
    }
  }
}

console.log('Fixed', matchCount, 'phrases.');
fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', fixedCode);
