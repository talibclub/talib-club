const fs = require('fs');
const path = require('path');

const quranPath = path.join(__dirname, '../src/pages/Quran.jsx');
const cssPath = path.join(__dirname, '../src/pages/quran/Quran.css');

let content = fs.readFileSync(quranPath, 'utf8');

// Find the style block
const styleStart = content.indexOf('<style>{`');
const styleEndStr = '`}</style>';
const styleEnd = content.indexOf(styleEndStr, styleStart) + styleEndStr.length;

if (styleStart !== -1 && styleEnd !== -1) {
  const styleBlock = content.substring(styleStart, styleEnd);
  // Extract just the CSS part
  const cssContent = styleBlock.replace('<style>{`', '').replace('`}</style>', '');
  
  // Create CSS file
  fs.writeFileSync(cssPath, cssContent);
  
  // Replace the style block in Quran.jsx with import statement
  // We'll put the import at the top of the file
  const newContent = content.substring(0, styleStart) + content.substring(styleEnd);
  
  // Add import to top
  const importLines = newContent.split('\n');
  const lastImportIndex = importLines.findIndex(line => !line.startsWith('import ') && line.trim() !== '');
  
  importLines.splice(lastImportIndex, 0, 'import "./quran/Quran.css"');
  
  fs.writeFileSync(quranPath, importLines.join('\n'));
  console.log("Successfully extracted CSS");
} else {
  console.error("Could not find style block");
}
