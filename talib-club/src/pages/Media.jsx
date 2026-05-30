import { useState, useMemo } from "react"
import { MEDIA, DEFAULT_TAXONOMY, SITE } from "../data/index.js"
import { useContentCollection, useTaxonomySettings, useSiteSettings } from "../lib/contentStore.js"

export default function Media({ go }) {
  const { items: media, loading, error, isUsingFallback } = useContentCollection("media", MEDIA)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const { site } = useSiteSettings(SITE)
  const [filter, setFilter] = useState("all")
  
  // State สำหรับ Playlist และ Pagination
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  const filters = [
    { id: "all", label: "ทั้งหมด", icon: "ti-layout-grid" },
    ...(taxonomy.mediaTypes || []).map(item => ({
      id: item,
      label: item === "youtube" ? "YouTube" : item === "spotify" ? "Spotify" : item,
      icon: item === "youtube" ? "ti-brand-youtube" : item === "spotify" ? "ti-brand-spotify" : "ti-player-play",
    })),
  ]

  // จัดกลุ่มเพลย์ลิสต์
  const playlists = []
  media.forEach(item => {
    const playlistName = item.series || "วิดีโอทั่วไป"
    let pl = playlists.find(p => p.name === playlistName)
    if (!pl) {
      pl = {
        name: playlistName,
        teacher: item.channel || item.series || "Talib Club",
        type: item.type,
        items: []
      }
      playlists.push(pl)
    }
    pl.items.push(item)
  })

  const filteredPlaylists = playlists.filter(pl => filter === "all" || pl.type === filter)

  // จัดการข้อมูลหน้า Pagination สำหรับ Playlist ที่กำลังเปิดอยู่
  const currentItems = useMemo(() => {
    if (!selectedPlaylist) return []
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    return selectedPlaylist.items.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [selectedPlaylist, page])

  const totalPages = selectedPlaylist ? Math.ceil(selectedPlaylist.items.length / ITEMS_PER_PAGE) : 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 8 }}>มีเดีย</h1>
        <p>วิดีโอ YouTube และพอดแคสต์ Spotify จาก Talib Club</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดข้อมูล...</p>}
      </div>

      {!selectedPlaylist ? (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
            {filters.map(item => (
              <button
                key={item.id}
                className={filter === item.id ? "btn btn-teal" : "btn btn-outline"}
                onClick={() => setFilter(item.id)}
              >
                <i className={`ti ${item.icon}`} style={{ marginRight: 6 }}></i>{item.label}
              </button>
            ))}
          </div>

          {filteredPlaylists.length === 0 ? (
            <div className="empty">ไม่พบรายการมีเดีย</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 14 }}>
              {filteredPlaylists.map((pl, idx) => (
                <div key={idx} className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
                  <div style={{ display: "flex", height: 130, borderBottom: ".5px solid var(--br2)" }}>
                    <div style={{ flex: 1, background: pl.type === "youtube" ? "rgba(255,50,50,.05)" : "rgba(30,215,96,.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`ti ${pl.type === "youtube" ? "ti-brand-youtube" : "ti-brand-spotify"}`} style={{ fontSize: 44, color: pl.type === "youtube" ? "#ff4444" : "#1ed760", opacity: .7 }}></i>
                    </div>
                    <div style={{ width: 85, backgroundColor: "#111a22", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <i className="ti ti-menu-2" style={{ fontSize: 16, opacity: 0.8 }}></i>
                      <span style={{ fontSize: 12, fontWeight: 400 }}>{pl.items.length} คลิป</span>
                    </div>
                  </div>
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--teal)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                      <i className="ti ti-user" style={{ fontSize: 12 }}></i> ผู้สอน: {pl.teacher}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 6, lineHeight: 1.4, flex: 1 }}>
                      {pl.name}
                    </div>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => { setSelectedPlaylist(pl); setPage(1); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, padding: "8px 0", borderColor: "rgba(15,110,86,0.3)", color: "var(--teal)" }}
                    >
                      <i className="ti ti-play-circle" style={{ fontSize: 13 }}></i> ดูเพลย์ลิสต์
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* INSIDE PLAYLIST (แบบบล็อกพร้อมปก Thumbnail และ Pagination) */
        <div>
          <button className="btn btn-outline" style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }} onClick={() => setSelectedPlaylist(null)}>
            <i className="ti ti-arrow-left"></i> กลับหน้ารวมมีเดีย
          </button>
          
          <div className="card" style={{ padding: 18, marginBottom: 24, background: "var(--acc2)" }}>
            <div style={{ fontSize: 12, color: "var(--teal)", marginBottom: 4, fontWeight: 500 }}>{selectedPlaylist.teacher}</div>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{selectedPlaylist.name}</h2>
            <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>รวมเนื้อหาทั้งหมด {selectedPlaylist.items.length} คลิป (หน้าที่ {page}/{totalPages})</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {currentItems.map((item) => {
              // ดึงภาพปกจาก YouTube หากไม่มีการใส่ CoverUrl
              const thumbUrl = item.coverUrl || (item.type === "youtube" && item.embedId ? `https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg` : null)
              
              return (
                <div 
                  key={item.id} 
                  className="card" 
                  style={{ padding: 0, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
                  onClick={() => go ? go("media-detail", item) : undefined}
                >
                  <div style={{ height: 150, background: "var(--acc2)", position: "relative" }}>
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={`ti ${item.type === "youtube" ? "ti-brand-youtube" : "ti-brand-spotify"}`} style={{ fontSize: 40, color: "var(--t3)" }}></i>
                      </div>
                    )}
                    {item.duration && (
                      <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
                        {item.duration}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 14, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 6 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>{item.channel}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={page === i + 1 ? "btn btn-teal" : "btn btn-outline"} 
                  style={{ padding: "6px 14px", fontSize: 12 }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <Footer site={site} />
    </div>
  )
}

function Footer({ site }) {
  const links = [
    { key: "facebook", icon: "ti-brand-facebook" },
    { key: "youtube", icon: "ti-brand-youtube" },
    { key: "spotify", icon: "ti-brand-spotify" },
    { key: "instagram", icon: "ti-brand-instagram" },
    { key: "tiktok", icon: "ti-brand-tiktok" },
  ].map(item => ({ ...item, url: site?.social?.[item.key] })).filter(item => item.url)

  return (
    <footer style={{ padding: "32px 0 20px", marginTop: "40px", textAlign: "center", borderTop: ".5px solid var(--br2)" }}>
      
      {/* ส่วนคำขวัญ QURAN SUNNAH */}
      <div style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500, letterSpacing: "0.5px", marginBottom: "6px", textTransform: "uppercase" }}>
        Quran, Sunnah <span style={{fontWeight: 300, fontSize: "13px"}}>and the understanding of Salaf</span>
      </div>

      {/* Copyright */}
      <div style={{ fontSize: "12px", color: "var(--t3)", marginBottom: "20px", fontWeight: 300 }}>
        All Rights Reserved for Talib Club {new Date().getFullYear()} ©
      </div>

      {/* กลุ่มปุ่มโซเชียล และ ปุ่มขึ้นบน (จัดให้อยู่ด้วยกัน) */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {links.map(item => (
          <a key={item.key} href={item.url} target="_blank" rel="noreferrer" 
             style={{ width: "36px", height: "36px", backgroundColor: "var(--card)", border: ".5px solid var(--br)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t2)", textDecoration: "none", transition: "0.2s" }}
             onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--teal)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--teal)"; }}
             onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--card)"; e.currentTarget.style.color = "var(--t2)"; e.currentTarget.style.borderColor = "var(--br)"; }}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: "16px" }}></i>
          </a>
        ))}

        {/* ปุ่มลูกศรขึ้นบน (เอา absolute ออก แล้วเรียงต่อกันแทน) */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                style={{ width: "36px", height: "36px", backgroundColor: "var(--teal-bg)", border: "1px solid rgba(15,110,86,0.1)", borderRadius: "50%", color: "var(--teal)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s", marginLeft: "10px" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--teal)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--teal-bg)"; e.currentTarget.style.color = "var(--teal)"; }}
        >
          <i className="ti ti-arrow-up" style={{ fontSize: "16px" }}></i>
        </button>
      </div>

    </footer>
  )
}