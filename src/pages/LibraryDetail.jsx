import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import { BOOKS } from "../data/index.js"
import { useContentCollection, useContentDoc, saveContentItem } from "../lib/contentStore.js"
import { bumpContentMetric } from "../utils/contentMetrics.js"
import { parseDetailId } from "../utils/slug.js"
import ImageWithFallback from "../components/ImageWithFallback.jsx"
import SEOHead, { truncate, BASE_URL } from "../components/SEOHead.jsx"

function isJournalType(type) {
  const t = String(type || "").toLowerCase().trim()
  return t === "journal" || t === "วารสาร" || t === "นิตยสาร"
}

function getDirectUrl(url) {
  if (!url) return ""
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//)
  if (match && match[1]) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`
  return url
}

function getDownloadUrl(url) {
  if (!url) return ""
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//)
  if (match && match[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`
  return url
}

function getPreviewUrl(url) {
  if (!url) return ""
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//)
  if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`
  return url
}

export default function LibraryDetail({ item, go, authState }) {
  const uid = authState?.user?.uid;
  const location = useLocation()
  const urlId = parseDetailId(location.pathname, location.search)
  const bookId = urlId || item?.id
  const fallbackBook = useMemo(
    () => (bookId ? BOOKS.find(b => String(b.id) === String(bookId)) : null) ?? null,
    [bookId]
  )
  const { item: remoteBook, loading } = useContentDoc("books", bookId, fallbackBook)
  const shelfQueryOptions = useMemo(() => ({ live: false }), [])
  const { items: shelfItems, saveItem: saveShelfItem } = useContentCollection("bookshelf", [], uid, shelfQueryOptions)
  const [openingReader, setOpeningReader] = useState(false)

  const hasIncrementedView = useRef(null)
  const hasSavedHistory = useRef(null)

  const displayItem = useMemo(() => {
    if (remoteBook) return remoteBook
    if (item?.title) return item
    return null
  }, [item, remoteBook])

  const existingShelfItem = useMemo(() => {
    if (!uid || !displayItem) return null
    return shelfItems.find(s => s.uid === uid && String(s.bookId) === String(displayItem.id)) || null
  }, [shelfItems, uid, displayItem])

  // บันทึกประวัติการดูหนังสือ
  useEffect(() => {
    if (displayItem && authState?.user?.uid && hasSavedHistory.current !== displayItem.id) {
      hasSavedHistory.current = displayItem.id
      const uid = authState.user.uid;
      const historyId = `${uid}_book_${displayItem.id}`;
      saveContentItem("history", {
        id: historyId,
        uid,
        itemId: displayItem.id,
        type: "book",
        title: displayItem.title,
        timestamp: Date.now()
      }, uid).catch(err => console.error("Failed to save book history to Firebase", err));
    }
  }, [displayItem, authState?.user?.uid])

  // --- ระบบนับยอดเข้าชมของจริง (ยิงขึ้น Firebase) ---
  useEffect(() => {
    if (displayItem && !loading && hasIncrementedView.current !== displayItem.id) {
      hasIncrementedView.current = displayItem.id
      bumpContentMetric("books", displayItem.id, "views")
    }
  }, [displayItem, loading])

  useEffect(() => {
    if (!loading && !displayItem) {
      go("library")
    }
  }, [displayItem, loading, go])

  // --- ระบบนับยอดดาวน์โหลดของจริง (ยิงขึ้น Firebase) ---
  const handleDownloadClick = async () => {
    if (!displayItem) return
    
    try {
      await bumpContentMetric("books", displayItem.id, "downloads")
    } catch (err) {
      console.error("ไม่สามารถอัปเดตยอดดาวน์โหลดได้:", err)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("คัดลอกลิงก์เรียบร้อยแล้ว นำไปแชร์ให้เพื่อนได้เลย!")
      try {
        const prev = Number(localStorage.getItem("talib_shared_articles_count") || 0)
        localStorage.setItem("talib_shared_articles_count", String(prev + 1))
        window.dispatchEvent(new window.Event("storage"))
      } catch {
        /* ignore storage errors */
      }
    } catch {
      toast.error("คัดลอกลิงก์ไม่สำเร็จ")
    }
  }

  const handleOpenInReader = async () => {
    if (!uid || !displayItem) {
      toast.error("กรุณาเข้าสู่ระบบก่อนใช้งานห้องอ่านหนังสือ")
      go("auth")
      return
    }
    setOpeningReader(true)
    try {
      const shelfId = existingShelfItem?.id || `${uid}_book_${displayItem.id}`
      if (!existingShelfItem) {
        await saveShelfItem({
          id: shelfId,
          uid,
          bookId: String(displayItem.id),
          status: "reading",
          progress: 0,
          note: "",
          totalPages: Number(displayItem.totalPages || 0),
          sourceType: "library",
          addedAt: Date.now(),
        })
        toast.success("เพิ่มเข้าชั้นหนังสือและเปิดห้องอ่านแล้ว")
      }
      go("reader", { shelfItemId: shelfId })
    } catch (err) {
      console.error("Failed to open book in reader:", err)
      toast.error("ไม่สามารถเปิดห้องอ่านหนังสือได้ในขณะนี้")
    } finally {
      setOpeningReader(false)
    }
  }

  if (loading && !displayItem) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <i className="ti ti-loader-2 spin" style={{ fontSize: 32, color: "var(--teal)", marginBottom: 10 }}></i>
        <p>กำลังโหลดข้อมูลหนังสือ...</p>
      </div>
    )
  }

  if (!displayItem) return null

  const descText = displayItem.desc || ""
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const urlMatch = descText.match(urlRegex)
  const onlineUrl = urlMatch ? urlMatch[0] : null
  const cleanDesc = (urlMatch ? descText.replace(urlRegex, "").replace(/อ่านได้ที่\s*:\s*/gi, "").trim() : descText.trim())
    || "สามารถเปิดอ่านหนังสือเล่มนี้แบบออนไลน์ เปิดในห้องอ่านพร้อมสมุดโน้ต หรือดาวน์โหลดไฟล์เพื่อศึกษาเนื้อหาเพิ่มเติม"

  return (
    <div className="article-page" style={{ maxWidth: 880, margin: "0 auto", paddingBottom: 40, width: "100%" }}>
      <SEOHead
        title={`${displayItem.title} | ห้องสมุด Talib Club`}
        description={truncate(cleanDesc, 160)}
        canonical={`${BASE_URL}/library-detail?id=${displayItem.id}`}
        ogImage={displayItem.coverUrl ? getDirectUrl(displayItem.coverUrl) : null}
      />

      <button 
        onClick={() => go("library")}
        className="btn btn-outline" 
        style={{ marginBottom: 24, padding: "6px 14px", fontSize: 12 }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 12 }}></i> กลับห้องสมุด
      </button>

      <div className="card" style={{ padding: "clamp(20px, 4vw, 32px)", marginBottom: 32, minWidth: 0 }}>
        <div style={{ display: "flex", gap: "clamp(20px, 4vw, 32px)", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 auto", margin: "0 auto", width: "min(230px, 100%)" }}>
            {displayItem.coverUrl ? (
              <ImageWithFallback 
                src={getDirectUrl(displayItem.coverUrl)} 
                alt={displayItem.title} 
                fallbackEmoji="📚"
                style={{ width: "100%", borderRadius: 12, boxShadow: "var(--shadow)", objectFit: "cover", aspectRatio: "3/4", border: "1px solid var(--br)" }} 
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "3/4", background: "var(--acc2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--br)" }}>
                <i className={`ti ${isJournalType(displayItem.type) ? "ti-news" : String(displayItem.type).toLowerCase() === "pdf" ? "ti-file-text" : "ti-book"}`} style={{ fontSize: 64, color: "var(--teal)" }}></i>
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <span className="tag tag-acc" style={{ fontSize: 11, padding: "3px 10px" }}>{isJournalType(displayItem.type) ? "วารสาร" : displayItem.type}</span>
              {isJournalType(displayItem.type) && displayItem.issueNumber !== undefined && displayItem.issueNumber !== "" && (
                <span className="tag tag-teal" style={{ fontSize: 11, padding: "3px 10px" }}>เล่มที่ {displayItem.issueNumber}</span>
              )}
              {displayItem.category && <span className="tag tag-teal" style={{ fontSize: 11, padding: "3px 10px" }}>{displayItem.category}</span>}
              {displayItem.source && <span className="tag" style={{ fontSize: 11, padding: "3px 10px", background: "var(--bg2)", color: "var(--t2)" }}>{displayItem.source}</span>}
            </div>

            <h1 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", marginBottom: 10, lineHeight: 1.35, wordBreak: "break-word" }}>{displayItem.title}</h1>

            {displayItem.author && (
              <div style={{ fontSize: 14, color: "var(--teal)", marginBottom: 12, fontWeight: 500 }}>
                <i className="ti ti-pencil" style={{ marginRight: 6 }}></i>{displayItem.author}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: "var(--t3)", fontSize: 12, marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid var(--br2)" }}>
              <span title="ผู้เข้าชม"><i className="ti ti-eye" style={{ marginRight: 4 }}></i>{(displayItem.views || 0).toLocaleString()} ครั้ง</span>
              <span title="ดาวน์โหลด"><i className="ti ti-download" style={{ marginRight: 4 }}></i>{(displayItem.downloads || 0).toLocaleString()} ดาวน์โหลด</span>
              {displayItem.year && <span title="ปีที่พิมพ์"><i className="ti ti-calendar" style={{ marginRight: 4 }}></i>ปี {displayItem.year}</span>}
              {displayItem.totalPages > 0 && <span title="จำนวนหน้า"><i className="ti ti-book-2" style={{ marginRight: 4 }}></i>{displayItem.totalPages} หน้า</span>}
            </div>

            <div style={{ fontSize: 14, lineHeight: 1.85, color: "var(--t2)", marginBottom: 24, fontWeight: 300 }}>
              {cleanDesc}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
              {displayItem.fileUrl && (
                <button
                  type="button"
                  onClick={handleOpenInReader}
                  disabled={openingReader}
                  className="btn btn-teal"
                  style={{ flex: "1 1 180px" }}
                >
                  <i className="ti ti-notebook" style={{ fontSize: 15 }}></i>
                  {openingReader ? "กำลังเปิด..." : existingShelfItem ? "อ่านต่อในห้องอ่านหนังสือ" : "เปิดในห้องอ่าน + จดโน้ต"}
                </button>
              )}
              {onlineUrl && (
                <a 
                  href={onlineUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={displayItem.fileUrl ? "btn btn-outline" : "btn btn-teal"} 
                  style={{ flex: "1 1 160px", textAlign: "center", textDecoration: "none" }}
                >
                  <i className="ti ti-book-open" style={{ fontSize: 15 }}></i>อ่านออนไลน์ (Flipbook)
                </a>
              )}
              <a 
                href={getDownloadUrl(displayItem.fileUrl)} 
                target="_blank" 
                rel="noreferrer" 
                className={!displayItem.fileUrl && !onlineUrl ? "btn btn-teal" : "btn btn-outline"} 
                onClick={handleDownloadClick}
                style={{ flex: "1 1 140px", textAlign: "center", textDecoration: "none", pointerEvents: displayItem.fileUrl ? "auto" : "none", opacity: displayItem.fileUrl ? 1 : 0.5 }}
              >
                <i className="ti ti-download" style={{ fontSize: 15 }}></i>ดาวน์โหลด PDF
              </a>
              <button type="button" onClick={handleShare} className="btn btn-outline" style={{ flex: "1 1 120px" }}>
                <i className="ti ti-share" style={{ fontSize: 15 }}></i>แชร์
              </button>
            </div>
          </div>
        </div>
      </div>

      {displayItem.fileUrl && (
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-device-desktop" style={{ color: "var(--t2)" }}></i> ตัวอย่างเนื้อหา (Preview)
          </h3>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: ".5px solid var(--br2)", height: "70vh", minHeight: 500, background: "var(--bg2)", marginBottom: 20 }}>
            {/* Transparent overlay to block Google Drive's native top-right toolbar (Pop-out/Download) */}
            {displayItem.fileUrl && displayItem.fileUrl.includes('drive.google.com') && (
              <div 
                style={{ 
                  position: "absolute", 
                  top: 0, 
                  right: 0, 
                  width: "250px", 
                  height: "60px", 
                  zIndex: 10, 
                  background: "transparent",
                  cursor: "pointer"
                }} 
                title="ดาวน์โหลดหรือเปิดไฟล์"
                onClick={(e) => {
                  handleDownloadClick(e);
                  window.open(getDownloadUrl(displayItem.fileUrl), '_blank');
                }}
              ></div>
            )}
            <iframe 
              src={getPreviewUrl(displayItem.fileUrl)} 
              style={{ width: "100%", height: "100%", border: "none" }} 
              title="PDF Preview"
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}