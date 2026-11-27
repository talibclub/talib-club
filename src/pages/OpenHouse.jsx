import React, { useState, useEffect, useMemo } from "react"
import SEOHead from "../components/SEOHead.jsx"
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import {
  OPENHOUSE_PLATFORM_ORDER,
  OPENHOUSE_CATEGORIES,
  normalizeFirestoreBooth,
  mergeOpenHouseBooths,
} from "../data/openhouse.js"
import "../styles/openhouse.css"

const CATEGORY_LABEL_MAP = Object.fromEntries(
  OPENHOUSE_CATEGORIES.map((c) => [c.id, c.label])
)

export default function OpenHouse({ go }) {
  const [platforms, setPlatforms] = useState([])
  const [booths, setBooths] = useState([])
  const [loading, setLoading] = useState(true)

  // Current view state: 'zones' (Main Hall), 'booths' (Platform or Category selected)
  const [view, setView] = useState("zones")
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchBooths = async () => {
      let firestoreBooths = []
      let deletedSlugs = []
      try {
        const q = query(collection(db, "openhouse_booths"), orderBy("order", "asc"))
        const [snap, settingsSnap] = await Promise.all([
          getDocs(q),
          getDoc(doc(db, "settings", "openhouse")).catch(() => null),
        ])
        firestoreBooths = snap.docs.map(d => normalizeFirestoreBooth(d.id, d.data()))
        if (settingsSnap?.exists()) {
          deletedSlugs = settingsSnap.data().deletedSlugs || []
        }
      } catch (err) {
        console.error("Error fetching open house data", err)
      }

      const allBooths = mergeOpenHouseBooths(firestoreBooths, deletedSlugs)
      setBooths(allBooths)

      // Extract unique platforms
      const uniquePlatforms = new Set()
      allBooths.forEach(b => {
        const plats = b.platforms || (b.platform ? [b.platform] : [])
        plats.forEach(p => uniquePlatforms.add(p))
      })

      const sortedPlatforms = Array.from(uniquePlatforms).sort((a, b) => {
        const ia = OPENHOUSE_PLATFORM_ORDER.indexOf(a)
        const ib = OPENHOUSE_PLATFORM_ORDER.indexOf(b)
        if (ia === -1 && ib === -1) return a.localeCompare(b)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })

      const platformData = sortedPlatforms.map(p => {
        const count = allBooths.filter(b => {
          const plats = b.platforms || (b.platform ? [b.platform] : [])
          return plats.includes(p)
        }).length

        let icon = "ti-world"
        let title = p
        if (p === "YouTube") { icon = "ti-brand-youtube"; title = "วิดีโอ (YouTube)"; }
        if (p === "Website") { icon = "ti-world"; title = "เว็บไซต์และบทความ (Website)"; }
        if (p === "Facebook") { icon = "ti-brand-facebook"; title = "เพจเฟสบุ๊ค (Facebook)"; }
        if (p === "Telegram") { icon = "ti-brand-telegram"; title = "แชทและอัปเดต (Telegram)"; }
        if (p === "Podcast") { icon = "ti-microphone"; title = "พอดแคสต์ (Podcast)"; }
        if (p === "Instagram") { icon = "ti-brand-instagram"; title = "อินสตาแกรม (Instagram)"; }
        if (p === "TikTok") { icon = "ti-brand-tiktok"; title = "ติ๊กต็อก (TikTok)"; }

        return { id: p, title, name: p, icon, count }
      })

      setPlatforms(platformData)
      setLoading(false)
    }

    fetchBooths()
  }, [])

  const enterPlatform = (platform) => {
    setSelectedPlatform(platform)
    setSelectedCategory("all")
    setSelectedLanguage("all")
    setSearchQuery("")
    setView("booths")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const enterCategory = (catId) => {
    setSelectedPlatform(null)
    setSelectedCategory(catId)
    setSelectedLanguage("all")
    setSearchQuery("")
    setView("booths")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const enterBooth = (booth) => {
    const targetId = booth.slug || booth.id
    go("openhouse-campus", { boothId: targetId })
  }

  const goBackToZones = () => {
    setView("zones")
    setSelectedPlatform(null)
    setSelectedCategory("all")
    setSelectedLanguage("all")
    setSearchQuery("")
  }

  const categoryCounts = useMemo(() => {
    const counts = { all: booths.length }
    for (const c of OPENHOUSE_CATEGORIES) {
      if (c.id === "all") continue
      counts[c.id] = booths.filter(b => (b.category || "articles") === c.id).length
    }
    return counts
  }, [booths])

  const filteredBooths = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return booths.filter(b => {
      if (selectedPlatform) {
        const plats = b.platforms || (b.platform ? [b.platform] : [])
        if (!plats.includes(selectedPlatform.id)) return false
      }
      if (selectedCategory !== "all" && (b.category || "articles") !== selectedCategory) {
        return false
      }
      if (selectedLanguage !== "all" && b.language !== selectedLanguage) {
        return false
      }
      if (q) {
        const hay = `${b.name || ""} ${b.description || ""} ${b.language || ""} ${CATEGORY_LABEL_MAP[b.category] || ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [booths, selectedPlatform, selectedCategory, selectedLanguage, searchQuery])

  const languages = useMemo(() => {
    const langs = new Set(booths.map(b => b.language).filter(Boolean))
    return ["all", ...Array.from(langs)]
  }, [booths])

  return (
    <div className="openhouse-container">
      <SEOHead title="แหล่งเรียนรู้ | Talib" />

      {/* Immersive Background */}
      <div className="openhouse-bg"></div>

      <div className="max-w" style={{ position: "relative", zIndex: 2 }}>

        {/* Header */}
        <div className="openhouse-header">
          <div className="openhouse-badge">Talib Learning Hub</div>
          <h1 className="openhouse-title">ศูนย์รวมแหล่งเรียนรู้สะลัฟ</h1>
          <p className="openhouse-subtitle">
            รวบรวมช่องทางความรู้จากสถาบัน ห้องสมุด และกลุ่มต่างๆ ไว้ในที่เดียว แบ่งหมวดหมู่เนื้อหาชัดเจน ({booths.length} แหล่งเรียนรู้)
          </p>
        </div>

        {loading ? (
          <div className="openhouse-loading">
            <i className="ti ti-loader-2 spin"></i> กำลังรวบรวมแหล่งเรียนรู้...
          </div>
        ) : (
          <div className="openhouse-content">
            {view === "zones" && (
              <div className="openhouse-zones-view fade-in">
                {/* Section 1: Browse by Content Category */}
                <h2 className="section-heading">
                  <i className="ti ti-category" style={{ marginRight: 10, color: "var(--teal)" }}></i>
                  เลือกตามหมวดหมู่เนื้อหา
                </h2>
                <div className="zones-grid" style={{ marginBottom: 42 }}>
                  {OPENHOUSE_CATEGORIES.map(cat => (
                    <div key={cat.id} className="zone-card" onClick={() => enterCategory(cat.id)}>
                      <div className="zone-icon"><i className={`ti ${cat.icon}`}></i></div>
                      <h3 className="zone-name">{cat.label}</h3>
                      <div className="zone-meta">{categoryCounts[cat.id] || 0} แหล่งเรียนรู้</div>
                      <div className="zone-glow"></div>
                    </div>
                  ))}
                </div>

                {/* Section 2: Browse by Platform */}
                <h2 className="section-heading">
                  <i className="ti ti-apps" style={{ marginRight: 10, color: "var(--teal)" }}></i>
                  เลือกตามแพลตฟอร์ม
                </h2>
                <div className="zones-grid">
                  {platforms.length === 0 ? (
                    <div className="empty-state">ยังไม่มีแหล่งเรียนรู้ในระบบ</div>
                  ) : platforms.map(p => (
                    <div key={p.id} className="zone-card" onClick={() => enterPlatform(p)}>
                      <div className="zone-icon"><i className={`ti ${p.icon}`}></i></div>
                      <h3 className="zone-name">{p.title}</h3>
                      <div className="zone-meta">{p.count} แหล่งเรียนรู้</div>
                      <div className="zone-glow"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === "booths" && (
              <div className="openhouse-booths-view slide-in-bottom">
                <div className="booth-nav">
                  <button className="btn-back-glow" onClick={goBackToZones}>
                    <i className="ti ti-arrow-left"></i> ย้อนกลับ
                  </button>
                  <h2 className="section-heading" style={{ margin: 0 }}>
                    <i
                      className={`ti ${selectedPlatform ? selectedPlatform.icon : (OPENHOUSE_CATEGORIES.find(c => c.id === selectedCategory)?.icon || "ti-layout-grid")}`}
                      style={{ marginRight: 12, color: "var(--teal)" }}
                    ></i>
                    {selectedPlatform ? selectedPlatform.title : (CATEGORY_LABEL_MAP[selectedCategory] || "แหล่งเรียนรู้ทั้งหมด")}
                    <span style={{ fontSize: 13, fontWeight: 400, color: "var(--t3)", marginLeft: 10 }}>
                      ({filteredBooths.length} แหล่ง)
                    </span>
                  </h2>
                </div>

                {/* Search + Category & Language Filters */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ flex: "1 1 240px", position: "relative" }}>
                      <i className="ti ti-search" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 16 }}></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อแหล่งเรียนรู้ หรือคำอธิบาย..."
                        style={{
                          width: "100%",
                          padding: "10px 36px 10px 40px",
                          borderRadius: 12,
                          border: "1px solid var(--br)",
                          background: "var(--bg2)",
                          color: "var(--text)",
                          fontSize: 14,
                          outline: "none",
                        }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          aria-label="ล้างคำค้นหา"
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--t3)", cursor: "pointer" }}
                        >
                          <i className="ti ti-x"></i>
                        </button>
                      )}
                    </div>

                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      aria-label="กรองตามภาษา"
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--br)",
                        background: "var(--bg2)",
                        color: "var(--text)",
                        fontSize: 13,
                      }}
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang === "all" ? "ทุกภาษา" : lang === "Thai" ? "ภาษาไทย" : lang === "English" ? "ภาษาอังกฤษ" : lang === "Arabic" ? "ภาษาอาหรับ" : lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {OPENHOUSE_CATEGORIES.map(cat => {
                      const active = selectedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: active ? 600 : 400,
                            border: active ? "1px solid var(--teal)" : "1px solid var(--br)",
                            background: active ? "var(--teal-bg)" : "var(--bg2)",
                            color: active ? "var(--teal)" : "var(--t2)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.2s",
                          }}
                        >
                          <i className={`ti ${cat.icon}`} style={{ fontSize: 13 }}></i>
                          {cat.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {filteredBooths.length === 0 ? (
                  <div className="empty-state" style={{ padding: 48, textAlign: "center", background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--br)" }}>
                    ไม่พบแหล่งเรียนรู้ที่ตรงกับเงื่อนไขที่เลือก
                  </div>
                ) : (
                  <div className="booths-grid">
                    {filteredBooths.map(booth => (
                      <div key={booth.id} className="booth-card" onClick={() => enterBooth(booth)}>
                        <div className="booth-color-top" style={{ background: booth.themeColor || "var(--teal)" }}></div>
                        <div className="booth-logo-wrapper">
                          {booth.logoUrl ? (
                            <img
                              src={booth.logoUrl}
                              alt={booth.name}
                              className="booth-logo"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                const fallback = e.currentTarget.nextElementSibling
                                if (fallback) fallback.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className="booth-logo-placeholder"
                            style={{
                              background: booth.themeColor || "var(--bg3)",
                              display: booth.logoUrl ? "none" : "flex",
                            }}
                          >
                            <i className="ti ti-book-2"></i>
                          </div>
                        </div>
                        <div className="booth-info">
                          <h3 className="booth-name">{booth.name}</h3>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                            {booth.language && (
                              <div className="booth-lang" style={{ marginBottom: 0 }}>
                                <i className="ti ti-language"></i> {booth.language}
                              </div>
                            )}
                            {booth.category && CATEGORY_LABEL_MAP[booth.category] && (
                              <div className="booth-lang" style={{ marginBottom: 0, background: "var(--bg)", color: "var(--t2)", border: "1px solid var(--br)" }}>
                                {CATEGORY_LABEL_MAP[booth.category]}
                              </div>
                            )}
                          </div>
                          {booth.description && <p className="booth-desc">{booth.description}</p>}
                        </div>

                        <div className="booth-action">
                          <span>เข้าชมหมวดหมู่เนื้อหา</span> <i className="ti ti-arrow-right"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
