const fs = require('fs');
let code = fs.readFileSync('src/pages/reading/components/ProNotebook.jsx', 'utf8');
console.log('Match?', code.includes('เธฅเน‰เธฒเธ‡เน€เธชเน‰เธ™เธ—เธฑเน‰เธ‡เธซเธกเธ”เน เธฅเน‰เธง'));
