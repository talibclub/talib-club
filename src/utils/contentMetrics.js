import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { CONTENT_COLLECTIONS } from "../lib/contentStore.js"
import { safeDateNow } from "./time.js"

// How long one person's bump counts for. Dedup used to live in sessionStorage,
// which is per TAB and dies with it — so refreshing did not double count, but
// opening the article in a new tab, or closing and reopening it, did. That is
// about as much effort as pressing F5. localStorage is shared across tabs and
// survives a restart, so a repeat only lands after the window has passed.
const BUMP_WINDOW_MS = {
  views: 24 * 60 * 60 * 1000,      // once a day per reader
  downloads: 60 * 60 * 1000,       // an hour — re-downloading a file is normal
  shares: 60 * 60 * 1000,
}
const DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1000

// Fallback when localStorage is unavailable (private mode, storage disabled).
// Per tab, like the old behaviour — the best that can be done without storage.
const memoryBumpCache = new Map()

function readLastBump(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? Number(raw) || 0 : 0
  } catch {
    return memoryBumpCache.get(key) || 0
  }
}

function writeLastBump(key, at) {
  try {
    localStorage.setItem(key, String(at))
  } catch {
    memoryBumpCache.set(key, at)
  }
}

/**
 * Atomic counter bump, deduplicated per browser per time window.
 *
 * This is a client-side counter and cannot be made tamper proof: anyone willing
 * to clear their storage, use a private window or a second browser can still
 * add to it. What this does stop is the accidental and the effortless — a
 * refresh, a second tab, a link opened twice. Numbers that have to be
 * trustworthy need a server-side endpoint or a real analytics product.
 */
export async function bumpContentMetric(collectionKey, id, field) {
  const collectionName = CONTENT_COLLECTIONS[collectionKey]
  if (!collectionName || !id || !field) return

  const key = `talib_bumped_${collectionKey}_${id}_${field}`
  const window = BUMP_WINDOW_MS[field] ?? DEFAULT_WINDOW_MS
  const now = safeDateNow()
  const last = readLastBump(key)
  if (last && now - last < window) return

  // Written before the request, not after: two rapid calls (a double click, a
  // remounting effect) used to both pass the check while the first was still in
  // flight and bump twice.
  writeLastBump(key, now)

  try {
    await updateDoc(doc(db, collectionName, String(id)), { [field]: increment(1) })
  } catch (err) {
    console.error(`bumpContentMetric(${collectionKey}, ${field}):`, err)
    // Let a genuine failure be retried rather than sitting out the whole window.
    writeLastBump(key, last)
  }
}
