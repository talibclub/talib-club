import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { CONTENT_COLLECTIONS } from "../lib/contentStore.js"

/** Atomic counter bump — avoids stale read-modify-write overwrites */
export async function bumpContentMetric(collectionKey, id, field) {
  const collectionName = CONTENT_COLLECTIONS[collectionKey]
  if (!collectionName || !id || !field) return
  try {
    await updateDoc(doc(db, collectionName, String(id)), { [field]: increment(1) })
  } catch (err) {
    console.error(`bumpContentMetric(${collectionKey}, ${field})`, err)
  }
}
