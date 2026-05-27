import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, query, updateDoc, doc, serverTimestamp, addDoc } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { notifySuccess, notifyError } from "../utils/feedback.jsx"

// คง CONFIG และฟีเจอร์เดิมไว้ครบ
const MAGAZINE_QUEUE = [
  { month: "มกราคม", user: "แบยัง" }, { month: "กุมภาพันธ์", user: "บังอัสมาวี" },
  { month: "มีนาคม", user: "อุสมาน" }, { month: "เมษายน", user: "ชามิล" },
  { month: "พฤษภาคม", user: "อนันดา" }, { month: "มิถุนายน", user: "แบยัง" },
  { month: "กรกฎาคม", user: "ฟาดิล" }, { month: "สิงหาคม", user: "ชาฟิน" }
]

export default function StaffWork({ authState, go }) {
  const [subs, setSubs] = useState([])
  const [tab, setTab] = useState("work")

  useEffect(() => {
    const q = query(collection(db, "submissions"))
    return onSnapshot(q, (snap) => {
      setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const stats = useMemo(() => ({
    pending: subs.filter(s => s.status === "รอตรวจ").length,
    approved: subs.filter(s => s.status === "อนุมัติ").length
  }), [subs])

  async function handleStatus(sub, status, feedback = "") {
    await updateDoc(doc(db, "submissions", sub.id), { status, feedback, updatedAt: serverTimestamp() })
    notifySuccess("อัปเดตงานเรียบร้อย")
  }

  return (
    <div className="staff-work">
      {/* Header ส่วนหัวเดิมของคุณ */}
      <div className="staff-work-head">
        <h1>ระบบส่งงาน Talib Club</h1>
        <p>รับงาน ส่งงาน ตรวจงาน และติดตามคิวงาน</p>
        <div className="staff-stat-grid">
           <div className="card">รอตรวจ <strong>{stats.pending}</strong></div>
           <div className="card">อนุมัติแล้ว <strong>{stats.approved}</strong></div>
        </div>
      </div>

      {/* Tabs นำทางเดิม */}
      <div className="staff-tabs">
        <button className={tab === "work" ? "pill on" : "pill"} onClick={() => setTab("work")}>ศูนย์งาน</button>
        <button className={tab === "magazine" ? "pill on" : "pill"} onClick={() => setTab("magazine")}>คิววารสาร</button>
      </div>

      {/* เนื้อหาตาม Tab */}
      {tab === "work" && (
        <div className="card translation-table">
          {subs.map(sub => (
            <div className="translation-row" key={sub.id}>
              <div><strong>{sub.title}</strong><br/><small>โดย: {sub.staffName}</small></div>
              <div>
                {sub.status === "รอตรวจ" ? (
                  <>
                    <button className="btn-small" onClick={() => handleStatus(sub, "อนุมัติ")}>อนุมัติ</button>
                    <button className="btn-small danger" onClick={() => {
                        const reason = prompt("เหตุผลที่ตีกลับ:");
                        if(reason) handleStatus(sub, "ตีกลับ", reason);
                    }}>ตีกลับ</button>
                  </>
                ) : <span className="badge">{sub.status}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "magazine" && (
        <div className="card">
          {MAGAZINE_QUEUE.map((q, i) => (
            <div key={i} className="translation-row">
              <span>{q.month}</span> <strong>{q.user}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}