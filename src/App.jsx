import { useEffect, useState, lazy, Suspense } from "react"
import { useTheme } from "./hooks/useTheme.js"
import { useAuth } from "./hooks/useAuth.js"
import Nav from "./components/Nav.jsx"

const Home = lazy(() => import("./pages/Home.jsx"))
const Articles = lazy(() => import("./pages/Articles.jsx"))
const ArticleDetail = lazy(() => import("./pages/ArticleDetail.jsx"))
const Library = lazy(() => import("./pages/Library.jsx"))
const LibraryDetail = lazy(() => import("./pages/LibraryDetail.jsx"))
const Media = lazy(() => import("./pages/Media.jsx"))
const MediaDetail = lazy(() => import("./pages/MediaDetail.jsx"))
const Scholars = lazy(() => import("./pages/Scholars.jsx"))
const Quran = lazy(() => import("./pages/Quran.jsx"))
const Tracking = lazy(() => import("./pages/Tracking.jsx"))
const Auth = lazy(() => import("./pages/Auth.jsx"))
const MemberDashboard = lazy(() => import("./pages/MemberDashboard.jsx"))
const StaffDashboard = lazy(() => import("./pages/StaffDashboard.jsx"))
const StaffWork = lazy(() => import("./pages/StaffWork.jsx"))
const StaffTranslation = lazy(() => import("./pages/StaffTranslation.jsx"))
const Admin = lazy(() => import("./pages/Admin.jsx"))
const Donation = lazy(() => import("./pages/Donation.jsx"))
import { Toaster } from "react-hot-toast"
import PWAInstallBanner from "./components/PWAInstallBanner.jsx"
import "./styles/global.css"

export default function App() {
  const { theme, setTheme } = useTheme()
  const authState = useAuth()
  const [page, setPage] = useState("home")
  const [ctx, setCtx] = useState(null)

  const urlToPage = {
    "": "home",
    "articles": "articles",
    "article": "article",
    "library": "library",
    "library-detail": "library-detail",
    "media": "media",
    "media-detail": "media-detail",
    "scholars": "scholars",
    "quran": "quran",
    "tracking-system": "tracking",
    "auth": "auth",
    "member": "member",
    "staff": "staff",
    "staff-work": "staff-work",
    "staff-translation": "staff-translation",
    "admin": "admin",
    "donate": "donate",
  }

  useEffect(() => {
    const handlePopstate = (event) => {
      if (event && event.state && event.state.page) {
        setPage(event.state.page)
        setCtx(event.state.ctx || null)
      } else {
        const path = window.location.pathname.replace(/^\//, "")
        const mapped = urlToPage[path] || "home"
        setPage(mapped)
        setCtx(null)
      }
    }

    const initialPath = window.location.pathname.replace(/^\//, "")
    const initialPage = urlToPage[initialPath] || "home"
    window.history.replaceState({ page: initialPage, ctx: null }, "", window.location.pathname + window.location.search)
    setPage(initialPage)

    window.addEventListener("popstate", handlePopstate)
    return () => window.removeEventListener("popstate", handlePopstate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = (p, data = null) => {
    setPage(p)
    setCtx(data)
    window.scrollTo(0, 0)
    
    let urlPath = "/";
    if (p === "tracking") {
      urlPath = "/tracking-system";
    } else if (p !== "home") {
      urlPath = "/" + p;
    }
    
    // ฝัง ID ลงในลิงก์ URL อัตโนมัติ เพื่อให้แชร์ได้ 
    if (data && data.id) {
      urlPath += `?id=${data.id}`
    }
    
    window.history.pushState({ page: p, ctx: data }, "", urlPath);
  }

  return (
    <div className={`app ${theme}`}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'Prompt', sans-serif", fontSize: 14 } }} />
      
      <Nav page={page} go={go} theme={theme} setTheme={setTheme} authState={authState} />
      <main className={`${page === "quran" || page === "member" ? "wide" : ""} fade-in-active`} key={page}>
        <Suspense fallback={<LoadingState />}>
          {page === "home" && <Home go={go} />}
          {page === "articles" && <Articles go={go} authState={authState} ctx={ctx} />}      
          {page === "article" && <ArticleDetail item={ctx} go={go} authState={authState} />}
          {page === "library" && <Library go={go} authState={authState} />}
          {page === "library-detail" && (
            <RequireLogin authState={authState} go={go}>
              <LibraryDetail item={ctx} go={go} authState={authState} />
            </RequireLogin>
          )}
          {page === "media" && <Media go={go} />}
          {page === "media-detail" && <MediaDetail item={ctx} go={go} authState={authState} />}
          {page === "scholars" && <Scholars />}
          {page === "quran" && (
            <RequireLogin authState={authState} go={go}>
              <MemberDashboard authState={authState} go={go} initialView="quran" />
            </RequireLogin>
          )}
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
          {page === "staff-translation" && (
            <RequireStaff authState={authState} go={go}>
              <StaffTranslation authState={authState} go={go} />
            </RequireStaff>
          )}
          {page === "admin" && (
            <RequireStaff authState={authState} go={go}>
              <Admin go={go} authState={authState} initialTab={ctx?.tab} />
            </RequireStaff>
          )}
          {page === "donate" && <Donation />}
        </Suspense>
      </main>
      <PWAInstallBanner />
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
      <i className="ti ti-loader-2 spin" style={{ fontSize: 28, color: "var(--teal)" }}></i>
      <p style={{ marginTop: 10 }}>กำลังตรวจสอบสถานะผู้ใช้...</p>
    </div>
  )
}