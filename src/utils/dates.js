// Article and media records store the date the admin typed, and the admin
// types Thai Buddhist years: "2569-05-19" means 19 May 2026, not a day 543
// years from now. That string was going into schema.org `datePublished`
// verbatim — 174 of the 178 articles told Google they were published in the
// year 2569, centuries after the `dateModified` taken from Firestore's own
// (Gregorian) updateTime. An Article whose dates are impossible cannot earn a
// rich result, and a future publication date is a freshness signal pointing
// the wrong way.
//
// Dependency-free on purpose: this is loaded by the browser bundle
// (src/components/SEOHead.jsx), the crawler prerender (api/seo-prerender.js)
// and plain node scripts, exactly like src/utils/slug.js.

// Buddhist years on this site run 2500-2600 and Gregorian ones 1900-2100.
// Nothing legitimate lands in between, so the gap is a safe place to split.
const BUDDHIST_YEAR_FLOOR = 2200
const BUDDHIST_ERA_OFFSET = 543

// Only the leading year is touched; the rest of the string — "-05-19", a full
// "T18:51:55.655159Z" timestamp, or nothing at all — is handed back unchanged.
// Anything that does not start with a four-digit year is left alone rather
// than guessed at.
export function toGregorianDateString(value) {
  if (value === null || value === undefined) return undefined
  const raw = String(value).trim()
  if (!raw) return undefined

  const match = raw.match(/^(\d{4})([-T].*)?$/s)
  if (!match) return raw

  const year = Number(match[1])
  if (year < BUDDHIST_YEAR_FLOOR) return raw
  return `${year - BUDDHIST_ERA_OFFSET}${match[2] || ''}`
}

// schema.org dates have to be ISO 8601. Beyond the era conversion this has to
// survive the three shapes a date reaches us in: a Firestore Timestamp
// (written by serverTimestamp() online), a number (written by the offline
// queue), and a string. A date-only string stays date-only so the prerendered
// copy and the SPA copy of the same page describe it identically.
export function toSchemaDate(value) {
  if (!value) return undefined

  try {
    if (typeof value === 'object' && typeof value.toDate === 'function') {
      return value.toDate().toISOString()
    }
    if (typeof value === 'number') {
      const fromNumber = new Date(value)
      return Number.isNaN(fromNumber.getTime()) ? undefined : fromNumber.toISOString()
    }

    const text = toGregorianDateString(value)
    if (!text) return undefined
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

    const parsed = new Date(text)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
  } catch {
    return undefined
  }
}

// Sorting a mix of "2569-05-19" and "2023-02-16" as plain strings puts every
// Gregorian-dated record last no matter how recent it is, which is what
// decided the order of the 30 links on the prerendered homepage.
export function comparableDate(value) {
  return toGregorianDateString(value) || ''
}
