import { useState, useEffect, useRef } from "react";
import { getOfflineItem, setOfflineItem } from "../../../lib/offlineStore.js";
import { SURA_LIST } from "../../../data/surahs.js";
import { cleanTajweedTags } from "../utils/quranUtils.js";

export function useQuranData({ selectedSura, selectedPage, translationKey }) {
  const [quranBenefits, setQuranBenefits] = useState(null)
  
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [pageVerses, setPageVerses] = useState([])
  const [pageLoading, setPageLoading] = useState(false)
  
  const cache = useRef({})
  
  const [reloadKey, setReloadKey] = useState(0)

  // Fetch Quran benefits
  useEffect(() => {
    let active = true
    if (!quranBenefits) {
      fetch("/quranBenefits.json")
        .then(res => res.json())
        .then(data => { if (active) setQuranBenefits(data) })
        .catch(err => console.error("Failed to load Quran benefits", err))
    }
    return () => { active = false }
  }, [quranBenefits])

  // Fetch page verses
  useEffect(() => {
    if (!selectedPage) return
    let active = true
    setPageLoading(true)
    setPageVerses([])

    const loadPageOffline = async () => {
      try {
        const cached = await getOfflineItem('quran_pages', selectedPage)
        if (cached && cached.length > 0 && active) {
          setPageVerses(cached)
          setPageLoading(false)
          return true
        }
      } catch (err) {
        console.warn("Offline page fetch failed", err)
      }
      return false
    }

    const fetchPageOnline = () => {
      const quranComUrl = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?page_number=${selectedPage}`
      fetch(quranComUrl)
        .then(res => res.json())
        .then(data => {
          if (!active) return
          if (data.verses && data.verses.length > 0) {
            const versesMapped = data.verses.map(v => {
              const parts = v.verse_key.split(":")
              const suraNum = parseInt(parts[0])
              const ayaNum = parseInt(parts[1])
              const suraInfo = SURA_LIST.find(s => s.number === suraNum)
              const cleanText = cleanTajweedTags(v.text_uthmani_tajweed || "")
              return {
                id: v.id, sura: suraNum, aya: ayaNum,
                arabic_text: cleanText, arabic_text_tajweed: cleanText,
                suraName: suraInfo ? suraInfo.englishName : ""
              }
            })
            setPageVerses(versesMapped)
            setOfflineItem('quran_pages', selectedPage, versesMapped).catch(() => {})
          }
        })
        .finally(() => { if (active) setPageLoading(false) })
    }

    loadPageOffline().then(found => { if (!found) fetchPageOnline() })
    return () => { active = false }
  }, [selectedPage])

  // Fetch Sura verses
  useEffect(() => {
    if (selectedPage) return
    let active = true
    setLoading(true)
    setError(null)

    const cacheKey = `${selectedSura}_${translationKey}`
    if (cache.current[cacheKey]) {
      setVerses(cache.current[cacheKey])
      setLoading(false)
      return
    }

    const loadSuraOffline = async () => {
      try {
        const cached = await getOfflineItem('quran_translations', cacheKey)
        if (cached && cached.length > 0 && active) {
          cache.current[cacheKey] = cached
          setVerses(cached)
          setLoading(false)
          return true
        }
      } catch (err) {
        console.warn("Offline translation fetch failed", err)
      }
      return false
    }

    const fetchSuraOnline = () => {
      const transId = translationKey === "thai_complex" ? 155 : 172
      const urlText = `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSura}`
      const urlTajweed = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${selectedSura}`
      const urlTrans = `https://api.quran.com/api/v4/quran/translations/${transId}?chapter_number=${selectedSura}`
      const urlTafsir = `https://api.quran.com/api/v4/quran/translations/155?chapter_number=${selectedSura}`

      Promise.all([
        fetch(urlText).then(r => r.json()),
        fetch(urlTajweed).then(r => r.json()),
        fetch(urlTrans).then(r => r.json()),
        fetch(urlTafsir).then(r => r.json())
      ])
        .then(([textData, tajweedData, transData, tafsirData]) => {
          if (!active) return
          if (!textData.verses) throw new Error("Quran text not found")
          const merged = textData.verses.map((v, i) => {
            const taj = tajweedData.verses ? tajweedData.verses[i] : null
            const tr = transData.translations ? transData.translations[i] : null
            const tf = tafsirData.translations ? tafsirData.translations[i] : null
            const parts = v.verse_key.split(":")
            const ayaNum = parseInt(parts[1])
            const cleanText = cleanTajweedTags(v.text_uthmani || "")
            const cleanTajweed = cleanTajweedTags(taj ? taj.text_uthmani_tajweed : "")
            return {
              id: v.id, sura: selectedSura, aya: ayaNum,
              arabic_text: cleanText,
              arabic_text_tajweed: cleanTajweed || cleanText,
              translation: tr ? tr.text : "",
              tafsir: tf ? tf.text : ""
            }
          })
          cache.current[cacheKey] = merged
          setVerses(merged)
          setOfflineItem('quran_translations', cacheKey, merged).catch(() => {})
        })
        .catch(err => {
          if (!active) return
          console.error(err)
          setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล")
        })
        .finally(() => { if (active) setLoading(false) })
    }

    loadSuraOffline().then(found => { if (!found) fetchSuraOnline() })
    return () => { active = false }
  }, [selectedSura, translationKey, reloadKey, selectedPage])

  return {
    verses, loading, error, setVerses,
    pageVerses, pageLoading,
    quranBenefits,
    reloadKey, setReloadKey
  }
}
