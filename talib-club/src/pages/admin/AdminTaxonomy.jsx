import { useEffect, useState } from "react"
import { DEFAULT_TAXONOMY } from "../../data/index.js"
import { useTaxonomySettings } from "../../lib/contentStore.js"

const GROUPS = [
  { key: "articleCategories", title: "หมวดหมู่บทความ", mode: "object", idLabel: "รหัส", labelLabel: "ชื่อหมวด" },
  { key: "articleTypes", title: "ประเภทบทความ", mode: "object", idLabel: "รหัส", labelLabel: "ชื่อประเภท" },
  { key: "articleSeries", title: "ซีรีส์บทความ", mode: "series", idLabel: "รหัส", labelLabel: "ชื่อซีรีส์" },
  { key: "bookTypes", title: "ประเภทหนังสือ/PDF", mode: "string", labelLabel: "ชื่อประเภท" },
  { key: "bookSources", title: "แหล่งที่มาหนังสือ", mode: "string", labelLabel: "ชื่อแหล่งที่มา" },
  { key: "mediaTypes", title: "ประเภทมีเดีย", mode: "string", labelLabel: "ชื่อประเภท" },
  { key: "scholarEras", title: "ยุคอุลามาอฺ", mode: "object", idLabel: "รหัสยุค", labelLabel: "ชื่อยุค" },
  { key: "scholarFields", title: "สาขาความรู้อุลามาอฺ", mode: "string", labelLabel: "ชื่อสาขา" },
]

function slugify(value) {
  const clean = value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ก-๙-]/g, "")
  return clean || crypto.randomUUID().slice(0, 8)
}

function normalizeItem(group, item) {
  if (group.mode === "string") return String(item || "").trim()
  if (group.mode === "series") {
    const name = String(item.name || item.label || "").trim()
    return { id: String(item.id || slugify(name)).trim(), name }
  }
  const label = String(item.label || item.name || "").trim()
  return { id: String(item.id || slugify(label)).trim(), label }
}

function emptyItem(group) {
  if (group.mode === "string") return ""
  if (group.mode === "series") return { id: "", name: "" }
  return { id: "", label: "" }
}

export default function AdminTaxonomy() {
  const { taxonomy, loading, error, saveTaxonomySettings } = useTaxonomySettings(DEFAULT_TAXONOMY)
  const [draft, setDraft] = useState(taxonomy)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDraft(taxonomy)
  }, [taxonomy])

  function updateGroup(key, items) {
    setDraft(prev => ({ ...prev, [key]: items }))
  }

  async function save() {
    try {
      await saveTaxonomySettings(draft)
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      console.error(err)
      alert("บันทึกหมวด/ตัวเลือกไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h2>หมวดและตัวเลือก</h2>
          <p style={{ marginTop: 6 }}>จัดการรายการที่ใช้ใน dropdown ของบทความ หนังสือ มีเดีย และอุลามาอฺ</p>
        </div>
        {loading && <span style={{ fontSize: 12, color: "var(--t3)" }}>กำลังโหลด...</span>}
        {saved && <span style={{ fontSize: 12, color: "var(--teal)" }}>บันทึกขึ้นเว็บแล้ว</span>}
        <button className="btn btn-teal" onClick={save}>
          <i className="ti ti-check" style={{ marginRight: 6 }}></i>บันทึกทั้งหมด
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
        {GROUPS.map(group => (
          <TaxonomyGroup
            key={group.key}
            group={group}
            items={draft[group.key] || []}
            onChange={items => updateGroup(group.key, items)}
          />
        ))}
      </div>

      {error && (
        <div className="card" style={{ marginTop: 20, padding: 16 }}>
          <h3>ใช้ข้อมูลตั้งต้นอยู่</h3>
          <p style={{ marginTop: 6 }}>ระบบโหลดหมวดจาก Firestore ไม่ได้ จึงแสดงค่าเริ่มต้นจากโปรเจกต์ก่อน</p>
        </div>
      )}
    </div>
  )
}

function TaxonomyGroup({ group, items, onChange }) {
  const [newItem, setNewItem] = useState(emptyItem(group))

  function setItem(index, key, value) {
    const next = [...items]
    if (group.mode === "string") next[index] = value
    else next[index] = { ...next[index], [key]: value }
    onChange(next)
  }

  function addItem() {
    const item = normalizeItem(group, newItem)
    if (group.mode === "string" ? !item : !(item.label || item.name)) return
    onChange([...items, item])
    setNewItem(emptyItem(group))
  }

  function removeItem(index) {
    if (!confirm("ลบรายการนี้? รายการเดิมที่ใช้อยู่ในเนื้อหาจะยังเก็บค่าเดิมไว้")) return
    onChange(items.filter((_, idx) => idx !== index))
  }

  return (
    <section className="card" style={{ padding: 16 }}>
      <h3>{group.title}</h3>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {items.map((item, index) => (
          <div key={`${group.key}-${index}`} style={{ display: "grid", gridTemplateColumns: group.mode === "string" ? "1fr auto" : "110px 1fr auto", gap: 6 }}>
            {group.mode !== "string" && (
              <input value={item.id || ""} onChange={e => setItem(index, "id", e.target.value)} placeholder={group.idLabel} />
            )}
            <input
              value={group.mode === "string" ? item : item.name || item.label || ""}
              onChange={e => setItem(index, group.mode === "series" ? "name" : group.mode === "string" ? null : "label", e.target.value)}
              placeholder={group.labelLabel}
            />
            <button className="btn btn-outline" style={{ color: "#e05555", borderColor: "rgba(224,85,85,.3)", padding: "8px 10px" }} onClick={() => removeItem(index)}>
              <i className="ti ti-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: group.mode === "string" ? "1fr auto" : "110px 1fr auto", gap: 6, marginTop: 12 }}>
        {group.mode !== "string" && (
          <input value={newItem.id || ""} onChange={e => setNewItem(prev => ({ ...prev, id: e.target.value }))} placeholder={group.idLabel} />
        )}
        <input
          value={group.mode === "string" ? newItem : newItem.name || newItem.label || ""}
          onChange={e => group.mode === "string"
            ? setNewItem(e.target.value)
            : setNewItem(prev => ({ ...prev, [group.mode === "series" ? "name" : "label"]: e.target.value }))}
          placeholder={`เพิ่ม${group.title}`}
        />
        <button className="btn btn-outline" onClick={addItem}>
          <i className="ti ti-plus"></i>
        </button>
      </div>
    </section>
  )
}
