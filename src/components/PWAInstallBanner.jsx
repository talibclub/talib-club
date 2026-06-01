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
        {/* Close Button at Top-Right */}
        <button onClick={handleDismiss} style={closeButtonStyle} aria-label="Dismiss banner">
          <i className="ti ti-x" style={{ fontSize: 11 }}></i>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <img 
            src="/icon-192.png" 
            alt="Talib Club" 
            style={{ width: 44, height: 44, borderRadius: 11, objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} 
          />
          <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>ติดตั้งแอป Talib Club</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 3, lineHeight: 1.35 }}>
              เข้าใช้งานรวดเร็วจากหน้าจอมือถือของคุณ
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <button onClick={installApp} style={buttonStyle}>
            ติดตั้ง
          </button>
        </div>
      </div>
    </div>
  )
}

const bannerStyle = {
  position: "fixed",
  bottom: 24,
  left: 16,
  right: 16,
  zIndex: 9999,
  animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  maxWidth: "460px",
  margin: "0 auto"
}

const containerStyle = {
  background: "linear-gradient(135deg, #0f6e56 0%, #0a4f3e 100%)",
  borderRadius: 16,
  padding: "16px 14px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  position: "relative"
}

const buttonStyle = {
  background: "#fff",
  color: "#0f6e56",
  border: "none",
  borderRadius: 20,
  padding: "8px 18px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'Prompt', sans-serif",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  transition: "transform 0.15s ease",
}

const closeButtonStyle = {
  position: "absolute",
  top: 6,
  right: 6,
  background: "rgba(255, 255, 255, 0.12)",
  color: "rgba(255, 255, 255, 0.65)",
  border: "none",
  borderRadius: "50%",
  width: 22,
  height: 22,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 0.15s, color 0.15s"
}

