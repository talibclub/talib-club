import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("talib-theme") || "dark" } catch { return "dark" }
  })
  useEffect(() => {
    try { localStorage.setItem("talib-theme", theme) } catch {}
    document.body.className = theme
  }, [theme])
  return { theme, setTheme }
}
