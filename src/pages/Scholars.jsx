import { useState, useMemo, useEffect } from "react"
import { DEFAULT_TAXONOMY, SCHOLARS } from "../data/index.js"
import { mergeScholarsList } from "../data/scholarsVerified.js"
import { useContentCollection, useTaxonomySettings } from "../lib/contentStore.js"
import SEOHead, { BASE_URL } from '../components/SEOHead.jsx'

const ERA_LABELS = {
  salaf: "ยุคแรก (Salaf) ค.ศ. 600–900",
  classical: "ยุคกลาง ค.ศ. 900–1500",
  revival: "ยุคฟื้นฟู ค.ศ. 1500–1800",
  modern: "ยุคปัจจุบัน ค.ศ. 1800–ปัจจุบัน"
}
const ERA_COLORS = {
  salaf: "var(--teal)",
  classical: "#c9a84c",
  revival: "#8b7dd8",
  modern: "var(--acc)"
}

const mapEraValue = (val) => {
  if (!val) return ""
  const str = String(val).trim().toLowerCase()
  if (str === "1" || str === "ยุคแรก" || str === "salaf") return "salaf"
  if (str === "2" || str === "ยุคกลาง" || str === "classical") return "classical"
  if (str === "3" || str === "ยุคฟื้นฟู" || str === "revival") return "revival"
  if (str === "4" || str === "ยุคปัจจุบัน" || str === "modern") return "modern"
  return str
}

export default function Scholars() {
  const scholarsQueryOptions = useMemo(() => ({ live: false }), [])
  const { items: rawScholars, loading } = useContentCollection("scholars", SCHOLARS, null, scholarsQueryOptions)
  const scholars = useMemo(() => mergeScholarsList(rawScholars), [rawScholars])
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [search, setSearch] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [era, setEra] = useState("0")
  const [field, setField] = useState("all")
  const [selectedScholar, setSelectedScholar] = useState(null)

  const [aqFilter, setAqFilter] = useState("")
  const [mhFilter, setMhFilter] = useState("")
  const [mzFilter, setMzFilter] = useState("")

  const [visibleCounts, setVisibleCounts] = useState({ salaf: 6, classical: 6, revival: 6, modern: 6 })

  useEffect(() => {
    if (!selectedScholar) return
    const onKey = (e) => { if (e.key === "Escape") setSelectedScholar(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedScholar])

  const resetVisible = () => {
    setVisibleCounts({ salaf: 6, classical: 6, revival: 6, modern: 6 })
  }

  const fields = ["all", ...new Set([...(taxonomy.scholarFields || []).map(f => typeof f === 'string' ? f : f.label), ...scholars.map(s => s.field).filter(Boolean)])]

  const filtered = useMemo(() => {
    return scholars.filter(s => {
      const term = search.toLowerCase().trim()
      const worksText = Array.isArray(s.works)
        ? s.works.map(w => `${w.title || ""} ${w.arabicTitle || ""} ${w.description || ""}`).join(" ").toLowerCase()
        : ""
      const matchSearch = !term ||
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.arabicName && s.arabicName.toLowerCase().includes(term)) ||
        (s.latin && s.latin.toLowerCase().includes(term)) ||
        (s.note && s.note.toLowerCase().includes(term)) ||
        (s.bio && s.bio.toLowerCase().includes(term)) ||
        worksText.includes(term)

      const matchEra = era === "0" || mapEraValue(s.era) === mapEraValue(era)
      const matchField = field === "all" || (s.field && s.field.includes(field))

      const matchAq = !aqFilter || s.aq === aqFilter
      const matchMh = !mhFilter || s.mh === mhFilter
      const matchMz = !mzFilter || s.mz === mzFilter

      return matchSearch && matchEra && matchField && matchAq && matchMh && matchMz
    })
  }, [scholars, search, era, field, aqFilter, mhFilter, mzFilter])

  const eras = ["0", ...(taxonomy.scholarEras || []).map(item => item.id)]
  const eraLabelMap = Object.fromEntries((taxonomy.scholarEras || []).map(item => [String(item.id), item.label]))

  const getAqClass = (aq) => {
    switch (aq) {
      case "สะลัฟ": return "baq-salafi"
      case "อะชะอะรี": return "baq-ashari"
      case "มาตุรีดี": return "baq-maturidi"
      default: return "baq-unknown"
    }
  }

  const getMhClass = (mh) => {
    switch (mh) {
      case "สะลัฟี": return "bmh-salafi"
      case "ศูฟี": return "bmh-sufi"
      case "เดโอบันดี": return "bmh-deobandi"
      case "บะเรลวี": return "bmh-bareilwi"
      case "ตับลีฆ": return "bmh-tabligh"
      case "อิควาน": return "bmh-ikhwan"
      case "กลาสสิก": return "bmh-classic"
      default: return "bmh-unknown"
    }
  }

  const getMzClass = (mz) => {
    switch (mz) {
      case "หัมบะลี": return "bmz-hanbali"
      case "ชาฟิอี": return "bmz-shafii"
      case "มาลิกี": return "bmz-maliki"
      case "หะนะฟี": return "bmz-hanafi"
      case "ซอฮิรี": return "bmz-zahiri"
      default: return "bmz-unknown"
    }
  }

  return (
    <div>
      <SEOHead
        title="ทำเนียบอุลามาอ์และนักวิชาการอิสลาม | Talib Club"
        description="รวบรวมประวัติและผลงานของอุลามาอ์ นักวิชาการ และนักปราชญ์อิสลามที่สำคัญ"
        canonical={`${BASE_URL}/scholars`}
      />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 8 }}>ทำเนียบบุคคลในอิสลาม</h1>
        <p style={{ color: "var(--t2)" }}>รวบรวมบุคคลและปราชญ์ในประวัติศาสตร์อิสลามแบ่งตามยุคสมัย พร้อมข้อมูลวิชาการ</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดรายชื่อใหม่ล่าสุด...</p>}
      </div>

      {/* DISCLAIMER BANNER */}
      <div style={{
        background: "rgba(245, 158, 11, 0.08)",
        border: "0.5px solid rgba(245, 158, 11, 0.25)",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "24px",
        fontSize: "12px",
        color: "var(--amber)",
        lineHeight: "1.5",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <i className="ti ti-info-circle" style={{ fontSize: "16px", flexShrink: 0 }}></i>
        <span>
          <strong>ชี้แจง:</strong> รายชื่อและฐานข้อมูลบุคคลด้านล่างนี้ยังอยู่ในขั้นตอนการปรับปรุงและอัปเดตข้อมูลให้สมบูรณ์ ทีมงานกำลังทยอยตรวจสอบรายละเอียดวิชาการทีละท่านอย่างรอบคอบ
        </span>
      </div>
      {/* ━━━ SEARCH & FILTER BAR ━━━ */}
      {(() => {
        const activeFilterCount = (field !== "all" ? 1 : 0) + (era !== "0" ? 1 : 0) + (aqFilter ? 1 : 0) + (mhFilter ? 1 : 0) + (mzFilter ? 1 : 0);
        return (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: showAdvanced ? 12 : 24 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 16 }}></i>
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); resetVisible(); }}
                  placeholder="ค้นหาชื่ออุลามาอ์ (ไทย/English/ประวัติ)..."
                  style={{ width: "100%", borderRadius: 24, padding: "12px 38px 12px 42px", background: "var(--bg2)", border: "1px solid transparent", fontSize: 14, outline: "none", transition: "border 0.2s" }}
                  onFocus={(e) => e.target.style.border = "1px solid var(--teal)"}
                  onBlur={(e) => e.target.style.border = "1px solid transparent"}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="ล้างคำค้นหา"
                    onClick={() => { setSearch(""); resetVisible(); }}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "var(--bg3)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)" }}
                  >
                    <i className="ti ti-x" style={{ fontSize: 13 }}></i>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  padding: "0 18px",
                  borderRadius: 24,
                  background: showAdvanced || activeFilterCount > 0 ? "var(--teal)" : "var(--bg2)",
                  color: showAdvanced || activeFilterCount > 0 ? "#fff" : "var(--text)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s"
                }}
                title="ตัวกรองเพิ่มเติม"
              >
                <i className="ti ti-filter" style={{ fontSize: 18 }}></i>
                {activeFilterCount > 0 && <span style={{ fontSize: 11, fontWeight: 700 }}>{activeFilterCount}</span>}
              </button>
            </div>

            {/* ━━━ EXPANDABLE FILTERS ━━━ */}
            {showAdvanced && (
              <div style={{ background: "var(--bg2)", padding: "16px", borderRadius: 16, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, alignItems: "end" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>สาขาวิชา</span>
                  <select value={field} onChange={e => { setField(e.target.value); resetVisible(); }} style={{ background: "var(--card)", border: "1px solid var(--br)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                    {fields.map(f => <option key={f} value={f}>{f === "all" ? "ทุกสาขาวิชา" : f}</option>)}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>ยุคสมัย</span>
                  <select value={era} onChange={e => { setEra(e.target.value); resetVisible(); }} style={{ background: "var(--card)", border: "1px solid var(--br)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                    {eras.map(e => (
                      <option key={e} value={e}>{e === "0" ? "-- ทุกยุคสมัย --" : eraLabelMap[e] || ERA_LABELS[e] || `ยุคที่ ${e}`}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>อะกีดะฮฺ</span>
                  <select value={aqFilter} onChange={e => { setAqFilter(e.target.value); resetVisible(); }} style={{ background: "var(--card)", border: "1px solid var(--br)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                    <option value="">ทุกอะกีดะฮฺ</option>
                    <option value="สะลัฟ">สะลัฟ / อะฮฺลุสสุนนะฮฺ</option>
                    <option value="อะชะอะรี">อะชะอะรี</option>
                    <option value="มาตุรีดี">มาตุรีดี</option>
                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>มันฮัจญ์</span>
                  <select value={mhFilter} onChange={e => { setMhFilter(e.target.value); resetVisible(); }} style={{ background: "var(--card)", border: "1px solid var(--br)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                    <option value="">ทุกมันฮัจญ์</option>
                    <option value="สะลัฟี">สะลัฟี</option>
                    <option value="ศูฟี">ศูฟี / ตะเซาวุฟ</option>
                    <option value="เดโอบันดี">เดโอบันดี</option>
                    <option value="บะเรลวี">บะเรลวี</option>
                    <option value="ตับลีฆ">ตับลีฆ</option>
                    <option value="อิควาน">อิควาน</option>
                    <option value="กลาสสิก">กลาสสิก / อะชะอะรี</option>
                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>มัซฮับ</span>
                  <select value={mzFilter} onChange={e => { setMzFilter(e.target.value); resetVisible(); }} style={{ background: "var(--card)", border: "1px solid var(--br)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                    <option value="">ทุกมัซฮับ</option>
                    <option value="หัมบะลี">หัมบะลี</option>
                    <option value="ชาฟิอี">ชาฟิอี</option>
                    <option value="มาลิกี">มาลิกี</option>
                    <option value="หะนะฟี">หะนะฟี</option>
                    <option value="ซอฮิรี">ซอฮิรี</option>
                    <option value="ไม่ระบุ">ไม่ระบุ</option>
                  </select>
                </label>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setField("all"); setEra("0"); setAqFilter(""); setMhFilter(""); setMzFilter(""); resetVisible(); }}
                    style={{ padding: "8px 14px", fontSize: 12, borderRadius: 8 }}
                  >
                    <i className="ti ti-refresh" style={{ fontSize: 14 }}></i> ล้างตัวกรอง
                  </button>
                )}
              </div>
            )}
          </>
        );
      })()}

      {/* TIMELINE */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card scholar-skeleton-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="skeleton-shimmer" style={{ height: 14, width: "50%", borderRadius: 4 }}></div>
                <div className="skeleton-shimmer" style={{ height: 12, width: "20%", borderRadius: 4 }}></div>
              </div>
              <div className="skeleton-shimmer" style={{ height: 11, width: "35%", borderRadius: 4 }}></div>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="skeleton-shimmer" style={{ height: 11, width: "25%", borderRadius: 4 }}></div>
                <div className="skeleton-shimmer" style={{ height: 11, width: "25%", borderRadius: 4 }}></div>
              </div>
              <div className="skeleton-shimmer" style={{ height: 12, width: "80%", borderRadius: 4, marginTop: 4 }}></div>
            </div>
          ))}
        </div>
      ) : (
        eras.filter(item => item !== "0").map(eraNum => {
          const eraScholars = filtered.filter(s => mapEraValue(s.era) === mapEraValue(eraNum))
          if (eraScholars.length === 0) return null
          const color = ERA_COLORS[eraNum] || "var(--teal)"
          const visibleScholars = eraScholars.slice(0, visibleCounts[eraNum] ?? 6)

          return (
            <div key={eraNum} style={{ marginBottom: 36 }}>
              {/* Era Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 3, height: 28, background: color, borderRadius: 2, flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {eraLabelMap[eraNum] || ERA_LABELS[eraNum] || `ยุคที่ ${eraNum}`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300 }}>{eraScholars.length} ท่าน</div>
                </div>
              </div>

              {/* Scholars Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {visibleScholars.map(s => (
                  <ScholarCard
                    key={s.id}
                    s={s}
                    color={color}
                    getAqClass={getAqClass}
                    getMhClass={getMhClass}
                    getMzClass={getMzClass}
                    onOpenDetail={() => setSelectedScholar({ scholar: s, color })}
                  />
                ))}
              </div>

              {/* SHOW MORE BUTTON */}
              {eraScholars.length > visibleScholars.length && (
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button
                    onClick={() => setVisibleCounts(prev => ({ ...prev, [eraNum]: (prev[eraNum] ?? 6) + 6 }))}
                    style={{
                      fontFamily: "'Prompt', sans-serif", fontSize: 11, fontWeight: 300,
                      padding: "5px 16px", borderRadius: 20, border: ".5px solid var(--br)",
                      cursor: "pointer", transition: "all .15s",
                      background: "var(--card)", color: "var(--t2)"
                    }}
                    onMouseOver={e => { e.target.style.background = 'var(--acc)'; e.target.style.color = 'var(--bg)' }}
                    onMouseOut={e => { e.target.style.background = 'var(--card)'; e.target.style.color = 'var(--t2)' }}
                  >
                    แสดงเพิ่มเติม ({eraScholars.length - visibleScholars.length} ท่าน)
                  </button>
                </div>
              )}
            </div>
          )
        }))}

      {!loading && filtered.length === 0 && <div className="empty">ไม่พบรายชื่อบุคคลที่ตรงกับการค้นหา</div>}

      {/* CONTACT */}
      <div style={{
        marginTop: 32, padding: "20px 24px", background: "var(--acc2)",
        border: ".5px solid var(--acc-br)", borderRadius: 14, textAlign: "center"
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
          ต้องการเสนอรายชื่อบุคคลเพิ่มเติม?
        </div>
        <p style={{ fontSize: 12, marginBottom: 14 }}>ติดต่อทีม Talib Club เพื่อเสนอรายชื่อบุคคลและผู้รู้เพิ่มเติม</p>
        <a
          href="https://www.facebook.com/TalibPublisher"
          target="_blank"
          rel="noreferrer"
          className="btn btn-main"
          style={{ fontSize: 12, textDecoration: "none", display: "inline-block" }}
        >
          ติดต่อเรา
        </a>
      </div>

      {selectedScholar && (
        <ScholarDetailModal
          s={selectedScholar.scholar}
          color={selectedScholar.color}
          getAqClass={getAqClass}
          getMhClass={getMhClass}
          getMzClass={getMzClass}
          onClose={() => setSelectedScholar(null)}
        />
      )}
    </div>
  )
}

function ScholarCard({ s, color, getAqClass, getMhClass, getMzClass, onOpenDetail }) {
  const hasDetails = Boolean(s.bio || (Array.isArray(s.works) && s.works.length > 0) || (s.note && s.note.length > 80))

  return (
    <div
      className="card scholar-card"
      onClick={() => {
        if (hasDetails) onOpenDetail()
      }}
      style={{
        padding: 16,
        borderTop: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: hasDetails ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)"
        e.currentTarget.style.boxShadow = "none"
      }}
      role={hasDetails ? "button" : undefined}
      tabIndex={hasDetails ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasDetails && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onOpenDetail()
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{s.name}</div>
        <span
          className="tag"
          style={{
            background: "var(--acc2)",
            color: "var(--t2)",
            fontSize: 9,
            flexShrink: 0,
            fontWeight: 400,
          }}
        >
          {s.field}
        </span>
      </div>

      {s.arabicName && (
        <div dir="rtl" style={{ fontSize: 13, color: "var(--t2)", fontFamily: "serif", lineHeight: 1.4, textAlign: "right" }}>
          {s.arabicName}
        </div>
      )}

      {s.latin && (
        <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace" }}>
          {s.latin}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, fontWeight: 300 }}>
          <span style={{ color: "var(--t3)" }}>ฮ.ศ. </span>
          <span style={{ color: color, fontWeight: 500 }}>{s.hijri}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 300 }}>
          <span style={{ color: "var(--t3)" }}>ค.ศ. </span>
          <span style={{ color: "var(--text)" }}>{s.ad}</span>
        </div>
      </div>

      {/* Labeled Badges for Creed (อะกีดะฮ์), Manhaj (มันฮัจญ์), Mazhab (มัซฮับ) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "4px 0" }}>
        {s.aq && s.aq !== "ไม่ระบุ" && (
          <span className={`badge-mockup ${getAqClass(s.aq)}`} style={{ fontSize: 10, padding: "2px 7px" }} title="อะกีดะฮ์ (หลักศรัทธา)">
            <span style={{ opacity: 0.78, fontWeight: 400 }}>อะกีดะฮ์: </span>{s.aq}
          </span>
        )}
        {s.mh && s.mh !== "ไม่ระบุ" && (
          <span className={`badge-mockup ${getMhClass(s.mh)}`} style={{ fontSize: 10, padding: "2px 7px" }} title="มันฮัจญ์ (แนวทางการดำเนินศาสนา)">
            <span style={{ opacity: 0.78, fontWeight: 400 }}>มันฮัจญ์: </span>{s.mh}
          </span>
        )}
        {s.mz && s.mz !== "ไม่ระบุ" && (
          <span className={`badge-mockup ${getMzClass(s.mz)}`} style={{ fontSize: 10, padding: "2px 7px" }} title="มัซฮับ (สำนักนิติศาสตร์)">
            <span style={{ opacity: 0.78, fontWeight: 400 }}>มัซฮับ: </span>{s.mz}
          </span>
        )}
      </div>

      {s.note && (
        <div style={{ marginTop: "auto", paddingTop: 4 }}>
          <p
            style={{
              fontSize: 11.5,
              lineHeight: 1.55,
              color: "var(--t2)",
              fontWeight: 300,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: 0,
            }}
          >
            {s.note}
          </p>
          {hasDetails && (
            <div
              style={{
                color: "var(--teal)",
                fontSize: "11px",
                padding: "6px 0 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                fontFamily: "'Prompt', sans-serif",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              <span>
                {Array.isArray(s.works) && s.works.length > 0
                  ? `ดูประวัติและผลงาน (${s.works.length} เรื่อง)`
                  : "ดูประวัติเพิ่มเติม"}
              </span>
              <i className="ti ti-chevron-right"></i>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScholarDetailModal({ s, color, getAqClass, getMhClass, getMzClass, onClose }) {
  const shamelaSearchUrl = `https://shamela.ws/search?q=${encodeURIComponent(s.arabicName || s.name)}`
  const emaanSearchUrl = `https://www.emaanlibrary.com/?s=${encodeURIComponent(s.latin || s.name)}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={s.name}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 620,
          maxHeight: "86vh",
          overflowY: "auto",
          padding: 24,
          borderTop: `4px solid ${color}`,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "var(--text)", lineHeight: 1.4 }}>{s.name}</h2>
            {s.arabicName && (
              <div dir="rtl" style={{ fontSize: 17, color: "var(--t2)", fontFamily: "serif", marginTop: 4 }}>
                {s.arabicName}
              </div>
            )}
            {s.latin && (
              <div style={{ fontSize: 12, color: "var(--t3)", fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                {s.latin}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            style={{
              background: "var(--bg2)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--t2)",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-x" style={{ fontSize: 16 }}></i>
          </button>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, marginBottom: 12 }}>
          <span><strong style={{ color: "var(--t3)", fontWeight: 400 }}>ฮ.ศ.:</strong> <span style={{ color, fontWeight: 600 }}>{s.hijri || "-"}</span></span>
          <span><strong style={{ color: "var(--t3)", fontWeight: 400 }}>ค.ศ.:</strong> {s.ad || "-"}</span>
          {s.field && <span><strong style={{ color: "var(--t3)", fontWeight: 400 }}>สาขา:</strong> {s.field}</span>}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {s.aq && s.aq !== "ไม่ระบุ" && (
            <span className={`badge-mockup ${getAqClass(s.aq)}`} style={{ fontSize: 11, padding: "3px 9px" }}>
              <span style={{ opacity: 0.8, fontWeight: 400 }}>อะกีดะฮ์: </span>{s.aq}
            </span>
          )}
          {s.mh && s.mh !== "ไม่ระบุ" && (
            <span className={`badge-mockup ${getMhClass(s.mh)}`} style={{ fontSize: 11, padding: "3px 9px" }}>
              <span style={{ opacity: 0.8, fontWeight: 400 }}>มันฮัจญ์: </span>{s.mh}
            </span>
          )}
          {s.mz && s.mz !== "ไม่ระบุ" && (
            <span className={`badge-mockup ${getMzClass(s.mz)}`} style={{ fontSize: 11, padding: "3px 9px" }}>
              <span style={{ opacity: 0.8, fontWeight: 400 }}>มัซฮับ: </span>{s.mz}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            <i className="ti ti-user-circle" style={{ marginRight: 6, color: "var(--teal)" }}></i>
            ประวัติโดยย่อ
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--t2)", margin: 0 }}>
            {s.bio || s.note}
          </p>
        </div>

        {Array.isArray(s.works) && s.works.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              <i className="ti ti-books" style={{ marginRight: 6, color: "var(--teal)" }}></i>
              ผลงานสำคัญ ({s.works.length} รายการ)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.works.map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg2)",
                    border: "0.5px solid var(--br2)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{w.title}</div>
                  {w.arabicTitle && (
                    <div dir="rtl" style={{ fontSize: 13, color: "var(--teal)", fontFamily: "serif", marginTop: 2 }}>
                      {w.arabicTitle}
                    </div>
                  )}
                  {w.description && (
                    <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, margin: "4px 0 0" }}>
                      {w.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: "0.5px solid var(--br2)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 11, color: "var(--t3)" }}>
            แหล่งอ้างอิง: {Array.isArray(s.sources) && s.sources.length > 0 ? s.sources.join(" · ") : "ฐานข้อมูล Talib Club"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={shamelaSearchUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: 11, padding: "4px 10px", textDecoration: "none" }}>
              ค้นใน Shamela ↗
            </a>
            <a href={emaanSearchUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: 11, padding: "4px 10px", textDecoration: "none" }}>
              EmaanLibrary ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
