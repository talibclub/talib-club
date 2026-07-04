import { Link } from "react-router-dom"

function getPagePath(id, data = null) {
  if (id === "home" || id === "") return "/";
  if (id === "tracking") return "/tracking-system";
  
  let p = "/" + id;
  if (data) {
    const qParams = new URLSearchParams()
    if (["article", "library-detail", "media-detail"].includes(id) && data.id) {
      qParams.set("id", String(data.id))
    } else {
      Object.entries(data).forEach(([key, val]) => {
        if (val !== null && val !== undefined && typeof val !== "object") {
          qParams.set(key, String(val))
        }
      })
    }
    const queryString = qParams.toString()
    if (queryString) {
      p += `?${queryString}`
    }
  }
  return p;
}

export function AccountDropdown({ name, email, photoURL, isStaff, nav, logout, isInstallable, installApp, setAccountOpen }) {
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

      <DropdownItem icon="ti-layout-dashboard" label="แดชบอร์ดสมาชิก" to={getPagePath("member", { view: "overview" })} onClick={() => setAccountOpen?.(false)} />
      <DropdownItem icon="ti-device-desktop" label="ห้องอ่านหนังสือ (จับเวลา)" to={getPagePath("reader")} onClick={() => setAccountOpen?.(false)} />
      <DropdownItem icon="ti-user-circle" label="โปรไฟล์ของฉัน" to={getPagePath("member", { view: "profile" })} onClick={() => setAccountOpen?.(false)} />
      {isStaff && <DropdownItem icon="ti-briefcase" label="Staff Workspace" to={getPagePath("staff")} onClick={() => setAccountOpen?.(false)} />}
      {isStaff && <DropdownItem icon="ti-shield-check" label="Admin Panel" to={getPagePath("admin")} onClick={() => setAccountOpen?.(false)} />}
      {isInstallable && <DropdownItem icon="ti-download" label="ติดตั้งแอป Talib" onClick={installApp} />}

      <div style={{ borderTop: ".5px solid var(--br2)", marginTop: 6, paddingTop: 6 }}>
        <DropdownItem icon="ti-logout" label="ออกจากระบบ" danger onClick={logout} />
      </div>
    </div>
  )
}

function DropdownItem({ icon, label, to, onClick, danger }) {
  const style = {
    width: "100%", border: "none", background: "transparent", cursor: "pointer",
    color: danger ? "#e05555" : "var(--text)", display: "flex", alignItems: "center",
    gap: 10, padding: "10px 8px", borderRadius: 8, textAlign: "left",
    fontFamily: "'Prompt',sans-serif", fontSize: 12,
    textDecoration: "none", boxSizing: "border-box"
  };

  if (to) {
    return (
      <Link to={to} onClick={onClick} style={style}>
        <i className={`ti ${icon}`} style={{ fontSize: 15, color: danger ? "#e05555" : "var(--teal)" }}></i>
        {label}
      </Link>
    )
  }

  return (
    <button onClick={onClick} style={style}>
      <i className={`ti ${icon}`} style={{ fontSize: 15, color: danger ? "#e05555" : "var(--teal)" }}></i>
      {label}
    </button>
  )
}

export function AccountDrawer({ name, email, photoURL, isStaff, nav, logout, onClose, page, isInstallable, installApp }) {
  return (
    <div className="account-drawer" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div 
        onClick={onClose} 
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(6px)",
          animation: "fadeIn 0.25s ease-out"
        }} 
      />
      <div style={{
        position: "relative",
        background: "var(--card)",
        borderTop: ".5px solid var(--br2)",
        borderRadius: "24px 24px 0 0",
        padding: "16px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
        boxShadow: "0 -8px 30px rgba(0,0,0,0.15)",
        zIndex: 1001,
        maxHeight: "85vh",
        overflowY: "auto",
        animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}} />
        <div style={{
          width: 40,
          height: 4,
          background: "var(--br2)",
          borderRadius: 2,
          margin: "0 auto 8px",
          opacity: 0.8
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 4px 16px", borderBottom: ".5px solid var(--br2)" }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--teal-bg)",
            color: "var(--teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 18,
            overflow: "hidden",
            flexShrink: 0
          }}>
            {photoURL ? <img src={photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name.trim()[0] || "U").toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            {email && <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "var(--bg2)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--t2)",
            cursor: "pointer"
          }}>
            <i className="ti ti-x" style={{ fontSize: 16 }}></i>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <DrawerItem icon="ti-layout-dashboard" label="แดชบอร์ดสมาชิก" to={getPagePath("member", { view: "overview" })} onClick={onClose} />
          <DrawerItem icon="ti-device-desktop" label="ห้องอ่านหนังสือ (จับเวลา)" to={getPagePath("reader")} onClick={onClose} />
          <DrawerItem icon="ti-user-circle" label="โปรไฟล์ของฉัน" to={getPagePath("member", { view: "profile" })} onClick={onClose} />
          {isStaff && <DrawerItem icon="ti-briefcase" label="Staff Workspace" to={getPagePath("staff")} onClick={onClose} />}
          {isStaff && <DrawerItem icon="ti-shield-check" label="Admin Panel" to={getPagePath("admin")} onClick={onClose} />}
          {isInstallable && <DrawerItem icon="ti-download" label="ติดตั้งแอป Talib" onClick={() => { installApp(); onClose(); }} />}
        </div>
        <div style={{ borderTop: ".5px solid var(--br2)", paddingTop: 12 }}>
          <DrawerItem icon="ti-logout" label="ออกจากระบบ" danger onClick={() => { logout(); onClose(); }} />
        </div>
      </div>
    </div>
  )
}

function DrawerItem({ icon, label, to, onClick, danger }) {
  const style = {
    width: "100%",
    border: "none",
    background: danger ? "rgba(224, 85, 85, 0.08)" : "var(--bg2)",
    cursor: "pointer",
    color: danger ? "#e05555" : "var(--text)",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 16px",
    borderRadius: 12,
    textAlign: "left",
    fontFamily: "'Prompt',sans-serif",
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.2s",
    textDecoration: "none",
    boxSizing: "border-box"
  };

  if (to) {
    return (
      <Link to={to} onClick={onClick} style={style}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color: danger ? "#e05555" : "var(--teal)" }}></i>
        <span style={{ flex: 1 }}>{label}</span>
        <i className="ti ti-chevron-right" style={{ fontSize: 14, opacity: 0.4 }}></i>
      </Link>
    )
  }

  return (
    <button onClick={onClick} style={style}>
      <i className={`ti ${icon}`} style={{ fontSize: 18, color: danger ? "#e05555" : "var(--teal)" }}></i>
      <span style={{ flex: 1 }}>{label}</span>
      <i className="ti ti-chevron-right" style={{ fontSize: 14, opacity: 0.4 }}></i>
    </button>
  )
}
