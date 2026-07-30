// ============================================================
//  UI Components — reusable ทั่วทั้งแอพ
// ============================================================

// Badge / Tag
export function Tag({ children, variant = "teal", className = "" }) {
  const styles = {
    teal: { background: "var(--teal-bg)", color: "var(--teal)" },
    acc:  { background: "var(--acc2)", color: "var(--t2)" },
    new:  { background: "rgba(45,190,160,.15)", color: "var(--teal)" },
  }
  return (
    <span style={{
      fontSize: 10, fontWeight: 400, padding: "2px 8px", borderRadius: 4,
      display: "inline-block", ...styles[variant]
    }} className={className}>
      {children}
    </span>
  )
}

// Empty State
export function Empty({ icon = "ti-search", text = "ไม่พบข้อมูล" }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--t3)" }}>
      <i className={`ti ${icon}`} style={{ fontSize: 32, display: "block", marginBottom: 12 }}></i>
      <span style={{ fontSize: 13, fontWeight: 300 }}>{text}</span>
    </div>
  )
}

// Section Header — a real <h2> so screen readers and search engines see the
// page structure, not just styled divs.
export function SecHeader({ title, onSeeAll, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", margin: 0 }}>
        {title}{count !== undefined && <span style={{ fontSize: 12, color: "var(--t3)", marginLeft: 6, fontWeight: 300 }}>({count})</span>}
      </h2>
      {onSeeAll && (
        <button onClick={onSeeAll} style={{
          fontSize: 12, color: "var(--teal)", fontWeight: 300, cursor: "pointer",
          background: "none", border: "none", fontFamily: "'Prompt',sans-serif",
          padding: "12px 12px", margin: "-12px -12px" // ≥44px hit area without moving layout
        }}>ดูทั้งหมด →</button>
      )}
    </div>
  )
}

// Filter Pills
export function Pills({ options, value, onChange, colorOn = "teal" }) {
  const bgOn = colorOn === "teal" ? "var(--teal)" : "var(--acc)"
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          fontFamily: "'Prompt',sans-serif", fontSize: 12, fontWeight: 300,
          padding: "5px 12px", borderRadius: 20, border: ".5px solid var(--br)",
          cursor: "pointer", transition: "all .15s",
          background: value === o.id ? bgOn : "var(--card)",
          color: value === o.id ? "#fff" : "var(--t2)",
        }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Search Input
export function SearchInput({ placeholder, value, onChange }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
      <i className="ti ti-search" style={{
        position: "absolute", left: 10, top: "50%",
        transform: "translateY(-50%)", color: "var(--t3)", fontSize: 14
      }}></i>
      <input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingLeft: 32, width: "100%" }}
      />
    </div>
  )
}

// Back Button
export function BackBtn({ onClick, label = "กลับ" }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'Prompt',sans-serif", cursor: "pointer", border: ".5px solid var(--br)",
      borderRadius: 24, fontSize: 12, fontWeight: 300, padding: "6px 14px",
      background: "transparent", color: "var(--t2)", display: "flex",
      alignItems: "center", gap: 6, marginBottom: 24
    }}>
      <i className="ti ti-arrow-left" style={{ fontSize: 12 }}></i>{label}
    </button>
  )
}

// Card wrapper. When clickable it becomes keyboard-operable (role, tabIndex,
// Enter/Space) — a bare <div onClick> is invisible to keyboards and screen readers.
export function Card({ children, onClick, style = {}, label }) {
  const interactive = Boolean(onClick)
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      onKeyDown={interactive ? e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e) }
      } : undefined}
      style={{
        background: "var(--card)", border: ".5px solid var(--br2)", borderRadius: 12,
        transition: "border-color .2s", cursor: interactive ? "pointer" : "default",
        ...style
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = "var(--acc-br)" }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = "var(--br2)" }}
    >
      {children}
    </div>
  )
}
