const fs = require('fs');

const cleanCode = fs.readFileSync('clean3.jsx', 'utf8');
const currCode = fs.readFileSync('ProNotebook_features.jsx', 'utf8');

const thaiRegex = /[\u0E00-\u0E7F]+/g;
const cleanLines = cleanCode.replace(/\r/g, '').split('\n');
const currLines = currCode.replace(/\r/g, '').split('\n');

let currIndex = 0;
let replaced = 0;

for (let i = 0; i < cleanLines.length; i++) {
  if (thaiRegex.test(cleanLines[i])) {
    const cleanLine = cleanLines[i];
    
    let patternStr = cleanLine.replace(/[\u0E00-\u0E7F]+/g, '___THAI___');
    patternStr = patternStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    patternStr = patternStr.replace(/___THAI___/g, '.*');
    
    const regex = new RegExp('^' + patternStr + '$');
    
    let found = -1;
    for (let j = Math.max(0, currIndex - 100); j < Math.min(currLines.length, currIndex + 300); j++) {
       if (regex.test(currLines[j])) {
          found = j;
          break;
       }
    }
    
    if (found !== -1 && currLines[found] !== cleanLine) {
       currLines[found] = cleanLine; 
       currIndex = found + 1;
       replaced++;
    } else if (found === -1) {
       console.log('Missed:', cleanLine.trim());
    }
  } else {
    if (currIndex < currLines.length && currLines[currIndex] === cleanLines[i]) {
       currIndex++;
    }
  }
}

console.log('Replaced', replaced, 'corrupted lines.');
fs.writeFileSync('src/pages/reading/components/ProNotebook.jsx', currLines.join('\n'));
