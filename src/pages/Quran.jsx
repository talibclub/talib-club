import { useState, useEffect, useRef } from "react"
import { SURA_LIST } from "../data/surahs.js"
import { getSurahTheme } from "../data/quranThemes.js"
import { useContentCollection } from "../lib/contentStore.js"
import toast from "react-hot-toast"
import { confirmAction } from "../utils/feedback.jsx"
import QURAN_BENEFITS from "../data/quranBenefits.json"

export default function Quran({ initialSura, initialAyah, authState }) {
  const [selectedSura, setSelectedSura] = useState(initialSura || 1)
  const [readingTheme, setReadingTheme] = useState(() => {
    return localStorage.getItem("quran-reading-theme") || "sepia"
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("quran-sidebar-collapsed") === "true"
  })
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [benefitsExpanded, setBenefitsExpanded] = useState(true)

  useEffect(() => {
    localStorage.setItem("quran-reading-theme", readingTheme)
  }, [readingTheme])

  useEffect(() => {
    localStorage.setItem("quran-sidebar-collapsed", sidebarCollapsed)
  }, [sidebarCollapsed])

  useEffect(() => {
    setBenefitsExpanded(true)
  }, [selectedSura])

  const [search, setSearch] = useState("")
  const [mode, setMode] = useState("translation") // "mushaf" | "translation" | "tafsir"
  const [translationKey, setTranslationKey] = useState("thai_complex") // "thai_complex" | "thai_rwwad"
  
  const [arabicSize, setArabicSize] = useState(32) // px
  const [thaiSize, setThaiSize] = useState(15) // px
  
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const cache = useRef({}) // Cache fetches
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  // Search & Navigation States
  const [sidebarTab, setSidebarTab] = useState("surah") // "surah" | "search"
  const [keywordQuery, setKeywordQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [targetScrollAyah, setTargetScrollAyah] = useState(initialAyah || null)
  
  // Bookmarks from Firestore
  const { items: savedVerses, saveItem, deleteItem } = useContentCollection("quran_bookmarks", [])
  const uid = authState?.user?.uid

  const [activeBookmarkModal, setActiveBookmarkModal] = useState(null)
  const [modalNotes, setModalNotes] = useState("")
  const [showObjective, setShowObjective] = useState(true)
  
  // Track mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Sync with dashboard triggers
  useEffect(() => {
    if (initialSura) {
      setSelectedSura(initialSura)
    }
  }, [initialSura])

  useEffect(() => {
    if (initialAyah) {
      setTargetScrollAyah(initialAyah)
    }
  }, [initialAyah])

  const handleKeywordSearch = async (e) => {
    if (e) e.preventDefault()
    if (!keywordQuery.trim()) return
    
    setSearchLoading(true)
    setSearchError(null)
    setSearchResults([])
    
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(keywordQuery)}/all/th.thai`)
      const data = await res.json()
      if (data.code === 200 && data.status === "OK" && data.data?.matches) {
        setSearchResults(data.data.matches)
      } else if (data.status === "NOT FOUND") {
        setSearchResults([])
      } else {
        throw new Error("การค้นหาคำสำคัญไม่สมบูรณ์")
      }
    } catch (err) {
      console.error(err)
      setSearchError("ไม่พบข้อมูล หรือการเชื่อมต่อเครือข่ายขัดข้อง")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectSearchResult = (match) => {
    setSelectedSura(match.surah.number)
    setTargetScrollAyah(match.numberInSurah)
  }

  const handleOpenBookmarkModal = (v, existingBookmark) => {
    if (!uid) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพื่อทำบันทึกข้อคิด")
      return
    }
    
    setActiveBookmarkModal({
      verseId: v.id,
      sura: selectedSura,
      aya: v.aya,
      suraName: currentSuraInfo.englishName,
      arabicText: v.arabic_text,
      translation: v.translation,
      bookmarkId: existingBookmark?.id || null
    })
    setModalNotes(existingBookmark?.notes || "")
  }

  const handleSaveBookmark = async () => {
    if (!activeBookmarkModal) return
    const toastId = toast.loading("กำลังบันทึก...")
    
    try {
      const isNew = !activeBookmarkModal.bookmarkId
      const id = activeBookmarkModal.bookmarkId || `${uid}_sura_${activeBookmarkModal.sura}_aya_${activeBookmarkModal.aya}`
      
      await saveItem({
        id,
        uid,
        sura: activeBookmarkModal.sura,
        aya: activeBookmarkModal.aya,
        suraName: activeBookmarkModal.suraName,
        arabicText: activeBookmarkModal.arabicText,
        translation: activeBookmarkModal.translation,
        notes: modalNotes,
        updatedAt: new Date()
      })
      
      toast.success(isNew ? "บันทึกอายะฮ์สำเร็จ" : "อัปเดตข้อคิดแล้ว", { id: toastId })
      setActiveBookmarkModal(null)
    } catch (err) {
      toast.error("บันทึกผิดพลาดกรุณาลองใหม่", { id: toastId })
    }
  }

  const handleDeleteBookmark = async () => {
    if (!activeBookmarkModal?.bookmarkId) return
    const ok = await confirmAction({
      title: "ลบอายะฮ์ที่บันทึก?",
      message: "คุณต้องการลบข้อบันทึกสำหรับอายะฮ์นี้ใช่หรือไม่?",
      confirmText: "ลบออก",
      danger: true
    })
    
    if (ok) {
      const toastId = toast.loading("กำลังลบ...")
      try {
        await deleteItem(activeBookmarkModal.bookmarkId)
        toast.success("ลบรายการบันทึกแล้ว", { id: toastId })
        setActiveBookmarkModal(null)
      } catch (err) {
        toast.error("ลบไม่สำเร็จ", { id: toastId })
      }
    }
  }

  const getBookmarkForVerse = (ayaNumber) => {
    if (!uid) return null
    return savedVerses.find(v => v.uid === uid && v.sura === selectedSura && v.aya === ayaNumber)
  }

  // Filter Surahs
  const filteredSurahs = SURA_LIST.filter(s => {
    const query = search.toLowerCase().trim()
    return !query || 
      s.englishName.toLowerCase().includes(query) ||
      s.englishNameTranslation.toLowerCase().includes(query) ||
      s.name.includes(query) ||
      String(s.number) === query
  })

  const currentSuraInfo = SURA_LIST.find(s => s.number === selectedSura) || SURA_LIST[0]

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
    
    const transUrl = `https://quranenc.com/api/v1/translation/sura/${translationKey}/${selectedSura}`
    const tafsirUrl = `https://quranenc.com/api/v1/translation/sura/thai_mokhtasar/${selectedSura}`
    
    Promise.all([
      fetch(transUrl).then(res => {
        if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อคำแปลความหมายจากระบบ QuranEnc ได้")
        return res.json()
      }),
      fetch(tafsirUrl).then(res => {
        if (!res.ok) throw new Error("ไม่สามารถเชื่อมต่อบทอธิบายความหมายย่อ (Tafsir) ได้")
        return res.json()
      })
    ])
    .then(([transData, tafsirData]) => {
      if (!active) return
      
      const merged = transData.result.map((aya, idx) => {
        const tafsirAya = tafsirData.result[idx] || {}
        return {
          id: aya.id,
          sura: aya.sura,
          aya: aya.aya,
          arabic_text: aya.arabic_text,
          translation: aya.translation,
          tafsir: tafsirAya.translation || ""
        }
      })
      
      cache.current[cacheKey] = merged
      setVerses(merged)
      setLoading(false)
    })
    .catch(err => {
      if (!active) return
      console.error(err)
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต")
      setLoading(false)
    })
    
    return () => {
      active = false
    }
  }, [selectedSura, translationKey])

  useEffect(() => {
    if (targetScrollAyah && !loading && verses.length > 0) {
      const element = document.getElementById(`ayah-${targetScrollAyah}`)
      if (element) {
        const timer1 = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.classList.add("pulse-highlight")
          const timer2 = setTimeout(() => {
            element.classList.remove("pulse-highlight")
            setTargetScrollAyah(null)
          }, 3000)
          return () => clearTimeout(timer2)
        }, 350)
        return () => clearTimeout(timer1)
      }
    }
  }, [targetScrollAyah, loading, verses])

  // Helper to draw Arabic numbers inside verse markers (for Mushaf Mode)
  const getArabicNumber = (num) => {
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
    return String(num).split("").map(digit => arabicDigits[Number(digit)] || digit).join("")
  }

  const hasBismillah = selectedSura !== 1 && selectedSura !== 9

  return (
    <div className={`quran-container quran-theme-${readingTheme}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        
        .quran-container {
          padding: 24px;
          border-radius: 20px;
          background: var(--quran-bg);
          color: var(--quran-text);
          transition: background 0.3s, color 0.3s;
        }
        
        .quran-theme-light {
          --quran-bg: var(--bg);
          --quran-card-bg: var(--card);
          --quran-text: var(--text);
          --quran-t2: var(--t2);
          --quran-t3: var(--t3);
          --quran-br: var(--br);
          --quran-br2: var(--br2);
          --quran-acc2: var(--acc2);
          --quran-teal: var(--teal);
          --quran-teal-bg: var(--teal-bg);
        }
        
        .quran-theme-sepia {
          --quran-bg: #f6f0e2;
          --quran-card-bg: #faf5eb;
          --quran-text: #2d241e;
          --quran-t2: #5d5045;
          --quran-t3: #8d7d6f;
          --quran-br: #e5dbc1;
          --quran-br2: #efe6cc;
          --quran-acc2: #eedfb8;
          --quran-teal: #1b7a63;
          --quran-teal-bg: #ecf4f1;
        }
        
        .quran-theme-dark {
          --quran-bg: #121214;
          --quran-card-bg: #1e1e22;
          --quran-text: #e3ded7;
          --quran-t2: #9b968f;
          --quran-t3: #6b6660;
          --quran-br: #28282c;
          --quran-br2: #202023;
          --quran-acc2: #27272b;
          --quran-teal: #2dbea0;
          --quran-teal-bg: rgba(45, 190, 160, 0.08);
        }

        .quran-container .card {
          background: var(--quran-card-bg) !important;
          border-color: var(--quran-br) !important;
          color: var(--quran-text) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02) !important;
        }

        .quran-container h1, 
        .quran-container h2, 
        .quran-container h3 {
          color: var(--quran-text) !important;
        }

        .quran-container p,
        .quran-container span {
          color: var(--quran-t2);
        }

        .quran-container input,
        .quran-container select {
          background: var(--quran-card-bg) !important;
          color: var(--quran-text) !important;
          border-color: var(--quran-br) !important;
        }
        
        .quran-container input::placeholder {
          color: var(--quran-t3) !important;
        }

        .surah-item {
          transition: all 0.2s ease;
          cursor: pointer;
          color: var(--quran-text) !important;
          border-bottom: 0.5px solid var(--quran-br) !important;
        }
        
        .surah-item span,
        .surah-item div {
          color: inherit;
        }
        
        .surah-item:hover {
          background: var(--quran-bg) !important;
        }
        
        .surah-item.active {
          background: var(--quran-teal-bg) !important;
          border-left: 3.5px solid var(--quran-teal) !important;
          color: var(--quran-teal) !important;
          font-weight: 500;
        }
        
        .quran-sidebar {
          overflow-y: auto;
          flex: 1;
        }
        .quran-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .quran-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .quran-sidebar::-webkit-scrollbar-thumb {
          background: var(--quran-br);
          border-radius: 4px;
        }
        .arabic-font {
          font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif;
          direction: rtl;
          text-align: right;
          line-height: 2.6;
          color: var(--quran-text);
        }
        .mushaf-flow {
          text-align: justify;
          direction: rtl;
          line-height: 2.6;
          color: var(--quran-text);
        }
        .mode-btn {
          font-family: 'Prompt', sans-serif;
          font-size: 11px;
          font-weight: 400;
          padding: 5px 12px;
          border-radius: 20px;
          border: 0.5px solid var(--quran-br);
          background: var(--quran-card-bg);
          color: var(--quran-t2);
          cursor: pointer;
          transition: all 0.15s;
        }
        .mode-btn.active {
          background: var(--quran-teal);
          color: #fff;
          border-color: var(--quran-teal);
        }
        .size-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 0.5px solid var(--quran-br);
          background: var(--quran-card-bg);
          color: var(--quran-text);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.15s;
        }
        .size-btn:hover {
          background: var(--quran-bg);
        }
        .tafsir-box {
          background: var(--quran-acc2);
          border-left: 3px solid var(--quran-teal);
          padding: 14px 18px;
          border-radius: 0 10px 10px 0;
          margin-top: 8px;
        }
        .tafsir-box div {
          color: var(--quran-text);
        }
        @keyframes pulse-highlight {
          0% { background-color: var(--quran-teal-bg); box-shadow: 0 0 12px rgba(45, 190, 160, 0.4); }
          50% { background-color: rgba(45, 190, 160, 0.25); box-shadow: 0 0 15px rgba(45, 190, 160, 0.5); }
          100% { background-color: transparent; box-shadow: none; }
        }
        .pulse-highlight {
          animation: pulse-highlight 3.2s ease-in-out;
          border-radius: 8px;
        }
        .sidebar-tab-btn {
          flex: 1;
          padding: 8px;
          font-family: 'Prompt', sans-serif;
          font-size: 12px;
          font-weight: 500;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--quran-t3);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .sidebar-tab-btn.active {
          color: var(--quran-teal);
          border-bottom-color: var(--quran-teal);
        }
        .search-result-item {
          padding: 12px;
          border-bottom: 0.5px solid var(--quran-br);
          cursor: pointer;
          transition: all 0.2s;
          color: var(--quran-text);
        }
        .search-result-item:hover {
          background: var(--quran-bg);
        }
        .search-highlight {
          background-color: rgba(255, 179, 0, 0.25);
          padding: 0 2px;
          border-radius: 2px;
          font-weight: 500;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* HEADER TITLE */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 8 }}>พระมหาคัมภีร์อัลกุรอาน</h1>
        <p style={{ color: "var(--t2)" }}>
          ระบบอ่านอัลกุรอานภาษาไทย พร้อมคำแปลความหมายต่ออายะฮ์ และบทอธิบายความหมายย่อ (ตัฟซีรย่อ)
        </p>
      </div>

      {/* CONTENT LAYOUT */}
      <div style={{ display: "flex", gap: sidebarCollapsed && !isMobile ? 0 : 24, flexDirection: isMobile ? "column" : "row", position: "relative" }}>
        {!isMobile ? (
          <div style={{ 
            width: sidebarCollapsed ? 0 : 280, 
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flexShrink: 0,
            height: "calc(100vh - 120px)",
            position: "sticky",
            top: 20,
            zIndex: 10
          }}>
            {/* Floating Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                position: "absolute",
                right: sidebarCollapsed ? "-16px" : "-16px",
                top: "40px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--quran-teal)",
                color: "#fff",
                border: "2.5px solid var(--quran-card-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 20,
                boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                transition: "transform 0.2s ease"
              }}
              title={sidebarCollapsed ? "เปิดแถบรายชื่อซูเราะฮ์" : "ปิดแถบรายชื่อซูเราะฮ์"}
            >
              <i className={`ti ${sidebarCollapsed ? "ti-chevron-right" : "ti-chevron-left"}`} style={{ fontSize: 12, fontWeight: "bold" }}></i>
            </button>

            {/* Inner Wrapper (to hide content during collapse) */}
            <div style={{
              width: 280,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              opacity: sidebarCollapsed ? 0 : 1,
              transition: "opacity 0.25s ease",
              pointerEvents: sidebarCollapsed ? "none" : "auto",
              overflow: "hidden"
            }}>
              {/* Sidebar Tabs */}
              <div style={{ display: "flex", borderBottom: "0.5px solid var(--quran-br)" }}>
                <button 
                  className={`sidebar-tab-btn ${sidebarTab === "surah" ? "active" : ""}`}
                  onClick={() => setSidebarTab("surah")}
                >
                  รายชื่อซูเราะฮ์
                </button>
                <button 
                  className={`sidebar-tab-btn ${sidebarTab === "search" ? "active" : ""}`}
                  onClick={() => setSidebarTab("search")}
                >
                  ค้นหาในอายะฮ์
                </button>
              </div>

              {/* Sidebar Tab Content */}
              {sidebarTab === "surah" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
                  <div style={{ position: "relative" }}>
                    <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--quran-t3)", fontSize: 13 }}></i>
                    <input 
                      placeholder="ค้นหาชื่อซูเราะห์..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ width: "100%", paddingLeft: 30, paddingRight: 10, height: 36, fontSize: 12, borderRadius: 8, border: "0.5px solid var(--quran-br)" }}
                    />
                  </div>
                  
                  <div className="quran-sidebar card" style={{ padding: 0, display: "flex", flexDirection: "column", overflowY: "auto", minHeight: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {filteredSurahs.map(s => (
                        <div 
                          key={s.number} 
                          className={`surah-item ${selectedSura === s.number ? "active" : ""}`}
                          onClick={() => setSelectedSura(s.number)}
                          style={{ 
                            padding: "10px 14px", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            borderBottom: "0.5px solid var(--quran-br)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "10px", color: "var(--quran-t3)", width: 18, textAlign: "center" }}>{s.number}</span>
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: 500 }}>{s.englishName}</div>
                              <div style={{ fontSize: "9px", color: "var(--quran-t2)" }}>{s.englishNameTranslation}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "14px", fontFamily: "'Amiri', serif" }}>{s.name}</div>
                            <div style={{ fontSize: "9px", color: "var(--quran-t3)" }}>{s.numberOfAyahs} อายะฮ์</div>
                          </div>
                        </div>
                      ))}
                      {filteredSurahs.length === 0 && (
                        <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--quran-t3)" }}>ไม่พบผลลัพธ์</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // KEYWORD SEARCH TAB
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
                  <form onSubmit={handleKeywordSearch} style={{ display: "flex", gap: 6 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--quran-t3)", fontSize: 13 }}></i>
                      <input 
                        placeholder="เช่น สวรรค์, ความเมตตา, นบี..."
                        value={keywordQuery}
                        onChange={e => setKeywordQuery(e.target.value)}
                        style={{ width: "100%", paddingLeft: 30, paddingRight: 10, height: 36, fontSize: 12, borderRadius: 8, border: "0.5px solid var(--quran-br)" }}
                      />
                    </div>
                    <button className="btn btn-teal" style={{ height: 36, padding: "0 12px", fontSize: 12 }} type="submit">ค้นหา</button>
                  </form>

                  {searchLoading && (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <i className="ti ti-loader-2 spin" style={{ fontSize: 20, color: "var(--quran-teal)" }}></i>
                      <div style={{ fontSize: 11, color: "var(--quran-t3)", marginTop: 6 }}>กำลังค้นหา...</div>
                    </div>
                  )}

                  {searchError && (
                    <div style={{ color: "var(--red)", fontSize: 11, padding: 8, textAlign: "center" }}>
                      {searchError}
                    </div>
                  )}

                  {!searchLoading && !searchError && (
                    <div className="quran-sidebar card" style={{ padding: 0, display: "flex", flexDirection: "column", overflowY: "auto", minHeight: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {searchResults.length > 0 ? (
                          searchResults.map((match, i) => {
                            const highlightText = (text, query) => {
                              if (!query) return text
                              const parts = text.split(new RegExp(`(${query})`, "gi"))
                              return parts.map((part, idx) => 
                                part.toLowerCase() === query.toLowerCase() 
                                  ? <span key={idx} className="search-highlight">{part}</span> 
                                  : part
                              )
                            }

                            return (
                              <div 
                                key={`${match.surah.number}_${match.numberInSurah}_${i}`} 
                                className="search-result-item"
                                onClick={() => handleSelectSearchResult(match)}
                                style={{ padding: "12px", borderBottom: "0.5px solid var(--quran-br)" }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--quran-teal)" }}>
                                    ซูเราะฮ์ {match.surah.englishName} ({match.numberInSurah})
                                  </span>
                                  <span style={{ fontSize: 9, color: "var(--quran-t3)" }}>
                                    [{match.surah.number}:{match.numberInSurah}]
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: "var(--quran-text)", lineHeight: 1.45 }}>
                                  {highlightText(match.text, keywordQuery)}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div style={{ padding: 24, textAlign: "center", fontSize: 11, color: "var(--quran-t3)" }}>
                            {keywordQuery ? "ไม่พบคำสำคัญนี้ในพระคัมภีร์" : "พิมพ์คำค้นหาและกดปุ่มเพื่อเริ่มค้นหาความหมาย"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MOBILE SELECT TRIGGER BAR */
          <div 
            onClick={() => setIsMobileNavOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "var(--quran-card-bg)",
              border: "1px solid var(--quran-br)",
              borderRadius: "12px",
              cursor: "pointer",
              marginBottom: "4px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="ti ti-book" style={{ color: "var(--quran-teal)", fontSize: 16 }}></i>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--quran-text)" }}>
                  ซูเราะฮ์ {currentSuraInfo.number}: {currentSuraInfo.englishName}
                </div>
                <div style={{ fontSize: "10px", color: "var(--quran-t2)" }}>
                  {currentSuraInfo.englishNameTranslation} • {currentSuraInfo.numberOfAyahs} อายะฮ์ (แตะเพื่อเลือก/ค้นหา)
                </div>
              </div>
            </div>
            <i className="ti ti-chevron-down" style={{ color: "var(--quran-t3)", fontSize: 14 }}></i>
          </div>
        )}

        {/* MAIN PANEL */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* SURAH SUMMARY CARD */}
          <div className="card" style={{ padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-teal" style={{ fontSize: 9 }}>ซูเราะห์ที่ {currentSuraInfo.number}</span>
                <span className="badge badge-acc" style={{ fontSize: 9 }}>
                  {currentSuraInfo.revelationType === "Meccan" ? "มักกียะฮ์ (ประทานที่มักกะฮ์)" : "มะดะนียะฮ์ (ประทานที่มะดีนะฮ์)"}
                </span>
              </div>
              <h2 style={{ marginTop: 6, fontSize: 18, fontWeight: 600 }}>
                {currentSuraInfo.englishName} <span style={{ fontWeight: 300, fontSize: 13, color: "var(--t2)" }}>({currentSuraInfo.englishNameTranslation})</span>
              </h2>
              <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
                จำนวน {currentSuraInfo.numberOfAyahs} อายะฮ์
              </div>
            </div>
            
            {/* Arabic Big Calligraphy Name */}
            <div style={{ fontSize: 32, fontFamily: "'Amiri', serif", color: "var(--teal)", textShadow: "0 0 1px rgba(45,190,160,0.1)" }}>
              {currentSuraInfo.name}
            </div>
          </div>

          {/* SURAH OBJECTIVE CARD */}
          {getSurahTheme(selectedSura) && (
            <div className="card" style={{ padding: "14px 18px", marginBottom: 16, borderLeft: "4px solid var(--teal)", background: "var(--bg3)" }}>
              <div 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setShowObjective(!showObjective)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 13, color: "var(--teal)" }}>
                  <i className="ti ti-bulb" style={{ fontSize: 16 }}></i>
                  เป้าหมายและวัตถุประสงค์หลักของซูเราะฮ์
                </div>
                <i className={`ti ${showObjective ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: 14, color: "var(--t2)" }}></i>
              </div>
              
              {showObjective && (
                <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6 }}>
                  <p style={{ fontWeight: 500, color: "var(--text)", margin: "0 0 8px 0" }}>
                    {getSurahTheme(selectedSura).objective}
                  </p>
                  {getSurahTheme(selectedSura).keyThemes && getSurahTheme(selectedSura).keyThemes.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600, display: "block", marginBottom: 4 }}>ประเด็นสำคัญประจำบท:</span>
                      <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "var(--t3)" }}>
                        {getSurahTheme(selectedSura).keyThemes.map((topic, idx) => (
                          <li key={idx}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CONTROLS CARD */}
          <div className="card" style={{ padding: "12px 16px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              
              {/* Mode Select Buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                <button 
                  className={`mode-btn ${mode === "translation" ? "active" : ""}`}
                  onClick={() => setMode("translation")}
                >
                  แปลทีละอายะฮ์
                </button>
                <button 
                  className={`mode-btn ${mode === "tafsir" ? "active" : ""}`}
                  onClick={() => setMode("tafsir")}
                >
                  คำแปล + ตัฟซีรย่อ
                </button>
                <button 
                  className={`mode-btn ${mode === "mushaf" ? "active" : ""}`}
                  onClick={() => setMode("mushaf")}
                >
                  มุศฮัฟ (ภาษาอาหรับล้วน)
                </button>
              </div>

              {/* Font Resizing & Theme Controls */}
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                
                {/* Theme Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--quran-t2)" }}>โทนสี:</span>
                  <div style={{ display: "flex", gap: 6, background: "var(--quran-bg)", padding: "3px 6px", borderRadius: 20, border: "0.5px solid var(--quran-br)" }}>
                    <button 
                      onClick={() => setReadingTheme("light")}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: readingTheme === "light" ? "2px solid var(--quran-teal)" : "0.5px solid #ccc",
                        cursor: "pointer",
                        padding: 0
                      }}
                      title="โทนสีสว่าง"
                    />
                    <button 
                      onClick={() => setReadingTheme("sepia")}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#faf5eb",
                        border: readingTheme === "sepia" ? "2px solid var(--quran-teal)" : "0.5px solid #e2d6bc",
                        cursor: "pointer",
                        padding: 0
                      }}
                      title="โทนสีถนอมสายตา (Sepia)"
                    />
                    <button 
                      onClick={() => setReadingTheme("dark")}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#1d1d20",
                        border: readingTheme === "dark" ? "2px solid var(--quran-teal)" : "0.5px solid #555",
                        cursor: "pointer",
                        padding: 0
                      }}
                      title="โทนสีมืด"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--quran-t2)" }}>อาหรับ:</span>
                  <button className="size-btn" onClick={() => setArabicSize(prev => Math.max(prev - 2, 20))} title="ย่อขนาดอักษรอาหรับ"><i className="ti ti-minus"></i></button>
                  <span style={{ fontSize: 11, width: 22, textAlign: "center", fontWeight: 500 }}>{arabicSize}</span>
                  <button className="size-btn" onClick={() => setArabicSize(prev => Math.min(prev + 2, 52))} title="ขยายขนาดอักษรอาหรับ"><i className="ti ti-plus"></i></button>
                </div>
                {mode !== "mushaf" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--quran-t2)" }}>ภาษาไทย:</span>
                    <button className="size-btn" onClick={() => setThaiSize(prev => Math.max(prev - 1, 12))} title="ย่อขนาดอักษรไทย"><i className="ti ti-minus"></i></button>
                    <span style={{ fontSize: 11, width: 22, textAlign: "center", fontWeight: 500 }}>{thaiSize}</span>
                    <button className="size-btn" onClick={() => setThaiSize(prev => Math.min(prev + 1, 26))} title="ขยายขนาดอักษรไทย"><i className="ti ti-plus"></i></button>
                  </div>
                )}
              </div>
            </div>

            {/* Translation Selection (Hidden in Mushaf mode) */}
            {mode !== "mushaf" && (
              <div style={{ borderTop: "0.5px solid var(--br2)", paddingTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--t2)" }}>สำนวนแปลความหมายไทย:</span>
                <select 
                  value={translationKey}
                  onChange={e => setTranslationKey(e.target.value)}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "0.5px solid var(--br)", fontSize: 11, fontFamily: "'Prompt', sans-serif", background: "var(--card)", color: "var(--text)" }}
                >
                  <option value="thai_complex">สำนวนแปลความหมาย คิงฟะฮัด (King Fahd Complex)</option>
                  <option value="thai_rwwad">สำนวนแปลความหมาย ศูนย์ Rowwad Translation Center</option>
                </select>
              </div>
            )}
          </div>

          {/* LOADING & ERROR STATES */}
          {loading && (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <i className="ti ti-loader-2 spin" style={{ fontSize: 24, color: "var(--teal)", marginBottom: 8 }}></i>
              <div style={{ fontSize: 13, color: "var(--t2)" }}>กำลังโหลดพระดำรัสและไฟล์ข้อมูลอายะฮ์...</div>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: 24, borderColor: "rgba(220, 38, 38, 0.3)", background: "rgba(220, 38, 38, 0.03)", textAlign: "center" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 24, color: "var(--red)", marginBottom: 8 }}></i>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>เกิดข้อผิดพลาด</div>
              <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 12 }}>{error}</p>
              <button className="btn btn-teal" style={{ fontSize: 11, padding: "5px 14px" }} onClick={() => setTranslationKey(prev => prev)}>ลองอีกครั้ง</button>
            </div>
          )}

          {/* READING AREA */}
          {!loading && !error && verses.length > 0 && (
            <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* BISMILLAH PREPEND */}
              {hasBismillah && (
                <div style={{ 
                  textAlign: "center", 
                  margin: "12px 0 24px", 
                  fontSize: `${arabicSize + 2}px`, 
                  fontFamily: "'Amiri', serif", 
                  color: "var(--text)", 
                  lineHeight: 1.5,
                  direction: "rtl"
                }}>
                  بِسْمِ اللَّهِ الرَّحْمัٰنِ الرَّحِيمِ
                </div>
              )}

              {/* MUSHAF MODE (FLOW TEXT) */}
              {mode === "mushaf" ? (
                <div 
                  className="mushaf-flow" 
                  style={{ 
                    fontSize: `${arabicSize}px`, 
                    fontFamily: "'Amiri', serif", 
                    color: "var(--text)", 
                    direction: "rtl",
                    textAlign: "justify",
                    lineHeight: 2.3
                  }}
                >
                  {verses.map(v => (
                    <span key={v.id}>
                      {v.arabic_text}{" "}
                      <span 
                        style={{ 
                          fontFamily: "sans-serif", 
                          fontSize: `${Math.round(arabicSize * 0.5)}px`, 
                          color: "var(--teal)", 
                          fontWeight: "bold",
                          margin: "0 4px",
                          display: "inline-flex",
                          width: `${Math.round(arabicSize * 0.95)}px`,
                          height: `${Math.round(arabicSize * 0.95)}px`,
                          border: "1.5px solid var(--teal)",
                          borderRadius: "50%",
                          alignItems: "center",
                          justifyContent: "center",
                          direction: "ltr"
                        }}
                      >
                        {getArabicNumber(v.aya)}
                      </span>{" "}
                    </span>
                  ))}
                </div>
              ) : (
                
                /* TRANSLATION & TAFSIR MODES (VERSE LIST) */
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {verses.map(v => {
                    const bookmark = getBookmarkForVerse(v.aya)
                    return (
                      <div 
                        key={v.id} 
                        id={`ayah-${v.aya}`}
                        style={{ 
                          borderBottom: "0.5px solid var(--br2)", 
                          paddingBottom: 20, 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: 12,
                          padding: "10px 10px 20px 10px",
                          transition: "background-color 0.3s"
                        }}
                      >
                        {/* Verse marker and Bookmark button */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace" }}>
                            [{v.sura}:{v.aya}]
                          </span>
                          
                          <button 
                            onClick={() => handleOpenBookmarkModal(v, bookmark)}
                            style={{ 
                              background: "transparent", 
                              border: "none", 
                              cursor: "pointer", 
                              color: bookmark ? "var(--teal)" : "var(--t3)",
                              padding: "4px 8px",
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}
                            title={bookmark ? "แก้ไขข้อคิด/ยกเลิกการบันทึก" : "บันทึกอายะฮ์นี้และจดข้อคิด"}
                          >
                            <i className={bookmark ? "ti ti-bookmark-filled" : "ti ti-bookmark"}></i>
                            <span style={{ fontSize: 10, fontFamily: "'Prompt', sans-serif" }}>
                              {bookmark ? "บันทึกแล้ว" : "บันทึก"}
                            </span>
                          </button>
                        </div>

                        {/* Arabic text */}
                        <div 
                          className="arabic-font" 
                          style={{ 
                            fontSize: `${arabicSize}px`, 
                            color: "var(--text)",
                            paddingRight: 6
                          }}
                        >
                          {v.arabic_text}
                        </div>

                        {/* Thai Translation */}
                        <div 
                          style={{ 
                            fontSize: `${thaiSize}px`, 
                            lineHeight: 1.6, 
                            color: mode === "tafsir" ? "var(--t2)" : "var(--text)", 
                            fontWeight: mode === "tafsir" ? 300 : 400 
                          }}
                        >
                          {v.translation}
                        </div>

                        {/* Thai Exegesis / Tafsir Block */}
                        {mode === "tafsir" && v.tafsir && (
                          <div className="tafsir-box">
                            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--teal)", marginBottom: 4 }}>
                              คำอธิบายความหมายย่อ (ตัฟซีร):
                            </div>
                            <div style={{ fontSize: `${thaiSize - 0.5}px`, lineHeight: 1.6, color: "var(--text)", fontWeight: 300 }}>
                              {v.tafsir}
                            </div>
                          </div>
                        )}

                        {/* User saved notes / reflections (ประโยชน์ที่ได้รับ) */}
                        {bookmark && (
                          <div style={{ 
                            background: "rgba(45, 190, 160, 0.04)", 
                            borderLeft: "3px solid var(--teal)", 
                            padding: "8px 12px", 
                            borderRadius: "0 8px 8px 0", 
                            marginTop: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 10
                          }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 10, color: "var(--teal)", fontWeight: 600, display: "block", marginBottom: 2 }}>
                                ข้อคิดและประโยชน์ที่คุณจดบันทึกไว้:
                              </span>
                              <p style={{ fontSize: 12, margin: 0, color: "var(--text)", fontStyle: bookmark.notes ? "normal" : "italic" }}>
                                {bookmark.notes || "ไม่มีข้อความบันทึก (กดที่ปุ่มบันทึกเพื่อเพิ่มข้อคิด)"}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleOpenBookmarkModal(v, bookmark)}
                              style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: 12, padding: 4 }}
                              title="แก้ไขบันทึก"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* VERSE BENEFITS (فوائد الآيات) */}
          {!loading && !error && verses.length > 0 && (() => {
            const suraBenefits = QURAN_BENEFITS[selectedSura] || [];
            if (suraBenefits.length === 0) return null;
            return (
              <div 
                className="card" 
                style={{ 
                  marginTop: 20, 
                  padding: "20px 24px", 
                  borderLeft: "4px solid var(--quran-teal)", 
                  background: "var(--quran-teal-bg)" 
                }}
              >
                <div 
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => setBenefitsExpanded(!benefitsExpanded)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <i className="ti ti-bulb" style={{ color: "var(--quran-teal)", fontSize: 18 }}></i>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--quran-text)", display: "block" }}>
                        ประโยชน์และข้อคิดที่ได้รับจากโองการต่างๆ ในซูเราะฮ์นี้
                      </span>
                      <span style={{ fontSize: 10, color: "var(--quran-t2)" }}>
                        فوائد الآيات وهداياتها (ตัฟซีรอัลมุคตะศ็อร)
                      </span>
                    </div>
                  </div>
                  <i className={`ti ${benefitsExpanded ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ color: "var(--quran-t2)", fontSize: 16 }}></i>
                </div>

                {benefitsExpanded && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                    {suraBenefits.map((b, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          borderBottom: idx === suraBenefits.length - 1 ? "none" : "0.5px solid var(--quran-br)", 
                          paddingBottom: idx === suraBenefits.length - 1 ? 0 : 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6
                        }}
                      >
                        {/* Arabic Benefit */}
                        <div 
                          style={{ 
                            fontFamily: "'Amiri', serif", 
                            fontSize: 20, 
                            direction: "rtl", 
                            textAlign: "right",
                            lineHeight: 1.5,
                            color: "var(--quran-teal)" 
                          }}
                        >
                          {b.arabic}
                        </div>
                        
                        {/* Thai Benefit */}
                        <div style={{ fontSize: "12.5px", lineHeight: 1.6, color: "var(--quran-text)", fontWeight: 400, textAlign: "left" }}>
                          • {b.thai}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* LICENCE AND CREDIT BANNER */}
          <div 
            style={{ 
              marginTop: 24, 
              padding: "16px 20px", 
              borderRadius: 12, 
              border: "0.5px solid var(--quran-br)", 
              background: "var(--quran-card-bg)", 
              fontSize: "11px", 
              color: "var(--quran-t2)", 
              lineHeight: "1.6" 
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--quran-text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-license" style={{ fontSize: 14, color: "var(--quran-teal)" }}></i>
              แหล่งข้อมูลและลิขสิทธิ์ข้อมูลเผยแพร่
            </div>
            ข้อมูลแปลความหมายพระมหาคัมภีร์อัลกุรอานและตัฟซีรย่อภาษาไทยได้รับการสนับสนุนจาก <strong>โครงการสารานุกรมอัลกุรอาน (QuranEnc.com)</strong>
            <ul style={{ paddingLeft: 16, marginTop: 4, display: "flex", flexDirection: "column", gap: 2, listStyleType: "none", textAlign: "left" }}>
              <li>• สำนวนคำแปลภาษาไทย: ศูนย์แปล Rowwad Translation Center และ คณะผู้ทรงคุณวุฒิ (สมาคมศิษย์เก่ามหาวิทยาลัยในต่างประเทศ)</li>
              <li>• บทอธิบายคำแปลย่อ (ตัฟซีรย่อ): หนังสือตัฟซีรอัลมุคตะศ็อร (Al-Mukhtasar fi Tafsir al-Qur'an) แปลภาษาไทย</li>
              <li>• พัฒนาโดยอ้างอิงข้อมูลเวอร์ชันล่าสุดของโครงการ ซึ่งไม่อนุญาตให้ดัดแปลงหรือตัดต่อเนื้อหาคัดลอกใดๆ เพื่อความถูกต้องของพระดำรัส</li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOOKMARK REFLECTION MODAL */}
      {activeBookmarkModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16
        }}>
          <div className="card" style={{
            maxWidth: 540,
            width: "100%",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--quran-card-bg)",
            border: "0.5px solid var(--quran-br)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--quran-text)", margin: 0 }}>
                {activeBookmarkModal.bookmarkId ? "แก้ไขบันทึกข้อคิดอายะฮ์" : "บันทึกข้อคิดและประโยชน์จากอายะฮ์"}
              </h3>
              <button 
                onClick={() => setActiveBookmarkModal(null)} 
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--quran-t3)" }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div style={{ padding: 12, background: "var(--quran-bg)", borderRadius: 8, border: "0.5px solid var(--quran-br2)" }}>
              <span style={{ fontSize: 10, color: "var(--quran-t3)", fontWeight: 500 }}>
                ซูเราะฮ์ {activeBookmarkModal.suraName} อายะฮ์ที่ {activeBookmarkModal.aya}
              </span>
              <div style={{ 
                fontFamily: "'Amiri', serif", 
                fontSize: 22, 
                direction: "rtl", 
                textAlign: "right", 
                margin: "8px 0",
                lineHeight: 1.6,
                color: "var(--quran-text)"
              }}>
                {activeBookmarkModal.arabicText}
              </div>
              <div style={{ fontSize: 12, color: "var(--quran-t2)", lineHeight: 1.45, textAlign: "left" }}>
                {activeBookmarkModal.translation}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--quran-teal)" }}>
                บันทึกข้อคิด/ประโยชน์ที่ได้รับ (จดบันทึกส่วนตัวเพื่อเตือนตนเอง):
              </label>
              <textarea 
                value={modalNotes}
                onChange={e => setModalNotes(e.target.value)}
                placeholder="พิมพ์สิ่งที่ได้รับจากโองการนี้ เช่น ข้อเตือนใจ, ข้อปฏิบัติในชีวิตประจำวัน..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 8,
                  border: "0.5px solid var(--quran-br)",
                  background: "var(--quran-card-bg)",
                  color: "var(--quran-text)",
                  fontSize: 13,
                  fontFamily: "'Prompt', sans-serif"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div>
                {activeBookmarkModal.bookmarkId && (
                  <button 
                    className="btn btn-outline" 
                    style={{ color: "var(--red)", borderColor: "rgba(220, 38, 38, 0.2)", fontSize: 12, padding: "6px 14px" }}
                    onClick={handleDeleteBookmark}
                  >
                    <i className="ti ti-trash" style={{ marginRight: 4 }}></i> ลบบันทึก
                  </button>
                )}
              </div>
              
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: 12, padding: "6px 16px" }}
                  onClick={() => setActiveBookmarkModal(null)}
                >
                  ยกเลิก
                </button>
                <button 
                  className="btn btn-teal" 
                  style={{ fontSize: 12, padding: "6px 16px" }}
                  onClick={handleSaveBookmark}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET NAVIGATION DRAWER */}
      {isMobile && isMobileNavOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center"
        }}
        onClick={() => setIsMobileNavOpen(false)}
        >
          <div 
            style={{
              width: "100%",
              maxHeight: "85vh",
              background: "var(--quran-card-bg)",
              borderRadius: "20px 20px 0 0",
              display: "flex",
              flexDirection: "column",
              padding: "16px 20px 24px",
              gap: 12,
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
              border: "1px solid var(--quran-br)",
              borderBottom: "none"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Drag bar & Close */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--quran-br)" }}></div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--quran-text)", margin: 0 }}>เลือกซูเราะฮ์ / ค้นหา</h3>
              <button 
                onClick={() => setIsMobileNavOpen(false)}
                style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "var(--quran-t2)" }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            {/* Sidebar Tabs inside Mobile Drawer */}
            <div style={{ display: "flex", borderBottom: "0.5px solid var(--quran-br)" }}>
              <button 
                className={`sidebar-tab-btn ${sidebarTab === "surah" ? "active" : ""}`}
                onClick={() => setSidebarTab("surah")}
              >
                รายชื่อซูเราะฮ์
              </button>
              <button 
                className={`sidebar-tab-btn ${sidebarTab === "search" ? "active" : ""}`}
                onClick={() => setSidebarTab("search")}
              >
                ค้นหาในอายะฮ์
              </button>
            </div>

            {/* Content inside drawer */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "hidden" }}>
              {sidebarTab === "surah" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
                  <div style={{ position: "relative" }}>
                    <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--quran-t3)", fontSize: 13 }}></i>
                    <input 
                      placeholder="ค้นหาชื่อซูเราะห์..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ width: "100%", paddingLeft: 30, paddingRight: 10, height: 36, fontSize: 12, borderRadius: 8, border: "0.5px solid var(--quran-br)" }}
                    />
                  </div>
                  
                  <div className="quran-sidebar" style={{ overflowY: "auto", flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {filteredSurahs.map(s => (
                        <div 
                          key={s.number} 
                          className={`surah-item ${selectedSura === s.number ? "active" : ""}`}
                          onClick={() => {
                            setSelectedSura(s.number);
                            setIsMobileNavOpen(false);
                          }}
                          style={{ 
                            padding: "10px 14px", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            borderBottom: "0.5px solid var(--quran-br)",
                            borderRadius: 6
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "10px", color: "var(--quran-t3)", width: 18, textAlign: "center" }}>{s.number}</span>
                            <div style={{ textAlign: "left" }}>
                              <div style={{ fontSize: "12px", fontWeight: 500 }}>{s.englishName}</div>
                              <div style={{ fontSize: "9px", color: "var(--quran-t2)" }}>{s.englishNameTranslation}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "14px", fontFamily: "'Amiri', serif" }}>{s.name}</div>
                            <div style={{ fontSize: "9px", color: "var(--quran-t3)" }}>{s.numberOfAyahs} อายะฮ์</div>
                          </div>
                        </div>
                      ))}
                      {filteredSurahs.length === 0 && (
                        <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--quran-t3)" }}>ไม่พบผลลัพธ์</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // KEYWORD SEARCH TAB
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
                  <form onSubmit={handleKeywordSearch} style={{ display: "flex", gap: 6 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--quran-t3)", fontSize: 13 }}></i>
                      <input 
                        placeholder="เช่น สวรรค์, ความเมตตา, นบี..."
                        value={keywordQuery}
                        onChange={e => setKeywordQuery(e.target.value)}
                        style={{ width: "100%", paddingLeft: 30, paddingRight: 10, height: 36, fontSize: 12, borderRadius: 8, border: "0.5px solid var(--quran-br)" }}
                      />
                    </div>
                    <button className="btn btn-teal" style={{ height: 36, padding: "0 12px", fontSize: 12 }} type="submit">ค้นหา</button>
                  </form>

                  {searchLoading && (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <i className="ti ti-loader-2 spin" style={{ fontSize: 20, color: "var(--quran-teal)" }}></i>
                      <div style={{ fontSize: 11, color: "var(--quran-t3)", marginTop: 6 }}>กำลังค้นหา...</div>
                    </div>
                  )}

                  {searchError && (
                    <div style={{ color: "var(--red)", fontSize: 11, padding: 8, textAlign: "center" }}>
                      {searchError}
                    </div>
                  )}

                  {!searchLoading && !searchError && (
                    <div className="quran-sidebar" style={{ overflowY: "auto", flex: 1 }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {searchResults.length > 0 ? (
                          searchResults.map((match, i) => {
                            const highlightText = (text, query) => {
                              if (!query) return text
                              const parts = text.split(new RegExp(`(${query})`, "gi"))
                              return parts.map((part, idx) => 
                                part.toLowerCase() === query.toLowerCase() 
                                  ? <span key={idx} className="search-highlight">{part}</span> 
                                  : part
                              )
                            }

                            return (
                              <div 
                                key={`${match.surah.number}_${match.numberInSurah}_${i}`} 
                                className="search-result-item"
                                onClick={() => {
                                  handleSelectSearchResult(match);
                                  setIsMobileNavOpen(false);
                                }}
                                style={{ padding: "12px", borderBottom: "0.5px solid var(--quran-br)" }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--quran-teal)" }}>
                                    ซูเราะฮ์ {match.surah.englishName} ({match.numberInSurah})
                                  </span>
                                  <span style={{ fontSize: 9, color: "var(--quran-t3)" }}>
                                    [{match.surah.number}:{match.numberInSurah}]
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: "var(--quran-text)", lineHeight: 1.45, textAlign: "left" }}>
                                  {highlightText(match.text, keywordQuery)}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div style={{ padding: 24, textAlign: "center", fontSize: 11, color: "var(--quran-t3)" }}>
                            {keywordQuery ? "ไม่พบคำสำคัญนี้" : "พิมพ์คำค้นหาเพื่อเริ่มค้นหาอายะฮ์"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
