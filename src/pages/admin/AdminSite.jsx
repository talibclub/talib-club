import { useEffect, useState } from "react"
import { SITE } from "../../data/index.js"
import { useSiteSettings } from "../../lib/contentStore.js"
import { notifyError, notifySuccess } from "../../utils/feedback.jsx"

// 1. ดึงข้อมูล tiktok จาก database มาใส่ใน state ของ form
function flattenSite(site) {
  return {
    ...site,
    facebook: site.social?.facebook || "",
    youtube: site.social?.youtube || "",
    spotify: site.social?.spotify || "",
    instagram: site.social?.instagram || "",
    tiktok: site.social?.tiktok || "", // <-- เพิ่มบรรทัดนี้
    ayahAr: site.ayah?.ar || "",
    ayahTh: site.ayah?.th || "",
    ayahRef: site.ayah?.ref || "",
    followers: site.stats?.followers || "",
    followersLabel: site.stats?.followersLabel || "",
  }
}

// 2. จัดรูปแบบข้อมูลจาก form เตรียมส่งไปเซฟใน database
function expandSite(form) {
  return {
    name: form.name || "",
    nameAr: form.nameAr || "",
    tagline: form.tagline || "",
    desc: form.desc || "",
    location: form.location || "",
    founded: form.founded || "",
    social: {
      facebook: form.facebook || "",
      youtube: form.youtube || "",
      spotify: form.spotify || "",
      instagram: form.instagram || "",
      tiktok: form.tiktok || "", // <-- เพิ่มบรรทัดนี้
    },
    ayah: {
      ar: form.ayahAr || "",
      th: form.ayahTh || "",
      ref: form.ayahRef || "",
    },
    stats: {
      followers: form.followers || "",
      followersLabel: form.followersLabel || "",
    },
  }
}

export default function AdminSite() {
  const { site, loading, error, saveSiteSettings } = useSiteSettings(SITE)
  const [form, setForm] = useState(() => flattenSite(site || SITE))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (site) setForm(flattenSite(site))
  }, [site])

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function save() {
    setBusy(true)
    try {
      await saveSiteSettings(expandSite(form))
      notifySuccess("บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว")
    } catch (err) {
      console.error(err)
      notifyError("บันทึกไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firestore")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>ตั้งค่าเว็บไซต์</h2>
      {loading && <p style={{ marginBottom: 12 }}>กำลังโหลดข้อมูล...</p>}
      {error && <p style={{ marginBottom: 12, color: "#e05555" }}>โหลดข้อมูลจาก Firestore ไม่สำเร็จ กำลังแสดงข้อมูลตั้งต้น</p>}

      <div className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
        <Field label="ชื่อเว็บไซต์">
          <input value={form.name || ""} onChange={e => set("name", e.target.value)} />
        </Field>
        <Field label="ชื่อภาษาอาหรับ">
          <input value={form.nameAr || ""} onChange={e => set("nameAr", e.target.value)} />
        </Field>
        <Field label="สโลแกน">
          <input value={form.tagline || ""} onChange={e => set("tagline", e.target.value)} />
        </Field>
        <Field label="คำอธิบายเว็บไซต์">
          <textarea rows={3} value={form.desc || ""} onChange={e => set("desc", e.target.value)} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Location">
            <input value={form.location || ""} onChange={e => set("location", e.target.value)} />
          </Field>
          <Field label="Founded">
            <input value={form.founded || ""} onChange={e => set("founded", e.target.value)} />
          </Field>
        </div>

        {/* 3. เพิ่มช่องกรอก TikTok ตรงนี้ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Facebook URL">
            <input value={form.facebook || ""} onChange={e => set("facebook", e.target.value)} />
          </Field>
          <Field label="YouTube URL">
            <input value={form.youtube || ""} onChange={e => set("youtube", e.target.value)} />
          </Field>
          <Field label="Spotify URL">
            <input value={form.spotify || ""} onChange={e => set("spotify", e.target.value)} />
          </Field>
          <Field label="Instagram URL">
            <input value={form.instagram || ""} onChange={e => set("instagram", e.target.value)} />
          </Field>
          <Field label="TikTok URL">
            <input value={form.tiktok || ""} onChange={e => set("tiktok", e.target.value)} />
          </Field>
        </div>

        <Field label="อายะห์ภาษาอาหรับ">
          <textarea rows={2} value={form.ayahAr || ""} onChange={e => set("ayahAr", e.target.value)} />
        </Field>
        <Field label="คำแปลอายะห์">
          <textarea rows={2} value={form.ayahTh || ""} onChange={e => set("ayahTh", e.target.value)} />
        </Field>
        <Field label="อ้างอิงอายะห์">
          <input value={form.ayahRef || ""} onChange={e => set("ayahRef", e.target.value)} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="จำนวนผู้ติดตาม">
            <input value={form.followers || ""} onChange={e => set("followers", e.target.value)} />
          </Field>
          <Field label="ป้ายผู้ติดตาม">
            <input value={form.followersLabel || ""} onChange={e => set("followersLabel", e.target.value)} />
          </Field>
        </div>

        <button className="btn btn-teal" onClick={save} disabled={busy} style={{ justifySelf: "start", marginTop: 10 }}>
          <i className={`ti ${busy ? "ti-loader-2" : "ti-check"}`} style={{ marginRight: 6 }}></i>
          {busy ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500, marginBottom: 6, display: "block" }}>{label}</span>
      {children}
    </label>
  )
}