import { useEffect, useMemo, useRef } from "react"
import toast from "react-hot-toast"
import { useContentDoc, saveContentItem } from "../lib/contentStore.js"
import { MEDIA } from "../data/index.js"
import SEOHead, { BASE_URL } from '../components/SEOHead.jsx'

export default function MediaDetail({ item: initialItem, go, authState }) {
  const uid = authState?.user?.uid;
  const urlId = new URLSearchParams(window.location.search).get("id")
  const mediaId = urlId || initialItem?.id
  const fallbackMedia = useMemo(
    () => (mediaId ? MEDIA.find(m => String(m.id) === String(mediaId)) : null) ?? null,
    [mediaId]
  )
  const { item: remoteMedia, loading } = useContentDoc("media", mediaId, fallbackMedia)
  const hasSavedHistory = useRef(null)

  const item = useMemo(() => {
    if (remoteMedia) return remoteMedia
    if (initialItem?.title) return initialItem
    return null
  }, [initialItem, remoteMedia])


  const spotifyEmbedSrc = useMemo(() => {
    let url = item?.spotifyUrl || "";
    if (!url) return "";

    // ถ้าเป็นลิงก์ embed อยู่แล้ว
    if (url.includes("/embed/")) return url;

    // ดึงเอา query parameters (เช่น ?si=...) ออกไปก่อน
    url = url.split("?")[0];

    // แปลงลิงก์ปกติให้เป็นลิงก์ Embed
    if (url.includes("open.spotify.com/")) {
      return url.replace("open.spotify.com/", "open.spotify.com/embed/");
    }
    return url;
  }, [item?.spotifyUrl])

  // ถ้ารีเฟรชแล้วไม่มีข้อมูล ให้กลับไปหน้ามีเดีย
  useEffect(() => {
    if (!loading && !item) {
      go("media")
    }
  }, [item, loading, go])

  // บันทึกประวัติการดูสื่อ
  useEffect(() => {
    if (item && authState?.user?.uid && hasSavedHistory.current !== item.id) {
      hasSavedHistory.current = item.id
      const uid = authState.user.uid;
      const historyId = `${uid}_media_${item.id}`;
      saveContentItem("history", {
        id: historyId,
        uid,
        itemId: item.id,
        type: "media",
        mediaType: item.type, // youtube หรือ spotify
        title: item.title,
        timestamp: Date.now()
      }, uid).catch(err => console.error("Failed to save media history to Firebase", err));
    }
  }, [item, authState?.user?.uid])

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}><i className="ti ti-loader-2 spin" style={{ fontSize: 24, color: "var(--teal)" }}></i></div>
  if (!item) return null

  return (
    <div className="article-page" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40, width: "100%" }}>
      {item && (
        <SEOHead
          title={`${item.title} | Talib Club`}
          description={item.description || item.series || `สื่อการเรียนรู้อิสลาม: ${item.title}`}
          canonical={`${BASE_URL}/media-detail?id=${item.id}`}
          ogType="article"
          ogImage={item.thumbnailUrl || item.coverUrl}
        />
      )}
      {/* ปุ่มย้อนกลับ */}
      <button
        onClick={() => go("media", initialItem?.playlist ? {
          playlist: initialItem.playlist,
          teacher: initialItem.teacher || "",
          filter: initialItem.filter,
          page: initialItem.page,
        } : null)}
        className="btn btn-outline"
        style={{ marginBottom: 20, padding: "6px 14px", fontSize: 12 }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 12 }}></i> {initialItem?.playlist ? "กลับไปยังเพลย์ลิสต์" : "กลับหน้ารวมมีเดีย"}
      </button>

      {/* ส่วนเล่นมีเดีย (ปรับขอบมน 16px และคุมระบบ Responsive ไม่ให้ดันจอแตก) */}
      {item.type === "youtube" && item.embedId && (
        <div style={{
          marginBottom: 24, borderRadius: 16, overflow: "hidden",
          border: ".5px solid var(--br2)", background: "#000",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
          width: "100%"
        }}>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              src={`https://www.youtube.com/embed/${item.embedId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={item.title} />
          </div>
        </div>
      )}
      {item.type === "youtube" && !item.embedId && (
        <div className="empty card" style={{ marginBottom: 24, padding: 20 }}>
          ยังไม่ได้ตั้งค่า YouTube Video ID
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-teal" style={{ marginTop: 12, display: "inline-block" }}>
              เปิดใน YouTube
            </a>
          )}
        </div>
      )}

      {item.type === "spotify" && (
        <div style={{
          marginBottom: 24, borderRadius: 16, overflow: "hidden",
          border: ".5px solid var(--br2)", background: "var(--card)",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
          width: "100%"
        }}>
          {spotifyEmbedSrc ? (
            <iframe style={{ width: "100%", height: 152, border: "none" }}
              src={spotifyEmbedSrc}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy" title={item.title} />
          ) : (
            <div className="empty">ยังไม่ได้ใส่ Spotify URL</div>
          )}
        </div>
      )}

      {item.type === "video" && (
        <div style={{
          marginBottom: 24, borderRadius: 16, overflow: "hidden",
          border: ".5px solid var(--br2)", background: "#000",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
          width: "100%", position: "relative", paddingBottom: "56.25%", height: 0
        }}>
          <video
            src={item.videoUrl}
            controls
            autoPlay
            playsInline
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      )}

      {/* ข้อมูลรายละเอียด (ปรับปรุงให้อยู่ในการ์ดมินิมอล และเปลี่ยนเป็นคำว่า จากช่อง :) */}
      <div className="card" style={{ padding: 24, minWidth: 0, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span className="tag" style={{
            background: item.type === "youtube" ? "rgba(255,50,50,.08)" : item.type === "spotify" ? "rgba(30,215,96,.08)" : "rgba(15,110,86,.08)",
            color: item.type === "youtube" ? "#ff4444" : item.type === "spotify" ? "#1ed760" : "var(--teal)", fontSize: 11, padding: "4px 10px", borderRadius: 20
          }}>
            <i className={`ti ${item.type === "youtube" ? "ti-brand-youtube" : item.type === "spotify" ? "ti-brand-spotify" : "ti-video"}`} style={{ marginRight: 4 }}></i>
            {item.type === "youtube" ? "YouTube" : item.type === "spotify" ? "Spotify" : "คลิปสั้น"}
          </span>
          <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 300 }}>{item.series}</span>
        </div>

        <h1 style={{ fontSize: "clamp(20px, 3.5vw, 24px)", marginBottom: 14, lineHeight: 1.4, wordBreak: "break-word" }}>{item.title}</h1>

        {item.description && (
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--t2)", marginBottom: 18, whiteSpace: "pre-wrap" }}>
            {item.description}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 18, borderTop: ".5px solid var(--br2)", paddingTop: 16, flexWrap: "wrap" }}>

          {/* จากช่อง : */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--teal-bg)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-device-tv"></i>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300 }}>จากช่อง</div>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.channel}</div>
            </div>
          </div>

          {item.date && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg2)", color: "var(--t2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-calendar"></i>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300 }}>วันที่เผยแพร่</div>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{item.date}</div>
              </div>
            </div>
          )}

          {/* ความยาวคลิป */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg2)", color: "var(--t2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-clock"></i>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300 }}>ความยาว</div>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{item.duration || "ไม่ได้ระบุ"}</div>
            </div>
          </div>

        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, paddingTop: 16, borderTop: ".5px solid var(--br2)" }}>
          {(item.url || item.spotifyUrl || (item.type === "youtube" && item.embedId)) && (
            <a
              href={item.url || item.spotifyUrl || `https://www.youtube.com/watch?v=${item.embedId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-teal"
              style={{ fontSize: 12, textDecoration: "none", flex: "1 1 160px" }}
            >
              <i className="ti ti-external-link" style={{ fontSize: 14 }}></i>
              เปิดใน {item.type === "spotify" ? "Spotify" : item.type === "youtube" ? "YouTube" : "แท็บใหม่"}
            </a>
          )}
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 12, flex: "1 1 140px" }}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                toast.success("คัดลอกลิงก์มีเดียแล้ว")
                try {
                  const prev = Number(localStorage.getItem("talib_shared_articles_count") || 0)
                  localStorage.setItem("talib_shared_articles_count", String(prev + 1))
                  window.dispatchEvent(new window.Event("storage"))
                } catch {
                  /* ignore */
                }
              } catch {
                toast.error("คัดลอกลิงก์ไม่สำเร็จ")
              }
            }}
          >
            <i className="ti ti-share" style={{ fontSize: 14 }}></i> คัดลอกลิงก์แชร์
          </button>
        </div>
      </div>
    </div>
  )
}