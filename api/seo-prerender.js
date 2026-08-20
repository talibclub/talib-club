import { detailPath } from '../src/utils/slug.js';
import { isoDuration, mediaDescription, mediaSummary, mediaThumbnail } from '../src/utils/mediaSeo.js';
import { comparableDate, toSchemaDate } from '../src/utils/dates.js';

const BASE_URL = 'https://talibclub.org';
const SITE_NAME = 'Talib Club';
const PROJECT_ID = 'talib-club-web';
const FIRESTORE_ROOT = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function parseFirestoreValue(value) {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.nullValue !== undefined) return null;
  if (value.arrayValue !== undefined) return (value.arrayValue.values || []).map(parseFirestoreValue);
  if (value.mapValue !== undefined) {
    const res = {};
    for (const key in value.mapValue.fields) {
      res[key] = parseFirestoreValue(value.mapValue.fields[key]);
    }
    return res;
  }
  return value;
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.name) return null;
  const data = {};
  for (const key in (doc.fields || {})) {
    data[key] = parseFirestoreValue(doc.fields[key]);
  }
  const id = doc.name.split('/').pop();
  return { id, updateTime: doc.updateTime, ...data };
}

async function getDoc(collection, id) {
  const res = await fetch(`${FIRESTORE_ROOT}/${collection}/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return parseFirestoreDoc(await res.json());
}

// The ids in `/article?id=308` and `/library-detail?id=17` are the numbering of
// the pre-migration site. Google still has those URLs indexed and they answered
// 404, which throws away every signal they had earned even though the article
// itself is still on the site under a new id. Each migrated document kept its
// former number in `old_id`, so the miss is recoverable: the caller renders the
// document it points at, and the handler's canonical check turns that into a
// 301 to the live URL.
//
// Only reached when a direct document read has already failed, so the extra
// query never touches the path a normal crawl takes.
async function findByOldId(collection, oldId) {
  const value = /^\d+$/.test(oldId) ? [{ stringValue: oldId }, { integerValue: oldId }] : [{ stringValue: oldId }];

  for (const candidate of value) {
    const res = await fetch(`${FIRESTORE_ROOT}:runQuery`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: { fieldFilter: { field: { fieldPath: 'old_id' }, op: 'EQUAL', value: candidate } },
          limit: 1,
        },
      }),
    });
    if (!res.ok) continue;
    const rows = await res.json();
    const doc = Array.isArray(rows) ? rows.map(row => row.document).find(Boolean) : null;
    if (doc) return parseFirestoreDoc(doc);
  }

  return null;
}

async function getDocOrPredecessor(collection, id) {
  return (await getDoc(collection, id)) || (await findByOldId(collection, id));
}

// Only the fields a listing actually prints are requested. Pulling whole
// documents to render a link list would drag every article body across the
// wire, and the list pages are the ones that most need to stay fast enough
// that a crawler does not give up on them.
// Rendering a single article page calls listDocs('content_articles') just to
// pick six related links — and that pages through up to 4 x 300 = 1,200
// documents. The CDN caches the finished HTML for an hour, but a crawler works
// through hundreds of distinct URLs, and every one of them was a cold render
// paying the full 1,200 reads. Serverless instances are reused between
// invocations, so a short in-process memo collapses a whole crawl burst onto
// one fetch per collection.
const listCache = new Map();
const LIST_CACHE_TTL_MS = 60 * 1000;

async function listDocs(collection, fields) {
  const cacheKey = `${collection}:${fields.join(',')}`;
  const cached = listCache.get(cacheKey);
  if (cached && Date.now() - cached.at < LIST_CACHE_TTL_MS) return cached.items;

  const items = [];
  let pageToken = '';

  for (let page = 0; page < 4; page++) {
    const params = new URLSearchParams({ pageSize: '300' });
    for (const field of ['deleted', ...fields]) params.append('mask.fieldPaths', field);
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`${FIRESTORE_ROOT}/${collection}?${params}`);
    if (!res.ok) break;
    const json = await res.json();
    for (const doc of json.documents || []) {
      const parsed = parseFirestoreDoc(doc);
      if (parsed && !parsed.deleted) items.push(parsed);
    }
    pageToken = json.nextPageToken || '';
    if (!pageToken) break;
  }

  listCache.set(cacheKey, { items, at: Date.now() });
  return items;
}

// comparableDate(), not the raw field: the admin enters Buddhist years, so a
// string sort reads every Gregorian-dated record as older than everything else.
function byNewestFirst(a, b) {
  return comparableDate(b.date || b.updateTime).localeCompare(comparableDate(a.date || a.updateTime));
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&amp;|&lt;|&gt;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text, maxLen = 160) {
  if (!text) return '';
  const clean = String(text).trim();
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, maxLen - 3).trim() + '...';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// JSON embedded in a <script> block has to escape the characters that could
// close the tag or break the parser. These write the six-character JSON escape
// sequences (backslash-u-…), not the literal characters.
const JSON_HTML_ESCAPES = [
  [/</g, '\\u003c'],
  [/>/g, '\\u003e'],
  [/&/g, '\\u0026'],
  [new RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028'],
  [new RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029'],
];

function stringifyJsonForHtml(value) {
  return JSON_HTML_ESCAPES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), JSON.stringify(value));
}

// --- article body -----------------------------------------------------------

const ALLOWED_TAGS = {
  p: [], br: [], hr: [],
  h2: [], h3: [], h4: [], h5: [], h6: [],
  strong: [], b: [], em: [], i: [], u: [], sup: [], sub: [],
  ul: [], ol: [], li: [],
  blockquote: [], figure: [], figcaption: [],
  table: [], thead: [], tbody: [], tr: [], th: [], td: [],
  a: ['href'], img: ['src', 'alt'],
};

const STRIPPED_ELEMENTS = 'script|style|iframe|object|embed|form|noscript|svg|canvas|audio|video';

function safeUrl(value) {
  const trimmed = String(value || '').trim();
  return /^(https?:\/\/|\/|#)/i.test(trimmed) ? trimmed : null;
}

// Deliberately an allowlist rather than a strip-everything pass. This used to
// run the body through stripHtml(), which handed Google one undifferentiated
// block of text: every <h2>/<h3> the author wrote, and the document outline
// they imply, was thrown away before the crawler ever saw it.
function sanitizeArticleHtml(html) {
  const withoutDangerousElements = String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(new RegExp(`<(${STRIPPED_ELEMENTS})\\b[\\s\\S]*?<\\/\\1\\s*>`, 'gi'), '')
    .replace(new RegExp(`<\\/?(${STRIPPED_ELEMENTS})\\b[^>]*>`, 'gi'), '')
    // The page's own <h1> is the article title; a second one inside the body
    // would compete with it, so body headings start at <h2>.
    .replace(/<(\/?)h1\b([^>]*)>/gi, '<$1h2$2>');

  return withoutDangerousElements.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\/?>/g, (match, closing, rawName, rawAttrs) => {
    const name = rawName.toLowerCase();
    // Unknown tags lose their markup but keep their text, so nothing the
    // author wrote disappears from the page.
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, name)) return '';
    if (closing) return `</${name}>`;

    let attrs = '';
    const allowed = ALLOWED_TAGS[name];
    if (allowed.length) {
      const attrPattern = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      let attr;
      while ((attr = attrPattern.exec(rawAttrs)) !== null) {
        const key = attr[1].toLowerCase();
        if (!allowed.includes(key)) continue;
        const raw = attr[2] !== undefined ? attr[2] : attr[3];
        const value = (key === 'href' || key === 'src') ? safeUrl(raw) : raw;
        if (value === null) continue;
        attrs += ` ${key}="${escapeHtml(value)}"`;
      }
    }
    return `<${name}${attrs}>`;
  });
}

// Older articles are stored as plain text with markdown-ish markers — the same
// shape src/pages/ArticleDetail.jsx converts at render time. Doing it here too
// keeps the crawler's copy structurally identical to the reader's.
function plainTextToHtml(text) {
  return String(text || '')
    .split(/\r?\n\s*\r?\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const heading3 = block.match(/^###\s+(.*)$/);
      if (heading3) return `<h3>${escapeHtml(heading3[1])}</h3>`;
      const heading2 = block.match(/^##\s+(.*)$/);
      if (heading2) return `<h2>${escapeHtml(heading2[1])}</h2>`;
      const quote = block.match(/^>\s+([\s\S]*)$/);
      if (quote) return `<blockquote>${escapeHtml(quote[1])}</blockquote>`;
      return `<p>${escapeHtml(block).replace(/\r?\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

function articleBodyHtml(body) {
  const raw = String(body || '');
  if (!raw.trim()) return '';
  const looksLikeHtml = /<(p|div|br|h[1-6]|ul|ol|blockquote)\b/i.test(raw);
  return looksLikeHtml ? sanitizeArticleHtml(raw) : plainTextToHtml(raw);
}

// --- page shell -------------------------------------------------------------

function breadcrumbs(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.path}`,
    })),
  };
}

function itemListJsonLd(name, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}${item.path}`,
      name: item.name,
    })),
  };
}

function linkList(items) {
  if (!items.length) return '<p>ยังไม่มีเนื้อหาในหมวดนี้</p>';
  return `<ul>${items.map(item => {
    const meta = item.meta ? ` — ${escapeHtml(item.meta)}` : '';
    return `<li><a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>${meta}</li>`;
  }).join('')}</ul>`;
}

function generateHtml({ title, description, canonical, ogImage, ogType = 'website', jsonLd, bodyContent, noIndex = false }) {
  const graph = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);
  let spaTarget = '/';
  try {
    const parsed = new URL(canonical);
    spaTarget = `${parsed.pathname}${parsed.search}`;
  } catch {
    spaTarget = '/';
  }

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${noIndex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}

  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="th_TH">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}

  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}

  ${graph.map(entry => `<script type="application/ld+json">\n${stringifyJsonForHtml(entry)}\n</script>`).join('\n  ')}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap" rel="stylesheet">

  <style>
    body { font-family: 'Prompt', sans-serif; line-height: 1.7; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #0f6e56; line-height: 1.4; }
    a { color: #0f6e56; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    blockquote { border-left: 4px solid #0f6e56; margin: 16px 0; padding: 4px 16px; color: #555; }
    nav { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    nav a { margin-right: 15px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <nav>
    <a href="/">หน้าแรก</a>
    <a href="/articles">บทความ</a>
    <a href="/library">ห้องสมุด</a>
    <a href="/media">มีเดีย</a>
    <a href="/scholars">ทำเนียบบุคคล</a>
    <a href="/donate">ร่วมบริจาค</a>
  </nav>
  <main>
    ${bodyContent}
  </main>
  <script>
    // Keep this list byte-identical to the two user-agent conditions in
    // vercel.json. A crawler that the rewrite lets in but this regex does not
    // recognise gets bounced to the SPA and never reads the page it was served.
    if (!navigator.userAgent.match(/Googlebot|Google-InspectionTool|GoogleOther|AdsBot-Google|Storebot-Google|bingbot|Baiduspider|YandexBot|Applebot|DuckDuckBot|PetalBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|LINE|Discordbot|TelegramBot/i)) {
      window.location.replace(${stringifyJsonForHtml(spaTarget)});
    }
  </script>
</body>
</html>`;
}

// --- routes -----------------------------------------------------------------

function decodePath(value) {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return String(value || '');
  }
}

async function renderHome() {
  const articles = (await listDocs('content_articles', ['title', 'category', 'date'])).sort(byNewestFirst).slice(0, 30);
  const links = articles.map(a => ({ path: detailPath('article', a.id, a.title), name: a.title, meta: a.category }));

  return {
    canonical: `${BASE_URL}/`,
    html: generateHtml({
      title: 'Talib Club | แหล่งศึกษาอิสลามแนวทางสะลัฟ',
      description: 'คลังความรู้อิสลามวิชาการ สำหรับมุสลิมและผู้สนใจทุกท่าน รวมบทความ หนังสือ สื่อการเรียนรู้ และทำเนียบนักวิชาการ',
      canonical: `${BASE_URL}/`,
      ogImage: `${BASE_URL}/logo.png`,
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: BASE_URL, inLanguage: 'th' },
        { '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: BASE_URL, logo: `${BASE_URL}/logo.png` },
      ],
      bodyContent: `
      <h1>Talib Club — แหล่งศึกษาอิสลามแนวทางสะลัฟ</h1>
      <p>คลังความรู้อิสลามวิชาการ สำหรับมุสลิมและผู้สนใจทุกท่าน รวมบทความวิชาการ หนังสือ สื่อการเรียนรู้ และทำเนียบนักวิชาการ</p>
      <h2>บทความล่าสุด</h2>
      ${linkList(links)}
    `,
    }),
  };
}

async function renderArticles() {
  const articles = (await listDocs('content_articles', ['title', 'category', 'date', 'author'])).sort(byNewestFirst);
  const links = articles.map(a => ({
    path: detailPath('article', a.id, a.title),
    name: a.title,
    meta: [a.category, a.author].filter(Boolean).join(' · '),
  }));

  return {
    canonical: `${BASE_URL}/articles`,
    html: generateHtml({
      title: 'บทความวิชาการอิสลาม | Talib Club',
      description: 'รวมบทความวิชาการอิสลามแนวทางสะลัฟ ครอบคลุมอากีดะฮ์ ฟิกฮ์ ซีเราะฮ์ ฮะดีษ ตัฟซีร และสังคมศาสตร์อิสลาม',
      canonical: `${BASE_URL}/articles`,
      jsonLd: [
        itemListJsonLd('บทความวิชาการอิสลาม', links),
        breadcrumbs([{ name: 'หน้าแรก', path: '/' }, { name: 'บทความ', path: '/articles' }]),
      ],
      bodyContent: `
      <h1>บทความวิชาการอิสลาม</h1>
      <p>บทความทั้งหมด ${articles.length} เรื่อง ครอบคลุมอากีดะฮ์ ฟิกฮ์ ซีเราะฮ์ ฮะดีษ ตัฟซีร และสังคมศาสตร์อิสลาม</p>
      ${linkList(links)}
    `,
    }),
  };
}

async function renderLibrary() {
  const books = (await listDocs('content_books', ['title', 'author', 'category', 'type']))
    .sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'th'));
  const links = books.map(b => ({
    path: detailPath('library-detail', b.id, b.title),
    name: b.title,
    meta: [b.author, b.type].filter(Boolean).join(' · '),
  }));

  return {
    canonical: `${BASE_URL}/library`,
    html: generateHtml({
      title: 'ห้องสมุดและตำราอิสลาม | Talib Club',
      description: 'หนังสือ วารสาร และสื่อดาวน์โหลดอิสลามวิชาการทั้งหมดของ Talib Club',
      canonical: `${BASE_URL}/library`,
      jsonLd: [
        itemListJsonLd('ห้องสมุดและตำราอิสลาม', links),
        breadcrumbs([{ name: 'หน้าแรก', path: '/' }, { name: 'ห้องสมุด', path: '/library' }]),
      ],
      bodyContent: `
      <h1>ห้องสมุดและตำราอิสลาม</h1>
      <p>หนังสือ วารสาร และสื่อดาวน์โหลดทั้งหมด ${books.length} รายการ</p>
      ${linkList(links)}
    `,
    }),
  };
}

async function renderMedia() {
  const media = (await listDocs('content_media', ['title', 'channel', 'series', 'type', 'date'])).sort(byNewestFirst);
  const links = media.map(m => ({
    path: detailPath('media-detail', m.id, m.title),
    name: m.title,
    meta: [m.channel, m.series].filter(Boolean).join(' · '),
  }));

  return {
    canonical: `${BASE_URL}/media`,
    html: generateHtml({
      title: 'มีเดียและสื่อการเรียนรู้ | Talib Club',
      description: 'คลิปวิดีโอ พอดแคสต์ และสื่อการเรียนรู้อิสลามแนวทางสะลัฟ',
      canonical: `${BASE_URL}/media`,
      jsonLd: [
        itemListJsonLd('มีเดียและสื่อการเรียนรู้', links),
        breadcrumbs([{ name: 'หน้าแรก', path: '/' }, { name: 'มีเดีย', path: '/media' }]),
      ],
      bodyContent: `
      <h1>มีเดียและสื่อการเรียนรู้</h1>
      <p>คลิปวิดีโอ พอดแคสต์ และสื่อการเรียนรู้ทั้งหมด ${media.length} รายการ</p>
      ${linkList(links)}
    `,
    }),
  };
}

// Scholars has no detail route — the whole directory lives on this one page,
// which is why the page itself has to carry the names.
async function renderScholars() {
  const scholars = await listDocs('content_scholars', ['name', 'latin', 'field', 'hijri', 'ad', 'era']);
  scholars.sort((a, b) => Number(a.hijri || 0) - Number(b.hijri || 0));

  const rows = scholars.map(s => {
    const meta = [s.latin, s.field, s.hijri ? `ฮ.ศ. ${s.hijri}` : '', s.ad ? `ค.ศ. ${s.ad}` : '']
      .filter(Boolean)
      .map(escapeHtml)
      .join(' · ');
    return `<li><strong>${escapeHtml(s.name || '')}</strong>${meta ? ` — ${meta}` : ''}</li>`;
  }).join('');

  return {
    canonical: `${BASE_URL}/scholars`,
    html: generateHtml({
      title: 'ทำเนียบนักวิชาการอิสลาม | Talib Club',
      description: 'ทำเนียบนักวิชาการอิสลามแนวทางสะลัฟตั้งแต่อดีตถึงปัจจุบัน พร้อมปีเกิด-เสียชีวิตและสาขาความเชี่ยวชาญ',
      canonical: `${BASE_URL}/scholars`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'ทำเนียบนักวิชาการอิสลาม',
          numberOfItems: scholars.length,
          itemListElement: scholars.map((s, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: { '@type': 'Person', name: s.name, description: s.field || undefined },
          })),
        },
        breadcrumbs([{ name: 'หน้าแรก', path: '/' }, { name: 'ทำเนียบบุคคล', path: '/scholars' }]),
      ],
      bodyContent: `
      <h1>ทำเนียบนักวิชาการอิสลาม</h1>
      <p>ทำเนียบนักวิชาการแนวทางสะลัฟตั้งแต่อดีตถึงปัจจุบัน รวม ${scholars.length} ท่าน</p>
      <ul>${rows}</ul>
    `,
    }),
  };
}

// The prerendered copy used to be a heading and one sentence — 126 characters
// of body text, which is not a page Google has any reason to index. It now
// carries what src/pages/Donation.jsx actually shows a visitor: what the money
// is for and how to give. The account number deliberately stays out of it; the
// page reads that from content_settings/site at runtime, and a copy frozen into
// the crawler's HTML is one that goes stale silently.
function renderDonate() {
  const purposes = [
    'แปลและจัดพิมพ์หนังสืออิสลาม แจกจ่ายทั้งรูปแบบเล่มและไฟล์ดาวน์โหลดฟรี',
    'พัฒนาเว็บไซต์และระบบห้องสมุดออนไลน์ของ Talib Club',
    'ค่าใช้จ่ายด้านอาคาร คลังเก็บหนังสือ และอุปกรณ์',
    'ผลิตเนื้อหาออนไลน์ ทั้งบทความ วิดีโอ และพอดแคสต์',
    'พัฒนากลุ่มและจัดหาอุปกรณ์สำหรับงานดะวะฮฺ',
  ];

  const steps = [
    ['สแกน QR Code หรือคัดลอกเลขบัญชี', 'ใช้แอปพลิเคชันธนาคารของท่านสแกน QR Code หรือคัดลอกเลขบัญชีธนาคารไทยพาณิชย์ (SCB) ที่แสดงอยู่บนหน้าร่วมบริจาค'],
    ['สนับสนุนการทำงานของกลุ่ม', 'ญะซากุมุลลอฮุค็อยร็อน — ขออัลลอฮฺทรงตอบแทนความดีงามแก่ท่าน สำหรับการมีส่วนร่วมในงานดะวะฮฺครั้งนี้'],
  ];

  const description = 'ร่วมสมทบทุนกับกลุ่มฏอลิบ (Talib Club) เพื่อแปลและแจกหนังสืออิสลามแนวทางสะลัฟ ผลิตสื่อการเรียนรู้ และดูแลห้องสมุดออนไลน์ โอนผ่านธนาคารไทยพาณิชย์หรือสแกน QR Code';

  return {
    canonical: `${BASE_URL}/donate`,
    html: generateHtml({
      title: 'ร่วมบริจาคสมทบทุนงานดะวะฮฺ | Talib Club',
      description,
      canonical: `${BASE_URL}/donate`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'DonateAction',
          name: 'ร่วมสมทบทุนกับกลุ่มฏอลิบ',
          description,
          recipient: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
          },
          url: `${BASE_URL}/donate`,
        },
        breadcrumbs([{ name: 'หน้าแรก', path: '/' }, { name: 'ร่วมบริจาค', path: '/donate' }]),
      ],
      bodyContent: `
      <h1>ร่วมสมทบทุน</h1>
      <p>เป็นส่วนหนึ่งในการทำงานดะวะฮฺของกลุ่มฏอลิบ ทุกยอดบริจาคถูกใช้ไปกับการเผยแพร่ความรู้อิสลามตามแนวทางสะลัฟให้เข้าถึงผู้คนได้กว้างที่สุดโดยไม่มีค่าใช้จ่ายกับผู้อ่าน</p>

      <h2>เงินบริจาคจะถูกนำไปใช้ในการ</h2>
      <ul>${purposes.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>

      <h2>วิธีการบริจาค</h2>
      <ol>${steps.map(([title, detail]) => `<li><strong>${escapeHtml(title)}</strong> — ${escapeHtml(detail)}</li>`).join('')}</ol>

      <h2>ผลงานที่เงินบริจาคสนับสนุนอยู่</h2>
      <p>ติดตามสิ่งที่กลุ่มฏอลิบทำได้จาก <a href="/library">ห้องสมุดหนังสือแปลที่เปิดให้ดาวน์โหลดฟรี</a>,
         <a href="/articles">บทความวิชาการ</a>, และ <a href="/media">สื่อการเรียนรู้</a> ทั้งหมดบนเว็บไซต์นี้</p>
    `,
    }),
  };
}

async function renderArticle(id) {
  const article = await getDocOrPredecessor('content_articles', id);
  if (!article || article.deleted) return null;

  const path = detailPath('article', article.id, article.title);
  const canonical = `${BASE_URL}${path}`;
  const plainBody = stripHtml(article.body || article.excerpt || '');

  const related = (await listDocs('content_articles', ['title', 'category', 'date']))
    .filter(a => a.id !== article.id && a.category && a.category === article.category)
    .sort(byNewestFirst)
    .slice(0, 6)
    .map(a => ({ path: detailPath('article', a.id, a.title), name: a.title, meta: '' }));

  return {
    canonical,
    html: generateHtml({
      title: `${article.title} | Talib Club`,
      description: truncate(plainBody, 160),
      canonical,
      ogImage: article.coverUrl || `${BASE_URL}/logo.png`,
      ogType: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          inLanguage: 'th',
          author: { '@type': 'Person', name: article.author || SITE_NAME },
          datePublished: toSchemaDate(article.date),
          dateModified: toSchemaDate(article.updateTime || article.date),
          articleSection: article.category || undefined,
          keywords: Array.isArray(article.tags) && article.tags.length ? article.tags.join(', ') : undefined,
          image: article.coverUrl || undefined,
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
          },
          description: truncate(plainBody, 200),
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        },
        breadcrumbs([
          { name: 'หน้าแรก', path: '/' },
          { name: 'บทความ', path: '/articles' },
          { name: article.title, path },
        ]),
      ],
      bodyContent: `
      <article>
        <h1>${escapeHtml(article.title)}</h1>
        <p><strong>ผู้เขียน:</strong> ${escapeHtml(article.author || '-')} |
           <strong>หมวด:</strong> ${escapeHtml(article.category || '-')} |
           <strong>วันที่:</strong> <time datetime="${escapeHtml(toSchemaDate(article.date) || '')}">${escapeHtml(article.date || '-')}</time></p>
        ${article.coverUrl ? `<img src="${escapeHtml(article.coverUrl)}" alt="${escapeHtml(article.title)}">` : ''}
        ${articleBodyHtml(article.body)}
      </article>
      ${related.length ? `<h2>บทความที่เกี่ยวข้อง</h2>${linkList(related)}` : ''}
    `,
    }),
  };
}

async function renderBook(id) {
  const book = await getDocOrPredecessor('content_books', id);
  if (!book || book.deleted) return null;

  const path = detailPath('library-detail', book.id, book.title);
  const canonical = `${BASE_URL}${path}`;
  const description = book.desc || book.description || `ดาวน์โหลดหนังสือ ${book.title}`;

  // Book pages were the only detail pages with no outgoing links to their own
  // kind: every one of them was reachable from /library and from nowhere else,
  // which is a poor shape to ask a crawler to work through 56 of.
  const related = (await listDocs('content_books', ['title', 'author', 'category', 'type']))
    .filter(b => b.id !== book.id && b.category && b.category === book.category)
    .slice(0, 8)
    .map(b => ({
      path: detailPath('library-detail', b.id, b.title),
      name: b.title,
      meta: [b.author, b.type].filter(Boolean).join(' · '),
    }));

  return {
    canonical,
    html: generateHtml({
      title: `${book.title} | Talib Club`,
      description: truncate(stripHtml(description), 160),
      canonical,
      ogImage: book.coverUrl || `${BASE_URL}/logo.png`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Book',
          name: book.title,
          inLanguage: 'th',
          author: { '@type': 'Person', name: book.author || SITE_NAME },
          description: stripHtml(description) || undefined,
          image: book.coverUrl || undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        },
        breadcrumbs([
          { name: 'หน้าแรก', path: '/' },
          { name: 'ห้องสมุด', path: '/library' },
          { name: book.title, path },
        ]),
      ],
      bodyContent: `
      <article>
        <h1>${escapeHtml(book.title)}</h1>
        <p><strong>ผู้แต่ง:</strong> ${escapeHtml(book.author || '-')} |
           <strong>ประเภท:</strong> ${escapeHtml(book.type || '-')}</p>
        ${book.coverUrl ? `<img src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title)}">` : ''}
        ${articleBodyHtml(description)}
      </article>
      ${related.length ? `<h2>หนังสือเล่มอื่นในหมวด${escapeHtml(book.category || '')}</h2>${linkList(related)}` : ''}
    `,
    }),
  };
}

// Everything unique a media record holds goes on the page, plus the rest of
// the series as real links — the old three-line version was thin enough that
// Search Console dropped these as "crawled - currently not indexed".
async function renderMediaItem(id) {
  const media = await getDocOrPredecessor('content_media', id);
  if (!media || media.deleted) return null;

  const path = detailPath('media-detail', media.id, media.title);
  const canonical = `${BASE_URL}${path}`;
  const summary = mediaSummary(media);
  const thumbnail = mediaThumbnail(media);
  const watchUrl = media.embedId ? `https://www.youtube.com/watch?v=${encodeURIComponent(media.embedId)}` : null;
  const spotifyUrl = safeUrl(media.spotifyUrl);

  const written = mediaDescription(media);

  // A clip with no playlist used to be a dead end: description, four facts and
  // no way out but the nav. Falling back to the rest of the channel keeps every
  // media page linking to ten others.
  const siblings = (await listDocs('content_media', ['title', 'series', 'channel', 'date', 'duration']))
    .filter(m => m.id !== media.id)
    .filter(m => (media.series ? m.series === media.series : m.channel && m.channel === media.channel))
    .sort(byNewestFirst)
    .slice(0, 10)
    .map(m => ({
      path: detailPath('media-detail', m.id, m.title),
      name: m.title,
      meta: [m.date, m.duration].filter(Boolean).join(' · '),
    }));
  const siblingsHeading = media.series
    ? `ตอนอื่นในซีรีส์ ${media.series}`
    : `สื่ออื่นจากช่อง ${media.channel || SITE_NAME}`;

  return {
    canonical,
    html: generateHtml({
      title: `${media.title} | Talib Club`,
      description: truncate(summary, 160),
      canonical,
      ogImage: thumbnail || `${BASE_URL}/logo.png`,
      ogType: 'video.other',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: media.title,
          inLanguage: 'th',
          description: summary,
          thumbnailUrl: thumbnail || undefined,
          uploadDate: toSchemaDate(media.date || media.updateTime),
          duration: isoDuration(media.duration),
          embedUrl: media.embedId ? `https://www.youtube.com/embed/${media.embedId}` : undefined,
          contentUrl: watchUrl || spotifyUrl || undefined,
          isPartOf: media.series ? { '@type': 'CreativeWorkSeries', name: media.series } : undefined,
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: BASE_URL,
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        },
        breadcrumbs([
          { name: 'หน้าแรก', path: '/' },
          { name: 'มีเดีย', path: '/media' },
          { name: media.title, path },
        ]),
      ],
      bodyContent: `
      <article>
        <h1>${escapeHtml(media.title)}</h1>
        ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(media.title)}">` : ''}
        ${written ? articleBodyHtml(written) : `<p>${escapeHtml(summary)}</p>`}
        <ul>
          ${media.series ? `<li><strong>ซีรีส์:</strong> ${escapeHtml(media.series)}</li>` : ''}
          ${media.channel ? `<li><strong>ช่อง:</strong> ${escapeHtml(media.channel)}</li>` : ''}
          ${media.duration ? `<li><strong>ความยาว:</strong> ${escapeHtml(media.duration)} นาที</li>` : ''}
          ${media.date ? `<li><strong>วันที่เผยแพร่:</strong> <time datetime="${escapeHtml(toSchemaDate(media.date) || '')}">${escapeHtml(media.date)}</time></li>` : ''}
        </ul>
        ${watchUrl ? `<p><a href="${escapeHtml(watchUrl)}" rel="noopener">รับชมวิดีโอ "${escapeHtml(media.title)}" บน YouTube</a></p>` : ''}
        ${spotifyUrl ? `<p><a href="${escapeHtml(spotifyUrl)}" rel="noopener">ฟังตอนนี้บน Spotify</a></p>` : ''}
      </article>
      ${siblings.length ? `<h2>${escapeHtml(siblingsHeading)}</h2>${linkList(siblings)}` : ''}
    `,
    }),
  };
}

const DETAIL_RENDERERS = {
  article: renderArticle,
  'library-detail': renderBook,
  'media-detail': renderMediaItem,
};

// Routes that exist in the SPA but have nothing to offer a search engine: the
// member area, the staff tools, the reader, the campaign forms. Since the bot
// rewrite in vercel.json became a catch-all, a crawler asking for one of these
// now reaches this function, and answering 404 for a page that is really there
// would be a lie Search Console would eventually notice. They get a 200 that
// says "do not index" instead — which is also what robots.txt already asks for
// on every one of them except /books.
const APP_ROUTES = new Set([
  'quran', 'tracking-system', 'auth', 'member',
  'staff', 'staff-work', 'staff-translation', 'staff-members', 'admin',
  'openhouse', 'openhouse-campus', 'books', 'book-register', 'reader',
]);

const LIST_RENDERERS = {
  '': renderHome,
  articles: renderArticles,
  library: renderLibrary,
  media: renderMedia,
  scholars: renderScholars,
  donate: renderDonate,
};

function notFoundHtml(canonical) {
  return generateHtml({
    title: 'ไม่พบเนื้อหา | Talib Club',
    description: 'เนื้อหาที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่',
    canonical,
    noIndex: true,
    bodyContent: '<h1>ไม่พบเนื้อหา</h1><p>ขออภัย ไม่พบหน้าที่คุณต้องการ</p><a href="/">กลับหน้าแรก</a>',
  });
}

function sendAppRoute(res, canonical) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  return res.status(200).send(generateHtml({
    title: 'Talib Club',
    description: 'ส่วนนี้ของ Talib Club ใช้งานผ่านแอปพลิเคชันบนเว็บ',
    canonical,
    noIndex: true,
    bodyContent: '<h1>Talib Club</h1><p>ส่วนนี้ของเว็บไซต์ใช้งานผ่านแอปพลิเคชัน กรุณาเปิดในเบราว์เซอร์ปกติ</p><a href="/">กลับหน้าแรก</a>',
  }));
}

// A real 404, not a 200 with an apology on it: Search Console reported ids that
// no longer exist in Firestore as failed redirects when this answered 200, and
// a soft-404 keeps the dead URL in the index.
function sendNotFound(res, canonical) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(404).send(notFoundHtml(canonical));
}

export default async function handler(req, res) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const pathInfo = req.headers['x-vercel-rewrite-path-info'];
    const url = new URL(pathInfo ? `${protocol}://${host}${pathInfo}` : `${protocol}://${host}${req.url}`);
    // The rewrite header carries the path; whether it also carries the query
    // depends on how the rewrite matched. Legacy `/article?id=X` links are
    // still the majority of what is indexed, so the id must survive either way.
    if (!url.search && req.url && req.url.includes('?')) {
      url.search = req.url.slice(req.url.indexOf('?'));
    }

    // `/` is the one route that reaches this function through middleware.js
    // rather than a vercel.json rewrite, because the filesystem answers `/`
    // before rewrites are consulted. A middleware rewrite does not carry the
    // x-vercel-rewrite-path-info header, so the request arrives addressed to
    // this function's own path — and the middleware matches nothing but `/`,
    // so that is unambiguously the page being asked for. Rewriting the pathname
    // (not just the route) also keeps the canonical check below from reading
    // `/api/seo-prerender` as a non-canonical spelling and 301ing on itself.
    if (url.pathname === '/api/seo-prerender') url.pathname = '/';

    const segments = url.pathname.split('/').filter(Boolean).map(decodePath);
    const route = segments[0] || '';

    let rendered = null;
    if (DETAIL_RENDERERS[route]) {
      // `?id=` wins over the path segment for the same reason the SPA prefers
      // it: `/article/<category>?id=X` is an older shape that is still indexed,
      // and there the first segment is a category rather than an id.
      const id = url.searchParams.get('id') || segments[1] || '';
      if (!id) return sendNotFound(res, `${BASE_URL}/${route}`);
      rendered = await DETAIL_RENDERERS[route](id);
      if (!rendered) return sendNotFound(res, `${BASE_URL}/${route}`);
    } else if (LIST_RENDERERS[route]) {
      rendered = await LIST_RENDERERS[route]();
    } else if (APP_ROUTES.has(route)) {
      return sendAppRoute(res, `${BASE_URL}/${route}`);
    }

    if (!rendered) return sendNotFound(res, `${BASE_URL}/${route}`);

    // Every alternate spelling of a URL — the legacy `?id=` form, a missing
    // slug, a stale slug left over from a renamed article — is answered with a
    // 301 to the single canonical form, so ranking signals land on one URL
    // instead of being split across several.
    const wantedPath = decodePath(new URL(rendered.canonical).pathname);
    if (decodePath(url.pathname) !== wantedPath || url.search) {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('Location', rendered.canonical);
      return res.status(301).end();
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(rendered.html);
  } catch (err) {
    console.error('Prerender error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send('<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Server Error</h1></body></html>');
  }
}

export const __testables = {
  articleBodyHtml,
  sanitizeArticleHtml,
  plainTextToHtml,
  stringifyJsonForHtml,
};
