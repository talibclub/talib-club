const iconv = require('iconv-lite');
let text = 'เน€เธ เน‡เธšเธ เธงเธฒเธ”เธงเธฑเธ•เธ–เธธเธ—เธตเนˆเธ‹เน‰เธญเธ™เธ เธฑเธ™เธญเธขเธนเนˆ';
let buffer = iconv.encode(text, 'windows-874'); // Encode back to bytes using cp874
console.log(iconv.decode(buffer, 'utf8')); // Decode bytes as utf8
