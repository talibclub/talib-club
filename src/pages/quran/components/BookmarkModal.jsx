import React from 'react';
import { createPortal } from 'react-dom';
import DOMPurify from "dompurify"
import { stripTajweedTags } from '../utils/quranUtils.js';

export default function BookmarkModal({
  activeBookmarkModal,
  setActiveBookmarkModal,
  modalNotes,
  setModalNotes,
  tajweedEnabled,
  handleDeleteBookmark,
  handleSaveBookmark
}) {
  if (!activeBookmarkModal) return null;

  return (
    <>
      {/* BOOKMARK REFLECTION MODAL */}
      {createPortal(
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100000,
          padding: 16
        }}>
          <div className="card" style={{
            maxWidth: 540,
            width: "100%",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--quran-card-bg)",
            border: "0.5px solid var(--quran-br)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--quran-text)", margin: 0 }}>
                {activeBookmarkModal.bookmarkId ? "แก้ไขบันทึกข้อคิดอายะฮ์" : "บันทึกข้อคิดและประโยชน์จากอายะฮ์"}
              </h3>
              <button
                onClick={() => setActiveBookmarkModal(null)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--quran-t3)" }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div style={{ padding: 12, background: "var(--quran-bg)", borderRadius: 8, border: "0.5px solid var(--quran-br2)" }}>
              <span style={{ fontSize: 10, color: "var(--quran-t3)", fontWeight: 500 }}>
                ซูเราะฮ์ {activeBookmarkModal.suraName} อายะฮ์ที่ {activeBookmarkModal.aya}
              </span>
              <div style={{
                fontFamily: "'Amiri', serif",
                fontSize: 22,
                direction: "rtl",
                textAlign: "right",
                margin: "8px 0",
                lineHeight: 1.6,
                color: "var(--quran-text)"
              }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tajweedEnabled ? activeBookmarkModal.arabicText : stripTajweedTags(activeBookmarkModal.arabicText), { ADD_TAGS: ["tajweed"] }) }} />
              <div style={{ fontSize: 12, color: "var(--quran-t2)", lineHeight: 1.45, textAlign: "left" }}>
                {activeBookmarkModal.translation}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--quran-teal)" }}>
                บันทึกข้อคิด/ประโยชน์ที่ได้รับ (จดบันทึกส่วนตัวเพื่อเตือนตนเอง):
              </label>
              <textarea
                value={modalNotes}
                onChange={e => setModalNotes(e.target.value)}
                placeholder="พิมพ์สิ่งที่ได้รับจากโองการนี้ เช่น ข้อเตือนใจ, ข้อปฏิบัติในชีวิตประจำวัน..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 8,
                  border: "0.5px solid var(--quran-br)",
                  background: "var(--quran-card-bg)",
                  color: "var(--quran-text)",
                  fontSize: 13,
                  fontFamily: "'Prompt', sans-serif"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div>
                {activeBookmarkModal.bookmarkId && (
                  <button
                    className="btn btn-outline"
                    style={{ color: "var(--red)", borderColor: "rgba(220, 38, 38, 0.2)", fontSize: 12, padding: "6px 14px" }}
                    onClick={handleDeleteBookmark}
                  >
                    <i className="ti ti-trash" style={{ marginRight: 4 }}></i> ลบบันทึก
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: 12, padding: "6px 16px" }}
                  onClick={() => setActiveBookmarkModal(null)}
                >
                  ยกเลิก
                </button>
                <button
                  className="btn btn-teal"
                  style={{ fontSize: 12, padding: "6px 16px" }}
                  onClick={handleSaveBookmark}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.querySelector(".app") || document.body
      )}
    </>
  );
}
