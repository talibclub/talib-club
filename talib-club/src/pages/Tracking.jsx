import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from ""../src/lib/firebase""; // ดึงการเชื่อมต่อมาจากไฟล์ที่เราสร้าง

export default function Tracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResult(null);
    setErrorMsg("");

    try {
      const trackingRef = collection(db, "tracking");
      
      const qTracking = query(trackingRef, where("trackingNumber", "==", searchQuery.trim()));
      const trackingSnapshot = await getDocs(qTracking);
      
      const qName = query(trackingRef, where("recipientName", "==", searchQuery.trim()));
      const nameSnapshot = await getDocs(qName);

      let foundData = null;

      if (!trackingSnapshot.empty) {
        foundData = { id: trackingSnapshot.docs[0].id, ...trackingSnapshot.docs[0].data() };
      } else if (!nameSnapshot.empty) {
        foundData = { id: nameSnapshot.docs[0].id, ...nameSnapshot.docs[0].data() };
      }

      if (foundData) {
        setSearchResult(foundData);
      } else {
        setSearchResult("NOT_FOUND");
      }
      
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
      setIsLoading(false);
    }
  };

  return (
    <div className="tracking-page animate-fade-in">
      <div className="sec-hd">
        <h1 className="sec-title" style={{ fontSize: "24px" }}>ติดตามสถานะการจัดส่ง</h1>
      </div>
      <p style={{ marginBottom: "28px" }}>
        ตรวจสอบสถานะการจัดส่งหนังสือและวารสารของ Talib Club ได้ที่นี่ <br/>
        รองรับการค้นหาด้วยเลขพัสดุ หรือชื่อผู้รับ
      </p>

      {/* กล่องค้นหา */}
      <div className="card" style={{ padding: "24px", marginBottom: "32px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1", position: "relative", minWidth: "200px" }}>
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="inp"
              style={{ paddingLeft: "40px" }}
              placeholder="กรอกเลขพัสดุ หรือ ชื่อผู้รับ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-teal" disabled={isLoading} style={{ minWidth: "100px" }}>
            {isLoading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </form>
        {errorMsg && <p style={{ color: "#e74c3c", fontSize: "12px", marginTop: "12px" }}>{errorMsg}</p>}
      </div>

      {/* ไม่พบข้อมูล */}
      {!isLoading && searchResult === "NOT_FOUND" && (
        <div className="empty card animate-fade-in" style={{ border: "1px dashed var(--br2)" }}>
          <p style={{ fontSize: "15px", color: "var(--text)" }}>ไม่พบข้อมูลพัสดุสำหรับ "{searchQuery}"</p>
          <p style={{ marginTop: "8px" }}>กรุณาตรวจสอบความถูกต้องของเลขพัสดุหรือชื่อผู้รับอีกครั้ง</p>
        </div>
      )}

      {/* พบข้อมูล */}
      {!isLoading && searchResult && searchResult !== "NOT_FOUND" && (
        <div className="card animate-fade-in" style={{ padding: "0", overflow: "hidden" }}>
          <div style={{ background: "var(--teal-bg)", padding: "16px 24px", borderBottom: "0.5px solid var(--br2)" }}>
            <h2 style={{ color: "var(--teal)", margin: 0, fontSize: "16px" }}>รายละเอียดการจัดส่ง</h2>
          </div>
          
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--t2)", fontSize: "13px" }}>เลขพัสดุ (Tracking No.)</span>
              <span style={{ fontWeight: "600", color: "var(--text)" }}>{searchResult.trackingNumber}</span>
            </div>
            <div className="divider" style={{ margin: "4px 0" }}></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--t2)", fontSize: "13px" }}>ชื่อผู้รับ</span>
              <span style={{ fontWeight: "500", color: "var(--text)" }}>{searchResult.recipientName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--t2)", fontSize: "13px" }}>บริษัทขนส่ง</span>
              <span style={{ fontWeight: "400", color: "var(--text)" }}>{searchResult.courier || "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--t2)", fontSize: "13px" }}>อัปเดตล่าสุด</span>
              <span style={{ fontWeight: "300", color: "var(--t2)", fontSize: "13px" }}>{searchResult.date || "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", padding: "12px", background: "var(--acc2)", borderRadius: "8px" }}>
              <span style={{ color: "var(--text)", fontSize: "14px", fontWeight: "500" }}>สถานะปัจจุบัน</span>
              <span className={searchResult.status === "จัดส่งสำเร็จ" ? "badge badge-teal" : "badge badge-acc"} style={{ fontSize: "12px" }}>
                {searchResult.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
