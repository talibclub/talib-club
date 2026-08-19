export function cleanForFirestore(value) {
  if (Array.isArray(value)) return value.map(cleanForFirestore)
  if (!value || typeof value !== "object") return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, cleanForFirestore(item)])
  )
}

export function isPlainObject(value) {
  return Boolean(value) && Object.getPrototypeOf(value) === Object.prototype
}

export function deepMerge(base, patch) {
  if (Array.isArray(base) && Array.isArray(patch)) return patch
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch === undefined ? base : patch
  }

  const result = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    result[key] = key in base ? deepMerge(base[key], value) : value
  }
  return result
}

function parseDateStringToMs(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return 0
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    let year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1
    const day = parseInt(match[3], 10)
    if (year > 2400) {
      year -= 543
    }
    return new Date(year, month, day).getTime()
  }
  const parsed = Date.parse(dateStr)
  return isNaN(parsed) ? 0 : parsed
}

export function getMs(val) {
  if (!val) return 0
  if (typeof val.toDate === "function") return val.toDate().getTime()
  if (val.seconds !== undefined && val.nanoseconds !== undefined) return val.seconds * 1000
  if (typeof val === "number") return val
  if (typeof val === "string") return parseDateStringToMs(val)
  const parsed = Date.parse(val)
  return isNaN(parsed) ? 0 : parsed
}

export function byNewest(a, b) {
  // First, compare by explicit 'date' field (which represents the logical publish date)
  // We use parseDateStringToMs directly if it's a YYYY-MM-DD string, or getMs
  const dateA = typeof a.date === "string" ? parseDateStringToMs(a.date) : getMs(a.date)
  const dateB = typeof b.date === "string" ? parseDateStringToMs(b.date) : getMs(b.date)

  if (dateA && dateB && dateA !== dateB) {
    return dateB - dateA
  }

  // If explicit dates are the same (or both missing), compare by exact creation/update time
  const timeA = getMs(a.createdAt) || getMs(a.updatedAt) || dateA
  const timeB = getMs(b.createdAt) || getMs(b.updatedAt) || dateB
  
  if (timeA && timeB && timeA !== timeB) {
    return timeB - timeA
  }

  return String(b.id || "").localeCompare(String(a.id || ""))
}

export function mergeWithFallback(fallbackItems, remoteItems) {
  if (!remoteItems) return fallbackItems

  const byId = new Map(fallbackItems.map(item => [String(item.id), item]))
  remoteItems.forEach(item => {
    const id = String(item.id)
    
    // Remove the old fallback item if it has been migrated to a new ID
    if (item.old_id && byId.has(String(item.old_id))) {
      byId.delete(String(item.old_id))
    }
    
    if (item.deleted) {
      byId.delete(id)
      return
    }
    byId.set(id, { ...(byId.get(id) || {}), ...item })
  })
  return Array.from(byId.values())
}

// Deterministic JSON: object keys sorted so the same query always produces the
// same cache key.
//
// The previous version assigned the RECURSIVE RESULT (already a JSON string)
// back into an object and ran JSON.stringify over it again, so every value came
// out escaped twice:
//
//   want: {"collectionName":"content_articles",...}
//   got:  {"collectionName":"\"content_articles\"",...}
//
// Nothing crashed, but every consumer matches on the un-escaped shape with
// `key.includes('"collectionName":"' + name + '"')` — 14 call sites across
// cache.js and hooks.js — so all of them silently matched nothing. That meant
// the public-collection localStorage cache was never written or read, and
// invalidation, optimistic updates and rollbacks after a save were all no-ops.
// Building the JSON by hand keeps nested values encoded exactly once.
export function stableStringify(obj) {
  if (obj === null) return "null"
  if (typeof obj !== "object") return JSON.stringify(obj)
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`

  const keys = Object.keys(obj).sort()
  return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(",")}}`
}

// `v` is bumped whenever the key shape changes so old entries are simply never
// matched again instead of being read back under new semantics. v3 = the
// double-escaping fix above.
export function getQueryCacheKey(collectionName, uid, limitCount, orderByField, orderDirection) {
  return stableStringify({ v: 3, collectionName, uid: uid || null, limitCount, orderByField, orderDirection })
}

export function generateDocId(item) {
  if (!item) return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  
  if (item.seriesId && item.part) {
    const seriesSlug = String(item.seriesId).trim().toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\u0E00-\u0E7F-]/g, '');
    if (seriesSlug) return `${seriesSlug}-${item.part}`;
  }
  
  const base = item.title || item.name || item.subject || "";
  if (base) {
    const slug = base.trim().toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\u0E00-\u0E7F-]/g, '');
    
    if (slug) {
      const rand = Math.random().toString(36).substring(2, 7);
      return `${slug}-${rand}`;
    }
  }
  
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}
