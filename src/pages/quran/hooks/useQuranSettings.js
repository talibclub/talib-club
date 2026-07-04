import { useState, useEffect } from "react";

export function useQuranSettings() {
  const [mode, setMode] = useState("translation") // "mushaf" | "translation" | "tafsir"
  const [translationKey, setTranslationKey] = useState("thai_complex") // "thai_complex" | "thai_rwwad"

  const [arabicSize, setArabicSize] = useState(() => {
    return window.innerWidth < 768 ? 26 : 32
  }) // px
  
  const [thaiSize, setThaiSize] = useState(15) // px
  const quranFont = "UthmanicHafs"
  
  const [tajweedEnabled, setTajweedEnabled] = useState(() => {
    return localStorage.getItem("quran-tajweed-enabled") !== "false"
  })

  useEffect(() => {
    localStorage.setItem("quran-tajweed-enabled", tajweedEnabled)
  }, [tajweedEnabled])
  
  const [showTajweedLegend, setShowTajweedLegend] = useState(false)

  return {
    mode, setMode,
    translationKey, setTranslationKey,
    arabicSize, setArabicSize,
    thaiSize, setThaiSize,
    quranFont,
    tajweedEnabled, setTajweedEnabled,
    showTajweedLegend, setShowTajweedLegend
  }
}
