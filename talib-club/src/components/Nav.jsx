import { SITE } from "../data/index.js"

const NAV_LINKS = [
  { id: "home",     label: "หน้าหลัก" },
  { id: "articles", label: "บทความ" },
  { id: "library",  label: "ห้องสมุด" },
  { id: "media",    label: "มีเดีย" },
  { id: "scholars", label: "อุลามาอ์" },
  { id: "tracking", label: "Tracking" },
]

export default function Nav({ page, go, theme, setTheme }) {
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 28px", borderBottom: ".5px solid var(--br2)",
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--nav-bg)", backdropFilter: "blur(14px)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => go("home")}>
        <div style={{
          width: 34, height: 34, background: "var(--logo-bg)", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 8, fontWeight: 600, color: "var(--logo-c)", letterSpacing: ".07em" }}>
            TALIB
          </span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.15 }}>
            {SITE.name}
          </div>
          <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 300 }}>
            {SITE.tagline}
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: 2 }}>
        {NAV_LINKS.map(l => (
          <button key={l.id} onClick={() => go(l.id)} style={{
            background: page === l.id ? "var(--bg2)" : "none",
            border: "none", cursor: "pointer", fontFamily: "'Prompt',sans-serif",
            fontSize: 12, color: page === l.id ? "var(--text)" : "var(--t2)",
            fontWeight: page === l.id ? 500 : 300,
            padding: "6px 10px", borderRadius: 8, transition: "all .15s",
          }}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Right: Theme toggle + Login */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          display: "flex", background: "var(--bg2)", borderRadius: 20,
          padding: 3, border: ".5px solid var(--br)", gap: 2,
        }}>
          {[["light", "☀ Light"], ["dark", "◑ Dark"]].map(([m, label]) => (
            <button key={m} onClick={() => setTheme(m)} style={{
              fontFamily: "'Prompt',sans-serif", fontSize: 10,
              padding: "4px 10px", borderRadius: 16, border: "none", cursor: "pointer",
              background: theme === m ? "var(--acc)" : "transparent",
              color: theme === m ? "var(--bg)" : "var(--t3)",
              fontWeight: 300, transition: "all .2s",
            }}>
              {label}
            </button>
          ))}
        </div>
        <button style={{
          fontFamily: "'Prompt',sans-serif", cursor: "pointer",
          border: ".5px solid var(--br)", borderRadius: 24,
          fontSize: 11, fontWeight: 300, padding: "6px 14px",
          background: "transparent", color: "var(--t2)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <i className="ti ti-user" style={{ fontSize: 11 }}></i>เข้าสู่ระบบ
        </button>
      </div>
    </nav>
  )
}
