import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import toast from "react-hot-toast";
import ProNotebook from "../../pages/reading/components/ProNotebook.jsx";
import { deleteNotebookData } from "../../utils/notebookStorage.js";

// Matches NOTEBOOK_COVERS in ProNotebook.
const COVER_GRADIENTS = {
  red: '#ef4444, #b91c1c',
  teal: 'var(--teal), var(--teal-dark)',
  indigo: '#6366f1, #3730a3',
  amber: '#f59e0b, #b45309',
  plum: '#a855f7, #6b21a8',
  forest: '#22c55e, #15803d',
};

export default function NotebookGalleryPanel({ authState, setView }) {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deletingNotebook, setDeletingNotebook] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchNotebooks() {
      if (!authState?.user?.uid) return;
      try {
        const q = query(
          collection(db, "content_notebooks"),
          where("uid", "==", authState.user.uid)
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Client-side sort to avoid missing Firebase composite index error
        fetched.sort((a, b) => {
           const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
           const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
           return timeB - timeA;
        });
        setNotebooks(fetched);
      } catch (err) {
        console.error("Failed to fetch notebooks", err);
        toast.error("ดึงข้อมูลสมุดโน้ตไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    }
    fetchNotebooks();
  }, [authState?.user?.uid]);

  const handleDeleteNotebook = async () => {
    if (!deletingNotebook || !authState?.user?.uid) return;
    setIsDeleting(true);
    try {
      // 1. Delete Firestore metadata doc
      await deleteDoc(doc(db, "content_notebooks", deletingNotebook.id));
      // 2. Delete cloud storage file
      await deleteNotebookData(authState.user.uid, deletingNotebook.bookId);
      // 3. Clear local storage
      try {
        localStorage.removeItem(`talib_notebook_${deletingNotebook.bookId}`);
      } catch (e) { /* ignore */ }

      // 4. Update UI
      setNotebooks(prev => prev.filter(nb => nb.id !== deletingNotebook.id));
      toast.success("ลบสมุดโน้ตเรียบร้อยแล้ว");
      setDeletingNotebook(null);
    } catch (err) {
      console.error("Failed to delete notebook", err);
      toast.error("ลบสมุดโน้ตไม่สำเร็จ: " + (err.message || "เกิดข้อผิดพลาด"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedNotebook) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, background: '#F3F4F6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: 56, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #E5E7EB', flexShrink: 0, gap: 12, flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <button 
                onClick={() => { setSelectedNotebook(null); setEditing(false); }} 
                className="btn btn-outline" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, whiteSpace: 'nowrap', cursor: 'pointer' }}
              >
                 <i className="ti ti-arrow-left"></i> กลับคลังสมุด
              </button>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedNotebook.title || "สมุดโน้ต"}
                </h3>
                <span style={{ fontSize: 11.5, color: editing ? '#059669' : '#6B7280', fontWeight: 500 }}>
                  {editing ? '✏️ โหมดจดโน้ต (แก้ไขได้)' : '📖 โหมดอ่านทบทวน (อ่านอย่างเดียว)'}
                </span>
              </div>
           </div>
           <button
             onClick={() => setEditing(v => !v)}
             className={`btn ${editing ? 'btn-outline' : 'btn-teal'}`}
             style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, whiteSpace: 'nowrap' }}
           >
              <i className={`ti ${editing ? 'ti-eye' : 'ti-pencil'}`}></i> {editing ? 'เปลี่ยนเป็นอ่านอย่างเดียว' : 'เข้าสู่โหมดจดโน้ต'}
           </button>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
           <ProNotebook
             key={editing ? 'edit' : 'view'}
             bookId={selectedNotebook.bookId}
             uid={authState.user.uid}
             activeBook={{ book: { title: selectedNotebook.title || "สมุดโน้ต" } }}
             readonly={!editing}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="panel-fade-in" style={{ textAlign: "left", maxWidth: 1000, margin: "0 auto" }}>
      <button
        onClick={() => setView("overview")}
        className="sec-link"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, background: "none", border: "none", fontFamily: "'Prompt', sans-serif", cursor: "pointer", color: "var(--t2)" }}
      >
        <i className="ti ti-arrow-left"></i> กลับหน้าแดชบอร์ด
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            <i className="ti ti-books" style={{ color: "var(--teal)", fontSize: 28 }}></i> คลังสมุดโน้ต
          </h2>
          <p style={{ fontSize: 14, color: "var(--t2)", marginTop: 6, marginBottom: 0 }}>สมุดจดบันทึกจากหนังสือทั้งหมดของคุณ เปิดอ่านทบทวนหรือแก้ไขได้ตลอดเวลา</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <i className="ti ti-loader-2 spin" style={{ fontSize: 24, color: "var(--teal)", marginBottom: 8 }}></i>
          <p style={{ fontSize: 13, color: "var(--t3)" }}>กำลังโหลดคลังสมุด...</p>
        </div>
      ) : notebooks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg2)", borderRadius: 16, border: "1px dashed var(--br)" }}>
          <i className="ti ti-notebook" style={{ fontSize: 48, color: "var(--br2)", marginBottom: 16 }}></i>
          <h3 style={{ fontSize: 18, color: "var(--text)", marginBottom: 8 }}>ยังไม่มีสมุดโน้ต</h3>
          <p style={{ fontSize: 14, color: "var(--t2)" }}>เริ่มอ่านหนังสือและเปิดสมุดโน้ตเพื่อจดบันทึก</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
          gap: 20 
        }}>
          {notebooks.map(nb => (
            <div 
              key={nb.id} 
              style={{ 
                background: "var(--card)", 
                borderRadius: 16, 
                overflow: "hidden", 
                border: "1px solid var(--br)", 
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
              }}
            >
              {/* Notebook Cover */}
              <div 
                onClick={() => { setSelectedNotebook(nb); setEditing(false); }}
                style={{ 
                  height: 130, 
                  background: `linear-gradient(135deg, ${COVER_GRADIENTS[nb.coverColor] || COVER_GRADIENTS.teal})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  cursor: "pointer"
                }}
                title="คลิกเพื่อเปิดอ่านทบทวน"
              >
                {/* Binder rings visual */}
                <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 14, display: "flex", flexDirection: "column", justifyContent: "space-evenly", opacity: 0.5 }}>
                   {[1,2,3,4,5,6].map(i => (
                     <div key={i} style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.8)', borderRadius: 2 }}></div>
                   ))}
                </div>
                <i className="ti ti-book" style={{ fontSize: 38, color: "rgba(255,255,255,0.95)" }}></i>
              </div>
              
              {/* Notebook Details */}
              <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 
                    onClick={() => { setSelectedNotebook(nb); setEditing(false); }}
                    style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 8px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4, cursor: "pointer" }}
                    title={nb.title || "สมุดโน้ตทั่วไป"}
                  >
                    {nb.title || "สมุดโน้ตทั่วไป"}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>
                    <i className="ti ti-clock"></i>
                    {nb.updatedAt?.toDate ? nb.updatedAt.toDate().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : "เพิ่งอัปเดต"}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 6, paddingTop: 12, borderTop: "1px solid var(--br)" }}>
                  <button
                    onClick={() => {
                      setSelectedNotebook(nb);
                      setEditing(false);
                    }}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: "6px 0", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 8, cursor: "pointer" }}
                    title="เปิดอ่านโน้ต (อ่านอย่างเดียว)"
                  >
                    <i className="ti ti-eye"></i> อ่าน
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNotebook(nb);
                      setEditing(true);
                    }}
                    className="btn btn-teal"
                    style={{ flex: 1, padding: "6px 0", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, borderRadius: 8, cursor: "pointer" }}
                    title="เปิดจดโน้ต / แก้ไข"
                  >
                    <i className="ti ti-pencil"></i> จดโน้ต
                  </button>
                  <button
                    onClick={() => setDeletingNotebook(nb)}
                    className="btn btn-outline"
                    style={{ padding: "6px 10px", fontSize: 12, color: "#e05555", borderColor: "rgba(224,85,85,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    title="ลบสมุดโน้ต"
                  >
                    <i className="ti ti-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNotebook && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setDeletingNotebook(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div style={{ background: 'var(--card, white)', borderRadius: 16, width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid var(--br)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                <i className="ti ti-trash"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text, #111827)' }}>ยืนยันการลบสมุดโน้ต?</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--t3, #6B7280)' }}>การกระทำนี้ไม่สามารถยกเลิกได้</p>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--t2, #4B5563)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              คุณต้องการลบสมุดโน้ต <strong style={{ color: 'var(--text)' }}>"{deletingNotebook.title || 'สมุดโน้ต'}"</strong> ออกจากระบบใช่หรือไม่? ข้อมูลโน้ตและไฟล์ที่จดไว้ทั้งหมดจะถูกลบถาวร
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingNotebook(null)}
                className="btn btn-outline"
                style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8, cursor: isDeleting ? 'default' : 'pointer' }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteNotebook}
                style={{ padding: '8px 18px', fontSize: 13, borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', fontWeight: 600, cursor: isDeleting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? (
                  <><i className="ti ti-loader-2 spin"></i> กำลังลบ...</>
                ) : (
                  <><i className="ti ti-trash"></i> ยืนยันลบ</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

