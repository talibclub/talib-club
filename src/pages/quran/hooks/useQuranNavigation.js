import { useState, useEffect } from "react";
import { normalizeSuraNumber, normalizeAyahNumber } from "../utils/quranUtils.js";

export function useQuranNavigation({ initialSura, initialAyah, mode, setSelectedPage }) {
  const [selectedSura, setSelectedSura] = useState(() => normalizeSuraNumber(initialSura))
  const [targetScrollAyah, setTargetScrollAyah] = useState(() => normalizeAyahNumber(initialAyah))
  
  // Navigation Mode: "surah" | "juz" | "page"
  const [navMode, setNavMode] = useState("surah")
  const [pageInput, setPageInput] = useState("")

  // Synchronize Quran selection with the browser URL query parameters
  useEffect(() => {
    const url = new URL(window.location.href)
    const isQuranPage = url.pathname === "/quran"
    const isMemberQuran = url.pathname === "/member" && url.searchParams.get("view") === "quran"

    if (isQuranPage || isMemberQuran) {
      const prevSura = url.searchParams.get("sura")
      const prevAyah = url.searchParams.get("ayah")

      let changed = false
      if (prevSura !== String(selectedSura)) {
        url.searchParams.set("sura", String(selectedSura))
        url.searchParams.delete("ayah") // Clear ayah on surah change
        changed = true
      }

      if (targetScrollAyah && prevAyah !== String(targetScrollAyah)) {
        url.searchParams.set("ayah", targetScrollAyah)
        changed = true
      }
      if (!targetScrollAyah && prevAyah) {
        url.searchParams.delete("ayah")
        changed = true
      }

      if (changed) {
        window.history.replaceState(window.history.state, "", url.pathname + url.search)
      }
    }
  }, [selectedSura, targetScrollAyah])

  // Reset selectedPage if mode leaves mushaf
  useEffect(() => {
    if (mode !== "mushaf" && setSelectedPage) {
      setSelectedPage(null)
    }
  }, [mode, setSelectedPage])

  // Sync with dashboard triggers
  useEffect(() => {
    if (initialSura) {
      if (setSelectedPage) setSelectedPage(null)
      setSelectedSura(normalizeSuraNumber(initialSura))
    }
  }, [initialSura, setSelectedPage])

  useEffect(() => {
    if (initialAyah) {
      setTargetScrollAyah(normalizeAyahNumber(initialAyah))
    }
  }, [initialAyah])

  return {
    selectedSura, setSelectedSura,
    targetScrollAyah, setTargetScrollAyah,
    navMode, setNavMode,
    pageInput, setPageInput
  }
}
