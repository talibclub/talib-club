import React, { useState } from "react";
import toast from "react-hot-toast";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { storage, app } from "../../../lib/firebase.js";

function sanitizeStorageName(name) {
  return String(name || "book.pdf")
    .replace(/[^\w.\-ก-๙]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export default function EditShelfModal({ item, onClose, onSave, uid }) {
  const book = item.book || item.customBook || {};
  const isExternal = item.sourceType === "external" || !!item.customBook;

  const [title, setTitle] = useState(book.title || "");
  const [author, setAuthor] = useState(book.author || "");
  const [fileUrl, setFileUrl] = useState(book.fileUrl || "");
  const [totalPages, setTotalPages] = useState(book.totalPages || item.totalPages || "");
  const [progress, setProgress] = useState(item.progress || 0);
  const [status, setStatus] = useState(item.status || (item.progress >= 100 ? "finished" : "reading"));
  const [desc, setDesc] = useState(book.desc || item.note || "");
  
  const [newFile, setNewFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sourceMode, setSourceMode] = useState("url"); // "url" | "upload"

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อหนังสือ");
      return;
    }

    setIsSaving(true);
    try {
      let finalFileUrl = fileUrl.trim();
      let fileMeta = {};

      if (newFile && uid) {
        const safeName = sanitizeStorageName(newFile.name);
        const usedStorage = storage || getStorage(app);
        const fileRef = ref(usedStorage, `members/${uid}/bookshelf/${Date.now()}-${safeName}`);
        await uploadBytes(fileRef, newFile, {
          contentType: newFile.type || "application/octet-stream",
          customMetadata: { uid, title: title.trim() },
        });
        finalFileUrl = await getDownloadURL(fileRef);
        fileMeta = {
          fileName: newFile.name,
          fileSize: newFile.size,
          fileType: newFile.type,
        };
      }

      await onSave(item.id, {
        title: title.trim(),
        author: author.trim(),
        fileUrl: finalFileUrl,
        totalPages: Number(totalPages || 0),
        progress: Number(progress || 0),
        status,
        desc: desc.trim(),
        fileMeta,
      });

      onClose();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "var(--card, #FFFFFF)",
          color: "var(--text, #111827)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "22px 24px 26px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px var(--br2, rgba(0,0,0,0.1))",
          border: "1px solid var(--br, #E5E7EB)",
          animation: "editPopIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        <style>{`
          @keyframes editPopIn {
            0% { transform: scale(0.92) translateY(12px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "var(--teal-bg, rgba(16, 185, 129, 0.1))",
                color: "var(--teal, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              <i className="ti ti-edit"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text, #111827)" }}>
                แก้ไขข้อมูลหนังสือ
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--t3, #6B7280)" }}>
                {isExternal ? "หนังสือส่วนตัว / ไฟล์นอก" : "หนังสือจากห้องสมุด"}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--t3, #6B7280)",
              fontSize: 20,
              display: "flex",
              padding: 4,
            }}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", marginBottom: 5 }}>
              ชื่อหนังสือ <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อหนังสือ..."
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--br, #D1D5DB)",
                background: "var(--bg, #FFFFFF)",
                color: "var(--text, #111827)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Author */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", marginBottom: 5 }}>
              ผู้แต่ง / ผู้แปล / แหล่งที่มา
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="เช่น ชัยคุลอิสลาม, สำนักพิมพ์, หรือไฟล์ส่วนตัว..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--br, #D1D5DB)",
                background: "var(--bg, #FFFFFF)",
                color: "var(--text, #111827)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* File / Link Section */}
          <div style={{ background: "var(--bg2, #F9FAFB)", padding: 14, borderRadius: 12, border: "1px solid var(--br, #E5E7EB)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", margin: 0 }}>
                <i className="ti ti-link" style={{ marginRight: 4 }}></i> ลิงก์ไฟล์ หรือ อัปโหลดไฟล์แทนที่
              </label>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setSourceMode("url")}
                  style={{
                    padding: "3px 8px",
                    fontSize: 11,
                    borderRadius: 6,
                    border: "none",
                    background: sourceMode === "url" ? "var(--teal, #059669)" : "transparent",
                    color: sourceMode === "url" ? "#FFFFFF" : "var(--t3, #6B7280)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ใส่ลิงก์
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode("upload")}
                  style={{
                    padding: "3px 8px",
                    fontSize: 11,
                    borderRadius: 6,
                    border: "none",
                    background: sourceMode === "upload" ? "var(--teal, #059669)" : "transparent",
                    color: sourceMode === "upload" ? "#FFFFFF" : "var(--t3, #6B7280)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  อัปโหลดใหม่
                </button>
              </div>
            </div>

            {sourceMode === "url" ? (
              <div>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="วางลิงก์ PDF / Google Drive / URL ที่นี่..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--br, #D1D5DB)",
                    background: "var(--card, #FFFFFF)",
                    color: "var(--text, #111827)",
                    fontSize: 12.5,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--t3, #6B7280)", marginTop: 4, display: "block" }}>
                  💡 รองรับลิงก์ไฟล์ PDF จาก Google Drive, Dropbox หรือ Web URL ทั่วไป
                </span>
              </div>
            ) : (
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "1px dashed var(--teal, #059669)",
                    borderRadius: 8,
                    background: "var(--card, #FFFFFF)",
                    padding: "10px 12px",
                    color: "var(--t2, #374151)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <i className="ti ti-upload" style={{ color: "var(--teal, #059669)", fontSize: 18 }}></i>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {newFile ? newFile.name : "คลิกเลือกไฟล์ PDF ใหม่เพื่อแทนที่ (จำกัด 100MB)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.epub,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setNewFile(null);
                        return;
                      }
                      if (file.size > 100 * 1024 * 1024) {
                        toast.error("ขนาดไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 100MB)");
                        e.target.value = "";
                        return;
                      }
                      setNewFile(file);
                    }}
                    style={{ display: "none" }}
                  />
                </label>
                {newFile && (
                  <span style={{ fontSize: 11, color: "var(--teal, #059669)", marginTop: 4, display: "block", fontWeight: 500 }}>
                    ✓ เลือกไฟล์แล้ว: {(newFile.size / (1024 * 1024)).toFixed(2)} MB (จะอัปโหลดเมื่อกดบันทึก)
                  </span>
                )}
              </div>
            )}

            {book.fileName && (
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--t3, #6B7280)", display: "flex", alignItems: "center", gap: 4 }}>
                <i className="ti ti-file"></i> ไฟล์เดิม: <span style={{ fontWeight: 500 }}>{book.fileName}</span>
              </div>
            )}
          </div>

          {/* Total Pages & Progress */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", marginBottom: 5 }}>
                จำนวนหน้าทั้งหมด
              </label>
              <input
                type="number"
                min="0"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="เช่น 250"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--br, #D1D5DB)",
                  background: "var(--bg, #FFFFFF)",
                  color: "var(--text, #111827)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", marginBottom: 5 }}>
                ความคืบหน้า ({progress}%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                  setProgress(val);
                  if (val >= 100) setStatus("finished");
                  else if (status === "finished" && val < 100) setStatus("reading");
                }}
                placeholder="0 - 100"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--br, #D1D5DB)",
                  background: "var(--bg, #FFFFFF)",
                  color: "var(--text, #111827)",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", marginBottom: 5 }}>
              สถานะหนังสือ
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setStatus("reading")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: status === "reading" ? "2px solid var(--teal, #059669)" : "1px solid var(--br, #E5E7EB)",
                  background: status === "reading" ? "var(--teal-bg, rgba(16,185,129,0.1))" : "transparent",
                  color: status === "reading" ? "var(--teal, #059669)" : "var(--t2, #374151)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <i className="ti ti-book-2"></i> กำลังอ่าน
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus("finished");
                  if (Number(progress) < 100) setProgress(100);
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: status === "finished" ? "2px solid var(--teal, #059669)" : "1px solid var(--br, #E5E7EB)",
                  background: status === "finished" ? "var(--teal-bg, rgba(16,185,129,0.1))" : "transparent",
                  color: status === "finished" ? "var(--teal, #059669)" : "var(--t2, #374151)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <i className="ti ti-circle-check"></i> อ่านจบแล้ว ✨
              </button>
            </div>
          </div>

          {/* Description / Note */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t2, #374151)", marginBottom: 5 }}>
              คำอธิบาย หรือ บันทึกเป้าหมายสั้น ๆ
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="บันทึกข้อความเพิ่มเติมเกี่ยวกับหนังสือเล่มนี้..."
              rows={2}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                border: "1px solid var(--br, #D1D5DB)",
                background: "var(--bg, #FFFFFF)",
                color: "var(--text, #111827)",
                fontSize: 12.5,
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10, paddingTop: 14, borderTop: "1px solid var(--br, #E5E7EB)" }}>
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, cursor: isSaving ? "default" : "pointer" }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-teal"
              style={{
                padding: "9px 22px",
                fontSize: 13,
                borderRadius: 10,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: isSaving ? "default" : "pointer",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? (
                <>
                  <i className="ti ti-loader-2 spin"></i> {newFile ? "กำลังอัปโหลด..." : "กำลังบันทึก..."}
                </>
              ) : (
                <>
                  <i className="ti ti-check"></i> บันทึกการแก้ไข
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
