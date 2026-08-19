import { Component, useEffect, useState, lazy, Suspense, useRef, useMemo, useCallback, createElement } from "react"
import { useNavigate, useLocation, useSearchParams, Routes, Route, Navigate } from "react-router-dom"
import { useTheme } from "./hooks/useTheme.js"
import { publicFirebaseConfig } from "./lib/firebase.js"
import { useAuth } from "./hooks/useAuth.js"
import Nav from "./components/Nav.jsx"
// Eager, not lazyWithRetry: a 404 is often reached because a chunk or a route
// went missing, which is the worst moment to need one more chunk to load.
import NotFound from "./pages/NotFound.jsx"
import { useAudio } from "./context/AudioContext.jsx"
import { getPagePath } from "./utils/url.js"

const lazyWithRetry = (componentImport) => {
  return lazy(() =>
    componentImport()
      .then((component) => {
        window.sessionStorage.removeItem("chunk-reload");
        return component;
      })
      .catch((error) => {
        console.error("Chunk load failed, forcing page reload...", error);
        const hasReloaded = window.sessionStorage.getItem("chunk-reload");
        if (!hasReloaded) {
          window.sessionStorage.setItem("chunk-reload", "true");
          window.location.reload();
          return new Promise(() => {});
        }
        window.sessionStorage.removeItem("chunk-reload");
        throw error;
      })
  );
};

// Dev-only design harness. The route is compiled out of production by the
// import.meta.env.DEV guard below, but declaring the lazy component here still
// left Rollup emitting its chunk into dist/ — dead weight that shipped. Building
// the component inside the guarded branch keeps the dynamic import out of the
// production graph entirely.
const Home = lazyWithRetry(() => import("./pages/Home.jsx"))
const Articles = lazyWithRetry(() => import("./pages/Articles.jsx"))
const ReadingApp = lazyWithRetry(() => import("./pages/ReadingApp.jsx"))
const ArticleDetail = lazyWithRetry(() => import("./pages/ArticleDetail.jsx"))
const Library = lazyWithRetry(() => import("./pages/Library.jsx"))
const LibraryDetail = lazyWithRetry(() => import("./pages/LibraryDetail.jsx"))
const Media = lazyWithRetry(() => import("./pages/Media.jsx"))
const MediaDetail = lazyWithRetry(() => import("./pages/MediaDetail.jsx"))
const Scholars = lazyWithRetry(() => import("./pages/Scholars.jsx"))
const Quran = lazyWithRetry(() => import("./pages/Quran.jsx"))
const Tracking = lazyWithRetry(() => import("./pages/Tracking.jsx"))
const Auth = lazyWithRetry(() => import("./pages/Auth.jsx"))
const MemberDashboard = lazyWithRetry(() => import("./pages/MemberDashboard.jsx"))
const StaffDashboard = lazyWithRetry(() => import("./pages/StaffDashboard.jsx"))
const StaffWork = lazyWithRetry(() => import("./pages/StaffWork.jsx"))
const StaffTranslation = lazyWithRetry(() => import("./pages/StaffTranslation.jsx"))
const Admin = lazyWithRetry(() => import("./pages/Admin.jsx"))
const StaffMembers = lazyWithRetry(() => import("./pages/StaffMembers.jsx"))
const Donation = lazyWithRetry(() => import("./pages/Donation.jsx"))
const OpenHouse = lazyWithRetry(() => import("./pages/OpenHouse.jsx"))
const OpenHouseCampus = lazyWithRetry(() => import("./pages/OpenHouseCampus.jsx"))
const BookCampaigns = lazyWithRetry(() => import("./pages/BookCampaigns.jsx"))
const BookRegistration = lazyWithRetry(() => import("./pages/BookRegistration.jsx"))
import { Toaster } from "react-hot-toast"
import PWAInstallBanner from "./components/PWAInstallBanner.jsx"
import "./styles/global.css"
import "./styles/dashboard.css"
import { useContentCollection } from "./lib/contentStore.js"
import { syncServerTime, safeDateNow } from "./utils/time.js"

import { getLocalDayKey } from "./utils/streak.js"
import { attemptStaleBundleRecovery } from "./utils/recovery.js"

// <main> width policy: "wide"/"gallery" pages are dashboards or card-grids
// that benefit from the extra horizontal space; everything else keeps the
// narrower 1100px reading column (prose, single-item detail pages, forms).
// Pages not listed here often have their own inline max-width already —
// adding them would have no visible effect, so they're left alone.
const WIDE_PAGES = new Set(["quran", "member", "admin", "tracking", "staff-work", "staff-translation"])
const GALLERY_PAGES = new Set(["articles", "library", "media", "scholars", "openhouse", "openhouse-campus", "home", "staff"])

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
  "staff-members": "staff-members",
  "admin": "admin",
  "donate": "donate",
  "reader": "reader",
  "openhouse": "openhouse",
  "openhouse-campus": "openhouse-campus",
  "books": "books",
  "book-register": "book-register",
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const authState = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Only the first segment names the page: detail routes carry an id and a
  // title slug after it (`/article/aqeedah-100/<slug>`), and matching on the
  // full path made those pages fall back to "home" — which silently changed
  // the <main> width class and the highlighted nav item.
  const page = useMemo(() => {
    const firstSegment = location.pathname.split("/").filter(Boolean)[0] || ""
    return urlToPage[firstSegment] || "home"
  }, [location.pathname])

  const ctx = useMemo(() => {
    if (location.state && location.state.ctx) {
      return location.state.ctx
    }
    const parsed = {}
    for (const [key, val] of searchParams.entries()) {
      parsed[key] = val
    }
    return Object.keys(parsed).length > 0 ? parsed : null
  }, [location.state, searchParams.toString()])
  const [countdownText, setCountdownText] = useState("")
  const { playingAudio, audioState, autoplayNext, setAutoplayNext, pause, resume, stop } = useAudio()

  // Sync server time offset on mount
  useEffect(() => {
    syncServerTime()
  }, [])

  // Site Visit Tracker
  useEffect(() => {
    if (authState?.loading) return; // Wait for auth to resolve
    
    const logVisit = async () => {
      try {
        if (!sessionStorage.getItem("talib_visited_session")) {
          sessionStorage.setItem("talib_visited_session", "true")
          const { addDoc, collection, serverTimestamp } = await import("firebase/firestore")
          const { db } = await import("./lib/firebase.js")
          await addDoc(collection(db, "site_visits"), {
            createdAt: serverTimestamp(),
            userAgent: navigator.userAgent,
            path: window.location.pathname,
            uid: authState?.user?.uid || "unknown",
            displayName: authState?.user?.displayName || "unknown",
            email: authState?.user?.email || "unknown"
          })
        }
      } catch (err) {
        console.error("Failed to log visit:", err)
      }
    }
    logVisit()
  }, [authState?.loading, authState?.user])

  useEffect(() => {
    window.__isStaff = authState?.isStaff;
  }, [authState?.isStaff])

  // The tracking tool (public/tracking-system.html) runs in a same-origin
  // iframe. It is a static file, so it cannot read the VITE_* config itself —
  // it reads this. Sharing the main project's config is what lets it inherit
  // the staff member's existing session instead of signing in anonymously to a
  // second project where the rules cannot tell staff from anyone else.
  useEffect(() => {
    window.__talibFirebaseConfig = publicFirebaseConfig;
  }, [])

  const uid = authState?.user?.uid
  const readingSessionsQueryOptions = useMemo(() => ({ limit: 20, orderByField: "completedAt", orderDirection: "desc", live: false }), [])
  const { items: readingSessions } = useContentCollection("reading_sessions", [], uid, readingSessionsQueryOptions)
  const countdownNotifRef = useRef(null)

  // --- Preferred Time Notification (60s interval, gated by user toggle) ---
  useEffect(() => {
    if (!uid) return
    const interval = setInterval(() => {
      const isNotifEnabled = localStorage.getItem("talib_notif_enabled") === "true"
      if (!isNotifEnabled || typeof Notification === "undefined" || Notification.permission !== "granted") return
      const now = new Date(safeDateNow())
      const todayKey = getLocalDayKey(now.getTime())
      const notifTime = localStorage.getItem("talib_notif_time") || "20:00"
      const [prefHour, prefMin] = notifTime.split(":").map(Number)
      // Matching the minute exactly meant a single missed tick — a sleeping
      // tab, a throttled background timer, any drift past 60s — skipped the
      // reminder for the whole day. Fire once the preferred time has passed,
      // as long as today's reminder has not gone out yet.
      const nowMinutes = now.getHours() * 60 + now.getMinutes()
      const prefMinutes = prefHour * 60 + prefMin
      if (Number.isFinite(prefMinutes) && nowMinutes >= prefMinutes) {
        const lastSent = localStorage.getItem("talib_last_pref_notif_sent")
        if (lastSent !== todayKey) {
          localStorage.setItem("talib_last_pref_notif_sent", todayKey)
          new Notification("ได้เวลาอ่านหนังสือแล้ว 📖", {
            body: "มาร่วมสร้างนิสัยการอ่านและสะสม streak วันนี้กันเถอะ!",
            tag: "preferred-time-notif"
          })
        }
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [uid])

  // --- Realtime Countdown Banner (1s tick, 23:00 hour) ---
  // H5: Uses visibilitychange to pause when tab is hidden (saves CPU/battery)
  useEffect(() => {
    if (!uid) return
    let interval = null

    const tick = () => {
      const now = new Date(safeDateNow())
      if (now.getHours() === 23) {
        const todayKey = getLocalDayKey(now.getTime())
        const todaySessions = readingSessions.filter(
          item =>
            item.uid === uid &&
            item.verified &&
            (item.dayKey || getLocalDayKey(item.completedAt || item.createdAt)) === todayKey
        )
        const todaySeconds = todaySessions.reduce((sum, item) => sum + Number(item.activeSeconds || 0), 0)
        if (todaySeconds < 600) {
          const secondsLeft = 3600 - (now.getMinutes() * 60 + now.getSeconds())
          const m = Math.floor(secondsLeft / 60)
          const s = secondsLeft % 60
          setCountdownText(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`)
        } else {
          setCountdownText("")
          if (countdownNotifRef.current) {
            countdownNotifRef.current.close()
            countdownNotifRef.current = null
          }
        }
      } else {
        setCountdownText("")
      }
    }

    // Only the 23:00 banner needs a per-second tick; the other 23 hours this
    // just re-confirmed that there is nothing to show.
    const schedule = () => {
      const nextDelay = new Date(safeDateNow()).getHours() === 23 ? 1000 : 30000
      interval = setTimeout(() => { tick(); schedule() }, nextDelay)
    }
    const start = () => { if (!interval) { tick(); schedule() } }
    const stopTick = () => { clearTimeout(interval); interval = null }
    const onVisibility = () => document.hidden ? stopTick() : start()

    document.addEventListener('visibilitychange', onVisibility)
    start()

    return () => {
      stopTick()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [uid, readingSessions])






  // `go` is handed to Nav and to every page below. A fresh identity on each
  // App render invalidated their memoised props and effect deps, so the whole
  // tree re-rendered on every unrelated App state change.
  const go = useCallback((p, data = null, options = {}) => {
    const urlPath = getPagePath(p, data);
    
    if (options.replace) {
      navigate(urlPath, { replace: true, state: { ctx: data } });
    } else {
      navigate(urlPath, { state: { ctx: data } });
    }
    if (!options.noScroll) {
      window.scrollTo(0, 0)
    }
  }, [navigate])

  // Public pages (home, articles, library, media, scholars, donate) render
  // immediately — they don't depend on auth. Blocking the whole app on Firebase
  // Auth (which has a 6s fallback timeout when blocked by extensions) made every
  // first visit stare at a spinner. Routes that DO need auth are wrapped in
  // RequireLogin / RequireStaff, which already show their own loading state.
  return (
    <div className={`app ${theme}`}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'Prompt', sans-serif", fontSize: 14 } }} />
      
      <Nav
        page={page}
        go={go}
        theme={theme}
        setTheme={setTheme}
        authState={authState}
        readingSessions={readingSessions}
      />
      {countdownText && (
        <div
          className="countdown-banner"
          onClick={() => go("reader")}
          style={{
            background: "linear-gradient(135deg, #dc2626, #991b1b)",
            color: "#fff",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            fontFamily: "'Prompt', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(220, 38, 38, 0.3)",
            position: "sticky",
            top: 58,
            zIndex: 99,
          }}
        >
          <i className="ti ti-alert-triangle" style={{ fontSize: 18, animation: "countdown-pulse 1s infinite" }} />
          <span>⏰ เหลือเวลาอีก <strong style={{ fontSize: 20, fontFamily: "monospace", letterSpacing: 2, margin: "0 4px" }}>{countdownText}</strong> รีบอ่านหนังสือเพื่อรักษา Streak!</span>
          <i className="ti ti-chevron-right" style={{ fontSize: 14, opacity: 0.7 }} />
        </div>
      )}
      <main className={`${WIDE_PAGES.has(page) ? "wide" : GALLERY_PAGES.has(page) ? "gallery" : ""} fade-in-active`}>
        <PageErrorBoundary resetKey={`${page}:${JSON.stringify(ctx || {})}`} go={go}>
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/" element={<Home go={go} />} />
              <Route path="/articles" element={<Articles go={go} authState={authState} ctx={ctx} />} />
              <Route path="/article" element={<ArticleDetail item={ctx} go={go} authState={authState} />} />
              {/* `/article/:idOrCategory` covers both the current slug URLs and the
                  older `/article/<category>?id=X` shape that is still indexed. */}
              <Route path="/article/:idOrCategory" element={<ArticleDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/article/:idOrCategory/:slug" element={<ArticleDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/library" element={<Library go={go} authState={authState} ctx={ctx} />} />
              {/* Not behind RequireLogin. api/seo-prerender.js serves crawlers a
                  full book page — title, author, cover, description — while a
                  person following that search result landed on a login form.
                  Google calls that cloaking and it risks a manual action. The
                  page now shows the same thing the crawler is shown; the file
                  itself, the online reader and the preview are still gated
                  inside LibraryDetail. */}
              <Route path="/library-detail" element={<LibraryDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/library-detail/:idOrCategory" element={<LibraryDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/library-detail/:idOrCategory/:slug" element={<LibraryDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/media" element={<Media go={go} ctx={ctx} />} />
              <Route path="/media-detail" element={<MediaDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/media-detail/:idOrCategory" element={<MediaDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/media-detail/:idOrCategory/:slug" element={<MediaDetail item={ctx} go={go} authState={authState} />} />
              <Route path="/scholars" element={<Scholars />} />
              <Route path="/quran" element={
                <RequireLogin authState={authState}>
                  <MemberDashboard authState={authState} go={go} initialView="quran" ctx={ctx} />
                </RequireLogin>
              } />
              <Route path="/tracking-system" element={<Tracking authState={authState} />} />
              <Route path="/auth" element={<Auth authState={authState} go={go} />} />
              <Route path="/member" element={
                <RequireLogin authState={authState}>
                  <MemberDashboard authState={authState} go={go} initialView={ctx?.view} ctx={ctx} theme={theme} />
                </RequireLogin>
              } />
              <Route path="/staff" element={
                <RequireLogin authState={authState}>
                  <StaffDashboard authState={authState} go={go} />
                </RequireLogin>
              } />
              <Route path="/staff-work" element={
                <RequireStaff authState={authState}>
                  <StaffWork authState={authState} go={go} />
                </RequireStaff>
              } />
              <Route path="/staff-translation" element={
                <RequireStaff authState={authState}>
                  <StaffTranslation authState={authState} go={go} />
                </RequireStaff>
              } />
              <Route path="/staff-members" element={
                <RequireOwner authState={authState}>
                  <StaffMembers authState={authState} go={go} />
                </RequireOwner>
              } />
              <Route path="/admin" element={
                <RequireStaff authState={authState}>
                  <Admin go={go} authState={authState} initialTab={ctx?.tab} />
                </RequireStaff>
              } />
              <Route path="/donate" element={<Donation />} />
              <Route path="/openhouse" element={<OpenHouse go={go} />} />
              <Route path="/openhouse-campus" element={<OpenHouseCampus go={go} ctx={ctx} />} />
              <Route path="/books" element={<BookCampaigns go={go} />} />
              <Route path="/book-register" element={<BookRegistration authState={authState} go={go} ctx={ctx} />} />
              <Route path="/reader" element={
                <RequireLogin authState={authState}>
                  <ReadingApp authState={authState} go={go} ctx={ctx} theme={theme} />
                </RequireLogin>
              } />
              {/* Dev-only: the notebook toolbars on their own, so their design
                  can be looked at without a login and a book. import.meta.env.DEV
                  is false in a production build, so Rollup drops this and the
                  lazy chunk with it. */}
              {import.meta.env.DEV && (
                <Route
                  path="/notebook-preview"
                  element={createElement(
                    lazyWithRetry(() => import("./pages/reading/components/notebook/__preview.jsx"))
                  )}
                />
              )}
              <Route path="*" element={<NotFound go={go} />} />
            </Routes>
          </Suspense>
        </PageErrorBoundary>
      </main>
      {playingAudio && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: "var(--card)",
          border: "1.5px solid var(--teal)",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(13, 148, 136, 0.25)",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          animation: "pageFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "'Prompt', sans-serif",
          maxWidth: "calc(100vw - 48px)",
          boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--teal-bg)",
              color: "var(--teal)",
              display: "grid",
              placeItems: "center",
              fontSize: 16,
              animation: audioState === "playing" ? "countdown-pulse 2s infinite" : "none"
            }}>
              <i className="ti ti-music"></i>
            </div>
            <div>
              <span style={{ fontSize: 9, color: "var(--t3)", display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>กำลังฟังเสียงอ่าน 📖</span>
              <strong style={{ fontSize: 13, color: "var(--text)" }}>
                ซูเราะฮ์ {playingAudio.suraName} [{playingAudio.sura}:{playingAudio.aya}]
              </strong>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, color: "var(--t2)", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={autoplayNext}
                onChange={(e) => setAutoplayNext(e.target.checked)}
                style={{ cursor: "pointer", accentColor: "var(--teal)" }}
              />
              <span>เล่นอายะฮ์ถัดไป</span>
            </label>
            <div style={{ width: 1, height: 16, background: "var(--br2)", margin: "0 4px" }} />
            {audioState === "playing" ? (
              <button className="btn btn-outline btn-sm" onClick={pause} style={{ padding: "4px 8px", borderRadius: 8, display: "grid", placeItems: "center", background: "none", border: "1px solid var(--br)" }}>
                <i className="ti ti-player-pause" style={{ fontSize: 14 }}></i>
              </button>
            ) : (
              <button className="btn btn-teal btn-sm" onClick={resume} style={{ padding: "4px 8px", borderRadius: 8, display: "grid", placeItems: "center" }}>
                <i className="ti ti-player-play" style={{ fontSize: 14 }}></i>
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={stop} style={{ padding: "4px 8px", borderRadius: 8, color: "var(--red)", borderColor: "rgba(220,38,38,0.2)", display: "grid", placeItems: "center", background: "none" }}>
              <i className="ti ti-x" style={{ fontSize: 14 }}></i>
            </button>
          </div>
        </div>
      )}
      <PWAInstallBanner />
    </div>
  )
}

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, recovering: false }
  }

  static getDerivedStateFromError(error) {
    // If this looks like an old-bundle mismatch, self-heal (clear caches +
    // hard reload once) instead of stranding the user on an error card.
    const recovering = attemptStaleBundleRecovery(error)
    return { hasError: true, error, recovering }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, recovering: false })
    }
  }

  componentDidCatch(error, info) {
    console.error("Page render failed", error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.state.recovering) {
      return (
        <div className="card" style={{ maxWidth: 420, margin: "44px auto", padding: 24, textAlign: "center" }}>
          <i className="ti ti-loader-2 spin" style={{ fontSize: 28, color: "var(--teal)" }}></i>
          <p style={{ marginTop: 10 }}>กำลังอัปเดตเป็นเวอร์ชันล่าสุด กรุณารอสักครู่...</p>
        </div>
      )
    }

    return (
      <div className="card" style={{ maxWidth: 520, margin: "44px auto", padding: 24, textAlign: "center" }}>
        <i className="ti ti-alert-triangle" style={{ fontSize: 28, color: "var(--red)", marginBottom: 10 }}></i>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>เปิดหน้านี้ไม่สำเร็จ</h2>
        <p style={{ marginBottom: 16 }}>
          ระบบเจอข้อผิดพลาดระหว่างแสดงผลหน้า ลองโหลดใหม่ หรือกลับหน้าแรกเพื่อใช้งานต่อได้เลย
        </p>
        {/* The full stack trace used to be printed for everyone. It means
            nothing to a reader, it leaks internal file and function names, and
            it made a recoverable glitch look like the site had fallen over.
            Developers still get it in the console and in the DEV build. */}
        {this.state.error && import.meta.env.DEV && (
          <div style={{ textAlign: "left", background: "var(--bg3)", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12, overflowX: "auto" }}>
            <strong style={{ color: "var(--red)" }}>{this.state.error.toString()}</strong>
            <pre style={{ margin: "8px 0 0", color: "var(--t2)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {this.state.error.stack}
            </pre>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-teal" onClick={() => window.location.reload()}>
            <i className="ti ti-refresh" style={{ marginRight: 6 }}></i>โหลดใหม่
          </button>
          <button className="btn btn-outline" onClick={() => this.props.go("home")}>
            <i className="ti ti-home" style={{ marginRight: 6 }}></i>กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }
}

function RequireLogin({ authState, children }) {
  const location = useLocation()
  if (authState.loading) return <LoadingState />
  if (!authState.user) {
    const fullPath = location.pathname + location.search
    return <Navigate to="/auth" replace state={{ from: fullPath }} />
  }
  return children
}

function RequireOwner({ authState, children }) {
  const location = useLocation()
  const navigate = useNavigate()
  if (authState.loading) return <LoadingState />
  if (!authState.user) {
    const fullPath = location.pathname + location.search
    return <Navigate to="/auth" replace state={{ from: fullPath }} />
  }
  if (authState.profile?.role !== "owner") {
    return (
      <div className="card" style={{ maxWidth: 520, margin: "44px auto", padding: 24, textAlign: "center" }}>
        <i className="ti ti-lock" style={{ fontSize: 28, color: "var(--red)", marginBottom: 10 }}></i>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>พื้นที่นี้สงวนสิทธิ์เฉพาะผู้ได้รับอนุญาต</h2>
        <p style={{ marginBottom: 16 }}>
          บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนนี้ มีเพียงเจ้าของระบบเท่านั้นที่เข้าถึงได้
        </p>
        <button className="btn btn-teal" onClick={() => navigate("/")}>
          กลับหน้าหลัก
        </button>
      </div>
    )
  }
  return children
}

function RequireStaff({ authState, children }) {
  const location = useLocation()
  if (authState.loading) return <LoadingState />
  if (!authState.user) {
    const fullPath = location.pathname + location.search
    return <Navigate to="/auth" replace state={{ from: fullPath }} />
  }
  if (!authState.isStaff) return <UnauthorizedState />
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

function UnauthorizedState() {
  const navigate = useNavigate()
  return (
    <div className="card" style={{ maxWidth: 520, margin: "44px auto", padding: 24, textAlign: "center" }}>
      <i className="ti ti-shield-lock" style={{ fontSize: 28, color: "var(--teal)", marginBottom: 10 }}></i>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>หน้านี้สำหรับเจ้าหน้าที่เท่านั้น</h2>
      <p style={{ marginBottom: 16 }}>
        บัญชีของคุณยังไม่มีสิทธิ์เข้าถึงส่วนนี้ หากต้องการใช้งานพื้นที่ staff หรือ admin ให้ใช้บัญชีที่กำหนดสิทธิ์ไว้ก่อน
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-teal" onClick={() => navigate("/")}>
          <i className="ti ti-home" style={{ marginRight: 6 }}></i>กลับหน้าหลัก
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/member?view=overview")}>
          <i className="ti ti-layout-dashboard" style={{ marginRight: 6 }}></i>ไปแดชบอร์ดสมาชิก
        </button>
      </div>
    </div>
  )
}
