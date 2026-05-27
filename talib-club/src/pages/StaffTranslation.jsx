import { useEffect, useMemo, useState } from "react"
import { collection, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { confirmAction, notifyError, notifySuccess } from "../utils/feedback.jsx"

const COLLECTION = "translation_abuiyaad"
const STATUS = {
  pending: "Pending",
  progress: "In progress",
  completed: "Completed",
}

const STATUS_LABEL = {
  [STATUS.pending]: "ยังไม่แปล",
  [STATUS.progress]: "กำลังแปล",
  [STATUS.completed]: "แปลเสร็จแล้ว",
}

function docId(url) {
  return btoa(unescape(encodeURIComponent(url))).replace(/[+/=]/g, "_").slice(0, 120)
}

export default function StaffTranslation({ go }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, COLLECTION))
      setItems(snap.docs.map(item => ({ id: item.id, ...item.data() })))
    } catch (error) {
      console.error(error)
      notifyError("โหลดฐานข้อมูลงานแปลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

 async function scrapeAbuIyaad() {
    setScraping(true);
    try {
      let allArticles = [];
      let page = 1;
      let totalPages = 1;

      // ลูปดึงข้อมูลหน้าละ 100 บทความ จนกว่าจะครบทุกหน้า
      do {
        const response = await fetch(`https://abuiyaad.com/wp-json/wp/v2/posts?per_page=100&page=${page}`);
        
        // ถ้า API พ่น Error หรือหน้าหมดแล้วให้หยุดลูป
        if (!response.ok) break;

        // ดึงจำนวนหน้าทั้งหมดจาก Header ที่ WordPress ส่งมาให้
        totalPages = parseInt(response.headers.get('x-wp-totalpages') || "1");
        const posts = await response.json();

        // นำข้อมูลมาแปลงให้อยู่ในฟอร์แมตที่ต้องการ
        const mappedPosts = posts.map(post => ({
          id: docId(post.link), // หรือฟังก์ชันสร้าง ID ของคุณ
          title: post.title.rendered.replace(/<[^>]+>/g, ''), // ล้างแท็ก HTML
          url: post.link,
          status: STATUS.pending,
          translator: "",
          notes: "",
        }));

        allArticles = [...allArticles, ...mappedPosts];
        page++;
      } while (page <= totalPages);

      // --- ส่วนนี้นำ allArticles ไปบันทึกลง Firestore (ใช้ Batch เหมือนเดิม) ---
      const batch = writeBatch(db);
      allArticles.forEach(article => {
        const docRef = doc(db, COLLECTION, article.id);
        batch.set(docRef, article, { merge: true }); // merge: true ป้องกันการทับสถานะเก่า
      });
      await batch.commit();

      notifySuccess(`ดึงข้อมูลสำเร็จ! พบทั้งหมด ${allArticles.length} บทความ`);
      loadItems(); // โหลดข้อมูลมาแสดงใหม่

    } catch (error) {
      console.error(error);
      notifyError("กวาดข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setScraping(false);
    }
  }

  async function updateItem(item, patch) {
    const next = { ...item, ...patch, updatedAt: serverTimestamp() }
    setItems(prev => prev.map(row => row.id === item.id ? { ...row, ...patch } : row))
    try {
      await setDoc(doc(db, COLLECTION, item.id), next, { merge: true })
      notifySuccess("อัปเดตสถานะแล้ว")
    } catch (error) {
      console.error(error)
      notifyError("อัปเดตไม่สำเร็จ")
      loadItems()
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter(item => statusFilter === "all" || item.status === statusFilter)
      .filter(item => !q || `${item.title} ${item.url} ${item.translator || ""}`.toLowerCase().includes(q))
      .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")))
  }, [items, query, statusFilter])

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter(item => item.status === STATUS.pending).length,
    progress: items.filter(item => item.status === STATUS.progress).length,
    completed: items.filter(item => item.status === STATUS.completed).length,
  }), [items])

  return (
    <div className="translation-page">
      <div className="staff-section-head">
        <div>
          <button className="btn btn-outline" onClick={() => go("staff")}>
            <i className="ti ti-arrow-left" style={{ marginRight: 6 }}></i>กลับ
          </button>
          <span className="badge badge-teal" style={{ marginLeft: 10 }}>Translation</span>
          <h1 style={{ marginTop: 14 }}>Abuiyaad Translation Tracker</h1>
          <p>กวาดรายชื่อบทความจาก abuiyaad.com แล้วติดตามสถานะงานแปลของทีม</p>
        </div>
        <button className="btn btn-teal" onClick={runScrape} disabled={scraping}>
          <i className={`ti ${scraping ? "ti-loader-2 spin" : "ti-world-search"}`} style={{ marginRight: 6 }}></i>
          {scraping ? "กำลังกวาดข้อมูล..." : "กวาดข้อมูลจากเว็บ"}
        </button>
      </div>

      <div className="staff-stat-grid">
        <Stat label="ทั้งหมด" value={stats.total} />
        <Stat label="ยังไม่แปล" value={stats.pending} tone="warn" />
        <Stat label="กำลังแปล" value={stats.progress} tone="info" />
        <Stat label="เสร็จแล้ว" value={stats.completed} tone="ok" />
      </div>

      <div className="card translation-toolbar">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="ค้นหาชื่อบทความ / URL / ผู้แปล..." />
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="all">ทุกสถานะ</option>
          {Object.values(STATUS).map(status => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
        </select>
      </div>

      <div className="card translation-table">
        <div className="translation-row translation-head">
          <span>บทความ</span>
          <span>สถานะ</span>
          <span>ผู้แปล</span>
          <span>หมายเหตุ</span>
        </div>
        {loading && <div className="empty">กำลังโหลด...</div>}
        {!loading && filtered.map(item => (
          <div className="translation-row" key={item.id}>
            <div>
              <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
              <small>{item.url}</small>
            </div>
            <select value={item.status || STATUS.pending} onChange={event => updateItem(item, { status: event.target.value })}>
              {Object.values(STATUS).map(status => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
            </select>
            <input value={item.translator || ""} onChange={event => updateItem(item, { translator: event.target.value })} placeholder="ชื่อผู้แปล" />
            <input value={item.notes || ""} onChange={event => updateItem(item, { notes: event.target.value })} placeholder="โน้ตสั้น ๆ" />
          </div>
        ))}
        {!loading && filtered.length === 0 && <div className="empty">ยังไม่มีรายการ หรือไม่พบจากตัวกรอง</div>}
      </div>
    </div>
  )
}

function Stat({ label, value, tone = "" }) {
  return (
    <div className={`card staff-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
