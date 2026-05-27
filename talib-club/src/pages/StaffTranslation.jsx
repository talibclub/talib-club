import { useEffect, useMemo, useState } from "react"
import { collection, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { confirmAction, notifyError, notifySuccess } from "../utils/feedback.jsx"

const COLLECTION = "translation_abuiyaad"
const STATUS = { pending: "Pending", progress: "In progress", completed: "Completed" }
const STATUS_LABEL = { [STATUS.pending]: "ยังไม่แปล", [STATUS.progress]: "กำลังแปล", [STATUS.completed]: "แปลเสร็จแล้ว" }

function docId(url) {
  return btoa(unescape(encodeURIComponent(url))).replace(/[+/=]/g, "_").slice(0, 120)
}

export default function StaffTranslation({ go }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, COLLECTION))
      setItems(snap.docs.map(item => ({ id: item.id, ...item.data() })))
    } catch (error) {
      notifyError("โหลดฐานข้อมูลงานแปลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  async function runScrape() {
    const ok = await confirmAction({ title: "กวาดข้อมูลจาก abuiyaad.com?", message: "ดึงบทความทั้งหมดผ่าน Proxy เพื่อป้องกัน Error", confirmText: "เริ่มกวาดข้อมูล" })
    if (!ok) return
    setScraping(true)
    try {
      let allArticles = [];
      let page = 1;
      let totalPages = 1;
      // ใช้ allorigins.win เป็น Proxy แก้ปัญหา CORS
      do {
        const url = `https://abuiyaad.com/wp-json/wp/v2/posts?per_page=100&page=${page}`;
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        if (!response.ok) break;
        const data = await response.json();
        const posts = JSON.parse(data.contents);
        totalPages = parseInt(data.status.headers['x-wp-totalpages'] || "1");
        const mappedPosts = posts.map(post => ({
          id: docId(post.link),
          title: post.title.rendered.replace(/<[^>]+>/g, '').replace(/&#8211;/g, '-').replace(/&#8217;/g, "'"),
          url: post.link,
          status: STATUS.pending
        }));
        allArticles = [...allArticles, ...mappedPosts];
        page++;
      } while (page <= totalPages);

      const batch = writeBatch(db)
      allArticles.forEach(article => {
        batch.set(doc(db, COLLECTION, article.id), { ...article, updatedAt: serverTimestamp() }, { merge: true })
      })
      await batch.commit()
      notifySuccess(`ดึงข้อมูลสำเร็จ! รวม ${allArticles.length} รายการ`)
      await loadItems()
    } catch (err) {
      notifyError("กวาดข้อมูลไม่สำเร็จ (ลองใหม่อีกครั้ง)")
    } finally {
      setScraping(false)
    }
  }

  async function updateItem(item, patch) {
    try {
      await setDoc(doc(db, COLLECTION, item.id), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
      setItems(prev => prev.map(row => row.id === item.id ? { ...row, ...patch } : row))
      notifySuccess("อัปเดตสถานะแล้ว")
    } catch {
      notifyError("อัปเดตไม่สำเร็จ")
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(i => (statusFilter === "all" || i.status === statusFilter) && (!q || i.title.toLowerCase().includes(q)))
  }, [items, query, statusFilter])

  return (
    <div className="translation-page">
      <div className="staff-section-head">
        <div>
          <button className="btn btn-outline" onClick={() => go("staff")}><i className="ti ti-arrow-left"></i> กลับ</button>
          <h1>Translation Tracker</h1>
        </div>
        <button className="btn btn-teal" onClick={runScrape} disabled={scraping}>{scraping ? "กำลังกวาด..." : "กวาดข้อมูลจากเว็บ"}</button>
      </div>
      <div className="card translation-table">
        {loading ? <div>กำลังโหลดข้อมูล...</div> : filtered.map(item => (
          <div className="translation-row" key={item.id}>
            <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
            <select value={item.status || STATUS.pending} onChange={e => updateItem(item, { status: e.target.value })}>
              {Object.values(STATUS).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}