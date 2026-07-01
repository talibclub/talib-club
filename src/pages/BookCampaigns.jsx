import React, { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import { useAuth } from "../hooks/useAuth.js"

export default function BookCampaigns({ go }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchCampaigns = async () => {
      try {
        const q = query(
          collection(db, "book_campaigns"), 
          where("status", "==", "active")
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
        setCampaigns(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8, color: "var(--teal)" }}>
          <i className="ti ti-books"></i> แจก/สั่งซื้อหนังสือ
        </h1>
        <p style={{ color: "var(--t2)" }}>ลงทะเบียนรับหนังสือหรือสั่งซื้อหนังสือจาก Talib Club</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><i className="ti ti-loader-2 spin"></i> กำลังโหลด...</div>
      ) : campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--t3)" }}>
          <i className="ti ti-book-off" style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}></i>
          <p>ขณะนี้ยังไม่มีแคมเปญแจกหรือสั่งซื้อหนังสือที่เปิดรับลงทะเบียน</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {campaigns.map(c => (
            <div key={c.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: 24, background: "var(--bg2)", borderBottom: "1px solid var(--br)" }}>
                <h2 style={{ margin: "0 0 8px 0", fontSize: 20 }}>{c.title}</h2>
                {c.description && <p style={{ color: "var(--t2)", margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{c.description}</p>}
                
                <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", fontSize: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--amber)" }}>
                    <i className="ti ti-ticket"></i> โควตาทั้งหมด {c.quota} สิทธิ์
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--teal)" }}>
                    <i className="ti ti-truck-delivery"></i> ค่าจัดส่ง {c.shippingFee > 0 ? `${c.shippingFee} บาท` : "ฟรี"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--t2)" }}>
                    <i className="ti ti-clock"></i> ให้เวลาโอนเงิน {c.timeLimit} นาที
                  </div>
                </div>
              </div>

              {c.items && c.items.length > 0 && (
                <div style={{ padding: 24, background: "var(--bg)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
                  {c.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ width: "100%", aspectRatio: "3/4", background: "var(--bg3)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--br)" }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}><i className="ti ti-book" style={{ fontSize: 32 }}></i></div>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, textAlign: "center", color: "var(--t2)" }}>{item.name}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: 20, display: "flex", justifyContent: "flex-end", background: "var(--bg2)", borderTop: "1px solid var(--br)" }}>
                <button className="btn btn-teal" onClick={() => go("book-register", { campaignId: c.id })}>
                  ลงทะเบียนรับสิทธิ์ <i className="ti ti-arrow-right" style={{ marginLeft: 6 }}></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
