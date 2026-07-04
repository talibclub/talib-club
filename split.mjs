import fs from 'fs';

const sourceFile = 'src/lib/contentStore.js';
const code = fs.readFileSync(sourceFile, 'utf8');

// I will extract hooks: useContentCollection, saveContentItem, deleteContentItem, bulkDeleteItems, bulkSaveItems, useCollectionCount, useUserDoc, useContentDoc
// And settings: useSiteSettings, useTaxonomySettings

const matchHooks = code.match(/export function useContentCollection[\s\S]*?(?=\nexport function useSiteSettings)/);
const hooksCode = matchHooks ? matchHooks[0] : '';

const matchSettings = code.match(/export function useSiteSettings[\s\S]*/);
const settingsCode = matchSettings ? matchSettings[0] : '';

// Create hooks.js
const hooksContent = `import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, writeBatch, query, where, limit, orderBy, getCountFromServer } from "firebase/firestore"
import { db } from "../firebase.js"
import { getOfflineItem } from "../offlineStore.js"
import { CONTENT_COLLECTIONS, USER_SPECIFIC_COLLECTIONS, PUBLIC_COLLECTIONS, LOCAL_STORAGE_CACHE_PREFIX } from "./constants.js"
import { cleanForFirestore, getMs, byNewest, mergeWithFallback, getQueryCacheKey } from "./utils.js"
import { 
  collectionCache, countCache, inFlightRequests, setWithLimit,
  readCachedCollection, writeCachedCollection, readLocalStorageCacheEntry,
  fetchContentMetadata, updateCollectionMetadata,
  readCachedUserDocument, writeCachedUserDocument, invalidateUserDocumentCache
} from "./cache.js"

function buildCollectionQuery(collectionName, { uid, isUserSpecific, orderByField, orderDirection, limitCount }) {
  let q = collection(db, collectionName)
  if (isUserSpecific && uid) {
    q = query(q, where("uid", "==", uid))
  }
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection))
  }
  if (limitCount) {
    q = query(q, limit(limitCount))
  }
  return q
}

function mapSnapshotDocs(snapshot) {
  return snapshot.docs.map(item => {
    const data = item.data()
    return { ...data, id: data.id ?? item.id }
  })
}

${hooksCode}
`;

fs.writeFileSync('src/lib/contentStore/hooks.js', hooksContent);

// Create settings.js
const settingsContent = `import { useState, useEffect, useRef } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase.js"
import { SITE_DOC, TAXONOMY_DOC } from "./constants.js"
import { cleanForFirestore, deepMerge } from "./utils.js"
import { readCachedDocument, writeCachedDocument, invalidateDocumentCache } from "./cache.js"

${settingsCode}
`;

fs.writeFileSync('src/lib/contentStore/settings.js', settingsContent);

// Create index.js (barrel file)
const indexContent = `export * from "./constants.js"
export * from "./utils.js"
export * from "./cache.js"
export * from "./hooks.js"
export * from "./settings.js"
`;

fs.writeFileSync('src/lib/contentStore/index.js', indexContent);

// Replace the original contentStore.js with the barrel file
fs.writeFileSync('src/lib/contentStore.js', `export * from "./contentStore/index.js"`);

console.log("Successfully split contentStore.js");
