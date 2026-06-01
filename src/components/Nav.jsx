import { useEffect, useRef, useState } from "react"
import { SITE } from "../data/index.js"
import toast from "react-hot-toast"
import { confirmAction } from "../utils/feedback.jsx"

const NAV_LINKS = [
  { id: "home", label: "หน้าหลัก", icon: "ti-home" },
  { id: "articles", label: "บทความ", icon: "ti-file-text" },
  { id: "library", label: "ห้องสมุด", icon: "ti-books" },
  { id: "media", label: "มีเดีย", icon: "ti-player-play" },
  { id: "scholars", label: "ทำเนียบบุคคล", icon: "ti-users" },
  { id: "tracking", label: "ตรวจพัสดุ", icon: "ti-package" },
]

export default function Nav({ page, go, theme, setTheme, authState }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const accountRef = useRef(null)

  useEffect(() => {
    const fn = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  useEffect(() => {
    function closeAccount(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    function closeOnEsc(e) {
      if (e.key === "Escape") setAccountOpen(false)
    }
    document.addEventListener("mousedown", closeAccount)
    document.addEventListener("keydown", closeOnEsc)
    return () => {
      document.removeEventListener("mousedown", closeAccount)
      document.removeEventListener("keydown", closeOnEsc)
    }
  }, [])

  function nav(id, data = null) {
    go(id, data)
    setMenuOpen(false)
    setAccountOpen(false)
  }

  // แก้ไขระบบออกจากระบบให้สมูทขึ้น
  async function logout() {
    const ok = await confirmAction({
      title: "ออกจากระบบ?",
      message: "คุณต้องการออกจากระบบหรือไม่?",
      confirmText: "ออกจากระบบ",
      danger: true
    });
    if (!ok) return;

    const toastId = toast.loading("กำลังออกจากระบบ...");

    setTimeout(async () => {
      try {
        if (authState?.logout) await authState.logout();
        toast.success("ออกจากระบบสำเร็จ", { id: toastId });
        window.location.href = "/"; // รีโหลดหน้าเพื่อเคลียร์ state ทั้งหมด
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการออกจากระบบ", { id: toastId });
      }
    }, 600);
  }

  const userName = authState?.profile?.displayName || authState?.user?.displayName || authState?.user?.email || "บัญชีของฉัน"
  const userInitial = (userName.trim()[0] || "U").toUpperCase()
  const [avatarBroken, setAvatarBroken] = useState(false)
  const photoURL = avatarBroken ? "" : authState?.user?.photoURL

  return (
    <>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: ".5px solid var(--br2)",
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--nav-bg)", backdropFilter: "blur(14px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={iconButtonStyle} aria-label={menuOpen ? "Close menu" : "Open menu"}>
              <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"}`}></i>
            </button>
          )}
          <div style={{ fontWeight: 600, cursor: "pointer", fontSize: 16 }} onClick={() => nav("home")}>
          <span style={{ 
  fontFamily: '"Times New Roman", Times, serif', 
  color: "var(--text)", /* <-- เปลี่ยนเป็น var(--text) */
  fontSize: "24px",                              
  fontWeight: "bold",                            
  letterSpacing: "1px",                          
  textTransform: "uppercase"                     
}}>
  Talib
</span>
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", gap: "8px" }}>
            {NAV_LINKS.map(l => <DesktopNavButton key={l.id} item={l} page={page} nav={nav} />)}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div ref={accountRef} style={{ position: "relative" }}>
            <button
              onClick={() => authState?.user ? setAccountOpen(open => !open) : nav("auth")}
              style={{
                background: authState?.user ? "var(--teal-bg)" : "var(--bg2)",
                border: "none", cursor: "pointer",
                color: authState?.user ? "var(--teal)" : "var(--t3)",
                padding: authState?.user ? 0 : "6px 14px", // ปรับ padding
                borderRadius: 20, width: authState?.user ? 34 : "auto",
                height: authState?.user ? 34 : "auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", // เพิ่มช่องไฟระหว่างไอคอนและข้อความ
                fontFamily: "'Prompt',sans-serif", fontWeight: 600,
              }}
              title={authState?.user ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}
              aria-label={authState?.user ? "เมนูบัญชี" : "เข้าสู่ระบบ"}
              aria-expanded={accountOpen}
            >
              {authState?.user ? (
                photoURL
                  ? <img src={photoURL} alt="" onError={() => setAvatarBroken(true)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : userInitial
              ) : (
                <>
                  <i className="ti ti-login" style={{ fontSize: 16 }}></i>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>เข้าสู่ระบบ</span>
                </>
              )}
            </button>

            {authState?.user && accountOpen && !isMobile && (
              <AccountDropdown
                name={userName}
                email={authState.user?.email}
                photoURL={photoURL}
                isStaff={authState.isStaff}
                nav={nav}
                logout={logout}
              />
            )}
          </div>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{
            background: "var(--bg2)", border: "none", cursor: "pointer",
            color: "var(--t3)", padding: "6px 10px", borderRadius: 20,
          }} title="เปลี่ยนธีม" aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}>
            <i className={`ti ${theme === "light" ? "ti-moon" : "ti-sun"}`}></i>
          </button>
        </div>
      </nav>

      {authState?.user && accountOpen && isMobile && (
        <AccountDrawer
          name={userName}
          email={authState.user?.email}
          photoURL={photoURL}
          isStaff={authState.isStaff}
          nav={nav}
          logout={logout}
          onClose={() => setAccountOpen(false)}
          page={page}
        />
      )}

      {isMobile && menuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
          <div onClick={() => setMenuOpen(false)} style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: "280px",
            background: "var(--bg)", padding: "60px 20px",
            borderRight: "1px solid var(--br2)", boxShadow: "5px 0 15px rgba(0,0,0,0.1)",
          }}>
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => nav(l.id)} style={mobileButtonStyle(page, l.id)}>
                <i className={`ti ${l.icon}`} style={{ marginRight: 15 }}></i>
                {l.label}
              </button>
            ))}
            <button onClick={() => nav(authState?.user ? "member" : "auth")} style={mobileButtonStyle(page, authState?.user ? "member" : "auth")}>
              <i className={`ti ${authState?.user ? "ti-user-circle" : "ti-login"}`} style={{ marginRight: 15 }}></i>
              {authState?.user ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function AccountDropdown({ name, email, photoURL, isStaff, nav, logout }) {
  return (
    <div style={{
      position: "absolute", right: 0, top: 42, width: 260,
      background: "var(--card)", border: ".5px solid var(--br2)",
      borderRadius: 12, boxShadow: "0 18px 45px rgba(0,0,0,.18)",
      padding: 10, zIndex: 200, color: "var(--text)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 10px", borderBottom: ".5px solid var(--br2)" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: "var(--teal-bg)",
          color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, overflow: "hidden",
        }}>
          {photoURL ? <img src={photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name.trim()[0] || "U").toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          {email && <div style={{ fontSize: 11, color: "var(--t3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>}
        </div>
      </div>

      <DropdownItem icon="ti-layout-dashboard" label="แดชบอร์ดสมาชิก" onClick={() => nav("member", { view: "overview" })} />
      <DropdownItem icon="ti-user-circle" label="โปรไฟล์ของฉัน" onClick={() => nav("member", { view: "profile" })} />
      {isStaff && <DropdownItem icon="ti-briefcase" label="Staff Workspace" onClick={() => nav("staff")} />}
      {isStaff && <DropdownItem icon="ti-shield-check" label="Admin Panel" onClick={() => nav("admin")} />}

      <div style={{ borderTop: ".5px solid var(--br2)", marginTop: 6, paddingTop: 6 }}>
        <DropdownItem icon="ti-logout" label="ออกจากระบบ" danger onClick={logout} />
      </div>
    </div>
  )
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", border: "none", background: "transparent", cursor: "pointer",
      color: danger ? "#e05555" : "var(--text)", display: "flex", alignItems: "center",
      gap: 10, padding: "10px 8px", borderRadius: 8, textAlign: "left",
      fontFamily: "'Prompt',sans-serif", fontSize: 12,
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 15, color: danger ? "#e05555" : "var(--teal)" }}></i>
      {label}
    </button>
  )
}

function DesktopNavButton({ item, page, nav }) {
  return (
    <button onClick={() => nav(item.id)} style={{
      background: page === item.id ? "var(--bg2)" : "transparent",
      border: "none", cursor: "pointer", padding: "6px 12px",
      borderRadius: 8, fontSize: 13,
      color: page === item.id ? "var(--text)" : "var(--t2)",
      fontFamily: "'Prompt',sans-serif",
    }}>
      {item.label}
    </button>
  )
}

function mobileButtonStyle(page, id) {
  return {
    display: "block", width: "100%", textAlign: "left", padding: "18px 10px",
    fontSize: 16, background: "transparent", border: "none",
    color: page === id ? "var(--teal)" : "var(--text)", cursor: "pointer",
    fontFamily: "'Prompt',sans-serif",
  }
}

const iconButtonStyle = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  color: "var(--text)",
}

function AccountDrawer({ name, email, photoURL, isStaff, nav, logout, onClose, page }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <div 
        onClick={onClose} 
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease-out"
        }} 
      />
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "280px",
        background: "var(--bg)",
        padding: "60px 20px",
        borderLeft: "1px solid var(--br2)",
        boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        animation: "slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 1001
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 15, borderBottom: "1px solid var(--br2)" }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--teal-bg)",
            color: "var(--teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            overflow: "hidden",
            flexShrink: 0
          }}>
            {photoURL ? <img src={photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name.trim()[0] || "U").toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            {email && <div style={{ fontSize: 11, color: "var(--t2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "var(--bg2)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--t2)",
            cursor: "pointer"
          }}>
            <i className="ti ti-x" style={{ fontSize: 14 }}></i>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <button onClick={() => { nav("member", { view: "overview" }); onClose(); }} style={drawerItemStyle(page === "member" && !window.location.search.includes("view=profile"))}>
            <i className="ti ti-layout-dashboard" style={{ marginRight: 15, fontSize: 18, color: "var(--teal)" }}></i>
            แดชบอร์ดสมาชิก
          </button>
          <button onClick={() => { nav("member", { view: "profile" }); onClose(); }} style={drawerItemStyle(page === "member" && window.location.search.includes("view=profile"))}>
            <i className="ti ti-user-circle" style={{ marginRight: 15, fontSize: 18, color: "var(--teal)" }}></i>
            โปรไฟล์ของฉัน
          </button>
          {isStaff && (
            <button onClick={() => { nav("staff"); onClose(); }} style={drawerItemStyle(page === "staff")}>
              <i className="ti ti-briefcase" style={{ marginRight: 15, fontSize: 18, color: "var(--teal)" }}></i>
              Staff Workspace
            </button>
          )}
          {isStaff && (
            <button onClick={() => { nav("admin"); onClose(); }} style={drawerItemStyle(page === "admin")}>
              <i className="ti ti-shield-check" style={{ marginRight: 15, fontSize: 18, color: "var(--teal)" }}></i>
              Admin Panel
            </button>
          )}
          <div style={{ borderTop: "1px solid var(--br2)", marginTop: 15, paddingTop: 15 }}>
            <button onClick={() => { logout(); onClose(); }} style={drawerItemStyle(false, true)}>
              <i className="ti ti-logout" style={{ marginRight: 15, fontSize: 18, color: "#e05555" }}></i>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function drawerItemStyle(active, danger) {
  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    padding: "16px 10px",
    fontSize: 15,
    background: "transparent",
    border: "none",
    color: danger ? "#e05555" : active ? "var(--teal)" : "var(--text)",
    cursor: "pointer",
    fontFamily: "'Prompt',sans-serif",
    fontWeight: active ? 600 : 400
  }
}