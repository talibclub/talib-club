export default function AdminTracking() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <h2>Tracking</h2>
          <p style={{ marginTop: 8 }}>จัดการรายชื่อ พัสดุ CSV ข้อมูล Tracking และ label ภายใน Admin Panel</p>
        </div>
        <a className="btn btn-outline" href="/tracking-system.html?admin=staff" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <i className="ti ti-external-link" style={{ marginRight: 6 }}></i>เปิดเต็มหน้าจอ
        </a>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}>
        <iframe
          title="Talib Club Tracking Admin"
          src="/tracking-system.html?admin=staff"
          style={{
            width: "100%",
            height: "min(980px, calc(100vh - 230px))",
            minHeight: 680,
            border: "none",
            display: "block",
            background: "#f7f5f0",
          }}
        />
      </div>
    </div>
  )
}
