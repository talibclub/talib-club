// ============================================================
//  Tracking Page — embed ระบบ tracking เดิมผ่าน iframe
//  ไฟล์ต้นฉบับอยู่ที่ public/tracking-system.html
// ============================================================
import { useState } from "react"

export default function Tracking() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ margin: "0 -24px" }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px 16px",
        borderBottom: ".5px solid var(--br2)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>
            <i className="ti ti-package" style={{ marginRight: 8, color: "var(--teal)" }}></i>
            ระบบติดตามพัสดุ
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300, marginTop: 3 }}>
            ตรวจสอบรายชื่อ · เลข Tracking · จัดการพัสดุ
          </div>
        </div>
        <a
          href="/tracking-system.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Prompt',sans-serif", fontSize: 11, fontWeight: 300,
            color: "var(--teal)", background: "var(--teal-bg)",
            border: ".5px solid rgba(45,190,160,.2)",
            padding: "6px 12px", borderRadius: 20, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <i className="ti ti-external-link" style={{ fontSize: 11 }}></i>
          เปิดเต็มหน้าจอ
        </a>
      </div>

      {/* Loading indicator */}
      {!loaded && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 300, gap: 10, color: "var(--t3)", fontSize: 13, fontWeight: 300,
        }}>
          <i className="ti ti-loader" style={{ fontSize: 20, animation: "spin 1s linear infinite" }}></i>
          กำลังโหลดระบบ...
        </div>
      )}

      {/* iframe — embed ระบบ tracking เดิมทั้งหมด */}
      <iframe
        src="/tracking-system.html"
        title="Talib Club Tracking System"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: loaded ? "calc(100vh - 140px)" : 0,
          border: "none",
          display: "block",
          minHeight: loaded ? 600 : 0,
        }}
        allow="clipboard-write"
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
