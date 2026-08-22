// ============================================================
//  TALIB CLUB — Thai Text Normalizer & Mojibake Repair
//  Handles CP874 / TIS-620, Latin-1 / Windows-1252 mojibake,
//  legacy font PUA glyphs, and decomposed Thai characters.
// ============================================================

// Legacy Thai PUA font glyph mapping (WinThai / DSN / PSL / JS)
const THAI_PUA_MAP = {
  0xF700: 0x0E10, 0xF701: 0x0E0D, 0xF702: 0x0E28, 0xF703: 0x0E29, 0xF704: 0x0E2A,
  0xF705: 0x0E31, 0xF706: 0x0E34, 0xF707: 0x0E35, 0xF708: 0x0E36, 0xF709: 0x0E37,
  0xF70A: 0x0E48, 0xF70B: 0x0E49, 0xF70C: 0x0E4A, 0xF70D: 0x0E4B, 0xF70E: 0x0E4C,
  0xF70F: 0x0E4D, 0xF710: 0x0E34, 0xF711: 0x0E35, 0xF712: 0x0E36, 0xF713: 0x0E37,
  0xF714: 0x0E48, 0xF715: 0x0E49, 0xF716: 0x0E4A, 0xF717: 0x0E4B, 0xF718: 0x0E4C,
  0xF719: 0x0E38, 0xF71A: 0x0E39, 0xF71B: 0x0E3A,
};

// CP874 Table mapping
const CP874_TABLE = [
  0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,
  0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,0x1E,0x1F,
  0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,0x2E,0x2F,
  0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D,0x3E,0x3F,
  0x40,0x41,0x42,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4A,0x4B,0x4C,0x4D,0x4E,0x4F,
  0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B,0x5C,0x5D,0x5E,0x5F,
  0x60,0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6A,0x6B,0x6C,0x6D,0x6E,0x6F,
  0x70,0x71,0x72,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7A,0x7B,0x7C,0x7D,0x7E,0x7F,
  0x20AC,0xFFFD,0xFFFD,0xFFFD,0xFFFD,0x2026,0xFFFD,0xFFFD,0xFFFD,0x2030,0xFFFD,0xFFFD,0xFFFD,0xFFFD,0xFFFD,0xFFFD,
  0xFFFD,0x2018,0x2019,0x201C,0x201D,0x2022,0x2013,0x2014,0xFFFD,0x2122,0xFFFD,0xFFFD,0xFFFD,0xFFFD,0xFFFD,0xFFFD,
  0x00A0,0x0E01,0x0E02,0x0E03,0x0E04,0x0E05,0x0E06,0x0E07,0x0E08,0x0E09,0x0E0A,0x0E0B,0x0E0C,0x0E0D,0x0E0E,0x0E0F,
  0x0E10,0x0E11,0x0E12,0x0E13,0x0E14,0x0E15,0x0E16,0x0E17,0x0E18,0x0E19,0x0E1A,0x0E1B,0x0E1C,0x0E1D,0x0E1E,0x0E1F,
  0x0E20,0x0E21,0x0E22,0x0E23,0x0E24,0x0E25,0x0E26,0x0E27,0x0E28,0x0E29,0x0E2A,0x0E2B,0x0E2C,0x0E2D,0x0E2E,0x0E2F,
  0x0E30,0x0E31,0x0E32,0x0E33,0x0E34,0x0E35,0x0E36,0x0E37,0x0E38,0x0E39,0x0E3A,0xFFFD,0xFFFD,0xFFFD,0xFFFD,0x0E3F,
  0x0E40,0x0E41,0x0E42,0x0E43,0x0E44,0x0E45,0x0E46,0x0E47,0x0E48,0x0E49,0x0E4A,0x0E4B,0x0E4C,0x0E4D,0x0E4E,0x0E4F,
  0x0E50,0x0E51,0x0E52,0x0E53,0x0E54,0x0E55,0x0E56,0x0E57,0x0E58,0x0E59,0x0E5A,0x0E5B,0xFFFD,0xFFFD,0xFFFD,0xFFFD
];

const REVERSE_CP874 = new Map();
CP874_TABLE.forEach((uni, byte) => {
  if (uni !== 0xFFFD) REVERSE_CP874.set(uni, byte);
});
for (let b = 0x80; b <= 0x9F; b++) {
  if (!REVERSE_CP874.has(b)) REVERSE_CP874.set(b, b);
}

// Windows-1252 mapping
const WIN1252_UNICODE = [
  0x20AC,0xFFFD,0x201A,0x0192,0x201E,0x2026,0x2020,0x2021,0x02C6,0x2030,0x0160,0x2039,0x0152,0xFFFD,0x017D,0xFFFD,
  0xFFFD,0x2018,0x2019,0x201C,0x201D,0x2022,0x2013,0x2014,0x02DC,0x2122,0x0161,0x203A,0x0153,0xFFFD,0x017E,0x0178
];
const REVERSE_WIN1252 = new Map();
for (let i = 0; i < 256; i++) {
  if (i < 128) REVERSE_WIN1252.set(i, i);
  else if (i >= 128 && i <= 159) {
    const u = WIN1252_UNICODE[i - 128];
    if (u !== 0xFFFD) REVERSE_WIN1252.set(u, i);
    REVERSE_WIN1252.set(i, i);
  } else {
    REVERSE_WIN1252.set(i, i);
  }
}

function countMojibakeMarkers(str) {
  if (!str) return 0;
  const m1 = (str.match(/เ[ธน]/g) || []).length;
  const m2 = (str.match(/เน[€เ]/g) || []).length;
  const m3 = (str.match(/โ‚ฌ|เน ย/g) || []).length;
  const m4 = (str.match(/à¹|à¸/g) || []).length;
  return m1 * 2 + m2 * 2 + m3 * 3 + m4 * 2;
}

function fixThaiPUA(str) {
  if (!str) return str;
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (THAI_PUA_MAP[code]) {
      res += String.fromCharCode(THAI_PUA_MAP[code]);
    } else {
      res += str[i];
    }
  }
  return res;
}

const utf8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: false }) : null;
const utf8Encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function decodeUtf8Bytes(bytes) {
  if (utf8Decoder) {
    return utf8Decoder.decode(new Uint8Array(bytes));
  }
  return null;
}

function encodeUtf8Char(char) {
  if (utf8Encoder) {
    return Array.from(utf8Encoder.encode(char));
  }
  return [char.charCodeAt(0)];
}

function fixCp874Step(input) {
  if (typeof input !== 'string' || !input) return input;
  const bytes = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (REVERSE_CP874.has(code)) {
      bytes.push(REVERSE_CP874.get(code));
    } else if (code < 256) {
      bytes.push(code);
    } else {
      const u8 = encodeUtf8Char(input[i]);
      for (const b of u8) bytes.push(b);
    }
  }
  try {
    const decoded = decodeUtf8Bytes(bytes);
    return decoded || input;
  } catch {
    return input;
  }
}

function fixLatin1Step(input) {
  if (typeof input !== 'string' || !input) return input;
  const bytes = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (REVERSE_WIN1252.has(code)) {
      bytes.push(REVERSE_WIN1252.get(code));
    } else if (code <= 0xFF) {
      bytes.push(code);
    } else {
      const u8 = encodeUtf8Char(input[i]);
      for (const b of u8) bytes.push(b);
    }
  }
  try {
    const decoded = decodeUtf8Bytes(bytes);
    return decoded || input;
  } catch {
    return input;
  }
}

/**
 * Repairs corrupted Thai text (Mojibake), legacy font PUA characters,
 * and normalizes combining vowels / tone marks.
 *
 * @param {string} str - Raw text string that may contain corrupted Thai
 * @returns {string} Cleaned, normalized Thai string
 */
export function normalizeThaiText(str) {
  if (typeof str !== 'string' || !str) return str;

  // 1. Fix PUA characters from legacy fonts
  let cur = fixThaiPUA(str);
  let curBad = countMojibakeMarkers(cur);

  // 2. If there are mojibake markers, try CP874 and Latin1 repair steps
  if (curBad > 0) {
    const cp1 = fixCp874Step(cur);
    const cp1Bad = countMojibakeMarkers(cp1);
    if (cp1Bad < curBad) {
      cur = cp1;
      curBad = cp1Bad;
    }

    if (curBad > 0) {
      const cp2 = fixCp874Step(cur);
      const cp2Bad = countMojibakeMarkers(cp2);
      if (cp2Bad < curBad) {
        cur = cp2;
        curBad = cp2Bad;
      }
    }

    if (curBad > 0) {
      const lat1 = fixLatin1Step(cur);
      const lat1Bad = countMojibakeMarkers(lat1);
      if (lat1Bad < curBad) {
        cur = lat1;
        curBad = lat1Bad;
      }
    }
  }

  // 3. Normalize decomposed Thai characters
  // Sara Am: Nikhahit (ํ) + Sara Aa (า) -> ำ
  cur = cur.replace(/\u0E4D\u0E32/g, '\u0E33');
  // Reorder Consonant + Tone + Upper Vowel -> Consonant + Upper Vowel + Tone
  cur = cur.replace(/([\u0E01-\u0E2E])([\u0E48-\u0E4C])([\u0E31\u0E34-\u0E37])/g, '$1$3$2');

  return cur;
}

/**
 * Cleans extracted text from PDF documents.
 */
export function cleanThaiPdfString(str) {
  return normalizeThaiText(str);
}

/**
 * Sanitizes an array of notebook pages by normalizing all text boxes,
 * stickers, and text lines.
 */
export function sanitizeNotebookPages(pages) {
  if (!Array.isArray(pages)) return pages;
  return pages.map((page) => {
    if (!page) return page;
    let modified = false;

    let nextTexts = page.texts;
    if (Array.isArray(page.texts)) {
      nextTexts = page.texts.map((t) => {
        if (!t) return t;
        const cleanText = normalizeThaiText(t.text || '');
        let cleanLines = t.lines;
        if (Array.isArray(t.lines)) {
          cleanLines = t.lines.map((l) => {
            if (!l) return l;
            const cl = normalizeThaiText(l.text || '');
            if (cl !== l.text) modified = true;
            return cl !== l.text ? { ...l, text: cl } : l;
          });
        }
        if (cleanText !== t.text || cleanLines !== t.lines) {
          modified = true;
          return { ...t, text: cleanText, lines: cleanLines };
        }
        return t;
      });
    }

    let nextStickers = page.stickers;
    if (Array.isArray(page.stickers)) {
      nextStickers = page.stickers.map((st) => {
        if (!st) return st;
        const cleanText = normalizeThaiText(st.text || '');
        let cleanLines = st.lines;
        if (Array.isArray(st.lines)) {
          cleanLines = st.lines.map((l) => {
            if (!l) return l;
            const cl = normalizeThaiText(l.text || '');
            if (cl !== l.text) modified = true;
            return cl !== l.text ? { ...l, text: cl } : l;
          });
        }
        if (cleanText !== st.text || cleanLines !== st.lines) {
          modified = true;
          return { ...st, text: cleanText, lines: cleanLines };
        }
        return st;
      });
    }

    let nextName = page.name ? normalizeThaiText(page.name) : page.name;
    if (nextName !== page.name) modified = true;

    if (modified) {
      return {
        ...page,
        texts: nextTexts,
        stickers: nextStickers,
        name: nextName,
      };
    }
    return page;
  });
}
