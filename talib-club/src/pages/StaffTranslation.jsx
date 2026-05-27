import { useEffect, useMemo, useState } from "react"
import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { notifyError, notifySuccess } from "../utils/feedback.jsx"

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
  const [progress, setProgress] = useState(0)
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
    setScraping(true);
    setProgress(0);
    try {
      // ดึงแค่หน้าแรกเพื่อเช็คจำนวนหน้า
      const firstPageRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent("https://abuiyaad.com/wp-json/wp/v2/posts?per_page=100&page=1")}`);
      if (!firstPageRes.ok) throw new Error("ไม่สามารถเชื่อมต่อ Proxy ได้");
      const firstPageJson = await firstPageRes.json();
      
      // ตรวจสอบข้อมูลก่อน parse
      if (!firstPageJson.contents) throw new Error("ไม่ได้รับข้อมูลจากเว็บไซต์");
      
      const totalPages = parseInt(firstPageJson.status?.headers?.["x-wp-totalpages"] || "1");
      let allPosts = JSON.parse(firstPageJson.contents);
      setProgress(Math.round((1 / totalPages) * 100));

      // วนลูปโดยมีการหน่วงเวลา (Delay) เพื่อไม่ให้ Proxy มองว่าเรากำลังโจมตีเว็บ
      for (let page = 2; page <= totalPages; page++) {
        // หน่วงเวลา 1 วินาทีในแต่ละหน้า
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://abuiyaad.com/wp-json/wp/v2/posts?per_page=100&page=${page}`)}`);
        if (res.ok) {
          const data = await res.json();
          allPosts = [...allPosts, ...JSON.parse(data.contents)];
          setProgress(Math.round((page / totalPages) * 100));
        }
      }

      // บันทึกข้อมูล
      const batch = writeBatch(db);
      allPosts.forEach(post => {
        batch.set(doc(db, COLLECTION, docId(post.link)), {
          title: post.title.rendered.replace(/<[^>]+>/g, ''),
          url: post.link,
          status: STATUS.pending,
          updatedAt: serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
      
      notifySuccess(`กวาดข้อมูลสำเร็จ! รวม ${allPosts.length} รายการ`);
      loadItems();
    } catch (err) {
      notifyError("กวาดข้อมูลไม่ได้: " + err.message);
    } finally {
      setScraping(false);
      setProgress(0);
    }
  }
  async function updateItem(item, patch) {
    try {
      const batch = writeBatch(db)
      batch.set(doc(db, COLLECTION, item.id), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
      await batch.commit()
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
        <button className="btn btn-teal" onClick={runScrape} disabled={scraping}>
          {scraping ? `กำลังกวาด... ${progress}%` : "กวาดข้อมูลจากเว็บทั้งหมด"}
        </button>
      </div>

      {scraping && (
        <div style={{ width: '100%', background: '#e0e0e0', height: '8px', margin: '15px 0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, background: '#008080', height: '100%', transition: 'width 0.3s ease' }}></div>
        </div>
      )}

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