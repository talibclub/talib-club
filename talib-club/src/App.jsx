import { useEffect, useState } from "react"
import { useTheme } from "./hooks/useTheme.js"
import { useAuth } from "./hooks/useAuth.js"
import Nav from "./components/Nav.jsx"
import Home from "./pages/Home.jsx"
import Articles from "./pages/Articles.jsx"
import ArticleDetail from "./pages/ArticleDetail.jsx"
import Library from "./pages/Library.jsx"
import Media from "./pages/Media.jsx"
import Scholars from "./pages/Scholars.jsx"
import Tracking from "./pages/Tracking.jsx"
import Auth from "./pages/Auth.jsx"
import MemberDashboard from "./pages/MemberDashboard.jsx"
import StaffDashboard from "./pages/StaffDashboard.jsx"
import StaffWork from "./pages/StaffWork.jsx"
import Admin from "./pages/Admin.jsx"
import "./styles/global.css"

export default function App() {
  const { theme, setTheme } = useTheme()
  const authState = useAuth()
  const [page, setPage] = useState("home")
  const [ctx, setCtx] = useState(null)

  useEffect(() => {
    if (authState.loading || !authState.user) return
    if (window.sessionStorage.getItem("talibAfterLogin") !== "member") return
    window.sessionStorage.removeItem("talibAfterLogin")
    setPage("member")
    setCtx(null)
  }, [authState.loading, authState.user])

  const go = (p, data = null) => {
    setPage(p)
    setCtx(data)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className={`app ${theme}`}>
      <Nav page={page} go={go} theme={theme} setTheme={setTheme} authState={authState} />
      <main>
        {page === "home" && <Home go={go} />}
        {page === "articles" && <Articles go={go} />}
        {page === "article" && <ArticleDetail item={ctx} go={go} />}
        {page === "library" && <Library />}
        {page === "media" && <Media />}
        {page === "scholars" && <Scholars />}
        {page === "tracking" && <Tracking />}
        {page === "auth" && <Auth authState={authState} go={go} />}
        {page === "member" && (
          <RequireLogin authState={authState} go={go}>
            <MemberDashboard authState={authState} go={go} initialView={ctx?.view} />
          </RequireLogin>
        )}
        {page === "staff" && (
          <RequireLogin authState={authState} go={go}>
            <StaffDashboard authState={authState} go={go} />
          </RequireLogin>
        )}
        {page === "staff-work" && (
          <RequireStaff authState={authState} go={go}>
            <StaffWork authState={authState} go={go} />
          </RequireStaff>
        )}
        {page === "admin" && (
          <RequireStaff authState={authState} go={go}>
            <Admin go={go} authState={authState} initialTab={ctx?.tab} />
          </RequireStaff>
        )}
      </main>
    </div>
  )
}

function RequireLogin({ authState, go, children }) {
  if (authState.loading) return <LoadingState />
  if (!authState.user) return <Auth authState={authState} go={go} />
  return children
}

function RequireStaff({ authState, go, children }) {
  if (authState.loading) return <LoadingState />
  if (!authState.user) return <Auth authState={authState} go={go} />
  if (!authState.isStaff) return <StaffDashboard authState={authState} go={go} />
  return children
}

function LoadingState() {
  return (
    <div className="card" style={{ maxWidth: 420, margin: "44px auto", padding: 24, textAlign: "center" }}>
      <i className="ti ti-loader-2" style={{ fontSize: 28, color: "var(--teal)" }}></i>
      <p style={{ marginTop: 10 }}>กำลังตรวจสอบสถานะผู้ใช้...</p>
    </div>
  )
}
