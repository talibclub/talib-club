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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .campaign-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid var(--br);
          border-radius: 24px;
          background: var(--bg);
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .campaign-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: var(--teal-alpha-30);
        }
        .campaign-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          background: var(--bg2);
          border: 1px solid var(--br);
        }
        .book-img-container {
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .book-item:hover .book-img-container {
          transform: translateY(-10px) scale(1.05);
        }
        .premium-btn {
          background: linear-gradient(135deg, var(--teal), #2b8a3e);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(18, 184, 134, 0.25);
          display: inline-flex;
          alignItems: center;
          gap: 8px;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(18, 184, 134, 0.35);
        }
        .premium-btn:active {
          transform: translateY(1px);
          box-shadow: 0 4px 10px rgba(18, 184, 134, 0.2);
        }
      `}} />

      <div style={{ textAlign: "center", marginBottom: 50, position: "relative" }}>
        <div style={{ 
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", 
          width: 300, height: 300, background: "var(--teal)", filter: "blur(120px)", opacity: 0.12, zIndex: -1 
        }} />
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, background: "linear-gradient(135deg, var(--teal), #2b8a3e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          แจก / สั่งซื้อหนังสือ
        </h1>
        <p style={{ color: "var(--t2)", fontSize: 16, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
          ศูนย์รวมการลงทะเบียนรับสิทธิ์หนังสือและสื่อความรู้จาก Talib Club
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <i className="ti ti-loader-2 spin" style={{ fontSize: 32, color: "var(--teal)" }}></i>
          <p style={{ marginTop: 16, color: "var(--t2)", fontWeight: 500 }}>กำลังโหลดแคมเปญล่าสุด...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 80, color: "var(--t3)", borderRadius: 24, border: "1px dashed var(--br)" }}>
          <i className="ti ti-book-off" style={{ fontSize: 64, marginBottom: 24, opacity: 0.3 }}></i>
          <h3 style={{ fontSize: 20, color: "var(--t2)", marginBottom: 8 }}>ยังไม่มีแคมเปญในขณะนี้</h3>
          <p>รอติดตามการแจกหนังสือรอบถัดไปได้เร็วๆ นี้</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {campaigns.map(c => (
            <div key={c.id} className="campaign-card">
              {/* Top Accent Line */}
              <div style={{ height: 6, width: "100%", background: "linear-gradient(90deg, var(--teal), #38d9a9)" }} />
              
              <div style={{ padding: "40px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <h2 style={{ margin: "0 0 16px 0", fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>{c.title}</h2>
                    {c.description && (
                      <p style={{ color: "var(--t2)", margin: "0 0 24px 0", fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {c.description}
                      </p>
                    )}
                    
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div className="campaign-badge" style={{ color: "#d97706", background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" }}>
                        <i className="ti ti-ticket" style={{ fontSize: 16 }}></i> โควตา {c.quota} สิทธิ์
                      </div>
                      <div className="campaign-badge" style={{ color: "var(--teal)", background: "rgba(18, 184, 134, 0.1)", borderColor: "rgba(18, 184, 134, 0.2)" }}>
                        <i className="ti ti-truck-delivery" style={{ fontSize: 16 }}></i> {c.shippingFee > 0 ? `ค่าจัดส่ง ${c.shippingFee} ฿` : "จัดส่งฟรี!"}
                      </div>
                      <div className="campaign-badge" style={{ color: "var(--t2)" }}>
                        <i className="ti ti-clock-stopwatch" style={{ fontSize: 16 }}></i> ให้เวลาโอน {c.timeLimit} นาที
                      </div>
                    </div>
                  </div>
                </div>

                {c.items && c.items.length > 0 && (
                  <div style={{ 
                    marginTop: 32, paddingTop: 32, borderTop: "1px dashed var(--br)", 
                    display: "flex", gap: 24, overflowX: "auto", paddingBottom: 24, scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch"
                  }}>
                    {c.items.map((item, idx) => (
                      <div key={idx} className="book-item" style={{ width: 130, flexShrink: 0 }}>
                        <div className="book-img-container" style={{ width: "100%", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 24px rgba(0,0,0,0.12)", marginBottom: 16 }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", background: "var(--bg3)", color: "var(--t3)" }}>
                              <i className="ti ti-book" style={{ fontSize: 40 }}></i>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, textAlign: "center", color: "var(--text)", lineHeight: 1.4 }}>{item.name}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <button 
                    className="premium-btn"
                    onClick={() => go("book-register", { campaignId: c.id })}
                  >
                    ลงทะเบียนรับสิทธิ์ <i className="ti ti-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
