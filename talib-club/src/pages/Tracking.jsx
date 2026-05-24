// Tracking page — เปิด tracking system แบบ full page ในหน้าเดิม
import { useEffect } from "react"

export default function Tracking() {
  useEffect(() => {
    // Redirect ไปที่ tracking system ใน tab เดิม
    window.location.href = "/tracking-system.html"
  }, [])

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: 300, flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, color: "var(--t2)", fontWeight: 300 }}>
        <i className="ti ti-loader" style={{ fontSize: 20, marginRight: 8,
          display: "inline-block", animation: "spin 1s linear infinite" }}></i>
        กำลังเปิดระบบ Tracking...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
