import { useState, useEffect } from "react"

export default function ImageWithFallback({ src, alt, fallbackEmoji = "📖", className, style, ...props }) {
  const [isBroken, setIsBroken] = useState(false)

  // Reset broken state if the source URL changes
  useEffect(() => {
    setIsBroken(false)
  }, [src])

  if (isBroken || !src) {
    return (
      <div 
        className={className} 
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--teal-bg)",
          color: "var(--teal)",
          width: "100%",
          height: "100%",
          minHeight: style?.height || "100%",
          fontSize: 32,
          ...style
        }}
      >
        <span>{fallbackEmoji}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setIsBroken(true)}
      {...props}
    />
  )
}
