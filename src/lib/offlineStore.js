const DB_NAME = 'talib_offline'
const DB_VERSION = 1

let dbPromise = null

function getDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('collections')) {
        db.createObjectStore('collections') // key: cacheKey, value: { items, at }
      }
      if (!db.objectStoreNames.contains('quran_pages')) {
        db.createObjectStore('quran_pages') // key: pageNumber, value: { data, at }
      }
      if (!db.objectStoreNames.contains('quran_translations')) {
        db.createObjectStore('quran_translations') // key: surahNumber, value: { data, at }
      }
    }
    request.onsuccess = (e) => resolve(e.target.result)
    request.onerror = (e) => {
      dbPromise = null
      reject(e.target.error)
    }
  })
  return dbPromise
}

export async function getOfflineItem(storeName, key) {
  try {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn(`[OfflineStore] Failed to get key ${key} from store ${storeName}`, err)
    return null
  }
}

export async function setOfflineItem(storeName, key, value) {
  try {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.put(value, key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn(`[OfflineStore] Failed to set key ${key} in store ${storeName}`, err)
  }
}

export async function clearOfflineStore(storeName) {
  try {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn(`[OfflineStore] Failed to clear store ${storeName}`, err)
  }
}
