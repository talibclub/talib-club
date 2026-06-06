import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { CONTENT_COLLECTIONS } from "../lib/contentStore.js"

// In-memory fallback for deduplication when sessionStorage is unavailable (private browsing)
const memoryBumpCache = new Set()

/** Atomic counter bump — avoids stale read-modify-write overwrites */
export async function bumpContentMetric(collectionKey, id, field) {
  const collectionName = CONTENT_COLLECTIONS[collectionKey]
  if (!collectionName || !id || !field) return

  // Rate limit: 1 bump per session per document per field
  const cacheKey = `${collectionKey}_${id}_${field}`

  // Try sessionStorage first (more reliable for same-domain navigation)
  let sessionStorageAvailable = false
  try {
    if (sessionStorage.getItem(`talib_bumped_${cacheKey}`)) {
      return // Already bumped this session
    }
    sessionStorageAvailable = true
  } catch (e) {
    // sessionStorage might be disabled (private browsing) - fall back to memory
    if (memoryBumpCache.has(cacheKey)) {
      return // Already bumped this session
    }
  }

  try {
    // Perform the Firebase update
    await updateDoc(doc(db, collectionName, String(id)), { [field]: increment(1) })

    // Mark as bumped
    if (sessionStorageAvailable) {
      try {
        sessionStorage.setItem(`talib_bumped_${cacheKey}`, "1")
      } catch (e) {
        console.warn("Failed to write dedup flag to sessionStorage, using memory cache:", e)
        memoryBumpCache.add(cacheKey)
      }
    } else {
      memoryBumpCache.add(cacheKey)
    }
  } catch (err) {
    console.error(`bumpContentMetric(${collectionKey}, ${field}):`, err)
  }
}
