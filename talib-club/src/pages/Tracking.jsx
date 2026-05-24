import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";

// --- Firebase Configuration (อ้างอิงจากระบบเดิมของคุณ) ---
const firebaseConfig = {
  apiKey: "AIzaSyAqz8d5xKNI-2LRAzFlTURJgYva0hOe3UE",
  authDomain: "talib-trackingnumber.firebaseapp.com",
  projectId: "talib-trackingnumber",
  storageBucket: "talib-trackingnumber.firebasestorage.app",
  messagingSenderId: "495823490887",
  appId: "1:495823490887:web:59062f61596514eb764662"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Tracking() {
  // --- View & Routing State ---
  const [view, setView] = useState("home"); 
  const [adminTab, setAdminTab] = useState("prep");
  
  // --- Secret Admin Trigger ---
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // --- External Scripts (PDF.js, PapaParse) ---
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // --- Public State ---
  const [userQuery, setUserQuery] = useState("");
  const [userSearchResult, setUserSearchResult] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // --- Admin Engine State ---
  const [csvRows, setCsvRows] = useState([]);
  const [pdfRows, setPdfRows] = useState([]);
  const [matches, setMatches] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [savedRecipients, setSavedRecipients] = useState([]);
  const [extractFiles, setExtractFiles] = useState([]);
  const [extractedRows, setExtractedRows] = useState([]);
  const [extractStep, setExtractStep] = useState(1);
  const [isEngineRunning, setIsEngineRunning] = useState(false);

  // โหลด Scripts เมื่อเริ่มต้น
  useEffect(() => {
    if (window.pdfjsLib && window.Papa) { setScriptsLoaded(true); return; }
    const loadScript = (src) => new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src; script.onload = resolve; document.head.appendChild(script);
    });
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js")
    ]).then(() => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setScriptsLoaded(true);
    });
    if (localStorage.getItem("talib_admin_auth") === "true") setIsAdminAuthenticated(true);
  }, []);

  // โหลดฐานข้อมูลเมื่อเปลี่ยนแท็บ
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (adminTab === "prep-manage") fetchRecipients();
    if (adminTab === "manage") fetchRecords();
  }, [adminTab, isAdminAuthenticated]);

  // ==========================================
  // ★ FIREBASE OPERATIONS
  // ==========================================
  const fetchRecipients = async () => {
    setIsEngineRunning(true);
    try {
      const snap = await getDocs(collection(db, "recipients"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.csvIndex || 0) - (b.csvIndex || 0));
      setSavedRecipients(items);
    } catch (e) { console.error(e); }
    setIsEngineRunning(false);
  };

  const fetchRecords = async () => {
    setIsEngineRunning(true);
    try {
      const snap = await getDocs(collection(db, "records"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setSavedRecords(items);
    } catch (e) { console.error(e); }
    setIsEngineRunning(false);
  };

  const handlePublicSearch = async (e, mode) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setIsUserLoading(true); setUserSearchResult(null);
    try {
      const targetCol = mode === "recipient" ? "recipients" : "records";
      const snap = await getDocs(collection(db, targetCol));
      const qClean = userQuery.trim().toLowerCase().replace(/\s+/g, '');
      const found = snap.docs.map(d => d.data()).filter(item => 
        (item.fullName || "").toLowerCase().replace(/\s+/g, '').includes(qClean) ||
        (item.phone || "").replace(/[-\s]/g, '').includes(qClean)
      );
      setUserSearchResult(found.length > 0 ? found : "NOT_FOUND");
    } catch (err) { console.error(err); }
    setIsUserLoading(false);
  };

  // ==========================================
  // ★ PDF EXTRACTOR LOGIC
  // ==========================================
  const parsePDFToRows = async (file) => {
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    let allText = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      allText = allText.concat(tc.items.map(it => ({ str: it.str.trim(), y: it.transform[5] })));
    }
    // Logic สกัดอย่างง่าย (Simplified for React State)
    const rawLines = allText.filter(t => t.str.length > 2).map(t => t.str);
    const results = [];
    const seen = new Set();
    
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].replace(/\s+/g, '');
      const trMatch = line.match(/[A-Z]{2}\d{9}TH/i) || line.match(/^[JP]\d{10,}/i);
      if (trMatch) {
        let tracking = trMatch[0].toUpperCase();
        if (seen.has(tracking)) continue;
        seen.add(tracking);
        
        // หารหัสไปรษณีย์ใกล้เคียง
        let zip = "";
        for (let j = Math.max(0, i - 5); j <= Math.min(rawLines.length - 1, i + 5); j++) {
          const zMatch = rawLines[j].match(/\b\d{5}\b/);
          if (zMatch) { zip = zMatch[0]; break; }
        }
        
        // หาชื่อผู้รับ
        let name = "";
        const pdfType = tracking.startsWith("J") || tracking.startsWith("P") ? "postsabuy" : "thaipost";
        if (pdfType === "thaipost") {
           const parts = rawLines[i].split(/\s+/).filter(p => p !== tracking && p !== zip && p.length > 2);
           name = parts.join(" ");
        } else {
           for (let j = i; j <= Math.min(rawLines.length - 1, i + 10); j++) {
              if (rawLines[j].includes("ผู้รับ")) {
                 name = rawLines[j].replace(/.*ผู้รับ\s*[:;]?\s*/, '').split(/โทร/)[0].trim();
                 break;
              }
           }
        }
        results.push({ tracking, postalCode: zip, recipientName: name || "(สกัดชื่อไม่สำเร็จ)", pdfType });
      }
    }
    return results;
  };

  const runExtract = async () => {
    if (!extractFiles.length) return;
    setIsEngineRunning(true); setExtractStep(2);
    try {
      let combined = [];
      for (const f of extractFiles) {
        const parsed = await parsePDFToRows(f);
        combined.push(...parsed);
      }
      setExtractedRows(combined); setExtractStep(3);
    } catch(e) { alert("Error parsing PDF"); setExtractStep(1); }
    setIsEngineRunning(false);
  };

  // ==========================================
  // ★ FUZZY MATCHING ENGINE
  // ==========================================
  const lcsLength = (a, b) => {
    if (!a || !b) return 0;
    const dp = Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
      let prev = 0;
      for (let j = 1; j <= b.length; j++) {
        const t = dp[j];
        dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
        prev = t;
      }
    }
    return dp[b.length];
  };

  const getFuzzyScore = (csv, pdf) => {
    const csvName = (csv.fullName || "").replace(/\s/g,'').toLowerCase();
    const pdfName = (pdf.recipientName || "").replace(/\s/g,'').toLowerCase();
    const csvZip = (csv.postalCode || "").trim();
    const pdfZip = (pdf.postalCode || "").trim();
    
    let zipMatch = 0;
    if (csvZip && pdfZip) {
      if (csvZip !== pdfZip) return 0; // Zip ไม่ตรงปัดตก
      zipMatch = 20; // Zip ตรงให้โบนัส
    }

    if (csvName === pdfName) return 100;
    if (csvName.includes(pdfName) || pdfName.includes(csvName)) return 90;
    
    const l = lcsLength(csvName, pdfName);
    const ratio = (l * 2) / (csvName.length + pdfName.length);
    let nameScore = ratio >= 0.75 ? 80 : (ratio >= 0.5 ? 50 : 0);
    
    return Math.min(100, nameScore + zipMatch);
  };

  const runMatching = () => {
    setIsEngineRunning(true);
    setTimeout(() => {
      const results = [];
      const usedPdf = new Set();
      
      csvRows.forEach((csv, cIdx) => {
        let bestMatch = null;
        let bestScore = 0;
        
        pdfRows.forEach((pdf, pIdx) => {
          if (usedPdf.has(pIdx)) return;
          const score = getFuzzyScore(csv, pdf);
          if (score > bestScore && score > 40) { bestScore = score; bestMatch = pIdx; }
        });

        if (bestMatch !== null) {
          usedPdf.add(bestMatch);
          results.push({ csvIdx: cIdx, pdfIdx: bestMatch, score: bestScore, status: bestScore >= 80 ? "high" : "med", confirmed: bestScore >= 80 });
        } else {
          results.push({ csvIdx: cIdx, pdfIdx: null, score: 0, status: "none", confirmed: false });
        }
      });
      
      pdfRows.forEach((pdf, pIdx) => {
        if (!usedPdf.has(pIdx)) {
          results.push({ csvIdx: null, pdfIdx: pIdx, score: 0, status: "none", confirmed: false });
        }
      });
      
      setMatches(results.sort((a, b) => b.score - a.score));
      setIsEngineRunning(false);
    }, 500);
  };

  const saveConfirmedMatches = async () => {
    const toSave = matches.filter(m => m.confirmed && m.csvIdx !== null && m.pdfIdx !== null);
    if (!toSave.length) { alert("ไม่มีรายการที่ยืนยันการจับคู่"); return; }
    
    setIsEngineRunning(true);
    try {
      const batch = writeBatch(db);
      toSave.forEach(m => {
        const csv = csvRows[m.csvIdx];
        const pdf = pdfRows[m.pdfIdx];
        const ref = doc(collection(db, "records"));
        batch.set(ref, {
          fullName: csv.fullName, phone: csv.phone || "", address: csv.address || "",
          postalCode: pdf.postalCode || csv.postalCode || "", trackingNumber: pdf.tracking,
          status: "จัดส่งสำเร็จ", courier: pdf.pdfType, createdAt: Timestamp.now()
        });
      });
      await batch.commit();
      alert(`บันทึกสำเร็จ ${toSave.length} พัสดุ!`);
      setAdminTab("manage");
    } catch(e) { console.error(e); alert("เกิดข้อผิดพลาดในการบันทึก"); }
    setIsEngineRunning(false);
  };

  // --- Handlers ---
  const handleSecretClick = () => {
    if (secretClickCount >= 2) {
      setView("admin-login"); setSecretClickCount(0);
    } else {
      setSecretClickCount(prev => prev + 1);
      setTimeout(() => setSecretClickCount(0), 1500);
    }
  };

  return (
    <div className="tracking-wrapper animate-fade-in" style={{ color: "var(--text)" }}>
      
      {/* ========================================================= */}
      {/* 🏠 VIEW 1: HOME (PUBLIC) */}
      {/* ========================================================= */}
      {view === "home" && (
        <div style={{ textAlign: "center", padding: "60px 16px" }}>
          {/* 📮 Easter Egg Trigger */}
          <div onClick={handleSecretClick} style={{ fontSize: "64px", marginBottom: "16px", cursor: "pointer", display: "inline-block", userSelect: "none", transition: "transform 0.1s" }} className="hover:scale-110">
            📮
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "12px", color: "var(--text)" }}>Talib Club Logistics</h1>
          <p style={{ color: "var(--t2)", marginBottom: "48px", fontSize: "15px" }}>ระบบตรวจสอบสิทธิ์รายชื่อจองหนังสือ และติดตามสถานะพัสดุ</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "700px", margin: "0 auto" }}>
            <div className="card" style={{ padding: "40px 24px", cursor: "pointer", borderTop: "4px solid var(--teal)", transition: "all 0.3s" }} onClick={() => { setView("user-recipient"); setUserQuery(""); setUserSearchResult(null); }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
              <h2 style={{ color: "var(--teal)", marginBottom: "8px", fontSize: "20px" }}>ตรวจสอบรายชื่อ</h2>
              <p style={{ fontSize: "13px", color: "var(--t2)" }}>เช็คความถูกต้องและยืนยันสิทธิ์รับวารสารรอบล่าสุด (ก่อนทำการจัดส่ง)</p>
            </div>
            <div className="card" style={{ padding: "40px 24px", cursor: "pointer", borderTop: "4px solid var(--acc)", transition: "all 0.3s" }} onClick={() => { setView("user-track"); setUserQuery(""); setUserSearchResult(null); }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <h2 style={{ color: "var(--text)", marginBottom: "8px", fontSize: "20px" }}>ตรวจสอบเลข Track</h2>
              <p style={{ fontSize: "13px", color: "var(--t2)" }}>ค้นหารหัสไปรษณีย์และเลขพัสดุสำหรับกล่องที่ดำเนินการส่งออกไปแล้ว</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔍 VIEW 2: PUBLIC SEARCH RESULTS */}
      {/* ========================================================= */}
      {(view === "user-recipient" || view === "user-track") && (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setView("home")}>← กลับหน้าหลัก</button>
            <span className="badge badge-teal" style={{ fontSize: "12px" }}>{view === "user-recipient" ? "ระบบเตรียมจัดส่ง" : "ระบบติดตามพัสดุ"}</span>
          </div>

          <h1 style={{ fontSize: "28px", marginBottom: "24px", fontWeight: "600" }}>
            {view === "user-recipient" ? "ตรวจสอบรายชื่อรับวารสาร" : "ติดตามเลขพัสดุจัดส่ง"}
          </h1>

          <div className="card" style={{ padding: "24px", marginBottom: "32px", border: "1px solid var(--br2)" }}>
            <form onSubmit={(e) => handlePublicSearch(e, view === "user-recipient" ? "recipient" : "track")} style={{ display: "flex", gap: "12px", flexDirection: "column", sm: { flexDirection: "row"} }}>
              <label style={{ fontSize: "13px", color: "var(--t2)", fontWeight: "500" }}>ค้นหาด้วย ชื่อ-นามสกุล หรือ เบอร์โทรศัพท์</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <input type="text" className="inp" placeholder="พิมพ์ข้อมูลที่นี่..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} style={{ flex: 1, padding: "12px 16px", fontSize: "15px" }} />
                <button type="submit" className="btn btn-teal" disabled={isUserLoading} style={{ padding: "0 24px" }}>
                  {isUserLoading ? "⏳" : "ค้นหา"}
                </button>
              </div>
            </form>
          </div>

          {userSearchResult === "NOT_FOUND" && (
            <div className="empty card" style={{ border: "1px dashed var(--br)", padding: "48px 24px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <p style={{ color: "var(--text)", fontWeight: "500", fontSize: "16px" }}>ไม่พบข้อมูลสำหรับ "{userQuery}"</p>
              <p style={{ fontSize: "13px", marginTop: "8px" }}>กรุณาตรวจสอบตัวสะกด หรือติดต่อแอดมินเพจหากคุณมีสิทธิ์รับหนังสือ</p>
            </div>
          )}

          {Array.isArray(userSearchResult) && userSearchResult.map((item, idx) => (
             <div key={idx} className="card animate-fade-in" style={{ padding: "0", overflow: "hidden", marginBottom: "20px", border: "1px solid var(--br2)" }}>
               <div style={{ background: "var(--teal-bg)", padding: "16px 24px", borderBottom: "1px solid var(--br2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <h3 style={{ color: "var(--teal)", margin: 0, fontSize: "16px" }}>ข้อมูลผู้รับสิทธิ์</h3>
                 {item.status && <span className="badge badge-teal">{item.status}</span>}
               </div>
               <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
                 <div>
                    <div style={{ color: "var(--t2)", fontSize: "12px", marginBottom: "4px" }}>ชื่อผู้รับ</div>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)" }}>{item.fullName}</div>
                 </div>
                 {item.phone && (
                   <div>
                      <div style={{ color: "var(--t2)", fontSize: "12px", marginBottom: "4px" }}>เบอร์โทรศัพท์</div>
                      <div style={{ fontSize: "15px", color: "var(--text)" }}>{item.phone}</div>
                   </div>
                 )}
                 {item.trackingNumber ? (
                   <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px dashed var(--br2)" }}>
                     <div style={{ color: "var(--t2)", fontSize: "12px", marginBottom: "8px" }}>เลข Tracking (พัสดุไปรษณีย์)</div>
                     <div style={{ background: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--br2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: "700", color: "var(--teal)", letterSpacing: "1px" }}>{item.trackingNumber}</span>
                       <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard.writeText(item.trackingNumber)}>📋 คัดลอก</button>
                     </div>
                   </div>
                 ) : (
                   <div style={{ marginTop: "8px", padding: "16px", background: "var(--acc2)", borderRadius: "8px", color: "var(--teal)", fontSize: "14px", fontWeight: "500", display: "flex", gap: "8px", alignItems: "center" }}>
                     <span>✅</span> ท่านมีรายชื่ออยู่ในคลังระบบเตรียมการจัดส่งแล้ว
                   </div>
                 )}
               </div>
             </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔐 VIEW 3: ADMIN LOGIN */}
      {/* ========================================================= */}
      {view === "admin-login" && (
        <div style={{ maxWidth: "400px", margin: "80px auto" }}>
          <div className="card" style={{ padding: "32px", textAlign: "center", borderTop: "4px solid var(--text)" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔐</div>
            <h1 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: "600" }}>Admin Access</h1>
            <p style={{ color: "var(--t2)", fontSize: "13px", marginBottom: "24px" }}>ระบบจัดการโลจิสติกส์หลังบ้าน</p>
            <input type="password" className="inp" placeholder="รหัสผ่าน..." value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ marginBottom: "16px", textAlign: "center", letterSpacing: "2px" }} />
            <button className="btn btn-main style-full" style={{ width: "100%" }} onClick={() => {
              if (adminPassword === "admin1234") { setIsAdminAuthenticated(true); localStorage.setItem("talib_admin_auth", "true"); setView("admin-dashboard"); } else { alert("รหัสผ่านไม่ถูกต้อง"); }
            }}>เข้าสู่แผงควบคุม</button>
            <button className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: "12px", border: "none" }} onClick={() => setView("home")}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🎛️ VIEW 4: ADMIN DASHBOARD (THE STUDIO) */}
      {/* ========================================================= */}
      {view === "admin-dashboard" && isAdminAuthenticated && (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text)" }}>Logistics Control Station</h1>
              <p style={{ fontSize: "14px", color: "var(--t2)", marginTop: "4px" }}>ระบบจัดการพัสดุและวิเคราะห์ข้อมูลอัตโนมัติครบวงจร</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-outline btn-sm" onClick={() => setView("home")}>🏠 มุมมองผู้ใช้</button>
              <button className="btn btn-outline btn-sm" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={() => { setIsAdminAuthenticated(false); localStorage.removeItem("talib_admin_auth"); setView("home"); }}>ออกจากระบบ</button>
            </div>
          </div>

          {/* Admin Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--br)", paddingBottom: "12px", marginBottom: "24px", overflowX: "auto", whiteSpace: "nowrap" }}>
            {[
              { id: "prep", icon: "📥", label: "อัปโหลดรายชื่อ" },
              { id: "extract", icon: "🔄", label: "แปลง PDF ไปรษณีย์" },
              { id: "match", icon: "📊", label: "สตูดิโอจับคู่ (Matching)" },
              { id: "prep-manage", icon: "📝", label: "คลังเตรียมส่ง" },
              { id: "manage", icon: "🗂️", label: "คลังส่งออกแล้ว" }
            ].map(t => (
              <button key={t.id} onClick={() => setAdminTab(t.id)} className={`btn btn-sm ${adminTab === t.id ? "btn-teal" : "btn-outline"}`} style={{ border: adminTab !== t.id ? "1px solid transparent" : "" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* --- TAB: PREP (Upload CSV) --- */}
          {adminTab === "prep" && (
            <div className="card" style={{ padding: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>📥 1. อัปโหลดรายชื่อจาก Google Sheet (CSV)</h3>
              <p style={{ fontSize: "14px", color: "var(--t2)", marginBottom: "24px" }}>ใช้สำหรับเตรียมข้อมูลตั้งต้นให้ผู้รับตรวจสอบสิทธิ์ หรือเตรียมจับคู่</p>
              
              <div style={{ border: "2px dashed var(--br2)", borderRadius: "12px", padding: "40px 24px", textAlign: "center", background: "var(--bg)", cursor: "pointer" }} onClick={() => document.getElementById('csv-uploader').click()}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
                <div style={{ fontWeight: "500", color: "var(--teal)", marginBottom: "4px" }}>คลิกเพื่อเลือกไฟล์ CSV</div>
                <div style={{ fontSize: "12px", color: "var(--t3)" }}>หรือลากไฟล์มาวางที่นี่</div>
                <input id="csv-uploader" type="file" accept=".csv" className="hidden" style={{ display: 'none' }} onChange={(e) => {
                  if (!e.target.files[0] || !window.Papa) return;
                  window.Papa.parse(e.target.files[0], {
                    header: true, skipEmptyLines: true, complete: (res) => {
                      const parsed = res.data.map(r => ({ fullName: r["ชื่อ-นามสกุล"] || r["ชื่อ"] || Object.values(r)[0], phone: (r["เบอร์โทร"] || "").replace(/[-\s]/g, ''), postalCode: (r["ที่อยู่"] || "").match(/\b\d{5}\b/)?.[0] || "" })).filter(x => x.fullName);
                      setCsvRows(parsed); alert(`โหลดสำเร็จ ${parsed.length} รายการ แนะนำให้ไปที่แท็บ 'สตูดิโอจับคู่'`);
                    }
                  });
                }} />
              </div>
              {csvRows.length > 0 && <div style={{ marginTop: "16px", padding: "12px", background: "var(--teal-bg)", color: "var(--teal)", borderRadius: "8px", fontWeight: "500" }}>✅ โหลดข้อมูลพร้อมใช้งาน: {csvRows.length} รายการ</div>}
            </div>
          )}

          {/* --- TAB: EXTRACT PDF --- */}
          {adminTab === "extract" && (
            <div className="card" style={{ padding: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>🔄 2. สกัดข้อมูลจาก PDF ไปรษณีย์ไทย</h3>
              <p style={{ fontSize: "14px", color: "var(--t2)", marginBottom: "24px" }}>ดึงเลข Tracking และรหัสไปรษณีย์ออกมาอัตโนมัติ เพื่อความแม่นยำในการจับคู่</p>
              
              <input type="file" multiple accept=".pdf" className="inp" onChange={(e) => setExtractFiles(Array.from(e.target.files))} style={{ marginBottom: "16px" }} />
              {extractFiles.length > 0 && extractStep === 1 && <button className="btn btn-main" onClick={runExtract}>🚀 เริ่มรันตัวสกัดข้อมูล ({extractFiles.length} ไฟล์)</button>}
              
              {isEngineRunning && <div style={{ padding: "24px", textAlign: "center", color: "var(--teal)" }}>⏳ กำลังประมวลผล PDF...</div>}

              {extractStep === 3 && (
                <div style={{ marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "16px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--br2)" }}>
                     <div>
                       <span style={{ fontSize: "14px", color: "var(--t2)" }}>สกัดสำเร็จ: </span>
                       <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--teal)" }}>{extractedRows.length}</span>
                       <span style={{ fontSize: "14px", color: "var(--t2)" }}> รายการ</span>
                     </div>
                     <button className="btn btn-teal" onClick={() => { setPdfRows(extractedRows); setAdminTab("match"); }}>➡️ โยนข้อมูลเข้าสตูดิโอจับคู่</button>
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid var(--br2)", borderRadius: "8px" }}>
                    <table style={{ width: "100%", fontSize: "13px", textAlign: "left", borderCollapse: "collapse" }}>
                      <thead style={{ background: "var(--bg)", position: "sticky", top: 0 }}>
                        <tr><th style={{ padding: "12px 16px" }}>Tracking</th><th style={{ padding: "12px 16px" }}>ชื่อผู้รับ (PDF)</th><th style={{ padding: "12px 16px" }}>รหัสไปรษณีย์</th></tr>
                      </thead>
                      <tbody>
                        {extractedRows.map((r, i) => (
                          <tr key={i} style={{ borderTop: "1px solid var(--br2)" }}>
                            <td style={{ padding: "10px 16px", fontFamily: "monospace", fontWeight: "600", color: "var(--text)" }}>{r.tracking}</td>
                            <td style={{ padding: "10px 16px", color: "var(--t2)" }}>{r.recipientName}</td>
                            <td style={{ padding: "10px 16px" }}>{r.postalCode || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TAB: MATCHING STUDIO (THE CORE UI) --- */}
          {adminTab === "match" && (
            <div>
              <div className="card" style={{ padding: "24px", marginBottom: "24px", background: "linear-gradient(to right, var(--card), var(--bg))" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>📊 สตูดิโอจับคู่ไฟล์อัจฉริยะ <span className="badge badge-teal" style={{ fontSize: "10px" }}>Fuzzy Logic Engine</span></h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                   <div style={{ background: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--br2)", borderLeft: csvRows.length ? "3px solid var(--teal)" : "3px solid var(--t3)" }}>
                      <div style={{ fontSize: "12px", color: "var(--t2)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Source 1: Google Sheet</div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: csvRows.length ? "var(--text)" : "var(--t3)" }}>{csvRows.length ? `${csvRows.length} รายการพร้อมแมตช์` : "รอข้อมูล (ไปที่แท็บ 1)"}</div>
                   </div>
                   <div style={{ background: "var(--bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--br2)", borderLeft: pdfRows.length ? "3px solid var(--teal)" : "3px solid var(--t3)" }}>
                      <div style={{ fontSize: "12px", color: "var(--t2)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Source 2: PDF Tracking</div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: pdfRows.length ? "var(--text)" : "var(--t3)" }}>{pdfRows.length ? `${pdfRows.length} เลขพัสดุพร้อมแมตช์` : "รอข้อมูล (ไปที่แท็บ 2)"}</div>
                   </div>
                </div>

                {csvRows.length > 0 && pdfRows.length > 0 && (
                  <button className="btn btn-main style-full" onClick={runMatching} disabled={isEngineRunning} style={{ width: "100%", padding: "14px", fontSize: "15px" }}>
                    {isEngineRunning ? "⏳ กำลังคำนวณสัมประสิทธิ์ความคล้ายคลึง..." : "🔀 รันอัลกอริทึมจับคู่พัสดุอัตโนมัติ"}
                  </button>
                )}
              </div>

              {/* MATCHING RESULTS UI */}
              {matches.length > 0 && !isEngineRunning && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "600" }}>ผลลัพธ์การคัดกรอง ({matches.length} คู่)</div>
                    <button className="btn btn-teal" onClick={saveConfirmedMatches}>💾 บันทึกรายการที่ยืนยันขึ้น Database</button>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {matches.map((m, idx) => {
                      const csv = m.csvIdx !== null ? csvRows[m.csvIdx] : null;
                      const pdf = m.pdfIdx !== null ? pdfRows[m.pdfIdx] : null;
                      const colorMap = { high: "#10b981", med: "#f59e0b", none: "#ef4444" };
                      const labelMap = { high: "มั่นใจสูง", med: "ตรวจสอบ", none: "ไม่พบคู่" };
                      const mainColor = colorMap[m.status];

                      return (
                        <div key={idx} className="card" style={{ padding: "0", overflow: "hidden", border: `1px solid ${m.confirmed ? mainColor : 'var(--br2)'}`, transition: "all 0.2s" }}>
                           {/* Card Header (Score & Badge) */}
                           <div style={{ padding: "10px 16px", background: "var(--bg)", borderBottom: "1px solid var(--br2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                               <span style={{ fontSize: "12px", color: "var(--t3)", fontWeight: "600" }}>#{idx + 1}</span>
                               <span style={{ padding: "4px 10px", background: `${mainColor}20`, color: mainColor, borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{labelMap[m.status]}</span>
                             </div>
                             <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                               {m.score > 0 && <span style={{ fontSize: "13px", color: "var(--t2)", fontWeight: "500" }}>ความแม่นยำ: {m.score}%</span>}
                               <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: m.confirmed ? mainColor : "var(--t2)" }}>
                                 <input type="checkbox" checked={m.confirmed} onChange={(e) => {
                                   const newMatches = [...matches]; newMatches[idx].confirmed = e.target.checked; setMatches(newMatches);
                                 }} style={{ accentColor: mainColor, width: "16px", height: "16px", cursor: "pointer" }} />
                                 {m.confirmed ? "พร้อมเซฟ" : "ยืนยัน"}
                               </label>
                             </div>
                           </div>
                           
                           {/* Progress Bar */}
                           {m.score > 0 && <div style={{ height: "3px", width: "100%", background: "var(--br2)" }}><div style={{ height: "100%", width: `${m.score}%`, background: mainColor, transition: "width 0.5s" }}></div></div>}

                           {/* Data Comparison Grid */}
                           <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", minHeight: "100px", sm: { gridTemplateColumns: "1fr" } }}>
                              {/* Left: CSV */}
                              <div style={{ padding: "16px 20px" }}>
                                <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--t3)", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>📋 ข้อมูลจาก Sheet</div>
                                {csv ? (
                                  <>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text)", marginBottom: "4px" }}>{csv.fullName}</div>
                                    <div style={{ fontSize: "13px", color: "var(--t2)" }}>📞 {csv.phone || "-"}</div>
                                    <div style={{ fontSize: "13px", color: "var(--teal)", fontWeight: "500", marginTop: "8px" }}>📍 รหัสไปรษณีย์: <span style={{ background: "var(--teal-bg)", padding: "2px 6px", borderRadius: "4px" }}>{csv.postalCode || "-"}</span></div>
                                  </>
                                ) : <div style={{ fontSize: "13px", color: "var(--t3)", fontStyle: "italic", marginTop: "12px" }}>ไม่มีข้อมูลใน Sheet</div>}
                              </div>
                              
                              {/* Center Divider */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed var(--br2)", borderRight: "1px dashed var(--br2)", background: "var(--bg)", color: "var(--t3)" }}>➡️</div>
                              
                              {/* Right: PDF */}
                              <div style={{ padding: "16px 20px" }}>
                                <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--t3)", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" }}>📄 ข้อมูลพัสดุ (PDF)</div>
                                {pdf ? (
                                  <>
                                    <div style={{ fontSize: "18px", fontFamily: "monospace", fontWeight: "700", color: "var(--text)", letterSpacing: "1px", marginBottom: "4px" }}>{pdf.tracking}</div>
                                    <div style={{ fontSize: "12px", color: "var(--t2)" }}>(สกัดชื่อ: {pdf.recipientName})</div>
                                    <div style={{ fontSize: "13px", color: "var(--acc)", fontWeight: "500", marginTop: "8px" }}>📍 รหัสไปรษณีย์: <span style={{ background: "var(--acc2)", padding: "2px 6px", borderRadius: "4px" }}>{pdf.postalCode || "-"}</span></div>
                                  </>
                                ) : <div style={{ fontSize: "13px", color: "var(--t3)", fontStyle: "italic", marginTop: "12px" }}>ไม่มีรหัสพัสดุ</div>}
                              </div>
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TAB: MANAGE RECORDS (Database) --- */}
          {(adminTab === "manage" || adminTab === "prep-manage") && (
            <div className="card" style={{ padding: "24px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px" }}>{adminTab === "manage" ? "🗂️ ฐานข้อมูลพัสดุส่งออก" : "📝 ฐานข้อมูลรายชื่อรอจัดส่ง"}</h3>
                  <div style={{ color: "var(--t2)", fontSize: "13px" }}>จำนวนทั้งหมด: <strong style={{ color: "var(--teal)" }}>{adminTab === "manage" ? savedRecords.length : savedRecipients.length}</strong></div>
               </div>
               
               {isEngineRunning ? <div style={{ textAlign: "center", padding: "40px", color: "var(--t3)" }}>⏳ กำลังโหลดข้อมูล...</div> : (
                 <div style={{ overflowX: "auto", border: "1px solid var(--br2)", borderRadius: "8px" }}>
                   <table style={{ width: "100%", fontSize: "13px", textAlign: "left", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
                     <thead style={{ background: "var(--bg)" }}>
                       <tr>
                         <th style={{ padding: "12px 16px" }}>ชื่อผู้รับ</th>
                         <th style={{ padding: "12px 16px" }}>เบอร์โทรศัพท์</th>
                         {adminTab === "manage" && <th style={{ padding: "12px 16px" }}>เลข Tracking</th>}
                         <th style={{ padding: "12px 16px" }}>รหัสไปรษณีย์</th>
                       </tr>
                     </thead>
                     <tbody>
                       {(adminTab === "manage" ? savedRecords : savedRecipients).map((r, i) => (
                         <tr key={i} style={{ borderTop: "1px solid var(--br2)" }}>
                           <td style={{ padding: "10px 16px", fontWeight: "500" }}>{r.fullName}</td>
                           <td style={{ padding: "10px 16px", color: "var(--t2)" }}>{r.phone || "-"}</td>
                           {adminTab === "manage" && <td style={{ padding: "10px 16px", fontFamily: "monospace", color: "var(--teal)", fontWeight: "600" }}>{r.trackingNumber}</td>}
                           <td style={{ padding: "10px 16px", color: "var(--t2)" }}>{r.postalCode || "-"}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
