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
  readTime: 5,
  coverEmoji: "📖",
  tags: [],
  body: "",
}

export default function AdminArticles() {
  const { items, loading, error, saveItem, deleteItem, isUsingFallback } = useContentCollection("articles", ARTICLES)
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [editing, setEdit] = useState(null)
  const [search, setSearch] = useState("")
  const [busy, setBusy] = useState(false)

  const filtered = items.filter(a => String(a.title || "").toLowerCase().includes(search.toLowerCase()))

  function openNew() {
    setEdit({ ...EMPTY, id: crypto.randomUUID() })
  }

  function openEdit(article) {
    setEdit({ ...article, tags: [...(article.tags || [])] })
  }

  async function save() {
    if (!editing.title?.trim()) {
      notifyError("กรุณาใส่ชื่อบทความ")
      return
    }

    const payload = {
      ...editing,
      part: editing.type === "series" && editing.part ? Number(editing.part) : null,
      readTime: Number(editing.readTime || 5),
    }

    setBusy(true)
    try {
      await saveItem(payload)
      setEdit(null)
      notifySuccess("บันทึกบทความขึ้นเว็บไซต์เรียบร้อยแล้ว")
    } catch (err) {
      console.error(err)
      notifyError("บันทึกไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    } finally {
      setBusy(false)
    }
  }

  async function remove(article) {
    const ok = await confirmAction({
      title: "ลบบทความนี้?",
      message: `บทความ "${article.title}" จะถูกซ่อนจากหน้าเว็บไซต์`,
      confirmText: "ลบบทความ",
      danger: true,
    })
    if (!ok) return

    try {
      await deleteItem(article.id)
      notifySuccess("ลบบทความเรียบร้อยแล้ว")
    } catch (err) {
      console.error(err)
      notifyError("ลบไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    }
  }

  if (editing) {
    return <ArticleForm item={editing} setItem={setEdit} onSave={save} onCancel={() => setEdit(null)} taxonomy={taxonomy} busy={busy} />
  }

  return (
    <div>
      <SectionHead title="บทความ" count={items.length} loading={loading} onNew={openNew} search={search} setSearch={setSearch} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(article => (
          <div key={article.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <span className="tag tag-teal">{article.category}</span>
                {article.type === "series" && <span className="tag">ซีรีส์ ตอน {article.part}</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {article.coverEmoji} {article.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300, marginTop: 3 }}>
                {article.author} · {article.date} · {article.readTime} นาที
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-outline" onClick={() => openEdit(article)}>
                <i className="ti ti-pencil" style={{ marginRight: 5 }}></i>แก้ไข
              </button>
              <button className="btn btn-outline" style={{ color: "#e05555", borderColor: "rgba(224,85,85,.3)" }} onClick={() => remove(article)}>
                <i className="ti ti-trash" style={{ marginRight: 5 }}></i>ลบ
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty">ไม่พบบทความ</div>}
      </div>

      {(error || isUsingFallback) && (
        <div className="card" style={{ marginTop: 24, padding: 16 }}>
          <h3>{error ? "ใช้ข้อมูลสำรองอยู่" : "ยังไม่มีข้อมูลใน Firestore"}</h3>
          <p style={{ marginTop: 6 }}>
            {error
              ? "ระบบโหลดบทความจาก Firestore ไม่ได้ จึงแสดงข้อมูลตั้งต้นจากโปรเจกต์ก่อน"
              : "เมื่อบันทึกบทความจากหน้านี้ หน้า member จะอ่านจาก Firestore ชุดเดียวกันทันที"}
          </p>
        </div>
      )}
    </div>
  )
}

function ArticleForm({ item, setItem, onSave, onCancel, taxonomy, busy }) {
  const set = (key, value) => setItem(prev => ({ ...prev, [key]: value }))

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="btn btn-outline" style={{ marginBottom: 18 }} onClick={onCancel}>
        <i className="ti ti-arrow-left" style={{ marginRight: 6 }}></i>กลับ
      </button>
      <h2 style={{ marginBottom: 20 }}>{item.id ? "แก้ไข/เพิ่มบทความ" : "เพิ่มบทความใหม่"}</h2>

      <div className="card" style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="ชื่อบทความ *" span>
          <input value={item.title || ""} onChange={e => set("title", e.target.value)} placeholder="ชื่อบทความ" />
        </Field>
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
            <Field label="ตอนที่">
              <input type="number" value={item.part || ""} onChange={e => set("part", e.target.value)} min="1" />
            </Field>
          </>
        )}
        {item.type === "specific" && (
          <Field label="ชื่อหัวข้อย่อย" span>
            <input value={item.seriesName || ""} onChange={e => set("seriesName", e.target.value)} />
          </Field>
        )}
        <Field label="ผู้เขียน">
          <input value={item.author || ""} onChange={e => set("author", e.target.value)} />
        </Field>
        <Field label="วันที่">
          <input type="date" value={item.date || ""} onChange={e => set("date", e.target.value)} />
        </Field>
        <Field label="เวลาอ่าน (นาที)">
          <input type="number" value={item.readTime || ""} onChange={e => set("readTime", e.target.value)} min="1" />
        </Field>
        <Field label="Emoji ปก">
          <input value={item.coverEmoji || ""} onChange={e => set("coverEmoji", e.target.value)} maxLength={4} />
        </Field>
        <Field label="บทคัดย่อ" span>
          <textarea value={item.excerpt || ""} onChange={e => set("excerpt", e.target.value)} rows={2} />
        </Field>
        <Field label="Tags (คั่นด้วยจุลภาค)" span>
          <input value={(item.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))} />
        </Field>
        <Field label="เนื้อหาบทความ" span>
          <textarea value={item.body || ""} onChange={e => set("body", e.target.value)} rows={10} />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button className="btn btn-teal" onClick={onSave} disabled={busy}>
          <i className={`ti ${busy ? "ti-loader-2" : "ti-check"}`} style={{ marginRight: 6 }}></i>
          {busy ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button className="btn btn-outline" onClick={onCancel}>ยกเลิก</button>
      </div>
    </div>
  )
}

function Field({ label, children, span }) {
  return (
    <label style={span ? { gridColumn: "1 / -1" } : undefined}>
      <span style={{ display: "block", fontSize: 12, color: "var(--t2)", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  )
}

function SectionHead({ title, count, loading, onNew, search, setSearch }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
      <h2 style={{ flex: 1 }}>{title} <span style={{ fontSize: 12, color: "var(--t3)" }}>({count})</span></h2>
      {loading && <span style={{ fontSize: 12, color: "var(--t3)" }}>กำลังโหลดข้อมูล...</span>}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..." style={{ maxWidth: 200 }} />
      <button className="btn btn-teal" onClick={onNew}>
        <i className="ti ti-plus" style={{ marginRight: 6 }}></i>เพิ่มใหม่
      </button>
    </div>
  )
}