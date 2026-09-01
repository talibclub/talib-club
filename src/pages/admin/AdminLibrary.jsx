import { useState, useEffect, useMemo } from "react"
import { collection, query, where, getDocs, writeBatch, doc, serverTimestamp } from "firebase/firestore"
import { BOOKS, DEFAULT_TAXONOMY } from "../../data/index.js"
import { useContentCollection, useTaxonomySettings, updateCollectionMetadata, invalidateCollectionCache, CONTENT_COLLECTIONS } from "../../lib/contentStore.js"
import { confirmAction, notifyError, notifySuccess } from "../../utils/feedback.jsx"
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage"
import { storage, app, db } from "../../lib/firebase.js"
import { compressImage } from "../../utils/image.js"
import ContentStatusBanner from "../../components/ContentStatusBanner.jsx"
import { clampPage } from "../../utils/pagination.js"
import { isJournal, getTimestampMs } from "../../utils/library.js"

const ALMAKTABAH_SOURCE = "อัลมักตะบะฮ์ อัษรียะฮ์"

function AlMaktabahSyncBanner() {
  const [status, setStatus] = useState("loading") // loading | hidden | shown | mixed | none
  const [total, setTotal] = useState(0)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setStatus("loading")
    const snap = await getDocs(query(collection(db, "content_books"), where("source", "==", ALMAKTABAH_SOURCE)))
    if (snap.empty) {
      setStatus("none")
      setTotal(0)
      return
    }
    const deletedCount = snap.docs.filter(d => d.data().deleted === true).length
    setTotal(snap.size)
    if (deletedCount === snap.size) setStatus("hidden")
    else if (deletedCount === 0) setStatus("shown")
    else setStatus("mixed")
  }

  useEffect(() => { refresh() }, [])

  async function toggle() {
    const willShow = status === "hidden" || status === "mixed"
    const ok = await confirmAction({
      title: willShow ? `แสดงหนังสือจาก ${ALMAKTABAH_SOURCE}?` : `ซ่อนหนังสือจาก ${ALMAKTABAH_SOURCE}?`,
      message: willShow
        ? `หนังสือ ${total} เล่มจะกลับมาแสดงบนเว็บไซต์ทันที`
        : `หนังสือ ${total} เล่มจะถูกซ่อนจากเว็บไซต์ทันที (ข้อมูลยังอยู่ครบ กดแสดงกลับได้ตลอด)`,
      confirmText: willShow ? "แสดง" : "ซ่อน",
      danger: !willShow,
    })
    if (!ok) return

    setBusy(true)
    try {
      const snap = await getDocs(query(collection(db, "content_books"), where("source", "==", ALMAKTABAH_SOURCE)))
      const docs = snap.docs
      for (let i = 0; i < docs.length; i += 400) {
        const batch = writeBatch(db)
        docs.slice(i, i + 400).forEach(d => {
          batch.update(doc(db, "content_books", d.id), { deleted: !willShow, updatedAt: serverTimestamp() })
        })
        await batch.commit()
      }
      // Visitors read the book list from a localStorage/IndexedDB cache that is
      // only invalidated by content_settings/metadata.content_books moving
      // forward — there is no TTL on that path. Writing the batch straight to
      // Firestore without bumping the timestamp left every returning visitor
      // looking at the pre-hide list indefinitely, which is why the site kept
      // showing all 442 books after they were hidden here.
      await updateCollectionMetadata(CONTENT_COLLECTIONS.books)
      invalidateCollectionCache(CONTENT_COLLECTIONS.books)
      notifySuccess(willShow ? "แสดงหนังสือแล้ว" : "ซ่อนหนังสือแล้ว")
      await refresh()
    } catch (err) {
      console.error(err)
      notifyError("เกิดข้อผิดพลาด กรุณาตรวจสิทธิ์ Firestore")
    } finally {
      setBusy(false)
    }
  }

  if (status === "loading" || status === "none") return null

  const isVisible = status === "shown"
  return (
    <div className="card" style={{ padding: 16, borderRadius: 16, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", border: `1.5px solid ${isVisible ? "var(--teal)" : "var(--br)"}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <i className="ti ti-books" style={{ fontSize: 20, color: isVisible ? "var(--teal)" : "var(--t3)" }}></i>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            แหล่งข้อมูล {ALMAKTABAH_SOURCE} — {total} เล่ม
            {status === "mixed" && <span style={{ color: "#bd7a13", fontWeight: 500 }}> (สถานะไม่ตรงกันบางส่วน)</span>}
          </div>
          <div style={{ fontSize: 12, color: "var(--t2)" }}>
            {isVisible ? "กำลังแสดงบนเว็บไซต์อยู่" : "กำลังซ่อนจากเว็บไซต์อยู่"}
          </div>
        </div>
      </div>
      <button className={`btn ${isVisible ? "btn-outline" : "btn-teal"}`} onClick={toggle} disabled={busy} style={{ padding: "8px 16px", fontSize: 13 }}>
        <i className={busy ? "ti ti-loader-2 spin" : isVisible ? "ti ti-eye-off" : "ti ti-eye"} style={{ marginRight: 6 }}></i>
        {busy ? "กำลังดำเนินการ..." : isVisible ? "ซ่อนทั้งหมด" : "แสดงทั้งหมด"}
      </button>
    </div>
  )
}

export { isJournal, getTimestampMs }

const EMPTY = {
  title: "",
  author: "Talib Club",
  source: "Talib Club",
  type: "journal",
  category: "aqeedah",
  year: new Date().getFullYear() + 543,
  fileUrl: "",
  coverUrl: "",
  desc: "",
  issueNumber: "",
}

export default function AdminLibrary() {
  const adminQueryOptions = useMemo(() => ({ live: false }), [])
  const { items, loading, error, saveItem, deleteItem, isUsingFallback } = useContentCollection("books", BOOKS, null, adminQueryOptions)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const bookTypes = useMemo(
    () => (taxonomy.bookTypes || []).map(t => typeof t === "string" ? { id: t, label: t } : t),
    [taxonomy.bookTypes]
  )

  const [editing, setEdit] = useState(null)
  
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all") 
  const [categoryFilter, setCategoryFilter] = useState("all") 
  const [sourceFilter, setSourceFilter] = useState("all") 
  const [showAdvanced, setShowAdvanced] = useState(false) 
  const [sortOrder, setSortOrder] = useState("newest")

  const [selected, setSelected] = useState([]) 
  const [busy, setBusy] = useState(false)

  const [bulkSource, setBulkSource] = useState("")
  const [bulkType, setBulkType] = useState("")
  const [bulkCategory, setBulkCategory] = useState("")
  const [bulkAuthor, setBulkAuthor] = useState("")
  const [bulkYear, setBulkYear] = useState("")

  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, categoryFilter, sourceFilter, sortOrder])

  const filtered = items.filter(b => {
    const matchSearch = String(b.title || "").toLowerCase().includes(search.toLowerCase()) || 
                        String(b.author || "").toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || 
                      b.type === typeFilter || 
                      (isJournal(typeFilter) && isJournal(b.type))
    const matchCat = categoryFilter === "all" || b.category === categoryFilter
    const matchSource = sourceFilter === "all" || b.source === sourceFilter
    
    return matchSearch && matchType && matchCat && matchSource
  })

  const sorted = [...filtered].sort((a, b) => {
    const normalizeYear = (yr) => {
      let y = Number(yr) || 0
      if (y > 2400) y -= 543
      return y
    }
    const yearA = normalizeYear(a.year)
    const yearB = normalizeYear(b.year)

    if (sortOrder === "newest") {
      // 1. เรียงตามปีที่พิมพ์ (ใหม่ไปเก่า)
      if (yearA !== yearB) return yearB - yearA

      // 2. หากปีเท่ากัน: ถ้าเป็นวารสาร ให้เรียงตามลำดับเล่มที่/ฉบับที่ (issueNumber) มากไปน้อย
      const isJournalA = isJournal(a.type)
      const isJournalB = isJournal(b.type)
      if (isJournalA && isJournalB) {
        const issueA = Number(a.issueNumber) || 0
        const issueB = Number(b.issueNumber) || 0
        if (issueA !== issueB) return issueB - issueA
      } else if (a.issueNumber !== undefined && b.issueNumber !== undefined && a.issueNumber !== "" && b.issueNumber !== "") {
        const issueA = Number(a.issueNumber) || 0
        const issueB = Number(b.issueNumber) || 0
        if (issueA !== issueB) return issueB - issueA
      }

      // 3. หากปีเท่ากัน (หรือเล่มที่เท่ากัน/ไม่ใช่เล่มวารสารทั้งคู่): เรียงตามวันที่สร้าง (createdAt) ใหม่ไปเก่า
      const createdA = getTimestampMs(a.createdAt)
      const createdB = getTimestampMs(b.createdAt)
      if (createdA !== createdB) return createdB - createdA

      // 4. Fallback วันที่อัปเดต (updatedAt)
      const updatedA = getTimestampMs(a.updatedAt)
      const updatedB = getTimestampMs(b.updatedAt)
      if (updatedA !== updatedB) return updatedB - updatedA

      // 5. Fallback รหัสเอกสารแบบตัวเลขอัจฉริยะ (numeric-aware sort)
      return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true })
    } else {
      // 1. เรียงตามปีที่พิมพ์ (เก่าไปใหม่)
      if (yearA !== yearB) return yearA - yearB

      // 2. หากปีเท่ากัน: ถ้าเป็นวารสาร เรียงตามเล่มที่ น้อยไปมาก
      const isJournalA = isJournal(a.type)
      const isJournalB = isJournal(b.type)
      if (isJournalA && isJournalB) {
        const issueA = Number(a.issueNumber) || 0
        const issueB = Number(b.issueNumber) || 0
        if (issueA !== issueB) return issueA - issueB
      } else if (a.issueNumber !== undefined && b.issueNumber !== undefined && a.issueNumber !== "" && b.issueNumber !== "") {
        const issueA = Number(a.issueNumber) || 0
        const issueB = Number(b.issueNumber) || 0
        if (issueA !== issueB) return issueA - issueB
      }

      // 3. วันที่สร้าง เก่าไปใหม่
      const createdA = getTimestampMs(a.createdAt)
      const createdB = getTimestampMs(b.createdAt)
      if (createdA !== createdB) return createdA - createdB

      // 4. Fallback วันที่อัปเดต
      const updatedA = getTimestampMs(a.updatedAt)
      const updatedB = getTimestampMs(b.updatedAt)
      if (updatedA !== updatedB) return updatedA - updatedB

      // 5. Fallback ID
      return String(a.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true })
    }
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1)
  const safePage = clampPage(page, totalPages)
  const currentItems = sorted.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  
  const toggleAll = () => {
    if (selected.length === sorted.length) setSelected([])
    else setSelected(sorted.map(b => b.id))
  }

  function openNew() {
    const defaultType = bookTypes[0]?.id || "journal"
    const defaultSource = taxonomy.bookSources?.[0] || "Talib Club"
    setEdit({ ...EMPTY, type: defaultType, source: defaultSource })
  }

  // --- ฟังก์ชันที่หายไป เติมกลับมาให้แล้วครับ ---
  function openEdit(book) {
    setEdit({ ...book })
  }

  async function save() {
    if (!editing.title?.trim()) return notifyError("กรุณาใส่ชื่อหนังสือ")
    const isJr = isJournal(editing.type)
    const payload = { 
      ...editing, 
      year: Number(editing.year || (new Date().getFullYear() + 543)),
      issueNumber: isJr && editing.issueNumber !== undefined && editing.issueNumber !== ""
        ? Number(editing.issueNumber)
        : (isJr ? "" : null)
    }
    setBusy(true)
    try {
      await saveItem(payload)
      setEdit(null)
      notifySuccess("บันทึกข้อมูลขึ้นเว็บไซต์เรียบร้อยแล้ว")
    } catch {
      notifyError("บันทึกไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    } finally {
      setBusy(false)
    }
  }

  async function remove(book) {
    if (busy) return
    const ok = await confirmAction({ title: "ลบรายการนี้?", message: `"${book.title}" จะถูกลบจากหน้าเว็บไซต์`, confirmText: "ลบ", danger: true })
    if (!ok) return
    setBusy(true)
    try {
      await deleteItem(book.id)
      setSelected(prev => prev.filter(id => id !== book.id))
      notifySuccess("ลบเรียบร้อยแล้ว")
    } catch {
      notifyError("ลบไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    } finally {
      setBusy(false)
    }
  }

  async function removeSelected() {
    const ok = await confirmAction({ title: `ยืนยันการลบ ${selected.length} รายการ?`, message: "ข้อมูลที่ถูกเลือกรวมถึงเนื้อหาทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้", confirmText: "ยืนยันการลบ", danger: true })
    if (!ok) return
    setBusy(true)
    try {
      await Promise.all(selected.map(id => deleteItem(id)))
      setSelected([])
      notifySuccess(`ลบ ${selected.length} รายการเรียบร้อยแล้ว`)
    } catch {
      notifyError("เกิดข้อผิดพลาดในการลบข้อมูลบางส่วน")
    } finally {
      setBusy(false)
    }
  }

  async function handleBulkUpdate() {
    if (selected.length === 0) return
    const ok = await confirmAction({ 
      title: `ยืนยันการแก้ไข ${selected.length} รายการ?`, 
      message: "ฟิลด์ที่กรอก/เลือกไว้จะถูกอัปเดตทดแทนค่าเดิมในหนังสือทั้งหมดที่เลือก", 
      confirmText: "ยืนยันการอัปเดต", 
      confirmColor: "var(--teal)" 
    })
    if (!ok) return
    
    setBusy(true)
    try {
      let updatedCount = 0;
      await Promise.all(selected.map(async (id) => {
        const original = items.find(b => String(b.id) === String(id))
        if (!original) return
        
        const next = { ...original }
        if (bulkSource) {
          next.source = bulkSource
        }
        if (bulkType) {
          next.type = bulkType
        }
        if (bulkCategory) {
          next.category = bulkCategory
        }
        if (bulkAuthor !== undefined && bulkAuthor !== "") {
          next.author = bulkAuthor
        }
        if (bulkYear) {
          next.year = Number(bulkYear)
        }
        
        await saveItem(next)
        updatedCount++
      }))
      
      setBulkSource("")
      setBulkType("")
      setBulkCategory("")
      setBulkAuthor("")
      setBulkYear("")
      setSelected([])
      
      notifySuccess(`อัปเดตข้อมูลหนังสือ ${updatedCount} รายการเรียบร้อยแล้ว`)
    } catch (err) {
      console.error(err)
      notifyError("เกิดข้อผิดพลาดในการอัปเดตข้อมูลบางส่วน")
    } finally {
      setBusy(false)
    }
  }

  if (editing) {
    return <LibraryForm item={editing} setItem={setEdit} onSave={save} onCancel={() => setEdit(null)} taxonomy={taxonomy} busy={busy} />
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ minWidth: 150 }}>หนังสือและ PDF <span style={{ fontSize: 12, color: "var(--t3)" }}>({sorted.length} รายการ)</span></h2>
          <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>
            หนังสือ วารสาร และสื่อดาวน์โหลดทั้งหมดของ Talib Club {totalPages > 0 && `(หน้า ${safePage}/${totalPages})`}
          </p>
          <ContentStatusBanner loading={loading} error={error} isUsingFallback={isUsingFallback} />
        </div>
        <button className="btn btn-teal" onClick={openNew} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
          <i className="ti ti-plus" style={{ marginRight: 6 }}></i>เพิ่มใหม่
        </button>
      </div>

      <AlMaktabahSyncBanner />

      {/* ━━━ SEARCH & FILTER BAR ━━━ */}
      <div style={{ display: "flex", gap: 8, marginBottom: showAdvanced ? 12 : 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 16 }}></i>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ, ผู้เขียน, หรือเนื้อหา..."
            style={{ width: "100%", paddingLeft: 42, borderRadius: 24, padding: "12px 16px 12px 42px", background: "var(--bg2)", border: "1px solid transparent", fontSize: 14, outline: "none", transition: "border 0.2s" }}
            onFocus={(e) => e.target.style.border = "1px solid var(--teal)"}
            onBlur={(e) => e.target.style.border = "1px solid transparent"}
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ 
            padding: "0 18px", 
            borderRadius: 24, 
            background: showAdvanced ? "var(--teal)" : "var(--bg2)", 
            color: showAdvanced ? "#fff" : "var(--text)", 
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          title="ตัวกรองเพิ่มเติม"
        >
          <i className="ti ti-filter" style={{ fontSize: 18 }}></i>
        </button>
      </div>

      {/* ━━━ EXPANDABLE FILTERS ━━━ */}
      {showAdvanced && (
        <div style={{ background: "var(--bg2)", padding: "16px", borderRadius: 16, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>ประเภท</span>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ background: "var(--card)", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              <option value="all">-- ทุกประเภท --</option>
              {bookTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>หมวดหมู่</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ background: "var(--card)", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              <option value="all">-- ทุกหมวดหมู่ --</option>
              {(taxonomy.articleCategories || []).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>สำนักพิมพ์</span>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ background: "var(--card)", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              <option value="all">-- ทุกสำนักพิมพ์ --</option>
              {(taxonomy.bookSources || []).map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>เรียงลำดับ</span>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ background: "var(--card)", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              <option value="newest">ปีพิมพ์/ลำดับล่าสุด ➜ เก่าสุด</option>
              <option value="oldest">ปีพิมพ์/ลำดับเก่าสุด ➜ ล่าสุด</option>
            </select>
          </label>
        </div>
      )}

      {selected.length > 0 && (
        <div className="card" style={{ border: "1.5px solid var(--teal)", padding: 20, borderRadius: 16, marginBottom: 20, background: "var(--teal-bg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "var(--teal)", fontWeight: 600 }}>
              <i className="ti ti-checkbox" style={{ marginRight: 6 }}></i>
              เลือกอยู่ {selected.length} รายการ
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setSelected([])} style={{ fontSize: 12, padding: "6px 12px" }}>
                ยกเลิกการเลือก
              </button>
              <button className="btn" style={{ background: "#e05555", color: "#fff", padding: "6px 12px", fontSize: 12 }} onClick={removeSelected} disabled={busy}>
                <i className={busy ? "ti ti-loader-2 spin" : "ti ti-trash"} style={{ marginRight: 6 }}></i>
                {busy ? "กำลังลบ..." : "ลบที่เลือก"}
              </button>
            </div>
          </div>

          <div className="divider" style={{ margin: "0 0 16px" }} />
          
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
            <i className="ti ti-edit" style={{ marginRight: 6, color: "var(--teal)" }}></i>
            แก้ไขข้อมูลพร้อมกันทั้งหมด (Bulk Edit)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "flex-end" }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--t2)" }}>เปลี่ยนแหล่งที่มา</span>
              <select value={bulkSource} onChange={e => setBulkSource(e.target.value)} style={{ fontSize: 12, padding: "6px 10px", background: "var(--card)" }}>
                <option value="">-- ไม่เปลี่ยน --</option>
                {(taxonomy.bookSources || []).map(src => <option key={src} value={src}>{src}</option>)}
              </select>
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--t2)" }}>เปลี่ยนประเภท</span>
              <select value={bulkType} onChange={e => setBulkType(e.target.value)} style={{ fontSize: 12, padding: "6px 10px", background: "var(--card)" }}>
                <option value="">-- ไม่เปลี่ยน --</option>
                {bookTypes.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
              </select>
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--t2)" }}>เปลี่ยนหมวดหมู่</span>
              <select value={bulkCategory} onChange={e => setBulkCategory(e.target.value)} style={{ fontSize: 12, padding: "6px 10px", background: "var(--card)" }}>
                <option value="">-- ไม่เปลี่ยน --</option>
                {(taxonomy.articleCategories || []).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--t2)" }}>เปลี่ยนชื่อผู้แต่ง/ผู้จัดทำ</span>
              <input value={bulkAuthor} onChange={e => setBulkAuthor(e.target.value)} placeholder="เช่น Talib Club" style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, background: "var(--card)", border: "0.5px solid var(--br)" }} />
            </label>

            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--t2)" }}>เปลี่ยนปีพิมพ์ (พ.ศ.)</span>
              <input type="number" value={bulkYear} onChange={e => setBulkYear(e.target.value)} placeholder="เช่น 2569" style={{ fontSize: 12, padding: "7px 10px", borderRadius: 8, background: "var(--card)", border: "0.5px solid var(--br)" }} />
            </label>

            <button 
              className="btn btn-teal" 
              onClick={handleBulkUpdate} 
              disabled={busy || (!bulkSource && !bulkType && !bulkCategory && !bulkAuthor && !bulkYear)}
              style={{ padding: "8px 16px", fontSize: 12, height: "34px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <i className={busy ? "ti ti-loader-2 spin" : "ti ti-device-floppy"}></i>
              {busy ? "กำลังอัปเดต..." : "อัปเดตข้อมูลที่เลือก"}
            </button>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 10, opacity: busy ? 0.6 : 1 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: busy ? "not-allowed" : "pointer", fontSize: 12, color: "var(--t2)" }}>
            <input type="checkbox" checked={selected.length === sorted.length && sorted.length > 0} onChange={toggleAll} disabled={busy} style={{ width: 16, height: 16, cursor: busy ? "not-allowed" : "pointer" }} />
            เลือกทั้งหมด {sorted.length} รายการที่ค้นเจอ
          </label>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {currentItems.map(book => (
          <div key={book.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, opacity: busy ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              <input type="checkbox" checked={selected.includes(book.id)} onChange={() => toggleSelect(book.id)} disabled={busy} style={{ width: 18, height: 18, cursor: busy ? "not-allowed" : "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                  <span className="tag tag-teal">{book.category || "ไม่มีหมวดหมู่"}</span>
                  <span className="tag" style={{ background: "var(--acc2)" }}>{book.type}</span>
                  {isJournal(book.type) && book.issueNumber !== undefined && book.issueNumber !== "" && (
                    <span className="tag" style={{ background: "rgba(45, 190, 160, 0.15)", color: "var(--teal)" }}>เล่มที่ {book.issueNumber}</span>
                  )}
                  <span className="tag" style={{ background: "var(--acc2)", color: "var(--t2)", border: ".5px solid var(--br)" }}>{book.source}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{book.title}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300, marginTop: 4 }}>ผู้แต่ง: {book.author} · ปี {book.year}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-outline" onClick={() => openEdit(book)} disabled={busy} style={{ padding: "6px 12px", fontSize: 12, opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }}><i className="ti ti-pencil"></i></button>
              <button className="btn btn-outline" style={{ color: "#e05555", borderColor: "rgba(224,85,85,.3)", padding: "6px 12px", fontSize: 12, opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }} onClick={() => remove(book)} disabled={busy}><i className="ti ti-trash"></i></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 32, flexWrap: "wrap" }}>
          <button className="btn btn-outline" disabled={page === 1} onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }} style={{ padding: "6px 12px", fontSize: 12 }}>ก่อนหน้า</button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
              return <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }} className={page === p ? "btn btn-teal" : "btn btn-outline"} style={{ padding: "6px 14px", fontSize: 12 }}>{p}</button>
            }
            if (p === page - 2 || p === page + 2) return <span key={p} style={{ color: "var(--t3)", padding: "0 4px" }}>...</span>
            return null;
          })}
          <button className="btn btn-outline" disabled={page === totalPages} onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }} style={{ padding: "6px 12px", fontSize: 12 }}>ถัดไป</button>
        </div>
      )}
    </div>
  )
}

function LibraryForm({ item, setItem, onSave, onCancel, taxonomy, busy }) {
  const set = (key, value) => setItem(prev => ({ ...prev, [key]: value }))
  const [uploadingImage, setUploadingImage] = useState(false)
  const bookTypes = (taxonomy.bookTypes || []).map(t => typeof t === "string" ? { id: t, label: t } : t)

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (import.meta.env.DEV) console.log("Starting Library Image Upload: v4 Diagnostic Logger active.");
    if (import.meta.env.DEV) console.log("Original File Name:", file.name, "Size:", file.size, "Type:", file.type);

    setUploadingImage(true)
    try {
      if (import.meta.env.DEV) console.log("Compressing image...");
      const compressedFile = await compressImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.75 })
      if (import.meta.env.DEV) console.log("Image compression complete. Output Name:", compressedFile.name, "Size:", compressedFile.size);
      
      const safeName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const usedStorage = storage || getStorage(app)
      let storageRef = null
      try {
        storageRef = ref(usedStorage, `library_covers/${Date.now()}_${safeName}`)
        if (import.meta.env.DEV) console.log("Uploading bytes to Firebase Storage reference:", storageRef.fullPath);
        await uploadBytes(storageRef, compressedFile)
      } catch (uploadErr) {
        console.error("Upload error (storageRef):", uploadErr?.code || "-", uploadErr?.message || uploadErr, "ref:", storageRef?.fullPath)
        throw uploadErr
      }

      if (import.meta.env.DEV) console.log("Firebase upload completed. Retrieving download URL...");
      const url = await getDownloadURL(storageRef)
      if (import.meta.env.DEV) console.log("Success! Cover URL obtained:", url);
      set("coverUrl", url)
      notifySuccess("อัปโหลดรูปภาพปกเรียบร้อยแล้ว")
    } catch (err) {
      console.error("Diagnostic error caught inside handleUploadImage:", err?.code || "-", err?.message || err)
      notifyError("อัปโหลดรูปภาพล้มเหลว")
    } finally {
      if (import.meta.env.DEV) console.log("Finally block executed. Setting uploadingImage back to false.");
      setUploadingImage(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="btn btn-outline" style={{ marginBottom: 18 }} onClick={onCancel}><i className="ti ti-arrow-left" style={{ marginRight: 6 }}></i>กลับ</button>
      <h2 style={{ marginBottom: 20 }}>{item.id ? "แก้ไขข้อมูล" : "เพิ่มรายการใหม่"}</h2>

      <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="ชื่อหนังสือ *" span><input value={item.title || ""} onChange={e => set("title", e.target.value)} placeholder="ชื่อหนังสือหรือเอกสาร" /></Field>
        <Field label="ผู้เขียน/ผู้จัดทำ"><input value={item.author || ""} onChange={e => set("author", e.target.value)} /></Field>
        <Field label="แหล่งที่มา">
          <select value={item.source || ""} onChange={e => set("source", e.target.value)}>
            {(taxonomy.bookSources || []).map(src => <option key={src} value={src}>{src}</option>)}
          </select>
        </Field>
        <Field label="ประเภท">
          <select 
            value={
              bookTypes.some(t => t.id === item.type)
                ? item.type
                : (isJournal(item.type) ? bookTypes.find(t => isJournal(t.id) || isJournal(t.label))?.id || item.type : item.type) || ""
            } 
            onChange={e => set("type", e.target.value)}
          >
            {bookTypes.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
          </select>
        </Field>
        <Field label="หมวดหมู่ (ใช้ร่วมกับบทความ)">
          <select value={item.category || ""} onChange={e => set("category", e.target.value)}>
            {(taxonomy.articleCategories || []).map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </Field>
        <Field label="ปีพิมพ์ (พ.ศ.)"><input type="number" value={item.year || ""} onChange={e => set("year", e.target.value)} /></Field>
        {isJournal(item.type) && (
          <Field label="ลำดับเล่มที่ / ฉบับที่ (issueNumber)">
            <input 
              type="number" 
              value={item.issueNumber ?? ""} 
              onChange={e => set("issueNumber", e.target.value === "" ? "" : Number(e.target.value))} 
              placeholder="ตัวอย่าง: 1 หรือ 2"
            />
          </Field>
        )}
        <Field label="ลิงก์ไฟล์ PDF/Drive" span><input value={item.fileUrl || ""} onChange={e => set("fileUrl", e.target.value)} placeholder="https://..." /></Field>
        <Field label="รูปภาพปกหนังสือ (URL)" span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={item.coverUrl || ""}
              onChange={e => set("coverUrl", e.target.value)}
              placeholder="https://example.com/image.jpg หรืออัปโหลดไฟล์..."
              style={{ flex: 1 }}
            />
            <label className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0, padding: "10px 16px" }}>
              <i className={uploadingImage ? "ti ti-loader-2 spin" : "ti ti-upload"}></i>
              {uploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
              <input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploadingImage} style={{ display: "none" }} />
            </label>
          </div>
          {item.coverUrl && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 120, height: 75, borderRadius: 8, overflow: "hidden", border: "1px solid var(--br2)", flexShrink: 0 }}>
                <img src={item.coverUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => set("coverUrl", "")}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 10
                  }}
                >
                  ✕
                </button>
              </div>
              <span style={{ fontSize: 12, color: "var(--t3)" }}>ตัวอย่างรูปภาพปก</span>
            </div>
          )}
        </Field>
        <Field label="คำอธิบาย" span><textarea value={item.desc || ""} onChange={e => set("desc", e.target.value)} rows={4} placeholder="รายละเอียดเพิ่มเติม..." style={{ lineHeight: 1.6 }} /></Field>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={onCancel}>ยกเลิก</button>
        <button className="btn btn-teal" onClick={onSave} disabled={busy}>
          <i className={`ti ${busy ? "ti-loader-2 spin" : "ti-check"}`} style={{ marginRight: 6 }}></i>{busy ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children, span }) {
  return (
    <label style={span ? { gridColumn: "1 / -1" } : undefined}>
      <span style={{ display: "block", fontSize: 13, color: "var(--t2)", marginBottom: 8, fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  )
}
