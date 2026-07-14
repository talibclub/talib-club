import React from "react"
import { toast } from "react-hot-toast"
import { SITE } from "../data/index.js"
import { useSiteSettings } from "../lib/contentStore.js"
import SEOHead, { BASE_URL } from '../components/SEOHead.jsx'

export default function Donation() {
  // ดึงข้อมูลการตั้งค่าเว็บล่าสุดจากฐานข้อมูล
  const { site } = useSiteSettings(SITE)

  // ข้อมูลบัญชีธนาคารจากโปสเตอร์
  const bankAccounts = [
    {
      id: 1,
      bankName: "ธนาคารไทยพาณิชย์ (SCB)",
      accountName: "นายสอบรีย์ บิลังโหลด",
      accountNumber: "704-287501-5",
      tag: "สมทบทุน",
      logo: "/scb-logo.png",
      qrImage: "/scb-qr.png"
    }
  ]

  // ฟังก์ชันกดคัดลอกเลขบัญชี
  const handleCopy = async (number) => {
    try {
      await navigator.clipboard.writeText(number.replace(/-/g, ""))
    } catch {
      toast.error("คัดลอกไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง")
      return
    }
    toast.success("คัดลอกเลขบัญชีเรียบร้อยแล้ว", {
      icon: '✅',
      style: {
        background: '#e0f2f1',
        color: '#047857',
        border: '1px solid #10b981'
      },
    })
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <SEOHead
        title="ร่วมบริจาคสนับสนุน Talib Club | Talib Club"
        description="ร่วมสมทบทุนเพื่อเผยแพร่ความรู้อิสลามวิชาการในภาษาไทย สนับสนุนการแปล จัดพิมพ์ และเผยแพร่หนังสืออิสลาม"
        canonical={`${BASE_URL}/donate`}
      />
      <div style={{ marginBottom: 30, padding: "0 20px" }}>
        <h1 style={{ fontSize: 28, color: "var(--teal)", marginBottom: 8 }}>ร่วมสมทบทุน</h1>
        <p style={{ color: "var(--t2)", fontSize: 16 }}>เป็นส่วนหนึ่งในการทำงานดะวะฮฺของกลุ่มฏอลิบ</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30, padding: "0 20px" }}>
        
        {/* ฝั่งซ้าย: บัญชีธนาคาร และ วัตถุประสงค์ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Card บัญชีธนาคาร พร้อม QR Code */}
          {bankAccounts.map((acc) => (
            <div key={acc.id} style={{ 
              border: "1px solid var(--acc-br)", 
              borderRadius: 12, 
              padding: 20, 
              background: "var(--acc2)",
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap"
            }}>
              
              {/* ส่วนแสดง QR Code */}
              <div style={{ 
                background: "var(--card)", 
                padding: 12, 
                borderRadius: 12, 
                border: "1px solid var(--br)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <img src={acc.qrImage} alt="QR Code" style={{ width: 130, height: 130, objectFit: "contain" }} />
                <span style={{ fontSize: 12, color: "var(--teal)", marginTop: 8, fontWeight: 500 }}>สแกนเพื่อโอนเงิน</span>
              </div>

              {/* ส่วนแสดงข้อมูลบัญชี */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <img src={acc.logo} alt={acc.bankName} style={{ width: 32, height: 32, objectFit: "contain" }} />
                  <h3 style={{ margin: 0, fontSize: 16, color: "var(--text)" }}>{acc.bankName}</h3>
                  <span style={{ fontSize: 12, background: "var(--teal-bg)", color: "var(--teal)", padding: "2px 8px", borderRadius: 12 }}>{acc.tag}</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, fontSize: 14, marginTop: 12 }}>
                  <span style={{ color: "var(--t3)" }}>ชื่อบัญชี:</span>
                  <strong style={{ color: "var(--text)" }}>{acc.accountName}</strong>
                  
                  <span style={{ color: "var(--t3)", alignSelf: "center" }}>เลขบัญชี:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 16, color: "var(--text)" }}>{acc.accountNumber}</strong>
                    <button 
                      onClick={() => handleCopy(acc.accountNumber)}
                      style={{ 
                        background: "var(--teal)", border: "none", color: "#fff", cursor: "pointer", 
                        display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "4px 10px", borderRadius: 6
                      }}
                    >
                      <i className="ti ti-copy"></i> คัดลอก
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}

          {/* Card วัตถุประสงค์ */}
          <div style={{ border: "1px solid var(--br)", borderRadius: 12, padding: 24, background: "var(--card)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: "var(--text)" }}>
              เงินบริจาคจะถูกนำไปใช้ในการ:
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--t2)", fontSize: 14, lineHeight: 1.8 }}>
              <li>แปลและแจกหนังสือทั้งรูปแบบเล่มและไฟล์</li>
              <li>พัฒนาเว็บไซต์</li>
              <li>ค่าใช้จ่ายในเรื่องของอาคารและที่เก็บหนังสือ/อุปกรณ์</li>
              <li>ผลิตเนื้อหาออนไลน์</li>
              <li>พัฒนากลุ่มและอุปกรณ์สำหรับงานดะวะฮฺ</li>
              <li>และอื่นๆ</li>
            </ul>
          </div>

        </div>

        {/* ฝั่งขวา: ขั้นตอนการบริจาคและช่องทางติดตาม */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div style={{ border: "1px solid var(--br)", borderRadius: 12, padding: 24, background: "var(--card)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-check" style={{ color: "var(--teal)" }}></i> วิธีการบริจาค
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <StepItem number="1" title="สแกน QR Code หรือคัดลอกเลขบัญชี" desc="ใช้แอปพลิเคชันธนาคารของคุณสแกน QR Code หรือคัดลอกเลขบัญชี SCB ด้านซ้าย" />
              <StepItem number="2" title="สนับสนุนการทำงานของกลุ่ม" desc="ญะซากุมุลลอฮุค็อยร็อน (ขออัลลอฮฺทรงตอบแทนความดีงามแก่ท่าน) สำหรับการมีส่วนร่วมในงานดะวะฮฺ" />
            </div>
          </div>

         {/* Card ช่องทางติดตามผลงาน */}
          <div style={{ border: "1px solid var(--br)", borderRadius: 12, padding: 24, background: "var(--bg2)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "var(--text)" }}>
              ติดตามผลงานของเราได้ตามช่องทาง
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, color: "var(--text)" }}>
              
              {site?.social?.facebook && (
                <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#1877F2"} onMouseOut={(e) => e.target.style.color = "inherit"}>
                  <i className="ti ti-brand-facebook"></i>
                </a>
              )}
              
              {site?.social?.instagram && (
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#E4405F"} onMouseOut={(e) => e.target.style.color = "inherit"}>
                  <i className="ti ti-brand-instagram"></i>
                </a>
              )}
              
              {site?.social?.tiktok && (
                <a href={site.social.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#000000"} onMouseOut={(e) => e.target.style.color = "inherit"}>
                  <i className="ti ti-brand-tiktok"></i>
                </a>
              )}
              
              {site?.social?.youtube && (
                <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#FF0000"} onMouseOut={(e) => e.target.style.color = "inherit"}>
                  <i className="ti ti-brand-youtube"></i>
                </a>
              )}
              
              {site?.social?.spotify && (
                <a href={site.social.spotify} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#1DB954"} onMouseOut={(e) => e.target.style.color = "inherit"}>
                  <i className="ti ti-brand-spotify"></i>
                </a>
              )}

              <span style={{ fontSize: 16, fontWeight: "bold", marginLeft: 4, color: "var(--text)" }}>Talib Club</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Component ย่อยสำหรับแสดงตัวเลขขั้นตอน
function StepItem({ number, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ 
        width: 28, height: 28, borderRadius: "50%", background: "var(--teal)", color: "#fff", 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold", flexShrink: 0 
      }}>
        {number}
      </div>
      <div>
        <h4 style={{ margin: "0 0 4px 0", fontSize: 15, color: "var(--text)" }}>{title}</h4>
        <p style={{ margin: 0, fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  )
}