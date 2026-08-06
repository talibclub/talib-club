// Canonical URL shapes for the three detail routes.
//
// This module is imported by everything that has an opinion about what a
// detail page's URL is: the browser bundle (src/utils/url.js + the detail
// pages), the sitemap generator (scripts/generate-sitemap.mjs) and the bot
// prerenderer (api/seo-prerender.js). They have to agree byte-for-byte —
// last time they drifted, Search Console reported ~84 pages as "duplicate,
// Google chose a different canonical". Keep it dependency-free so all three
// runtimes (Vite, plain node, Vercel functions) can load it.

const SLUG_MAX_LENGTH = 80
const NON_SLUG_CHARS = new RegExp("[^฀-๿a-z0-9]+", 'g')

export const DETAIL_ROUTES = ['article', 'library-detail', 'media-detail']

// Thai (U+0E00–U+0E7F) is kept verbatim. Browsers percent-encode it in the
// address bar but Google indexes and displays the decoded form, so the search
// result shows readable Thai words instead of an opaque id.
export function slugify(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFC')
    .toLowerCase()
    .replace(NON_SLUG_CHARS, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '')
}

// `/article/aqeedah-100/ละหมาด-ตะรอวีห์` — id first so it can be read back
// without guessing where the slug ends. Document ids already contain hyphens
// ("aqeedah-100"), so a trailing `-<id>` suffix would not be parseable.
export function detailPath(route, id, title) {
  if (!id) return `/${route}`
  const slug = slugify(title)
  const base = `/${route}/${encodeURIComponent(id)}`
  return slug ? `${base}/${encodeURIComponent(slug)}` : base
}

export function detailUrl(baseUrl, route, id, title) {
  return `${baseUrl}${detailPath(route, id, title)}`
}

// A `?id=` query always wins: `/article?id=X` and `/article/<category>?id=X`
// are both still indexed and still linked to from outside, and in the second
// shape the first path segment is a category, not an id.
export function parseDetailId(pathname, search) {
  const fromQuery = new URLSearchParams(search || '').get('id')
  if (fromQuery) return fromQuery

  const segments = String(pathname || '').split('/').filter(Boolean)
  if (segments.length < 2 || !DETAIL_ROUTES.includes(segments[0])) return null
  try {
    return decodeURIComponent(segments[1])
  } catch {
    return segments[1]
  }
}
