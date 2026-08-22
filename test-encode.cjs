const fs = require('fs');
let text = 'เน€เธ เน‡เธšเธ เธงเธฒเธ”เธงเธฑเธ•เธ–เธธเธ—เธตเนˆเธ‹เน‰เธญเธ™เธ เธฑเธ™เธญเธขเธนเนˆ';
let buffer = Buffer.from(text, 'latin1');
console.log(buffer.toString('utf8'));
