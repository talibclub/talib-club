import { useState } from "react"
import { MEDIA, DEFAULT_TAXONOMY, SITE } from "../data/index.js"
import { useContentCollection, useTaxonomySettings, useSiteSettings } from "../lib/contentStore.js"

export default function Media({ go }) {
  const { items: media, loading, error, isUsingFallback } = useContentCollection("media", MEDIA)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const { site } = useSiteSettings(SITE)
  const [filter, setFilter] = useState("all")
  const [selectedPlaylist, setSelectedPlaylist] = useState(null) // สถานะสำหรับจัดการการเลือกเพลย์ลิสต์

  const filters = [
    { id: "all", label: "ทั้งหมด", icon: "ti-layout-grid" },
    ...(taxonomy.mediaTypes || []).map(item => ({
      id: item,
      label: item === "youtube" ? "YouTube" : item === "spotify" ? "Spotify" : item,
      icon: item === "youtube" ? "ti-brand-youtube" : item === "spotify" ? "ti-brand-spotify" : "ti-player-play",
    })),
  ]

  // ระบบจัดกลุ่มข้อมูลวิดีโอเดี่ยวๆ ให้กลายเป็นโครงสร้าง Playlist อัตโนมัติ
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

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 8 }}>มีเดีย</h1>
        <p>วิดีโอ YouTube และพอดแคสต์ Spotify จาก Talib Club</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดข้อมูล...</p>}
        {error && <p style={{ marginTop: 8, fontSize: 12, color: "#e05555" }}>โหลดข้อมูลจาก Firestore ไม่สำเร็จ กำลังแสดงข้อมูลสำรอง</p>}
      </div>

      {/* สลับหน้าจอระหว่าง หน้ารวม Playlist กับ หน้าแสดงคลิปข้างใน */}
      {!selectedPlaylist ? (
        <>
          {/* FILTER BUTTONS */}
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

          {/* PLAYLIST GRID (ดีไซน์สไตล์เดียวกับเรฟเฟอเรนซ์) */}
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
                      <span style={{ fontSize: 12, fontWeight: 400 }}>{pl.items.length} วิดีโอ</span>
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
                      onClick={() => setSelectedPlaylist(pl)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, padding: "8px 0", borderColor: "rgba(15,110,86,0.3)", color: "var(--teal)" }}
                    >
                      <i className="ti ti-play-circle" style={{ fontSize: 13 }}></i> เรียนบทนี้
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* INSIDE PLAYLIST VIEW (เมื่อกดเข้ามาเรียนวิชานั้นๆ) */
        <div>
          <button className="btn btn-outline" style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px" }} onClick={() => setSelectedPlaylist(null)}>
            <i className="ti ti-arrow-left"></i> กลับหน้ารวมมีเดีย
          </button>
          
          <div className="card" style={{ padding: 18, marginBottom: 20, background: "var(--acc2)" }}>
            <div style={{ fontSize: 12, color: "var(--teal)", marginBottom: 4, fontWeight: 500 }}>คอร์สเรียนโดย: {selectedPlaylist.teacher}</div>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{selectedPlaylist.name}</h2>
            <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 4 }}>รวมเนื้อหาทั้งหมด {selectedPlaylist.items.length} ตอนบรรยาย</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {selectedPlaylist.items.map((item, index) => (
              <div 
                key={item.id} 
                className="card" 
                style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}
                onClick={() => go ? go("media-detail", item) : undefined}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 500, width: 16 }}>{index + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{item.channel}</div>
                  </div>
                </div>
                {item.duration && (
                  <span className="tag" style={{ background: "var(--bg2)", color: "var(--t2)", fontSize: 11 }}>{item.duration}</span>
                )}
              </div>
            ))}
          </div>
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
  ].map(item => ({ ...item, url: site?.social?.[item.key] })).filter(item => item.url)

  return (
    <footer style={{ padding: "24px 0 16px", marginTop: "40px", textAlign: "center", position: "relative", borderTop: ".5px solid var(--br2)" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
        <a href="#" style={{ color: "var(--text)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>About our site</a>
        <a href="#" style={{ color: "var(--text)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>About the general supervisor</a>
        <a href="#" style={{ color: "var(--text)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>Privacy policy</a>
      </div>
      <div style={{ fontSize: "12px", color: "var(--t3)", marginBottom: "16px", fontWeight: 300 }}>
        All Rights Reserved for Talib Club {new Date().getFullYear()} ©
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        {links.map(item => (
          <a key={item.key} href={item.url} target="_blank" rel="noreferrer" style={{ width: "36px", height: "36px", backgroundColor: "var(--card)", border: ".5px solid var(--br)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t2)", textDecoration: "none", transition: "0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--teal)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--teal)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--card)"; e.currentTarget.style.color = "var(--t2)"; e.currentTarget.style.borderColor = "var(--br)"; }}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: "16px" }}></i>
          </a>
        ))}
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ position: "absolute", right: "0", top: "24px", width: "38px", height: "38px", backgroundColor: "var(--teal-bg)", border: "1px solid rgba(15,110,86,0.1)", borderRadius: "50%", color: "var(--teal)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--teal)"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--teal-bg)"; e.currentTarget.style.color = "var(--teal)"; }}
      >
        <i className="ti ti-arrow-up" style={{ fontSize: "16px" }}></i>
      </button>
    </footer>
  )
}