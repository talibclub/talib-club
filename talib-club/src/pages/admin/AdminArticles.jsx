import { useState } from "react"
import { ARTICLES, ARTICLE_CATEGORIES, SERIES } from "../../data/index.js"

const EMPTY = {
  id: Date.now(), type: "general", seriesId: "", seriesName: "", part: null,
  title: "", category: "aqeedah", excerpt: "", author: "Talib Club",
  date: new Date().toISOString().slice(0,10), readTime: 5,
  coverEmoji: "📖", tags: [], body: "",
}

export default function AdminArticles() {
  const [items, setItems]   = useState(ARTICLES)
  const [editing, setEdit]  = useState(null)
  const [search, setSearch] = useState("")
  const [saved, setSaved]   = useState(false)

  const filtered = items.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() { setEdit({ ...EMPTY, id: Date.now() }) }
  function openEdit(a) { setEdit({ ...a, tags: [...(a.tags || [])] }) }
  function cancel() { setEdit(null) }

  function save() {
    if (!editing.title.trim()) return alert("กรุณาใส่ชื่อบทความ")
    setItems(prev => {
      const idx = prev.findIndex(a => a.id === editing.id)
      return idx >= 0
        ? prev.map(a => a.id === editing.id ? editing : a)
        : [...prev, editing]
    })
    setEdit(null)
    flash()
  }

  function del(id) {
    if (!confirm("ลบบทความนี้?")) return
    setItems(prev => prev.filter(a => a.id !== id))
    flash()
  }

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  if (editing) return <ArticleForm item={editing} setItem={setEdit} onSave={save} onCancel={cancel} />

  return (
    <div>
      <SectionHead title="บทความ" count={items.length} saved={saved}
        onNew={openNew} search={search} setSearch={setSearch} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(a => (
          <div key={a.id} style={{
            background: "var(--card)", border: ".5px solid var(--br2)", borderRadius: 12,
            padding: "14px 16px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4,
                  background: "var(--teal-bg)", color: "var(--teal)" }}>{a.category}</span>
                {a.type === "series" && <span style={{ fontSize: 10, padding: "2px 7px",
                  borderRadius: 4, background: "var(--acc2)", color: "var(--t2)" }}>
                  ซีรีส์ ตอน {a.part}</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)",
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {a.coverEmoji} {a.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300, marginTop: 3 }}>
                {a.author} · {a.date} · {a.readTime} นาที
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <Btn label="แก้ไข" icon="ti-pencil" onClick={() => openEdit(a)} />
              <Btn label="ลบ" icon="ti-trash" color="#e05555" onClick={() => del(a.id)} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Empty text="ไม่พบบทความ" />}
      </div>

      <CodeHint title="วิธีบันทึกถาวร — แก้ไฟล์นี้:" file="src/data/articles.js"
        desc="เพิ่ม/แก้ object ในไฟล์ articles.js แล้ว push ขึ้น GitHub — เว็บจะอัปเดตเอง" />
    </div>
  )
}

function ArticleForm({ item, setItem, onSave, onCancel }) {
  const set = (k, v) => setItem(prev => ({ ...prev, [k]: v }))
  return (
    <div style={{ maxWidth: 720 }}>
      <BackBtn onClick={onCancel} />
      <h2 style={{ marginBottom: 20 }}>{item.id === item.id && !ARTICLES.find(a=>a.id===item.id) ? "เพิ่มบทความใหม่" : "แก้ไขบทความ"}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="ชื่อบทความ *" style={{ gridColumn: "1/-1" }}>
          <input value={item.title} onChange={e => set("title", e.target.value)}
            placeholder="ชื่อบทความ" />
        </Field>
        <Field label="ประเภท">
          <select value={item.type} onChange={e => set("type", e.target.value)}>
            <option value="general">ทั่วไป</option>
            <option value="series">ซีรีส์</option>
            <option value="specific">เฉพาะเรื่อง</option>
            <option value="social">สังคมศาสตร์</option>
          </select>
        </Field>
        <Field label="หมวดหมู่">
          <select value={item.category} onChange={e => set("category", e.target.value)}>
            {ARTICLE_CATEGORIES.filter(c => c.id !== "all").map(c =>
              <option key={c.id} value={c.id}>{c.label}</option>
            )}
          </select>
        </Field>
        {item.type === "series" && <>
          <Field label="ซีรีส์">
            <select value={item.seriesId} onChange={e => set("seriesId", e.target.value)}>
              <option value="">-- เลือกซีรีส์ --</option>
              {SERIES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="ตอนที่">
            <input type="number" value={item.part || ""} onChange={e => set("part", parseInt(e.target.value))} min="1" />
          </Field>
        </>}
        {item.type === "specific" && (
          <Field label="ชื่อหัวข้อย่อย" style={{ gridColumn: "1/-1" }}>
            <input value={item.seriesName} onChange={e => set("seriesName", e.target.value)}
              placeholder="เช่น อิสลามในสังคมไทย" />
          </Field>
        )}
        <Field label="ผู้เขียน">
          <input value={item.author} onChange={e => set("author", e.target.value)} />
        </Field>
        <Field label="วันที่">
          <input type="date" value={item.date} onChange={e => set("date", e.target.value)} />
        </Field>
        <Field label="เวลาอ่าน (นาที)">
          <input type="number" value={item.readTime} onChange={e => set("readTime", parseInt(e.target.value))} min="1" />
        </Field>
        <Field label="Emoji ปก">
          <input value={item.coverEmoji} onChange={e => set("coverEmoji", e.target.value)} maxLength={2} />
        </Field>
        <Field label="บทคัดย่อ" style={{ gridColumn: "1/-1" }}>
          <textarea value={item.excerpt} onChange={e => set("excerpt", e.target.value)}
            rows={2} placeholder="สรุปสั้นๆ ของบทความ" />
        </Field>
        <Field label="tags (คั่นด้วยจุลภาค)" style={{ gridColumn: "1/-1" }}>
          <input value={(item.tags || []).join(", ")}
            onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
            placeholder="เช่น อากีดะฮ์, ยุคใหม่" />
        </Field>
        <Field label="เนื้อหาบทความ" style={{ gridColumn: "1/-1" }}>
          <textarea value={item.body} onChange={e => set("body", e.target.value)}
            rows={10} placeholder="เนื้อหาบทความ (ขึ้นบรรทัดใหม่ด้วย Enter)" />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button onClick={onSave} style={{ ...btnStyle, background: "var(--teal)", color: "#fff" }}>
          <i className="ti ti-check" style={{ marginRight: 5 }}></i>บันทึก
        </button>
        <button onClick={onCancel} style={{ ...btnStyle, background: "transparent",
          border: ".5px solid var(--br)", color: "var(--t2)" }}>ยกเลิก</button>
      </div>
    </div>
  )
}

const btnStyle = { fontFamily: "'Prompt',sans-serif", fontSize: 13, fontWeight: 500,
  padding: "9px 18px", borderRadius: 24, border: "none", cursor: "pointer" }

function Btn({ label, icon, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'Prompt',sans-serif", fontSize: 11, fontWeight: 400,
      padding: "5px 10px", borderRadius: 16, cursor: "pointer", transition: "all .15s",
      border: `.5px solid ${color ? `${color}44` : "var(--br)"}`,
      background: color ? `${color}11` : "var(--bg2)",
      color: color || "var(--t2)", display: "flex", alignItems: "center", gap: 4,
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 11 }}></i>{label}
    </button>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--t2)", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ ...btnStyle, background: "transparent",
      border: ".5px solid var(--br)", color: "var(--t2)", marginBottom: 20,
      fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
      <i className="ti ti-arrow-left" style={{ fontSize: 12 }}></i> กลับ
    </button>
  )
}

function SectionHead({ title, count, saved, onNew, search, setSearch }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10,
      marginBottom: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", flex: 1 }}>
        {title} <span style={{ fontSize: 12, color: "var(--t3)" }}>({count})</span>
      </span>
      {saved && <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 400 }}>
        <i className="ti ti-check" style={{ marginRight: 4 }}></i>บันทึกแล้ว (ชั่วคราว)</span>}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="ค้นหา..." style={{
          fontFamily: "'Prompt',sans-serif", fontSize: 12, padding: "6px 10px",
          background: "var(--inp)", border: ".5px solid var(--br)", borderRadius: 8,
          color: "var(--text)", outline: "none", width: 160,
        }} />
      <button onClick={onNew} style={{
        ...btnStyle, fontSize: 12, background: "var(--teal)", color: "#fff", padding: "7px 14px" }}>
        <i className="ti ti-plus" style={{ marginRight: 4 }}></i>เพิ่มใหม่
      </button>
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "40px 24px",
    color: "var(--t3)", fontSize: 13, fontWeight: 300 }}>{text}</div>
}

function CodeHint({ title, file, desc }) {
  return (
    <div style={{ marginTop: 28, padding: "14px 18px", background: "var(--acc2)",
      border: ".5px solid var(--acc-br)", borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--acc)", marginBottom: 4 }}>
        <i className="ti ti-info-circle" style={{ marginRight: 6 }}></i>{title}
      </div>
      <code style={{ fontSize: 11, color: "var(--teal)", display: "block", marginBottom: 4 }}>
        📁 {file}
      </code>
      <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 300 }}>{desc}</div>
    </div>
  )
}
