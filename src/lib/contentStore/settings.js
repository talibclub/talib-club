import { useState, useEffect, useMemo } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase.js"
import { SITE_DOC, TAXONOMY_DOC } from "./constants.js"
import { cleanForFirestore, deepMerge } from "./utils.js"
import { readCachedDocument, writeCachedDocument, invalidateDocumentCache } from "./cache.js"

export function useSiteSettings(fallbackSite) {
  const [site, setSite] = useState(() => {
    const cached = readCachedDocument(SITE_DOC.collection, SITE_DOC.id)
    return cached ? deepMerge(fallbackSite, cached) : fallbackSite
  })
  const [loading, setLoading] = useState(() => {
    const cached = readCachedDocument(SITE_DOC.collection, SITE_DOC.id)
    return !cached
  })
  const [error, setError] = useState(null)

  // Callers pass this fallback as an object literal, so it is a new identity on
  // every render and cannot be used in a dependency array directly. It used to
  // be held in a ref that was compared and rewritten mid-render, which is a
  // pattern React cannot guarantee under concurrent rendering — a render that
  // gets thrown away still leaves its write behind. Memoising on the serialised
  // value does the same job with none of that, and stringifies once per render
  // instead of twice.
  const fallbackSiteKey = JSON.stringify(fallbackSite)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFallbackSite = useMemo(() => fallbackSite, [fallbackSiteKey])

  useEffect(() => {
    const cached = readCachedDocument(SITE_DOC.collection, SITE_DOC.id)
    if (cached) {
      setLoading(false)
      return undefined
    }

    let cancelled = false
    getDoc(doc(db, SITE_DOC.collection, SITE_DOC.id))
      .then(snapshot => {
        if (cancelled) return
        if (snapshot.exists()) {
          const data = snapshot.data()
          writeCachedDocument(SITE_DOC.collection, SITE_DOC.id, data)
          setSite(deepMerge(stableFallbackSite, data))
        } else {
          setSite(stableFallbackSite)
        }
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error("Cannot load site settings", err)
        setSite(stableFallbackSite)
        setError(err)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [stableFallbackSite])

  async function saveSiteSettings(nextSite) {
    await setDoc(doc(db, SITE_DOC.collection, SITE_DOC.id), {
      ...cleanForFirestore(nextSite),
      updatedAt: serverTimestamp(),
    }, { merge: true })
    invalidateDocumentCache(SITE_DOC.collection, SITE_DOC.id)
  }

  return { site, loading, error, saveSiteSettings }
}

export function useTaxonomySettings(fallbackTaxonomy) {
  const [taxonomy, setTaxonomy] = useState(() => {
    const cached = readCachedDocument(TAXONOMY_DOC.collection, TAXONOMY_DOC.id)
    return cached ? deepMerge(fallbackTaxonomy, cached) : fallbackTaxonomy
  })
  const [loading, setLoading] = useState(() => {
    const cached = readCachedDocument(TAXONOMY_DOC.collection, TAXONOMY_DOC.id)
    return !cached
  })
  const [error, setError] = useState(null)

  // Callers pass this fallback as an object literal, so it is a new identity on
  // every render and cannot be used in a dependency array directly. It used to
  // be held in a ref that was compared and rewritten mid-render, which is a
  // pattern React cannot guarantee under concurrent rendering — a render that
  // gets thrown away still leaves its write behind. Memoising on the serialised
  // value does the same job with none of that, and stringifies once per render
  // instead of twice.
  const fallbackTaxonomyKey = JSON.stringify(fallbackTaxonomy)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFallbackTaxonomy = useMemo(() => fallbackTaxonomy, [fallbackTaxonomyKey])

  useEffect(() => {
    const cached = readCachedDocument(TAXONOMY_DOC.collection, TAXONOMY_DOC.id)
    if (cached) {
      setLoading(false)
      return undefined
    }

    let cancelled = false
    getDoc(doc(db, TAXONOMY_DOC.collection, TAXONOMY_DOC.id))
      .then(snapshot => {
        if (cancelled) return
        if (snapshot.exists()) {
          const data = snapshot.data()
          writeCachedDocument(TAXONOMY_DOC.collection, TAXONOMY_DOC.id, data)
          setTaxonomy(deepMerge(stableFallbackTaxonomy, data))
        } else {
          setTaxonomy(stableFallbackTaxonomy)
        }
        setError(null)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.error("Cannot load taxonomy settings", err)
        setTaxonomy(stableFallbackTaxonomy)
        setError(err)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [stableFallbackTaxonomy])

  async function saveTaxonomySettings(nextTaxonomy) {
    await setDoc(doc(db, TAXONOMY_DOC.collection, TAXONOMY_DOC.id), {
      ...cleanForFirestore(nextTaxonomy),
      updatedAt: serverTimestamp(),
    }, { merge: true })
    invalidateDocumentCache(TAXONOMY_DOC.collection, TAXONOMY_DOC.id)
  }

  return { taxonomy, loading, error, saveTaxonomySettings }
}

