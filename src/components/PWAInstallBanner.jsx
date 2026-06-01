import { useEffect, useState } from "react"
import { usePWA } from "../hooks/usePWA.js"

export default function PWAInstallBanner() {
  const { isInstallable, installApp } = usePWA()
  const [dismissed, setDismissed] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    // Check if user previously dismissed it
    const wasDismissed = localStorage.getItem("talib_pwa_dismissed") === "true"
    setDismissed(wasDismissed)

    // Handle screen resize to only show on mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isInstallable])

  const handleDismiss = () => {
    localStorage.setItem("talib_pwa_dismissed", "true")
    setDismissed(true)
  }

  // If already installed, not installable, dismissed, or on desktop, don't render anything
  if (!isInstallable || dismissed || !isMobile) {
    return null
  }

  return (
    <div style={bannerStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <img 
            src="/icon-192.png" 
            alt="Talib Club" 
            style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} 
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>ติดตั้งแอป Talib Club</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              เข้าใช้งานรวดเร็วจากหน้าจอมือถือ
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button onClick={installApp} style={buttonStyle}>
            ติดตั้ง
          </button>
          <button onClick={handleDismiss} style={closeButtonStyle} aria-label="Dismiss banner">
            <i className="ti ti-x" style={{ fontSize: 14 }}></i>
          </button>
        </div>
      </div>
    </div>
  )
}

const bannerStyle = {
  position: "fixed",
  bottom: 20,
  left: 16,
  right: 16,
  zIndex: 9999,
  animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  maxWidth: "480px",
  margin: "0 auto"
}

const containerStyle = {
  background: "linear-gradient(135deg, #0f6e56 0%, #0d5d49 100%)",
  borderRadius: 16,
  padding: "12px 14px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  border: "1px solid rgba(255,255,255,0.1)",
}

const buttonStyle = {
  background: "#fff",
  color: "#0f6e56",
  border: "none",
  borderRadius: 20,
  padding: "8px 16px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Prompt', sans-serif",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
}

const closeButtonStyle = {
  background: "rgba(255, 255, 255, 0.15)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}
