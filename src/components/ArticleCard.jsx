import React from "react"
import ImageWithFallback from "./ImageWithFallback.jsx"

export default function ArticleCard({ article: a, onClick, coverHeight = 160 }) {
  return (
    <div
      className="card"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%"
      }}
      onClick={() => onClick(a)}
    >
      {a.coverUrl ? (
        <div style={{ width: "100%", height: coverHeight, overflow: "hidden", borderBottom: ".5px solid var(--br2)" }}>
          <ImageWithFallback src={a.coverUrl} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ width: "100%", height: coverHeight, background: "var(--teal-bg)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: ".5px solid var(--br2)" }}>
          <span style={{ fontSize: coverHeight >= 160 ? 40 : 36 }}>{a.coverEmoji || "📖"}</span>
        </div>
      )}
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {a.type === "series" && a.part && (
              <span style={{ fontSize: 10, color: "var(--teal)", fontWeight: 500, background: "var(--teal-bg)", padding: "2px 8px", borderRadius: 4 }}>
                ตอนที่ {a.part}
              </span>
            )}
            <span className="tag tag-teal">{a.category}</span>
            {a.type === "specific" && a.seriesName && (
              <span className="tag tag-acc">{a.seriesName}</span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {a.title}
          </div>
          <p style={{ fontSize: 12, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--t2)" }}>
            {a.excerpt}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300 }}>
            {a.author} · {a.date}
          </div>
        </div>
      </div>
    </div>
  )
}
