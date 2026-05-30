import { useState } from "react"
import { ARTICLES, DEFAULT_TAXONOMY } from "../../data/index.js"
import { useContentCollection, useTaxonomySettings } from "../../lib/contentStore.js"
import { confirmAction, notifyError, notifySuccess } from "../../utils/feedback.jsx"

const EMPTY = {
  type: "general",
  seriesId: "",
  seriesName: "",
  part: "",
  title: "",
  category: "aqeedah",
  excerpt: "",
  author: "Talib Club",
  date: new Date().toISOString().slice(0, 10),
  tags: [],
  body: "",
}

export default function AdminArticles() {
  const { items, loading, error, saveItem, deleteItem, isUsingFallback } = useContentCollection("articles", ARTICLES)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  
  const [editing, setEdit] = useState(null)
  
  // States สำหรับค้นหาและตัวกรอง
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all") // สำหรับปุ่ม Pill
  const [categoryFilter, setCategoryFilter] = useState("all") // สำหรับ Dropdown
  const [showAdvanced, setShowAdvanced] = useState(false) // Toggle เปิดปิดตัวกรองเพิ่มเติม
  
  const [selected, setSelected] = useState([]) 
  const [busy, setBusy] = useState(false)

  // กรองข้อมูล
  const filtered = items.filter(a => {
    const matchSearch = String(a.title || "").toLowerCase().includes(search.toLowerCase()) ||
                        String(a.author || "").toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || a.type === typeFilter
    const matchCat = categoryFilter === "all" || a.category === categoryFilter
    
    return matchSearch && matchType && matchCat
  })

  // จัดการ Checkbox
  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered.map(a => a.id))
  }

  function openNew() {
    setEdit({ ...EMPTY, id: crypto.randomUUID() })
  }

  async function save() {
    if (!editing.title?.trim()) return notifyError("กรุณาใส่ชื่อบทความ")

    const payload = { ...editing, part: editing.type === "series" && editing.part ? Number(editing.part) : null }
    delete payload.readTime;
    delete payload.coverEmoji;

    setBusy(true)
    try {
      await saveItem(payload)
      setEdit(null)
      notifySuccess("บันทึกบทความขึ้นเว็บไซต์เรียบร้อยแล้ว")
    } catch (err) {
      notifyError("บันทึกไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    } finally {
      setBusy(false)
    }
  }

  async function remove(article) {
    const ok = await confirmAction({ title: "ลบบทความนี้?", message: `บทความ "${article.title}" จะถูกซ่อนจากหน้าเว็บไซต์`, confirmText: "ลบบทความ", danger: true })
    if (!ok) return
    try {
      await deleteItem(article.id)
      setSelected(prev => prev.filter(id => id !== article.id))
      notifySuccess("ลบบทความเรียบร้อยแล้ว")
    } catch (err) {
      notifyError("ลบไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    }
  }

  async function removeSelected() {
    const ok = await confirmAction({ title: `ยืนยันการลบ ${selected.length} รายการ?`, message: "ข้อมูลที่ถูกเลือกรวมถึงเนื้อหาทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้", confirmText: "ยืนยันการลบ", danger: true })
    if (!ok) return
    setBusy(true)
    try {
      await Promise.all(selected.map(id => deleteItem(id)))
      setSelected([])
      notifySuccess(`ลบ ${selected.length} บทความเรียบร้อยแล้ว`)
    } catch (err) {
      notifyError("เกิดข้อผิดพลาดในการลบข้อมูลบางส่วน")
    } finally {
      setBusy(false)
    }
  }

  if (editing) {
    return <ArticleForm item={editing} setItem={setEdit} onSave={save} onCancel={() => setEdit(null)} taxonomy={taxonomy} busy={busy} />
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ minWidth: 150 }}>บทความ <span style={{ fontSize: 12, color: "var(--t3)" }}>({filtered.length})</span></h2>
          <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>บทความวิชาการอิสลามทั้งหมดของ Talib Club</p>
        </div>
        <button className="btn btn-teal" onClick={openNew}>
          <i className="ti ti-plus" style={{ marginRight: 6 }}></i>เพิ่มใหม่
        </button>
      </div>

      {/* แถบค้นหา และ ปุ่มกรอง (UI ใหม่) */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: showAdvanced ? 12 : 24 }}>
        
        {/* ช่องค้นหา */}
        <div style={{ flex: "1 1 250px", position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 16 }}></i>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setSelected([]); }} 
            placeholder="ค้นหาชื่อบทความ, ผู้เขียน..." 
            style={{ width: "100%", paddingLeft: 42, borderRadius: 24, padding: "10px 16px 10px 42px", background: "var(--bg2)", border: "none" }} 
          />
        </div>

        {/* ปุ่มประเภท (Pills) */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => { setTypeFilter("all"); setSelected([]); }} className={`pill ${typeFilter === "all" ? "on-acc" : ""}`} style={{ padding: "8px 16px" }}>ทั้งหมด</button>
          {(taxonomy.articleTypes || []).map(type => (
            <button key={type.id} onClick={() => { setTypeFilter(type.id); setSelected([]); }} className={`pill ${typeFilter === type.id ? "on-acc" : ""}`} style={{ padding: "8px 16px" }}>
              {type.label}
            </button>
          ))}
        </div>

        {/* ปุ่มเปิดตัวกรองเพิ่มเติม */}
        <button 
          className={`btn ${showAdvanced ? "btn-teal" : "btn-outline"}`} 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ padding: "8px 16px", borderRadius: 24 }}
        >
          <i className="ti ti-filter" style={{ marginRight: 6 }}></i>ตัวกรองเพิ่มเติม
        </button>
      </div>

      {/* แถบตัวกรองเพิ่มเติม (Drop-down) */}
      {showAdvanced && (
        <div style={{ background: "var(--bg2)", padding: "16px 20px", borderRadius: 16, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>หมวดหมู่บทความ</span>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setSelected([]); }} style={{ background: "var(--card)", border: "none" }}>
              <option value="all">-- ทุกหมวดหมู่ --</option>
              {(taxonomy.articleCategories || []).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* แถบเครื่องมือจัดการหลายรายการ */}
      {selected.length > 0 && (
        <div style={{ background: "rgba(45,190,160,0.1)", border: "1px solid var(--teal)", padding: "10px 16px", borderRadius: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 500 }}>เลือกอยู่ {selected.length} รายการ</span>
          <button className="btn" style={{ background: "#e05555", color: "#fff", padding: "6px 14px", fontSize: 12 }} onClick={removeSelected} disabled={busy}>
            <i className={busy ? "ti ti-loader-2 spin" : "ti ti-trash"} style={{ marginRight: 6 }}></i> {busy ? "กำลังลบ..." : "ลบที่เลือก"}
          </button>
        </div>
      )}

      {/* เลือกทั้งหมด */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "var(--t2)" }}>
            <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 16, height: 16, cursor: "pointer" }} />
            เลือกทั้งหมด
          </label>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(article => (
          <div key={article.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              <input type="checkbox" checked={selected.includes(article.id)} onChange={() => toggleSelect(article.id)} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                  <span className="tag tag-teal">{article.category}</span>
                  {article.type === "series" && <span className="tag">ซีรีส์ ตอน {article.part}</span>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{article.title}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300, marginTop: 4 }}>{article.author} · {article.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-outline" onClick={() => openEdit(article)} style={{ padding: "6px 12px", fontSize: 12 }}><i className="ti ti-pencil"></i></button>
              <button className="btn btn-outline" style={{ color: "#e05555", borderColor: "rgba(224,85,85,.3)", padding: "6px 12px", fontSize: 12 }} onClick={() => remove(article)}><i className="ti ti-trash"></i></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty">ไม่พบบทความที่ตรงกับเงื่อนไข</div>}
      </div>
    </div>
  )
}

function ArticleForm({ item, setItem, onSave, onCancel, taxonomy, busy }) {
  const set = (key, value) => setItem(prev => ({ ...prev, [key]: value }))

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="btn btn-outline" style={{ marginBottom: 18 }} onClick={onCancel}><i className="ti ti-arrow-left" style={{ marginRight: 6 }}></i>กลับ</button>
      <h2 style={{ marginBottom: 20 }}>{item.id ? "แก้ไขบทความ" : "เพิ่มบทความใหม่"}</h2>

      <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="ชื่อบทความ *" span><input value={item.title || ""} onChange={e => set("title", e.target.value)} placeholder="ชื่อบทความ" /></Field>
        <Field label="ประเภท">
          <select value={item.type || "general"} onChange={e => set("type", e.target.value)}>
            {(taxonomy.articleTypes || []).map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
          </select>
        </Field>
        <Field label="หมวดหมู่">
          <select value={item.category || ""} onChange={e => set("category", e.target.value)}>
            {(taxonomy.articleCategories || []).map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
        </Field>
        {item.type === "series" && (
          <>
            <Field label="ซีรีส์">
              <select value={item.seriesId || ""} onChange={e => set("seriesId", e.target.value)}>
                <option value="">เลือกซีรีส์</option>
                {(taxonomy.articleSeries || []).map(series => <option key={series.id} value={series.id}>{series.name}</option>)}
              </select>
            </Field>
            <Field label="ตอนที่"><input type="number" value={item.part || ""} onChange={e => set("part", e.target.value)} min="1" /></Field>
          </>
        )}
        {item.type === "specific" && <Field label="ชื่อหัวข้อย่อย" span><input value={item.seriesName || ""} onChange={e => set("seriesName", e.target.value)} /></Field>}
        <Field label="ผู้เขียน"><input value={item.author || ""} onChange={e => set("author", e.target.value)} /></Field>
        <Field label="วันที่เผยแพร่"><input type="date" value={item.date || ""} onChange={e => set("date", e.target.value)} /></Field>
        <Field label="บทคัดย่อ (แสดงหน้าการ์ด)" span><textarea value={item.excerpt || ""} onChange={e => set("excerpt", e.target.value)} rows={2} placeholder="เนื้อหาสรุปสั้นๆ..." /></Field>
        <Field label="Tags (คั่นด้วยลูกน้ำ ,)" span><input value={(item.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))} placeholder="เช่น ฟิกฮ์, อะกีดะฮ์" /></Field>
        <Field label="เนื้อหาบทความแบบเต็ม" span><textarea value={item.body || ""} onChange={e => set("body", e.target.value)} rows={12} placeholder="พิมพ์เนื้อหาที่นี่..." style={{ lineHeight: 1.6 }} /></Field>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
        <button className="btn btn-outline" onClick={onCancel}>ยกเลิก</button>
        <button className="btn btn-teal" onClick={onSave} disabled={busy}>
          <i className={`ti ${busy ? "ti-loader-2 spin" : "ti-check"}`} style={{ marginRight: 6 }}></i>{busy ? "กำลังบันทึก..." : "บันทึกบทความ"}
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