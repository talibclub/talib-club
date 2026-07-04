import { useState, useEffect, useRef } from "react"
import { getOfflineItem, setOfflineItem } from "../../../lib/offlineStore.js"
import { SURA_LIST } from "../../../data/surahs.js"
import { cleanTajweedTags } from "./quranUtils.js"
import toast from "react-hot-toast"

export function useQuranData({ selectedSura, setSelectedSura, selectedPage, translationKey, reloadKey, isMobile, setIsMobileNavOpen, setTargetScrollAyah }) {
  const [verses, setVerses] = useState([])
  const [pageVerses, setPageVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const cache = useRef({}) // Cache fetches

  // Fetch Sura verses
  useEffect(() => {
    let active = true
    const cacheKey = `${translationKey}-${selectedSura}`

    if (cache.current[cacheKey]) {
      setVerses(cache.current[cacheKey])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

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
        console.warn("Offline sura fetch failed", err)
      }
      return false
    }

    const fetchSuraOnline = () => {
      const transUrl = `https://quranenc.com/api/v1/translation/sura/${translationKey}/${selectedSura}`
      const tafsirUrl = `https://quranenc.com/api/v1/translation/sura/thai_mokhtasar/${selectedSura}`
      const quranComUrl = `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${selectedSura}`

      Promise.all([
        fetch(transUrl).then(res => {
          if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อคำแปลความหมายจากระบบ QuranEnc ได้")
          return res.json()
        }),
        fetch(tafsirUrl).then(res => {
          if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อบทอธิบายความหมายย่อ (Tafsir) ได้")
          return res.json()
        }),
        fetch(quranComUrl)
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch Tajweed from Quran.com")
            return res.json()
          })
          .catch(err => {
            console.warn("Quran.com Tajweed API failed, falling back to QuranEnc Arabic text", err)
            return null
          })
      ])
        .then(([transData, tafsirData, tajweedData]) => {
          if (!active) return

          const merged = transData.result.map((aya, idx) => {
            const tafsirAya = tafsirData.result[idx] || {}

            let tajweedText = null
            if (tajweedData && tajweedData.verses) {
              const matchingTajweed = tajweedData.verses.find(v => {
                const parts = v.verse_key.split(":")
                return parseInt(parts[1]) === parseInt(aya.aya)
              })
              if (matchingTajweed) {
                tajweedText = matchingTajweed.text_uthmani_tajweed
              }
            }

            return {
              id: aya.id,
              sura: aya.sura,
              aya: aya.aya,
              arabic_text: cleanTajweedTags(aya.arabic_text || ""),
              arabic_text_tajweed: cleanTajweedTags(tajweedText || aya.arabic_text || ""),
              translation: aya.translation,
              tafsir: tafsirAya.translation || ""
            }
          })

          cache.current[cacheKey] = merged
          setVerses(merged)
          setLoading(false)
          setOfflineItem('quran_translations', cacheKey, merged).catch(() => {})
        })
        .catch(err => {
          if (!active) return
          console.error(err)
          setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต")
          setLoading(false)
        })
    }

    loadSuraOffline().then(found => {
      if (!found) fetchSuraOnline()
    })

    return () => {
      active = false
    }
  }, [selectedSura, translationKey, reloadKey])

  // Fetch verses for page-based reading
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
          setSelectedSura(cached[0].sura)
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
        .then(res => {
          if (!res.ok) throw new Error("Quran.com API error")
          return res.json()
        })
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
                id: v.id,
                sura: suraNum,
                aya: ayaNum,
                arabic_text: cleanText,
                arabic_text_tajweed: cleanText,
                suraName: suraInfo ? suraInfo.englishName : ""
              }
            })
            setPageVerses(versesMapped)
            setSelectedSura(versesMapped[0].sura)
            setPageLoading(false)
            setOfflineItem('quran_pages', selectedPage, versesMapped).catch(() => {})
          } else {
            throw new Error("No verses returned")
          }
        })
        .catch(err => {
          console.warn("Failed to load page from Quran.com API, falling back to AlQuran.cloud", err)
          fetch(`https://api.alquran.cloud/v1/page/${selectedPage}/quran-simple`)
            .then(res => res.json())
            .then(data => {
              if (!active) return
              if (data.code === 200 && data.data?.ayahs) {
                const ayahs = data.data.ayahs
                const versesMapped = ayahs.map(aya => {
                  const cleanText = cleanTajweedTags(aya.text || "")
                  return {
                    id: aya.number,
                    sura: aya.surah.number,
                    aya: aya.numberInSurah,
                    arabic_text: cleanText,
                    arabic_text_tajweed: cleanText,
                    suraName: aya.surah.englishName
                  }
                })
                setPageVerses(versesMapped)
                if (ayahs.length > 0) {
                  setSelectedSura(ayahs[0].surah.number)
                }
                setPageLoading(false)
                setOfflineItem('quran_pages', selectedPage, versesMapped).catch(() => {})
              } else {
                setPageLoading(false)
              }
            })
            .catch(fallbackErr => {
              if (!active) return
              console.error("Both APIs failed", fallbackErr)
              setPageLoading(false)
              toast.error("ไม่สามารถโหลดข้อมูลหน้าได้")
            })
        })
    }

    loadPageOffline().then(found => {
      if (!found) fetchPageOnline()
    })

    return () => {
      active = false
    }
  }, [selectedPage, setSelectedSura])

  return {
    verses,
    pageVerses,
    loading,
    pageLoading,
    error,
    cache
  }
}
