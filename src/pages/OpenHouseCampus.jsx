import React, { useState, useEffect } from "react"
import SEOHead from "../components/SEOHead.jsx"
import { collection, query, orderBy, getDocs, doc, getDoc, where, limit } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import {
  normalizeFirestoreBooth,
  findCuratedBooth,
} from "../data/openhouse.js"
import "../styles/openhouse.css"

export default function OpenHouseCampus({ go, ctx }) {
  const boothId = ctx?.boothId
  const [booth, setBooth] = useState(null)
  const [campuses, setCampuses] = useState([])
  const [networkBooths, setNetworkBooths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!boothId) {
      go("openhouse")
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        let firestoreBooth = null
        try {
          // Fetch Booth Info by doc ID
          const boothRef = doc(db, "openhouse_booths", boothId)
          const boothSnap = await getDoc(boothRef)

          if (boothSnap.exists()) {
            firestoreBooth = normalizeFirestoreBooth(boothSnap.id, boothSnap.data())
          } else {
            // Try fetching by slug
            const slugQuery = query(collection(db, "openhouse_booths"), where("slug", "==", boothId), limit(1))
            const slugSnap = await getDocs(slugQuery)
            if (!slugSnap.empty) {
              firestoreBooth = normalizeFirestoreBooth(slugSnap.docs[0].id, slugSnap.docs[0].data())
            } else {
              // Legacy fallback: docs that stored custom slug in `id` field (e.g. booth-1 -> id: "assabiqoon")
              const legacyQuery = query(collection(db, "openhouse_booths"), where("id", "==", boothId), limit(1))
              const legacySnap = await getDocs(legacyQuery)
              if (!legacySnap.empty) {
                firestoreBooth = normalizeFirestoreBooth(legacySnap.docs[0].id, legacySnap.docs[0].data())
              }
            }
          }
        } catch (err) {
          console.error("Error fetching booth from Firestore", err)
        }

        const curatedBooth = findCuratedBooth(firestoreBooth?.slug || boothId)

        let boothData = null
        if (firestoreBooth && curatedBooth) {
          boothData = {
            ...curatedBooth,
            ...firestoreBooth,
            id: firestoreBooth.id,
            slug: firestoreBooth.slug || curatedBooth.slug,
            name: firestoreBooth.name || curatedBooth.name,
            description: firestoreBooth.description || curatedBooth.description,
            logoUrl: firestoreBooth.logoUrl || curatedBooth.logoUrl,
            platforms:
              firestoreBooth.platforms && firestoreBooth.platforms.length > 0
                ? firestoreBooth.platforms
                : curatedBooth.platforms,
            socialLinks:
              firestoreBooth.socialLinks && Object.keys(firestoreBooth.socialLinks).length > 0
                ? { ...curatedBooth.socialLinks, ...firestoreBooth.socialLinks }
                : curatedBooth.socialLinks,
            networks:
              firestoreBooth.networks && firestoreBooth.networks.length > 0
                ? firestoreBooth.networks
                : curatedBooth.networks,
          }
        } else if (firestoreBooth) {
          boothData = firestoreBooth
        } else if (curatedBooth) {
          boothData = curatedBooth
        }

        if (boothData) {
          setBooth(boothData)
        } else {
          go("openhouse")
          return
        }

        // Fetch Campuses (Buildings)
        let fetchedCampuses = []
        if (firestoreBooth) {
          try {
            const q = query(collection(db, `openhouse_booths/${firestoreBooth.id}/campuses`), orderBy("order", "asc"))
            const campusSnap = await getDocs(q)
            fetchedCampuses = campusSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          } catch (e) {
            console.error("Failed to fetch campuses", e)
          }
        }

        if (fetchedCampuses.length > 0) {
          setCampuses(fetchedCampuses)
        } else if (curatedBooth?.campuses?.length > 0) {
          setCampuses(curatedBooth.campuses)
        } else {
          setCampuses([])
        }

        // Fetch Networks (resolve from Firestore or curated data)
        const netIds = boothData.networks || []
        if (netIds.length > 0) {
          const nets = await Promise.all(
            netIds.map(async (nid) => {
              const curatedNet = findCuratedBooth(nid)
              try {
                const snap = await getDoc(doc(db, "openhouse_booths", nid))
                if (snap.exists()) {
                  const fbNet = normalizeFirestoreBooth(snap.id, snap.data())
                  return curatedNet ? { ...curatedNet, ...fbNet, logoUrl: fbNet.logoUrl || curatedNet.logoUrl } : fbNet
                }
              } catch {
                // fall back to curatedNet
              }
              return curatedNet
            })
          )
          setNetworkBooths(nets.filter(Boolean))
        } else {
          setNetworkBooths([])
        }

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
          <i className="ti ti-loader-2 spin"></i> กำลังรวบรวมเนื้อหา...
        </div>
      </div>
    )
  }

  if (!booth) return null

  return (
    <div className="openhouse-container">
      <SEOHead title={booth?.name ? `${booth.name} | แหล่งเรียนรู้` : 'แหล่งเรียนรู้ | Talib'} />
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
                <img
                  src={booth.logoUrl}
                  alt={booth.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    const fallback = e.currentTarget.nextElementSibling
                    if (fallback) fallback.style.display = "inline-block"
                  }}
                />
              ) : null}
              <i
                className="ti ti-building"
                style={{
                  color: booth.themeColor || "var(--teal)",
                  display: booth.logoUrl ? "none" : "inline-block",
                }}
              ></i>
            </div>
            <div className="campus-info">
              <div className="campus-badges">
                {(booth.platforms || (booth.platform ? [booth.platform] : [])).map(p => (
                  <span key={p} className="campus-badge" style={{ background: booth.themeColor || "var(--teal)", color: "#fff" }}>
                    {p}
                  </span>
                ))}
                {booth.language && <span className="campus-badge" style={{ background: "var(--bg2)", color: "var(--text)", border: "1px solid var(--br)" }}>{booth.language}</span>}
              </div>
              <h1 className="campus-title">{booth.name}</h1>
              {booth.description && <p className="campus-desc">{booth.description}</p>}
              
              {booth.socialLinks && Object.keys(booth.socialLinks).length > 0 && (
                <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                  {Object.entries(booth.socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    let icon = "ti-world"
                    if (platform === "YouTube") icon = "ti-brand-youtube"
                    if (platform === "Facebook") icon = "ti-brand-facebook"
                    if (platform === "Telegram") icon = "ti-brand-telegram"
                    if (platform === "Instagram") icon = "ti-brand-instagram"
                    if (platform === "TikTok") icon = "ti-brand-tiktok"
                    if (platform === "Podcast") icon = "ti-microphone"
                    
                    return (
                      <a key={platform} href={url} target="_blank" rel="noreferrer" 
                         style={{ 
                           display: "flex", alignItems: "center", gap: 6, 
                           padding: "6px 12px", background: "var(--bg)", 
                           border: "1px solid var(--br)", borderRadius: 20,
                           fontSize: 13, color: "var(--text)", textDecoration: "none",
                           transition: "all 0.2s ease"
                         }}
                         className="social-link-hover"
                      >
                        <i className={`ti ${icon}`} style={{ color: booth.themeColor || "var(--teal)" }}></i>
                        {platform}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Network Booths (Affiliates) */}
        {networkBooths.length > 0 && (
          <div className="campus-networks slide-in-bottom" style={{ marginBottom: 40, animationDelay: "0.1s" }}>
            <h3 style={{ fontSize: 15, color: "var(--t2)", marginBottom: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-link"></i> เครือข่ายพันธมิตร
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {networkBooths.map(net => (
                <div 
                  key={net.id} 
                  className="net-card network-badge-hover"
                  onClick={() => {
                    const targetId = net.slug || net.id;
                    go("openhouse-campus", { boothId: targetId });
                  }}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 8, 
                    background: "var(--bg2)", padding: "8px 16px", borderRadius: 12, 
                    border: "1px solid var(--br)", cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: net.themeColor || "var(--teal)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {net.logoUrl ? <img src={net.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="ti ti-building" style={{ fontSize: 12, color: "#fff" }}></i>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{net.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campuses (Buildings) Grid */}
        <div className="campus-buildings slide-in-bottom" style={{ animationDelay: "0.2s" }}>
          <h2 className="section-heading" style={{ marginTop: 0 }}>
            <i className="ti ti-folder" style={{ marginRight: 8, color: booth.themeColor || "var(--teal)" }}></i>
            หมวดหมู่เนื้อหา / ซีรีส์
          </h2>
          
          {campuses.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--t3)", background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--br)" }}>
              ยังไม่มีการจัดกลุ่มเนื้อหาในช่องนี้
            </div>
          ) : (
            <div className="buildings-grid">
              {campuses.map(campus => (
                <div key={campus.id} className="building-card">
                  <div className="building-header" style={{ borderBottomColor: booth.themeColor ? `${booth.themeColor}40` : "var(--br)" }}>
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
