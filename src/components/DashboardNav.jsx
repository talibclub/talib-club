import React from "react"

const navItems = [
  {
    icon: "ti ti-book",
    label: "ห้องอ่านหนังสือส่วนตัว",
    desc: "จับเวลา บันทึกเซสชัน ทำภารกิจรายวัน",
    view: "bookshelf",
    color: "var(--teal)",
    bg: "var(--teal-bg)"
  },
  {
    icon: "ti ti-flame",
    label: "สถิติการอ่านต่อเนื่อง",
    desc: "ดู Streak น้ำแข็ง และสิทธิ์ลากิจ",
    view: "streak",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)"
  },
  {
    icon: "ti ti-user-circle",
    label: "โปรไฟล์ของฉัน",
    desc: "จัดการข้อมูลบัญชีและรหัสสมาชิก",
    view: "profile",
    color: "#818cf8",
    bg: "rgba(129,140,248,0.1)"
  },
  {
    icon: "ti ti-bookmark",
    label: "บทความที่บันทึกไว้",
    desc: "บทความที่กดบันทึกไว้เพื่ออ่านภายหลัง",
    view: "saved-articles",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)"
  },
  {
    icon: "ti ti-book-2",
    label: "อัลกุรอานของฉัน",
    desc: "เปิดอ่าน แปลไทย ตัฟซีรย่อ และค้นหาคำสำคัญ",
    view: "quran",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)"
  },
  {
    icon: "ti ti-notebook",
    label: "อายะฮ์ที่บันทึกไว้",
    desc: "ข้อคิดและประโยชน์ที่ได้รับจากอัลกุรอาน",
    view: "saved-verses",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)"
  },
]

export default function DashboardNav({ setView, go }) {
  function handleClick(view) {
    if (view === "quran") {
      go("quran", { sura: 1, ayah: null })
    } else {
      setView(view)
    }
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 14,
      padding: "4px 0 24px",
    }}>
      {navItems.map(item => (
        <button
          key={item.view}
          onClick={() => handleClick(item.view)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--card)",
            border: "1px solid var(--br)",
            borderRadius: 16,
            padding: "16px 18px",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
            fontFamily: "'Prompt', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = item.color
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.12)`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--br)"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: item.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className={item.icon} style={{ fontSize: 20, color: item.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.4 }}>{item.desc}</div>
          </div>
          <i className="ti ti-chevron-right" style={{ color: "var(--t3)", fontSize: 16, flexShrink: 0 }} />
        </button>
      ))}
    </div>
  )
}
