import { useState } from "react"
import AdminArticles from "./admin/AdminArticles.jsx"
import AdminLibrary from "./admin/AdminLibrary.jsx"
import AdminMedia from "./admin/AdminMedia.jsx"
import AdminScholars from "./admin/AdminScholars.jsx"
import AdminTracking from "./admin/AdminTracking.jsx"
import AdminSite from "./admin/AdminSite.jsx"

const ADMIN_PASSWORD = "talib2568" // ← เปลี่ยนรหัสผ่านตรงนี้

const TABS = [
  { id: "articles", label: "บทความ",   icon: "ti-file-text" },
  { id: "library",  label: "ห้องสมุด", icon: "ti-books" },
  { id: "media",    label: "มีเดีย",   icon: "ti-player-play" },
  { id: "scholars", label: "อุลามาอ์", icon: "ti-users" },
  { id: "tracking", label: "Tracking", icon: "ti-package" },
  { id: "site",     label: "ตั้งค่าเว็บ", icon: "ti-settings" },
]

export default function Admin({ go }) {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem("talib_admin") === "1")
  const [pw, setPw]           = useState("")
  const [pwErr, setPwErr]     = useState(false)
  const [tab, setTab]         = useState("articles")

  function login() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("talib_admin", "1")
      setAuthed(true)
    } else {
      setPwErr(true)
      setPw("")
      setTimeout(() => setPwErr(false), 2000)
    }
  }

  function logout() {
    sessionStorage.removeItem("talib_admin")
    setAuthed(false)
    go("home")
  }

  if (!authed) return <LoginScreen pw={pw} setPw={setPw} onLogin={login} error={pwErr} go={go} />

  return (
    <div>
      {/* ADMIN HEADER */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24, paddingBottom: 16, borderBottom: ".5px solid var(--br2)",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
            <i className="ti ti-shield-check" style={{ marginRight: 8, color: "var(--teal)" }}></i>
            Admin Panel
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", fontWeight: 300, marginTop: 3 }}>
            จัดการเนื้อหาทั้งหมดของ Talib Club
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => go("home")} style={{
            fontFamily: "'Prompt',sans-serif", fontSize: 12, fontWeight: 300,
            padding: "7px 14px", borderRadius: 20, border: ".5px solid var(--br)",
            background: "transparent", color: "var(--t2)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 12 }}></i> กลับหน้าเว็บ
          </button>
          <button onClick={logout} style={{
            fontFamily: "'Prompt',sans-serif", fontSize: 12, fontWeight: 400,
            padding: "7px 14px", borderRadius: 20,
            border: ".5px solid rgba(224,85,85,0.3)",
            background: "rgba(224,85,85,0.08)", color: "#e05555", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <i className="ti ti-logout" style={{ fontSize: 12 }}></i> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: "'Prompt',sans-serif", fontSize: 12, fontWeight: tab === t.id ? 500 : 300,
            padding: "7px 14px", borderRadius: 20, cursor: "pointer", transition: "all .15s",
            border: tab === t.id ? ".5px solid var(--teal)" : ".5px solid var(--br)",
            background: tab === t.id ? "var(--teal-bg)" : "var(--card)",
            color: tab === t.id ? "var(--teal)" : "var(--t2)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 12 }}></i>{t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div>
        {tab === "articles" && <AdminArticles />}
        {tab === "library"  && <AdminLibrary />}
        {tab === "media"    && <AdminMedia />}
        {tab === "scholars" && <AdminScholars />}
        {tab === "tracking" && <AdminTracking />}
        {tab === "site"     && <AdminSite />}
      </div>
    </div>
  )
}

function LoginScreen({ pw, setPw, onLogin, error, go }) {
  return (
    <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 60, height: 60, background: "var(--acc2)", border: ".5px solid var(--acc-br)",
          borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 24,
        }}>🔐</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          Admin Login
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)", fontWeight: 300 }}>
          Talib Club Admin Panel
        </div>
      </div>

      <div style={{
        background: "var(--card)", border: `.5px solid ${error ? "rgba(224,85,85,0.5)" : "var(--br2)"}`,
        borderRadius: 14, padding: 24, transition: "border-color .2s",
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--t2)", marginBottom: 8 }}>
            รหัสผ่าน
          </div>
          <input
            type="password"
            placeholder="กรอกรหัสผ่าน Admin"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onLogin()}
            autoFocus
            style={{
              width: "100%", padding: "10px 14px",
              background: "var(--inp)", border: `.5px solid ${error ? "rgba(224,85,85,0.5)" : "var(--br)"}`,
              borderRadius: 8, color: "var(--text)", fontSize: 13, fontFamily: "'Prompt',sans-serif",
              fontWeight: 300, outline: "none",
            }}
          />
          {error && (
            <div style={{ fontSize: 11, color: "#e05555", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 11 }}></i> รหัสผ่านไม่ถูกต้อง
            </div>
          )}
        </div>
        <button onClick={onLogin} style={{
          width: "100%", fontFamily: "'Prompt',sans-serif", fontSize: 13, fontWeight: 500,
          padding: "10px", borderRadius: 24, border: "none", cursor: "pointer",
          background: "var(--acc)", color: "var(--bg)",
        }}>
          เข้าสู่ระบบ
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={() => go("home")} style={{
          fontFamily: "'Prompt',sans-serif", fontSize: 12, color: "var(--t3)",
          background: "none", border: "none", cursor: "pointer", fontWeight: 300,
        }}>
          ← กลับหน้าหลัก
        </button>
      </div>
    </div>
  )
}
