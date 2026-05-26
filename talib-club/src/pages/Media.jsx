import { useState } from "react"
// ปรับกลับมาใช้ Relative Path เพื่อให้ตรงกับโครงสร้างโฟลเดอร์จริง
import { DEFAULT_TAXONOMY, MEDIA } from "../data/index.js"
import { useContentCollection, useTaxonomySettings } from "../lib/contentStore.js"

export default function Media({ go }) {
  const { items: media, loading } = useContentCollection("media", MEDIA)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [filter, setFilter] = useState("all")

  const filtered = media.filter(m => filter === "all" || m.type === filter)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 8 }}>มีเดีย</h1>
        <p>วิดีโอ YouTube และพอดแคสต์ Spotify จาก Talib Club</p>
        {loading && <p style={{ marginTop: 8, fontSize: 12 }}>กำลังโหลดข้อมูล...</p>}
      </div>

      {/* ส่วนตัวกรอง */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
        {[{ id: "all", label: "ทั้งหมด", icon: "ti-layout-grid" }, ...(taxonomy.mediaTypes || []).map(item => ({
          id: item, label: item === "youtube" ? "YouTube" : item === "spotify" ? "Spotify" : item,
          icon: item === "youtube" ? "ti-brand-youtube" : item === "spotify" ? "ti-brand-spotify" : "ti-player-play",
        }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            fontFamily: "'Prompt', sans-serif", fontSize: 12, fontWeight: 300,
            padding: "6px 14px", borderRadius: 20, border: ".5px solid var(--br)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            background: filter === f.id ? "var(--acc)" : "var(--card)",
            color: filter === f.id ? "var(--bg)" : "var(--t2)"
          }}>
            <i className={`ti ${f.icon}`} style={{ fontSize: 12 }}></i>{f.label}
          </button>
        ))}
      </div>

      {/* ส่วนแสดงรายการมีเดียทั้งหมด */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(m => (
          <div key={m.id} className="card" style={{ cursor: "pointer", overflow: "hidden" }}
            onClick={() => go("media-detail", m)}>
            <div style={{ height: 120, background: m.type === "youtube" ? "rgba(255,50,50,.08)" : "rgba(30,215,96,.08)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <i className={`ti ${m.type === "youtube" ? "ti-brand-youtube" : "ti-brand-spotify"}`} style={{ fontSize: 40, color: m.type === "youtube" ? "#ff4444" : "#1ed760", opacity: .7 }}></i>
              {m.duration && (
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
                  {m.duration}
                </div>
              )}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>{m.title}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{m.channel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
