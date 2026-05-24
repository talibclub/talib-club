import { useState, useEffect } from "react"
import { SITE } from "../data/index.js"

const NAV_LINKS = [
  { id: "home",     label: "หน้าหลัก",  icon: "ti-home" },
  { id: "articles", label: "บทความ",    icon: "ti-file-text" },
  { id: "library",  label: "ห้องสมุด",  icon: "ti-books" },
  { id: "media",    label: "มีเดีย",    icon: "ti-player-play" },
  { id: "scholars", label: "อุลามาอ์",  icon: "ti-users" },
  { id: "tracking", label: "Tracking",  icon: "ti-package" },
]

export default function Nav({ page, go, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  function nav(id) {
    go(id)
    setMenuOpen(false)
  }

  return (
    <>
      {/* ─── NAV BAR ─── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "12px 16px" : "13px 28px",
        borderBottom: ".5px solid var(--br2)",
        position: "sticky", top: 0, zIndex: 200,
        background: "var(--nav-bg)", backdropFilter: "blur(14px)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => nav("home")}>
          <div style={{ width: 34, height: 34, background: "var(--logo-bg)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: "var(--logo-c)", letterSpacing: ".07em" }}>TALIB</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.15 }}>{SITE.name}</div>
            {!isMobile && <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 300 }}>{SITE.tagline}</div>}
          </div>
        </div>

        {/* Desktop Links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 2 }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => nav(l.id)} style={{
                background: page === l.id ? "var(--bg2)" : "none",
                border: "none", cursor: "pointer", fontSize: 12, color: page === l.id ? "var(--text)" : "var(--t2)",
                padding: "6px 10px", borderRadius: 8, transition: "all .15s",
              }}>
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{
            background: "var(--bg2)", border: ".5px solid var(--br)", borderRadius: 20,
            padding: "5px 10px", cursor: "pointer", color: "var(--t3)"
          }}>
            <i className={`ti ${theme === "light" ? "ti-moon" : "ti-sun"}`}></i>
          </button>

          {/* Hamburger (Mobile) */}
          {isMobile ? (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: "var(--bg2)", border: ".5px solid var(--br)", borderRadius: 8,
              width: 36, height: 36, cursor: "pointer", color: "var(--text)"
            }}>
              <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"}`}></i>
            </button>
          ) : (
            <button style={{ border: ".5px solid var(--br)", borderRadius: 24, fontSize: 11, padding: "6px 14px", background: "transparent", color: "var(--t2)", cursor: "pointer" }}>
              <i className="ti ti-user"></i> เข้าสู่ระบบ
            </button>
          )}
        </div>
      </nav>

      {/* ─── MOBILE DRAWER (ฝั่งขวา) ─── */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 60, right: 0, bottom: 0, width: "80%",
          background: "var(--bg)", zIndex: 190, borderLeft: ".5px solid var(--br2)",
          padding: "20px", boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
        }}>
          {NAV_LINKS.map(l => (
            <button key={l.id} onClick={() => nav(l.id)} style={{
              display: "block", width: "100%", textAlign: "left", padding: "15px",
              fontSize: 16, background: "transparent", border: "none",
              color: page === l.id ? "var(--teal)" : "var(--text)"
            }}>
              <i className={`ti ${l.icon}`} style={{ marginRight: 10 }}></i>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
