import { useState } from "react"
import { useTheme } from "./hooks/useTheme.js"
import Nav from "./components/Nav.jsx"
import Home from "./pages/Home.jsx"
import Articles from "./pages/Articles.jsx"
import ArticleDetail from "./pages/ArticleDetail.jsx"
import Library from "./pages/Library.jsx"
import Media from "./pages/Media.jsx"
import Scholars from "./pages/Scholars.jsx"
import Tracking from "./pages/Tracking.jsx"
import "./styles/global.css"

export default function App() {
  const { theme, setTheme } = useTheme()
  const [page, setPage]     = useState("home")
  const [ctx, setCtx]       = useState(null)   // data ส่งระหว่างหน้า

  const go = (p, data = null) => {
    setPage(p)
    setCtx(data)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className={`app ${theme}`}>
      <Nav page={page} go={go} theme={theme} setTheme={setTheme} />
      <main className="container">
        {page === "home"     && <Home go={go} />}
        {page === "articles" && <Articles go={go} />}
        {page === "article"  && <ArticleDetail item={ctx} go={go} />}
        {page === "library"  && <Library />}
        {page === "media"    && <Media />}
        {page === "scholars" && <Scholars />}
        {page === "tracking" && <Tracking />}
      </main>
    </div>
  )
}
