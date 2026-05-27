import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, query, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { notifySuccess, notifyError } from "../utils/feedback.jsx"

// 1. เก็บ Config เดิมไว้ครบถ้วน
const MAGAZINE_QUEUE = [
  { month: "มกราคม", user: "แบยัง" }, { month: "กุมภาพันธ์", user: "บังอัสมาวี" },
  { month: "มีนาคม", user: "อุสมาน" }, { month: "เมษายน", user: "ชามิล" },
  { month: "พฤษภาคม", user: "อนันดา" }, { month: "มิถุนายน", user: "แบยัง" },
  { month: "กรกฎาคม", user: "ฟาดิล" }, { month: "สิงหาคม", user: "ชาฟิน" }
]

export default function StaffWork({ authState, go }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. ดึงข้อมูล Real-time
  useEffect(() => {
    const q = query(collection(db, "submissions"))
    return onSnapshot(q, (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  // 3. ระบบคำนวณสถิติ (ใส่กลับมาให้แล้ว)
  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === "รอตรวจ").length,
    approved: submissions.filter(s => s.status === "อนุมัติ").length
  }), [submissions])

  // 4. ฟังก์ชันจัดการสถานะ
  async function handleStatus(sub, newStatus, feedback = "") {
    try {
      await updateDoc(doc(db, "submissions", sub.id), { 
        status: newStatus, 
        feedback, 
        updatedAt: serverTimestamp() 
      })
      notifySuccess("อัปเดตสถานะสำเร็จ")
    } catch {
      notifyError("มีบางอย่างผิดพลาด")
    }
  }

  return (
    <div className="staff-work-page">
      {/* ส่วนหัวและสถิติ */}
      <div className="staff-section-head">
        <h1>ระบบส่งงาน Talib Club</h1>
        <button className="btn btn-outline" onClick={() => go("staff")}>กลับ</button>
      </div>

      <div className="staff-stat-grid">
        <div className="card">รอตรวจ <strong>{stats.pending}</strong></div>
        <div className="card">อนุมัติแล้ว <strong>{stats.approved}</strong></div>
      </div>

      {/* หน้าคิววารสาร (เอาของเดิมกลับมาใส่) */}
      <section>
        <h2>คิววารสารประจำปี</h2>
        <div className="card">
          {MAGAZINE_QUEUE.map((q, i) => (
            <div key={i} className="translation-row">
              <span>{q.month}</span>
              <span>{q.user}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ตารางงานที่ส่งเข้ามา */}
      <section style={{ marginTop: 20 }}>
        <h2>รายการงานที่ส่งเข้ามา</h2>
        <div className="card translation-table">
          {submissions.map(sub => (
            <div className="translation-row" key={sub.id}>
              <div>{sub.title} <small>({sub.staffName})</small></div>
              <div>
                {sub.status === "รอตรวจ" ? (
                  <>
                    <button className="btn-small" onClick={() => handleStatus(sub, "อนุมัติ")}>อนุมัติ</button>
                    <button className="btn-small danger" onClick={() => {
                        const reason = prompt("เหตุผลที่ตีกลับ:");
                        if(reason) handleStatus(sub, "ตีกลับ", reason);
                    }}>ตีกลับ</button>
                  </>
                ) : (
                  <span className="badge">{sub.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}