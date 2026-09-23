import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import SEOHead, { BASE_URL } from "../components/SEOHead.jsx"

function readAfterLogin() {
  try {
    const stored = window.sessionStorage.getItem("talibAfterLogin")
    // Only ever an in-app path, never an absolute URL from somewhere else.
    return stored && stored.startsWith("/") && !stored.startsWith("//") ? stored : null
  } catch (e) {
    console.warn(e)
    return null
  }
}

export default function Auth({ authState, go }) {
  const location = useLocation()
  const navigate = useNavigate()
  // A Google redirect sign-in reloads the app, so location.state is empty when
  // the user comes back. loginWithGoogle() parks the destination in
  // sessionStorage for exactly that trip.
  const [redirectTarget] = useState(() => location.state?.from || readAfterLogin() || "/member")

  useEffect(() => {
    if (authState?.user) {
      try { window.sessionStorage.removeItem("talibAfterLogin") } catch { /* Storage may be unavailable. */ }
      navigate(redirectTarget, { replace: true })
    }
  }, [authState?.user, redirectTarget, navigate])

  const [mode, setMode] = useState("login")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")

  function changeMode(nextMode) {
    setMode(nextMode)
    setError("")
    setStatus("")
    setShowPassword(false)
  }

  function validateForm() {
    if (mode === "register" && !displayName.trim()) return "กรุณากรอกชื่อที่แสดงในบัญชี"
    if (!email.trim()) return "กรุณากรอกอีเมลก่อนครับ"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com"
    if (!password) return "กรุณากรอกรหัสผ่านก่อนครับ"
    if (password.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ"
    return ""
  }

  async function submit(e) {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setStatus("")
      return
    }

    setBusy(true)
    setError("")
    setStatus("")
    try {
      const cleanEmail = email.trim()
      if (mode === "register") {
        await authState.register({ email: cleanEmail, password, displayName })
      } else {
        await authState.login(cleanEmail, password)
      }
      setStatus("")
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      console.error(err)
      setStatus("")
      setError(mode === "register" ? "สมัครสมาชิกไม่สำเร็จ อีเมลนี้อาจถูกใช้แล้วหรือรหัสผ่านไม่ตรงเงื่อนไข" : "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน")
    }
    setBusy(false)
  }

  async function signInGoogle() {
    setBusy(true)
    setError("")
    setStatus("")
    try {
      const res = await authState.loginWithGoogle(redirectTarget)
      if (!res?.redirecting) {
        setStatus("")
        navigate(redirectTarget, { replace: true })
      }
    } catch (err) {
      console.error(err)
      setStatus("")
      setError("เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
    setBusy(false)
  }

  async function forgotPassword() {
    if (!email.trim()) {
      setError("กรุณากรอกอีเมลบัญชีก่อนครับ")
      setStatus("")
      return
    }
    setBusy(true)
    setError("")
    setStatus("")
    try {
      await authState.sendPasswordResetForEmail(email.trim())
      setStatus("ส่งคำขอแล้ว หากอีเมลนี้มีบัญชีอยู่ คุณจะได้รับลิงก์ในไม่ช้า")
    } catch (err) {
      console.error(err)
      setStatus("")
      setError("ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
    setBusy(false)
  }

  if (authState?.user) return null

  return (
    <div className="auth-page">
      <SEOHead title={`${mode === "register" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"} | Talib Club`} canonical={`${BASE_URL}/auth`} noIndex />
      <div className="auth-intro">
        <button className="btn btn-outline" onClick={() => go("home")} style={{ marginBottom: 18 }}>
          <i className="ti ti-arrow-left" style={{ marginRight: 6 }}></i>กลับหน้าเว็บ
        </button>
        <h1>{mode === "register" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"} Talib Club</h1>
      </div>

      <form onSubmit={submit} className="card auth-card" noValidate>
        <div className="auth-tabs" aria-label="เลือกโหมดบัญชี">
          <button type="button" disabled={busy} aria-pressed={mode === "login"} className={`pill ${mode === "login" ? "on" : ""}`} onClick={() => changeMode("login")}>
            เข้าสู่ระบบ
          </button>
          <button type="button" disabled={busy} aria-pressed={mode === "register"} className={`pill ${mode === "register" ? "on" : ""}`} onClick={() => changeMode("register")}>
            สมัครสมาชิก
          </button>
        </div>

        {mode === "register" && (
          <label>
            <span style={labelStyle}>ชื่อที่แสดง</span>
            <input autoComplete="nickname" disabled={busy} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="เช่น Ahmad Talib" />
          </label>
        )}

        <label>
          <span style={labelStyle}>อีเมลบัญชี</span>
          <input autoComplete="email" inputMode="email" disabled={busy} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
        </label>

        <label>
          <span style={labelStyle}>รหัสผ่าน</span>
          <input autoComplete={mode === "register" ? "new-password" : "current-password"} disabled={busy} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" />
        </label>

        <button type="button" className="btn btn-outline" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}</button>

        {mode === "login" && (
          <button type="button" onClick={forgotPassword} disabled={busy} style={{
            border: "none", background: "transparent", color: "var(--teal)", cursor: "pointer",
            fontFamily: "'Prompt',sans-serif", fontSize: 12, padding: 0, alignSelf: "flex-start",
          }}>
            ลืมรหัสผ่าน?
          </button>
        )}

        {status && <div className="auth-info" role="status">{status}</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}

        <button className="btn btn-main auth-submit" disabled={busy} type="submit">
          {busy ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชีสมาชิก"}
        </button>

        <div className="auth-divider">
          <span></span>
          หรือใช้บัญชี Google
          <span></span>
        </div>

        <button type="button" className="btn auth-google" disabled={busy} onClick={signInGoogle}>
          <i className="ti ti-brand-google"></i>
          เข้าสู่ระบบด้วย Google
        </button>
      </form>
    </div>
  )
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "var(--t2)",
  marginBottom: 6,
}
