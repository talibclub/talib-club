import { useEffect, useState } from "react"
import { SITE } from "../../data/index.js"
import { useSiteSettings } from "../../lib/contentStore.js"

function flattenSite(site) {
  return {
    ...site,
    facebook: site.social?.facebook || "",
    youtube: site.social?.youtube || "",
    spotify: site.social?.spotify || "",
    ayahAr: site.ayah?.ar || "",
    ayahTh: site.ayah?.th || "",
    ayahRef: site.ayah?.ref || "",
  }
}

function expandSite(form) {
  return {
    name: form.name,
    tagline: form.tagline,
    desc: form.desc,
    location: form.location,
    social: {
      facebook: form.facebook,
      youtube: form.youtube,
      spotify: form.spotify,
    },
    ayah: {
      ar: form.ayahAr,
      th: form.ayahTh,
      ref: form.ayahRef,
    },
    stats: SITE.stats,
  }
}

export default function AdminSite() {
  const { site, loading, error, saveSiteSettings } = useSiteSettings(SITE)
  const [form, setForm] = useState(() => flattenSite(site))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(flattenSite(site))
  }, [site])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function save() {
    try {
      await saveSiteSettings(expandSite(form))
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      console.error(err)
      alert("บันทึกตั้งค่าเว็บไม่สำเร็จ กรุณาตรวจสิทธิ์ Firestore")
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ flex: 1 }}>ตั้งค่าเว็บ</h2>
        {loading && <span style={{ fontSize: 12, color: "var(--t3)" }}>กำลังโหลดข้อมูล...</span>}
        {saved && <span style={{ fontSize: 12, color: "var(--teal)" }}>บันทึกขึ้นเว็บแล้ว</span>}
      </div>

      <div className="card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <Field label="ชื่อเว็บ">
          <input value={form.name || ""} onChange={e => set("name", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input value={form.tagline || ""} onChange={e => set("tagline", e.target.value)} />
        </Field>
        <Field label="คำอธิบายเว็บ">
          <textarea rows={4} value={form.desc || ""} onChange={e => set("desc", e.target.value)} />
        </Field>
        <Field label="ที่ตั้ง">
          <input value={form.location || ""} onChange={e => set("location", e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <Field label="Facebook URL">
            <input value={form.facebook || ""} onChange={e => set("facebook", e.target.value)} />
          </Field>
          <Field label="YouTube URL">
            <input value={form.youtube || ""} onChange={e => set("youtube", e.target.value)} />
          </Field>
          <Field label="Spotify URL">
            <input value={form.spotify || ""} onChange={e => set("spotify", e.target.value)} />
          </Field>
        </div>
        <Field label="อายะฮ์ภาษาอาหรับ">
          <textarea rows={2} value={form.ayahAr || ""} onChange={e => set("ayahAr", e.target.value)} />
        </Field>
        <Field label="คำแปลอายะฮ์">
          <textarea rows={2} value={form.ayahTh || ""} onChange={e => set("ayahTh", e.target.value)} />
        </Field>
        <Field label="อ้างอิงอายะฮ์">
          <input value={form.ayahRef || ""} onChange={e => set("ayahRef", e.target.value)} />
        </Field>

        <button className="btn btn-teal" onClick={save} style={{ justifySelf: "start" }}>
          <i className="ti ti-check" style={{ marginRight: 6 }}></i>บันทึกขึ้นเว็บ
        </button>
      </div>

      {error && (
        <div className="card" style={{ marginTop: 24, padding: 16 }}>
          <h3>ใช้ข้อมูลสำรองอยู่</h3>
          <p style={{ marginTop: 6 }}>ระบบกำลังแสดงข้อมูลตั้งต้นจากไฟล์ในโปรเจกต์ หากต้องการบันทึกจริงให้ตรวจการตั้งค่าและสิทธิ์ Firestore</p>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label>
      <span style={{ display: "block", fontSize: 12, color: "var(--t2)", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  )
}
