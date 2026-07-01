import React, { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import "../styles/openhouse.css"

export default function OpenHouseCampus({ go, ctx }) {
  const boothId = ctx?.boothId
  const [booth, setBooth] = useState(null)
  const [campuses, setCampuses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!boothId) {
      go("openhouse")
      return
    }

    const fetchData = async () => {
      try {
        // Fetch Booth Info
        const boothRef = doc(db, "openhouse_booths", boothId)
        const boothSnap = await getDoc(boothRef)
        if (boothSnap.exists()) {
          setBooth({ id: boothSnap.id, ...boothSnap.data() })
        } else {
          go("openhouse")
          return
        }

        // Fetch Campuses (Buildings)
        const q = query(collection(db, `openhouse_booths/${boothId}/campuses`), orderBy("order", "asc"))
        const campusSnap = await getDocs(q)
        setCampuses(campusSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching campus data", err)
        setLoading(false)
      }
    }

    fetchData()
  }, [boothId, go])

  if (loading) {
    return (
      <div className="openhouse-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="openhouse-loading">
          <i className="ti ti-loader-2 spin"></i> กำลังเดินทางเข้าสู่พื้นที่...
        </div>
      </div>
    )
  }

  if (!booth) return null

  return (
    <div className="openhouse-container">
      {/* Immersive Background mapped to booth theme */}
      <div className="openhouse-bg" style={{ 
        background: `radial-gradient(circle at top right, ${booth.themeColor}20 0%, transparent 50%), radial-gradient(circle at bottom left, var(--teal-bg) 0%, transparent 50%)`,
        backgroundColor: "var(--bg)"
      }}></div>
      
      <div className="max-w" style={{ position: "relative", zIndex: 2 }}>
        
        {/* Campus Header */}
        <div className="campus-header fade-in">
          <button className="btn-back-glow" onClick={() => go("openhouse")}>
            <i className="ti ti-arrow-left"></i> ออกจากพื้นที่
          </button>
          
          <div className="campus-profile">
            <div className="campus-logo-wrap" style={{ borderColor: booth.themeColor || "var(--teal)" }}>
              {booth.logoUrl ? (
                <img src={booth.logoUrl} alt={booth.name} />
              ) : (
                <i className="ti ti-building" style={{ color: booth.themeColor || "var(--teal)" }}></i>
              )}
            </div>
            <div className="campus-info">
              <div className="campus-badges">
                <span className="campus-badge" style={{ background: booth.themeColor || "var(--teal)", color: "#fff" }}>
                  {booth.platform}
                </span>
                {booth.language && <span className="campus-badge" style={{ background: "var(--bg2)", color: "var(--text)", border: "1px solid var(--br)" }}>{booth.language}</span>}
              </div>
              <h1 className="campus-title">{booth.name}</h1>
              {booth.description && <p className="campus-desc">{booth.description}</p>}
            </div>
          </div>
        </div>

        {/* Campuses (Buildings) Grid */}
        <div className="campus-buildings slide-in-bottom">
          <h2 className="section-heading" style={{ marginTop: 40 }}>
            <i className="ti ti-map-2" style={{ marginRight: 8, color: booth.themeColor || "var(--teal)" }}></i>
            แผนผังอาคารเรียน
          </h2>

          {campuses.length === 0 ? (
            <div className="empty-state">ยังไม่มีการก่อสร้างอาคารในพื้นที่นี้</div>
          ) : (
            <div className="buildings-grid">
              {campuses.map(campus => (
                <div key={campus.id} className="building-card">
                  <div className="building-header" style={{ borderBottomColor: `${booth.themeColor}40` || "var(--br)" }}>
                    <h3 className="building-name">
                      <i className="ti ti-building-arch"></i> {campus.name}
                    </h3>
                    {campus.description && <p className="building-desc">{campus.description}</p>}
                  </div>
                  
                  <div className="building-links">
                    {campus.links && campus.links.length > 0 ? (
                      campus.links.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="resource-link">
                          <div className="resource-icon"><i className="ti ti-link"></i></div>
                          <div className="resource-text">{link.title}</div>
                          <i className="ti ti-external-link resource-go"></i>
                        </a>
                      ))
                    ) : (
                      <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--t3)", textAlign: "center" }}>ยังไม่มีเนื้อหาในอาคารนี้</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
