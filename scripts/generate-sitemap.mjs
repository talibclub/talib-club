import fs from 'fs';
import path from 'path';
import { detailUrl } from '../src/utils/slug.js';

const BASE_URL = 'https://talibclub.org';
const PROJECT_ID = 'talib-club-web';

// Paginated on purpose. A single pageSize=300 request silently truncated
// content_books at 300 of its 498 documents, and because the hidden
// al-maktabah imports sort first, only 4 of the 56 visible books survived into
// the sitemap. Any collection that outgrows one page hits the same wall.
async function fetchDocuments(collectionName) {
  const documents = [];
  let pageToken = '';

  try {
    for (let page = 0; page < 20; page++) {
      const params = new URLSearchParams({ pageSize: '300' });
      if (pageToken) params.set('pageToken', pageToken);
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?${params}`;

      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Sitemap] Warning: Failed to fetch ${collectionName} (${res.status} ${res.statusText})`);
        break;
      }
      const data = await res.json();
      documents.push(...(data.documents || []));

      pageToken = data.nextPageToken || '';
      if (!pageToken) break;
    }
  } catch (err) {
    // Swallowing this meant a network blip produced a sitemap missing a whole
    // collection, written over the good one, with the build still green.
    console.error(`[Sitemap] Error fetching ${collectionName}:`, err.message);
    throw new Error(`Could not fetch ${collectionName} for the sitemap: ${err.message}`);
  }

  return documents;
}

function getField(doc, fieldName, type = 'stringValue') {
  if (doc.fields && doc.fields[fieldName]) {
    return doc.fields[fieldName][type];
  }
  return null;
}

function isDeleted(doc) {
  const deletedVal = getField(doc, 'deleted', 'booleanValue');
  return deletedVal === true;
}

function getDocId(doc) {
  const idVal = getField(doc, 'id', 'stringValue');
  if (idVal) return idVal;
  return doc.name.split('/').pop();
}

function getTitle(doc) {
  return getField(doc, 'title', 'stringValue') || '';
}

function getFormattedDate(doc) {
  if (doc.updateTime) {
    return doc.updateTime.split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

async function generate() {
  console.log('[Sitemap] Generating sitemap.xml...');
  const urls = [];

  // 1. Add static pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/articles', priority: '0.8', changefreq: 'daily' },
    { path: '/library', priority: '0.8', changefreq: 'daily' },
    { path: '/media', priority: '0.8', changefreq: 'daily' },
    { path: '/scholars', priority: '0.8', changefreq: 'weekly' },
    { path: '/donate', priority: '0.5', changefreq: 'monthly' }
  ];

  // 2. Fetch dynamic items from Firestore REST API
  const [articles, books, media] = await Promise.all([
    fetchDocuments('content_articles'),
    fetchDocuments('content_books'),
    fetchDocuments('content_media')
  ]);

  // The listing pages change when their contents change, so they are dated from
  // the newest document rather than from "today". A wall-clock lastmod rewrites
  // every static entry on every run, which makes the nightly refresh job commit
  // and redeploy a sitemap that is otherwise identical — and teaches crawlers to
  // stop believing the field.
  const newestContentDate = [...articles, ...books, ...media]
    .map(getFormattedDate)
    .sort()
    .pop() || new Date().toISOString().split('T')[0];

  for (const page of staticPages) {
    urls.push({
      loc: `${BASE_URL}${page.path}`,
      lastmod: newestContentDate,
      changefreq: page.changefreq,
      priority: page.priority
    });
  }

  // 3-5. Process detail pages. The URL is built with the same helper the app
  // and api/seo-prerender.js use, so the sitemap entry, the <link rel=canonical>
  // on the page and the prerenderer's 301 target are always the same string —
  // a mismatch between them is what Search Console reports as "duplicate,
  // Google chose a different canonical".
  const collections = [
    { route: 'article', docs: articles },
    { route: 'library-detail', docs: books },
    { route: 'media-detail', docs: media }
  ];

  for (const { route, docs } of collections) {
    docs.forEach(doc => {
      if (isDeleted(doc)) return;
      urls.push({
        loc: detailUrl(BASE_URL, route, getDocId(doc), getTitle(doc)),
        lastmod: getFormattedDate(doc),
        changefreq: 'weekly',
        priority: '0.7'
      });
    });
  }

  // 6. Generate XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';

  // 7. Write to public/sitemap.xml and dist/sitemap.xml (if dist exists)
  const publicPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`[Sitemap] Written to ${publicPath}`);

  const distPath = path.resolve(process.cwd(), 'dist/sitemap.xml');
  const distDir = path.dirname(distPath);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`[Sitemap] Written to ${distPath}`);
  } else {
    console.log('[Sitemap] Dist directory not found, skipping writing to dist/sitemap.xml');
  }
}

generate().catch(err => {
  // Deliberately does NOT fail the build. Aborting before the write leaves the
  // committed public/sitemap.xml in place, so the deploy still ships the last
  // good sitemap instead of one that silently lost a whole collection — which
  // is exactly what the swallowed per-collection error used to produce. That is
  // also why public/sitemap.xml stays tracked in git: it is the fallback.
  // What was missing was any way to notice, so say it loudly.
  console.error('');
  console.error('='.repeat(70));
  console.error('[Sitemap] GENERATION FAILED — sitemap.xml was NOT updated.');
  console.error('[Sitemap] The previously committed sitemap.xml will be deployed as-is.');
  console.error('[Sitemap] Reason:', err?.message || err);
  console.error('='.repeat(70));
  console.error('');
});
