import { createPortal } from "react-dom"

export function TutorialModal({ onClose }) {
  return createPortal(
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 16px",
      overflowY: "auto",
    }} onClick={onClose}>
      <div className="card" style={{
        maxWidth: 500,
        width: "100%",
        padding: "28px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        textAlign: "center",
        animation: "pageFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        position: "relative",
      }} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "var(--t3)",
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            transition: "background 0.15s",
          }}
          title="ปิด"
        >
          <i className="ti ti-x"></i>
        </button>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: -4 }}>
          <span className="badge badge-teal" style={{ fontSize: 11, padding: "4px 10px", fontWeight: 600 }}>แนะนำการใช้งาน 🚀</span>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", margin: 0 }}>
          ห้องอ่านหนังสือส่วนตัวคืออะไร?
        </h2>

        <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, margin: 0 }}>
          เครื่องมือสร้างวินัยรักการอ่าน ผ่านการจับเวลาจริง บันทึกผล และสะสมสถิติความต่อเนื่อง (Streak)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>

          <div style={{ display: "flex", gap: 12, background: "var(--bg2)", padding: 13, borderRadius: 12, border: "0.5px solid var(--br)" }}>
            <div style={{ width: 34, height: 34, background: "var(--teal-bg)", color: "var(--teal)", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0 }}>
              <i className="ti ti-books"></i>
            </div>
            <div>
              <strong style={{ fontSize: 13, color: "var(--text)", display: "block", marginBottom: 2 }}>เพิ่มหนังสือแล้วเริ่มอ่าน</strong>
              <span style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>เลือกหนังสือจากคลังหรืออัปโหลด PDF กด <span style={{ color: "var(--teal)", fontWeight: 500 }}>เริ่มอ่าน</span> เพื่อเข้าโหมดจับเวลา ระบบบันทึกเวลาที่อ่านจริงเท่านั้น</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, background: "var(--bg2)", padding: 13, borderRadius: 12, border: "0.5px solid var(--br)" }}>
            <div style={{ width: 34, height: 34, background: "rgba(248, 113, 113, 0.12)", color: "#f87171", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0 }}>
              <i className="ti ti-flame"></i>
            </div>
            <div>
              <strong style={{ fontSize: 13, color: "var(--text)", display: "block", marginBottom: 2 }}>รักษา Streak ต่อเนื่อง 🔥</strong>
              <span style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>อ่าน and บันทึกเซสชันทุกวัน ระบบจะนับวันต่อเนื่อง หากวันไหนอ่านไม่ได้ ใช้ไอเทมคุ้มครองแทนได้</span>
            </div>
          </div>

          {/* ─── น้ำแข็ง & ลากิจ ─── */}
          <div style={{ background: "rgba(96,165,250,0.07)", border: "0.5px solid rgba(96,165,250,0.2)", borderRadius: 12, padding: 13 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-shield-check" style={{ color: "#60a5fa" }}></i>
              ไอเทมคุ้มครอง Streak (สูงสุด 2 ชิ้นต่อประเภท)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>🧊</span>
                <div>
                  <strong style={{ fontSize: 12, color: "var(--text)" }}>น้ำแข็ง (Freeze)</strong>
                  <span style={{ fontSize: 11, color: "var(--t2)", display: "block", lineHeight: 1.4 }}>ระบบใช้อัตโนมัติเมื่อลืมอ่านหนังสือในวันก่อนหน้า เพื่อรักษา Streak ของคุณ ได้จากภารกิจสะสม</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>📅</span>
                <div>
                  <strong style={{ fontSize: 12, color: "var(--text)" }}>ลากิจ (Leave)</strong>
                  <span style={{ fontSize: 11, color: "var(--t2)", display: "block", lineHeight: 1.4 }}>ใช้เมื่อวางแผนล่วงหน้าแล้วว่าน่าจะเรียนไม่ทันหรือไม่ว่าง สามารถกดใช้วันนี้ด้วยตัวเอง ได้จากภารกิจสะสม</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, background: "var(--bg2)", padding: 13, borderRadius: 12, border: "0.5px solid var(--br)" }}>
            <div style={{ width: 34, height: 34, background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0 }}>
              <i className="ti ti-target"></i>
            </div>
            <div>
              <strong style={{ fontSize: 13, color: "var(--text)", display: "block", marginBottom: 2 }}>ภารกิจรายวัน (ไม่ง่าย)</strong>
              <span style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>อ่าน 10 นาที หรือเขียนข้อคิด 100 ตัวอักษร หรือผ่านแบบทดสอบ 12/20 ข้อ จึงจะได้รับไอเทม และมีสิทธิ์รับได้เพียงครั้งเดียวต่อวัน</span>
            </div>
          </div>

        </div>

        <button
          className="btn btn-teal"
          onClick={onClose}
          style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 4 }}
        >
          เข้าใจแล้ว เริ่มต้นใช้งานเลย!
        </button>

      </div>
    </div>,
    document.body
  )
}
