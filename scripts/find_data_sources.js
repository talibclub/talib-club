import fs from 'fs';
import path from 'path';

const searchDir = 'C:/Users/HP/Documents/GitHub/talib-club';
const targetWord = 'อัจลูนี';
const targetWordEn = 'Al-Ajlouni';

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.dist') continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.md'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(targetWord) || content.includes(targetWordEn)) {
        console.log(`Found match in file: ${fullPath}`);
      }
    }
  }
}

console.log("Searching for data sources...");
searchFiles(searchDir);
console.log("Search finished.");
