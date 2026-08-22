const iconv = require('iconv-lite');
const fs = require('fs');
let text = 'เน€เธ เน‡เธšเธ เธงเธฒเธ”เธงเธฑเธ•เธ–เธธเธ—เธตเนˆเธ‹เน‰เธญเธ™เธ เธฑเธ™เธญเธขเธนเนˆ';
let buffer = iconv.encode(text, 'windows-1252');
console.log(iconv.decode(buffer, 'utf8'));
