import { useEffect, useState } from "react"

export default function MemberDashboard({ authState, go, initialView = "overview" }) {
  const [view, setView] = useState("overview")
  const [copied, setCopied] = useState("")
  const user = authState.user
  const profile = authState.profile || {}
  const name = profile.displayName || user?.displayName || user?.email || "สมาชิก"
  const role = profile.role || "member"

  useEffect(() => {
    if (initialView === "overview" || initialView === "profile") setView(initialView)
  }, [initialView])

  async function copyText(label, value) {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied(""), 1800)
    } catch (err) {
      console.error("Cannot copy text", err)
      setCopied("")
    }
  }

  return (
    <div className="member-page">
      <div className="member-hero">
        <div>
          <span className="badge badge-teal">{role === "staff" ? "Staff" : "Member"}</span>
          <h1>ยินดีต้อนรับ, {name}</h1>
          <p>พื้นที่สมาชิกสำหรับติดตามการอ่าน บันทึกหนังสือ และจัดการข้อมูลบัญชี Talib Club</p>
        </div>
        <div className="member-actions">
          <button className="btn btn-outline" onClick={authState.logout}>
            <i className="ti ti-logout" style={{ marginRight: 6 }}></i>ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="member-tabs" aria-label="เมนูสมาชิก">
        <button className={`pill ${view === "overview" ? "on" : ""}`} onClick={() => setView("overview")}>
          แดชบอร์ด
        </button>
        <button className={`pill ${view === "profile" ? "on" : ""}`} onClick={() => setView("profile")}>
          โปรไฟล์
        </button>
      </div>

      {view === "overview" ? (
        <Overview authState={authState} go={go} setView={setView} />
      ) : (
        <ProfilePanel authState={authState} copied={copied} copyText={copyText} go={go} />
      )}
    </div>
  )
}

function Overview({ authState, go, setView }) {
  return (
    <>
      <div className="grid3">
        <DashboardCard icon="ti-user-circle" title="โปรไฟล์ของฉัน" text="จัดการข้อมูลบัญชี" onClick={() => setView("profile")} />
        <DashboardCard icon="ti-book-2" title="ชั้นหนังสือของฉัน" text="บันทึกหนังสือที่กำลังอ่านและอ่านจบ" />
        <DashboardCard icon="ti-flame" title="Reading Streak" text="ติดตามวันที่อ่านต่อเนื่อง" />
      </div>

      <div className="grid3" style={{ marginTop: 12 }}>
        <DashboardCard icon="ti-bookmark" title="บทความที่บันทึกไว้" text="เก็บบทความที่อยากกลับมาอ่านภายหลัง" />
        <DashboardCard icon="ti-bell" title="การแจ้งเตือน" text="ข่าวสาร กิจกรรม และหนังสือใหม่" />
        <DashboardCard icon="ti-settings" title="ตั้งค่าบัญชี" text="จัดการข้อมูลส่วนตัวและการเข้าสู่ระบบ" onClick={() => setView("profile")} />
      </div>
    </>
  )
}

function ProfilePanel({ authState, copied, copyText, go }) {
  const user = authState.user
  const profile = authState.profile || {}
  const role = profile.role || "member"
  const displayName = profile.displayName || user?.displayName || "-"
  const email = user?.email || profile.email || "-"
  const photoURL = user?.photoURL || ""
  const isStaff = role === "staff"
  const emailVerified = Boolean(user?.emailVerified)
  const needsPasswordReauth = user?.providerData?.some(item => item.providerId === "password")
  const [form, setForm] = useState({
    displayName: displayName === "-" ? "" : displayName,
    email,
    password: "",
  })
  const emailChanged = formEmailChanged(form.email, email)
  const [busy, setBusy] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setForm({
      displayName: displayName === "-" ? "" : displayName,
      email,
      password: "",
    })
  }, [displayName, email])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function saveProfile(e) {
    e.preventDefault()
    setBusy("profile")
    setMessage("")
    setError("")
    try {
      await authState.updateUserProfile({
        displayName: form.displayName,
      })
      setMessage("บันทึกโปรไฟล์แล้ว")
    } catch (err) {
      console.error(err)
      setError("บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง")
    }
    setBusy("")
  }

  async function requestEmailChange() {
    setBusy("email")
    setMessage("")
    setError("")
    try {
      if (needsPasswordReauth && !form.password.trim()) {
        setError("กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันก่อนเปลี่ยนอีเมล")
        setBusy("")
        return
      }
      await authState.reauthenticateForSensitiveAction(form.password)
      await authState.requestEmailChange(form.email)
      set("password", "")
      setMessage("ส่งคำขอเปลี่ยนอีเมลแล้ว กรุณายืนยันจากอีเมลใหม่")
    } catch (err) {
      console.error(err)
      const message = getEmailChangeError(err)
      setError(message)
    }
    setBusy("")
  }

  async function verifyCurrentEmail() {
    setBusy("verify")
    setMessage("")
    setError("")
    try {
      await authState.sendCurrentEmailVerification()
      setMessage("ส่งคำขอยืนยันอีเมลแล้ว")
    } catch (err) {
      console.error(err)
      setError("ส่งลิงก์ยืนยันอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
    setBusy("")
  }

  async function resetPassword() {
    setBusy("password")
    setMessage("")
    setError("")
    try {
      await authState.sendPasswordReset()
      setMessage("ส่งคำขอเปลี่ยนรหัสผ่านแล้ว")
    } catch (err) {
      console.error(err)
      setError("ส่งลิงก์เปลี่ยนรหัสผ่านไม่สำเร็จ")
    }
    setBusy("")
  }

  return (
    <div className="profile-layout">
      <form className="card profile-card" onSubmit={saveProfile}>
        <div className="profile-head">
          <div className="profile-avatar" style={{ overflow: "hidden" }}>
            {photoURL
              ? <img src={photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials(displayName, email)}
          </div>
          <div>
            <span className={`badge ${isStaff ? "badge-teal" : "badge-acc"}`}>{isStaff ? "Staff" : "Member"}</span>
            <h2>{displayName}</h2>
            <p>{email}</p>
          </div>
        </div>

        <section className="profile-section">
          <div className="profile-section-head">
            <div>
              <h3>ข้อมูลส่วนตัว</h3>
              <p>ชื่อส่วนนี้จะแสดงบนหน้าโปรไฟล์และแดชบอร์ดของคุณ</p>
            </div>
          </div>

          <label style={fieldStyle}>
            <span>ชื่อที่แสดง</span>
            <input value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="ชื่อที่ต้องการแสดง" />
          </label>

          <div className="profile-actions">
            <button className="btn btn-teal" disabled={busy === "profile"} type="submit">
              <i className="ti ti-device-floppy" style={{ marginRight: 6 }}></i>{busy === "profile" ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
            </button>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-head">
            <div>
              <h3>ความปลอดภัยบัญชี</h3>
              <p>การเปลี่ยนอีเมลและรหัสผ่านจะส่งลิงก์ยืนยันไปที่อีเมลก่อนเสมอ</p>
            </div>
          </div>

          <label style={fieldStyle}>
            <span>อีเมลที่ใช้เข้าสู่ระบบ</span>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </label>

          {emailChanged && needsPasswordReauth && (
            <label style={fieldStyle}>
              <span>รหัสผ่านปัจจุบัน</span>
              <input
                type="password"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                placeholder="ยืนยันตัวตนก่อนส่งลิงก์เปลี่ยนอีเมล"
              />
            </label>
          )}

          {!emailVerified && (
            <div className="auth-note profile-note">
              <i className="ti ti-alert-circle"></i>
              <span>อีเมลนี้ยังไม่ได้ยืนยัน กดยืนยันเพื่อเพิ่มความปลอดภัยและใช้สำหรับกู้บัญชีได้มั่นใจขึ้น</span>
            </div>
          )}

          <div className="profile-actions">
            {!emailVerified && (
              <button className="btn btn-outline" type="button" disabled={busy === "verify"} onClick={verifyCurrentEmail}>
                <i className="ti ti-shield-check" style={{ marginRight: 6 }}></i>{busy === "verify" ? "กำลังส่ง..." : "ยืนยันอีเมลปัจจุบัน"}
              </button>
            )}
            <button className="btn btn-outline" type="button" disabled={busy === "email" || !emailChanged} onClick={requestEmailChange}>
              <i className="ti ti-mail-check" style={{ marginRight: 6 }}></i>{busy === "email" ? "กำลังส่ง..." : "ส่งลิงก์ยืนยันอีเมลใหม่"}
            </button>
            <button className="btn btn-outline" type="button" disabled={busy === "password"} onClick={resetPassword}>
              <i className="ti ti-key" style={{ marginRight: 6 }}></i>{busy === "password" ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
            </button>
          </div>
        </section>

        <InfoRow label="สถานะบัญชี" value={isStaff ? "Staff" : "Member"} />
        {message && <div className="auth-info" style={{ marginTop: 12 }}>{message}</div>}
        {error && <div className="auth-error" style={{ marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  )
}

function InfoRow({ label, value, onCopy, copied, mono }) {
  return (
    <div className="profile-row">
      <span>{label}</span>
      <div>
        <strong className={mono ? "mono" : ""}>{value}</strong>
        {onCopy && (
          <button type="button" className="copy-btn" onClick={onCopy}>
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        )}
      </div>
    </div>
  )
}

function DashboardCard({ icon, title, text, onClick }) {
  const Tag = onClick ? "button" : "div"

  return (
    <Tag onClick={onClick} className="card dashboard-card">
      <i className={`ti ${icon}`}></i>
      <h2>{title}</h2>
      <p>{text}</p>
    </Tag>
  )
}

function initials(name, email) {
  const source = name && name !== "-" ? name : email
  return source
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "TC"
}

function formEmailChanged(nextEmail, currentEmail) {
  return nextEmail?.trim().toLowerCase() !== currentEmail?.trim().toLowerCase()
}

function getEmailChangeError(err) {
  if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
    return "รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง"
  }
  if (err?.code === "auth/requires-recent-login") {
    return "เพื่อความปลอดภัย กรุณายืนยันตัวตนอีกครั้งก่อนเปลี่ยนอีเมล"
  }
  if (err?.code === "auth/email-already-in-use") {
    return "อีเมลนี้ถูกใช้กับบัญชีอื่นแล้ว"
  }
  if (err?.code === "auth/invalid-email") {
    return "รูปแบบอีเมลไม่ถูกต้อง"
  }
  return "เปลี่ยนอีเมลไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง"
}

const fieldStyle = {
  display: "grid",
  gap: 6,
  marginTop: 12,
  fontSize: 12,
  color: "var(--t2)",
}
