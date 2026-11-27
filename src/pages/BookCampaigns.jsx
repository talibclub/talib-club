import React, { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase.js"
import SEOHead, { BASE_URL } from "../components/SEOHead.jsx"

export default function BookCampaigns({ go }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState({})
  const [quotas, setQuotas] = useState({})

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

    // Fetch quotas
    fetch("/api/get-campaign-quotas")
      .then(res => res.json())
      .then(data => setQuotas(data))
      .catch(console.error)
  }, [])

  return (
    <div className="campaigns-container">
      <SEOHead
        title="โครงการแจกหนังสือและสื่อความรู้ | Talib Club"
        description="ศูนย์รวมการลงทะเบียนรับสิทธิ์หนังสือและวารสารวิชาการอิสลามจาก Talib Club"
        canonical={`${BASE_URL}/books`}
      />
      <style dangerouslySetInnerHTML={{__html: `
        .campaigns-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px 60px;
        }
        .campaign-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          border: 1px solid var(--br);
          border-radius: 20px;
          background: var(--card);
          position: relative;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .campaign-card:hover {
          transform: translateY(-4px);
          border-color: var(--acc-br);
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
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .campaign-card:hover .book-img-container {
          transform: translateY(-3px) scale(1.015);
        }
        .premium-btn {
          background: var(--teal);
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          box-shadow: 0 8px 20px rgba(15, 110, 86, 0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .app.dark .premium-btn,
        body.dark .premium-btn {
          color: #06281f;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(15, 110, 86, 0.3);
        }
        .premium-btn:active {
          transform: translateY(0);
        }
        
        .campaign-content-layout {
          display: flex;
          flex-direction: row;
          gap: 48px;
          padding: 48px;
        }
        .campaign-image-side {
          flex: 0 0 260px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .campaign-text-side {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        @media (max-width: 768px) {
          .campaigns-container {
            padding: 32px 12px;
          }
          .campaign-content-layout {
            flex-direction: column;
            gap: 24px;
            padding: 24px 16px;
          }
          .campaign-image-side {
            flex: 1;
            width: 100%;
            align-items: center;
          }
          .book-featured {
            max-width: 260px;
          }
        }
      `}} />

      <div style={{ textAlign: "center", marginBottom: 48, position: "relative" }}>
        <span className="badge badge-teal" style={{ marginBottom: 12, fontSize: 12, padding: "5px 14px" }}>โครงการส่งเสริมการอ่าน</span>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
          แจกหนังสือและสื่อวิชาการ
        </h1>
        <p style={{ color: "var(--t2)", fontSize: 16, maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
          ศูนย์รวมการลงทะเบียนรับสิทธิ์หนังสือและวารสารความรู้จาก Talib Club
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
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {campaigns.map(c => (
            <div key={c.id} className="campaign-card">
              <div style={{ height: 6, width: "100%", background: "linear-gradient(90deg, var(--teal), #38d9a9)" }} />
              
              <div className="campaign-content-layout">
                {/* Left Side: Images */}
                <div className="campaign-image-side">
                  {c.items && c.items.length > 0 ? (
                    (() => {
                      const activeIdx = activeImageIdx[c.id] || 0;
                      const activeItem = c.items[activeIdx] || c.items[0];
                      return (
                        <>
                          {/* Featured Image */}
                          <div className="book-img-container book-featured" style={{ width: "100%", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 32px rgba(0,0,0,0.15)" }}>
                            {activeItem.imageUrl ? (
                              <img src={activeItem.imageUrl} alt={activeItem.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", background: "var(--bg3)", color: "var(--t3)" }}>
                                <i className="ti ti-book" style={{ fontSize: 60 }}></i>
                              </div>
                            )}
                          </div>
                          
                          {/* Thumbnails */}
                          {c.items.length > 1 && (
                            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, marginTop: 8 }}>
                              {c.items.map((item, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setActiveImageIdx(prev => ({ ...prev, [c.id]: idx }))}
                                  style={{ 
                                    width: 64, flexShrink: 0, aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", 
                                    border: activeIdx === idx ? "2px solid var(--teal)" : "1px solid var(--br)", 
                                    opacity: activeIdx === idx ? 1 : 0.6, 
                                    cursor: "pointer",
                                    transition: "all 0.2s" 
                                  }}
                                  onMouseEnter={e => { if (activeIdx !== idx) e.currentTarget.style.opacity = 0.9 }} 
                                  onMouseLeave={e => { if (activeIdx !== idx) e.currentTarget.style.opacity = 0.6 }}
                                >
                                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ background: "var(--bg3)", height: "100%" }} />}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="book-featured" style={{ width: "100%", aspectRatio: "3/4", borderRadius: 16, border: "2px dashed var(--br)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>
                      <i className="ti ti-gift" style={{ fontSize: 60 }}></i>
                    </div>
                  )}
                </div>

                {/* Right Side: Content */}
                <div className="campaign-text-side">
                  <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                    <div className="campaign-badge" style={{ color: "#d97706", background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" }}>
                      <i className="ti ti-ticket" style={{ fontSize: 16 }}></i> {quotas[c.id] ? `โควตาเหลือ ${quotas[c.id].remaining} จาก ${c.quota} สิทธิ์` : `โควตาทั้งหมด ${c.quota} สิทธิ์`}
                    </div>
                    <div className="campaign-badge" style={{ color: "var(--teal)", background: "rgba(18, 184, 134, 0.1)", borderColor: "rgba(18, 184, 134, 0.2)" }}>
                      <i className="ti ti-truck-delivery" style={{ fontSize: 16 }}></i> {c.shippingFee > 0 ? `ค่าจัดส่ง ${c.shippingFee} ฿` : "จัดส่งฟรี!"}
                    </div>
                    <div className="campaign-badge" style={{ color: "var(--t2)", background: "var(--bg3)" }}>
                      <i className="ti ti-clock-stopwatch" style={{ fontSize: 16 }}></i> ให้เวลาโอน {c.timeLimit} นาที
                    </div>
                  </div>

                  <h2 style={{ margin: "0 0 16px 0", fontSize: 36, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>{c.title}</h2>
                  
                  {c.description && (
                    <p style={{ color: "var(--t2)", margin: "0 0 32px 0", fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap", flex: 1 }}>
                      {c.description}
                    </p>
                  )}

                  {c.items && c.items.length > 0 && (
                    <div style={{ marginBottom: 40, padding: "20px 24px", background: "var(--bg2)", borderRadius: 16, border: "1px solid var(--br)" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: "var(--teal)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>หนังสือในแคมเปญนี้</h4>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text)", fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>
                        {c.items.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: c.items.length > 1 ? 6 : 0 }}>{item.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: "auto" }}>
                    {quotas[c.id] && quotas[c.id].remaining <= 0 ? (
                      <button 
                        className="premium-btn"
                        disabled
                        style={{ width: "100%", justifyContent: "center", background: "var(--bg3)", color: "var(--t3)", boxShadow: "none", cursor: "not-allowed" }}
                      >
                        โควตาเต็มแล้ว <i className="ti ti-lock"></i>
                      </button>
                    ) : (
                      <button 
                        className="premium-btn"
                        onClick={() => go("book-register", { campaignId: c.id })}
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        ลงทะเบียนรับสิทธิ์ทันที <i className="ti ti-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
