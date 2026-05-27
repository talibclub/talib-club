import { useState } from "react"

export default function Media({ go }) {
  const { items: media, loading, error, isUsingFallback } = useContentCollection("media", MEDIA)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [filter, setFilter] = useState("all")

  const filtered = media.filter(item => filter === "all" || item.type === filter)
  const filters = [
    { id: "all", label: "ทั้งหมด", icon: "ti-layout-grid" },
    ...(taxonomy.mediaTypes || []).map(item => ({
      id: item,
      label: item === "youtube" ? "YouTube" : item === "spotify" ? "Spotify" : item,
      icon: item === "youtube" ? "ti-brand-youtube" : item === "spotify" ? "ti-brand-spotify" : "ti-player-play",
    })),
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 8 }}>มีเดีย</h1>
        <p>วิดีโอ YouTube และพอดแคสต์ Spotify จาก Talib Club</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดข้อมูล...</p>}
        {error && <p style={{ marginTop: 8, fontSize: 12, color: "#e05555" }}>โหลดข้อมูลจาก Firestore ไม่สำเร็จ กำลังแสดงข้อมูลสำรอง</p>}
        {!error && isUsingFallback && <p style={{ marginTop: 8, fontSize: 12 }}>ยังไม่มีข้อมูลใน Firestore จึงแสดงรายการตั้งต้นก่อน</p>}
      </div>

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(item => (
          <div
            key={item.id}
            className="card"
            style={{ cursor: "pointer", overflow: "hidden" }}
            onClick={() => go ? go("media-detail", item) : undefined}
          >
            <div
              style={{
                height: 120,
                background: item.type === "youtube" ? "rgba(255,50,50,.08)" : "rgba(30,215,96,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <i
                className={`ti ${item.type === "youtube" ? "ti-brand-youtube" : "ti-brand-spotify"}`}
                style={{ fontSize: 42, color: item.type === "youtube" ? "#ff4444" : "#1ed760", opacity: .75 }}
              ></i>
              {item.duration && (
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.72)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
                  {item.duration}
                </div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--text)" }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{item.channel || item.series || "Talib Club"}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty">ไม่พบรายการมีเดีย</div>}
    </div>
  )
}