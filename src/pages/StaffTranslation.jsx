import { useEffect, useMemo, useState } from "react"
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { useAuth } from "../hooks/useAuth.js"
import { notifyError, notifySuccess } from "../utils/feedback.jsx"

const COLLECTION = "translation_abuiyaad"
const STATUS = { pending: "Pending", progress: "In progress", completed: "Completed" }
const STATUS_LABEL = {
  [STATUS.pending]: "ยังไม่แปล",
  [STATUS.progress]: "กำลังแปล",
  [STATUS.completed]: "แปลเสร็จแล้ว",
}

function docId(url) {
  return btoa(unescape(encodeURIComponent(url))).replace(/[+/=]/g, "_").slice(0, 120)
}

// ── Modal ──────────────────────────────────────────────────────────
function EditModal({ item, onClose, onSave }) {
  const [thaiTitle, setThaiTitle] = useState(item.thaiTitle || "")
  const [note, setNote] = useState(item.note || "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({ thaiTitle: thaiTitle.trim(), note: note.trim() })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="card" style={{ width: "min(520px,92vw)", padding: "28px" }}>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "11px", color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>บทความต้นฉบับ</div>
          <a href={item.url} target="_blank" rel="noreferrer"
            style={{ fontSize: "13px", color: "var(--teal)", fontWeight: 500, wordBreak: "break-word" }}>
            {item.title}
          </a>
        </div>

        <div style={{ display: "grid", gap: "14px", marginBottom: "22px" }}>
          <label style={{ display: "grid", gap: "6px", fontSize: "12px", color: "var(--t2)" }}>
            หัวข้อภาษาไทย
            <input
              type="text"
              value={thaiTitle}
              onChange={e => setThaiTitle(e.target.value)}
              placeholder="กรอกหัวข้อภาษาไทย..."
            />
          </label>
          <label style={{ display: "grid", gap: "6px", fontSize: "12px", color: "var(--t2)" }}>
            หมายเหตุ <span style={{ color: "var(--t3)", display: "inline" }}>(ไม่บังคับ)</span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="เช่น กำลังรอตรวจสอบ, ต้องการความช่วยเหลือ..."
              rows={3}
              style={{ resize: "vertical" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-teal" onClick={handleSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────
export default function StaffTranslation({ go }) {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [scrapeProgress, setScrapeProgress] = useState(0)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editItem, setEditItem] = useState(null)

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, COLLECTION))
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      notifyError("โหลดฐานข้อมูลงานแปลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  async function runScrape() {
    setScraping(true)
    setScrapeProgress(30)
    try {
      const res = await fetch("/api/abuiyaad-scrape")
      const data = await res.json()
      if (!data.articles) throw new Error(data.error)
      setScrapeProgress(70)
      const BATCH_LIMIT = 499
      for (let i = 0; i < data.articles.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db)
        for (const post of data.articles.slice(i, i + BATCH_LIMIT)) {
          const id = docId(post.url)
          batch.set(doc(db, COLLECTION, id),
            { title: post.title, url: post.url, status: STATUS.pending },
            { merge: true }
          )
        }
        await batch.commit()
      }
      setScrapeProgress(100)
      notifySuccess(`สำเร็จ! ได้บทความทั้งหมด ${data.count} รายการ`)
      loadItems()
    } catch (err) {
      notifyError("กวาดข้อมูลไม่ได้: " + err.message)
    } finally {
      setScraping(false)
      setScrapeProgress(0)
    }
  }

  async function updateItem(item, patch) {
    try {
      const batch = writeBatch(db)
      batch.set(doc(db, COLLECTION, item.id), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
      await batch.commit()
      setItems(prev => prev.map(r => r.id === item.id ? { ...r, ...patch } : r))
    } catch {
      notifyError("อัปเดตไม่สำเร็จ")
    }
  }

  async function claimItem(item) {
    const name = profile?.displayName || profile?.email || "ไม่ระบุ"
    await updateItem(item, { status: STATUS.progress, assignee: name, claimedAt: serverTimestamp() })
    notifySuccess("รับงานแล้ว")
  }

  async function unclaimItem(item) {
    await updateItem(item, { status: STATUS.pending, assignee: "", claimedAt: null })
    notifySuccess("ยกเลิกงานแล้ว")
  }

  async function saveEdit(item, patch) {
    await updateItem(item, patch)
    notifySuccess("บันทึกแล้ว")
  }

  // สถิติ
  const total = items.length
  const completed = items.filter(i => i.status === STATUS.completed).length
  const inProgress = items.filter(i => i.status === STATUS.progress).length
  const pending = items.filter(i => !i.status || i.status === STATUS.pending).length
  const completedPct = total ? Math.round((completed / total) * 100) : 0
  const inProgressPct = total ? Math.round((inProgress / total) * 100) : 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(i =>
      (statusFilter === "all" || i.status === statusFilter) &&
      (!q || i.title.toLowerCase().includes(q) || (i.thaiTitle || "").toLowerCase().includes(q))
    )
  }, [items, query, statusFilter])

  return (
    <div className="translation-page">

      {/* Header */}
      <div className="staff-section-head">
        <div>
          <button className="btn btn-outline" onClick={() => go("staff")}>
            <i className="ti ti-arrow-left" /> กลับ
          </button>
          <h1 style={{ marginTop: "10px" }}>Translation Tracker</h1>
          <p style={{ marginTop: "4px" }}>ติดตามสถานะการแปลบทความจาก abuiyaad.com</p>
        </div>
        <button className="btn btn-teal" onClick={runScrape} disabled={scraping}>
          <i className={`ti ${scraping ? "ti-loader-2 spin" : "ti-refresh"}`} style={{ marginRight: "6px" }} />
          {scraping ? `กำลังกวาด... ${scrapeProgress}%` : "กวาดข้อมูลจากเว็บ"}
        </button>
      </div>

      {/* Scrape progress */}
      {scraping && (
        <div style={{ width: "100%", background: "var(--br)", height: "4px", borderRadius: "2px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ width: `${scrapeProgress}%`, background: "var(--teal)", height: "100%", transition: "width 0.3s ease" }} />
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <>
          <div className="staff-stat-grid" style={{ marginBottom: "16px" }}>
            <div className="card staff-stat">
              <span>บทความทั้งหมด</span>
              <strong>{total}</strong>
            </div>
            <div className="card staff-stat warn">
              <span>ยังไม่แปล</span>
              <strong>{pending}</strong>
            </div>
            <div className="card staff-stat info">
              <span>กำลังแปล</span>
              <strong>{inProgress}</strong>
            </div>
            <div className="card staff-stat ok">
              <span>แปลเสร็จแล้ว</span>
              <strong>{completed}</strong>
            </div>
          </div>

          {total > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--t2)", marginBottom: "6px" }}>
                <span>ความคืบหน้าการแปล</span>
                <span>{completedPct}% เสร็จแล้ว · {inProgressPct}% กำลังแปล</span>
              </div>
              <div style={{ width: "100%", background: "var(--bg2)", height: "8px", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${completedPct}%`, background: "var(--teal)", height: "100%", transition: "width 0.5s ease" }} />
                <div style={{ width: `${inProgressPct}%`, background: "#3b73c4", height: "100%", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "11px", color: "var(--t3)" }}>
                <span><span style={{ color: "var(--teal)" }}>■</span> เสร็จแล้ว</span>
                <span><span style={{ color: "#3b73c4" }}>■</span> กำลังแปล</span>
                <span><span style={{ color: "var(--bg2)" }}>■</span> ยังไม่แปล</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="ค้นหาบทความ (อังกฤษหรือไทย)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: "200px" }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="all">ทั้งหมด ({total})</option>
          <option value={STATUS.pending}>ยังไม่แปล ({pending})</option>
          <option value={STATUS.progress}>กำลังแปล ({inProgress})</option>
          <option value={STATUS.completed}>แปลเสร็จแล้ว ({completed})</option>
        </select>
      </div>

      {/* Table */}
      <div className="card translation-table">
        {loading ? (
          <div className="empty">
            <i className="ti ti-loader-2 spin" style={{ fontSize: "24px", color: "var(--teal)" }} />
            <p style={{ marginTop: "10px" }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">ไม่พบบทความ</div>
        ) : filtered.map(item => (
          <div key={item.id} style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: "12px",
            alignItems: "start",
            padding: "14px",
            borderTop: ".5px solid var(--br2)"
          }}>
            {/* ข้อมูล */}
            <div>
              <a href={item.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", display: "block", marginBottom: "3px" }}>
                {item.title}
              </a>

              {item.thaiTitle ? (
                <div style={{ fontSize: "13px", color: "var(--teal)", marginBottom: "5px" }}>
                  {item.thaiTitle}
                </div>
              ) : (
                <div style={{ fontSize: "11px", color: "var(--t3)", marginBottom: "5px", fontStyle: "italic" }}>
                  ยังไม่มีหัวข้อภาษาไทย
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {item.assignee && (
                  <span className="badge badge-teal" style={{ fontSize: "11px" }}>
                    <i className="ti ti-user" style={{ fontSize: "11px" }} /> {item.assignee}
                  </span>
                )}
                {item.note && (
                  <span style={{ fontSize: "11px", color: "var(--t3)", fontStyle: "italic" }}>
                    {item.note}
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
              <select
                value={item.status || STATUS.pending}
                onChange={e => updateItem(item, { status: e.target.value })}
                style={{ width: "auto", fontSize: "12px", padding: "5px 10px" }}
              >
                {Object.values(STATUS).map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>

              <div style={{ display: "flex", gap: "6px" }}>
                {!item.assignee && item.status !== STATUS.completed && (
                  <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "12px" }}
                    onClick={() => claimItem(item)}>
                    รับงาน
                  </button>
                )}
                {item.assignee && item.status !== STATUS.completed && (
                  <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "12px", color: "var(--t3)" }}
                    onClick={() => unclaimItem(item)}>
                    ยกเลิก
                  </button>
                )}
                <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: "12px" }}
                  onClick={() => setEditItem(item)}>
                  <i className="ti ti-pencil" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={patch => saveEdit(editItem, patch)}
        />
      )}
    </div>
  )
}