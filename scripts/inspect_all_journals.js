import fs from 'fs';

const journalItems = JSON.parse(fs.readFileSync('C:/Users/HP/Documents/GitHub/talib-club/scripts/parsed_journals.json', 'utf8'));

journalItems.forEach((item, index) => {
  const bodyText = item.bodyText;
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
  const hashtags = (bodyText.match(/#[^\s#]+/g) || []).map(h => h.slice(1));
  
  console.log(`Journal ${index}:`);
  console.log(`  Lines 1-3: ${JSON.stringify(lines.slice(0, 3))}`);
  console.log(`  Hashtags: ${JSON.stringify(hashtags)}`);
  console.log("--------------------------------------------------");
});
