import React from 'react';
import { createPortal } from 'react-dom';
import { useAudio } from '../../../context/AudioContext.jsx';
import { SURA_LIST } from '../../../data/surahs.js';
import { stripTajweedTags } from '../utils/quranUtils.js';

export default function AyahMenuModal({
  activeAyahMenu,
  setActiveAyahMenu,
  quranFont,
  tajweedEnabled,
  selectedPage,
  pageVerses,
  verses,
  modalDetails,
  updateLastRead,
  lastRead,
  getBookmarkForVerse,
  getVerseTranslation,
  handleOpenBookmarkModal
}) {
  const { playingAudio, audioState, play, pause, resume } = useAudio();

  if (!activeAyahMenu) return null;

  return (
    <>
      {/* AYAH OPTIONS POPUP (MUSHAF MODE MENU) */}
      {createPortal(
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(3px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100001,
          padding: 16
        }} onClick={() => setActiveAyahMenu(null)}>
          <div className="card" style={{
            maxWidth: 480,
            width: "100%",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--quran-card-bg)",
            border: "0.5px solid var(--quran-br)",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.25)",
            animation: "scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid var(--quran-br2)", paddingBottom: 10 }}>
              <span style={{ fontSize: 12, color: "var(--quran-t2)", fontWeight: 600, fontFamily: "'Prompt', sans-serif" }}>
                ซูเราะฮ์ {SURA_LIST.find(s => Number(s.number) === Number(activeAyahMenu.sura))?.englishName} อายะฮ์ที่ {activeAyahMenu.aya}
              </span>
              <button
                onClick={() => setActiveAyahMenu(null)}
                style={{ background: "none", border: "none", color: "var(--quran-t3)", cursor: "pointer", fontSize: 16 }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            <div style={{
              padding: 12,
              background: "var(--quran-bg)",
              borderRadius: 8,
              border: "0.5px solid var(--quran-br2)",
              textAlign: "right",
              fontFamily: quranFont === "UthmanicHafs" ? "'UthmanicHafs', serif" : quranFont === "Amiri" ? "'Amiri', serif" : "'Noto Naskh Arabic', serif",
              fontSize: 22,
              color: "var(--quran-text)",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
              direction: "rtl"
            }} dangerouslySetInnerHTML={{
              __html: tajweedEnabled ? (activeAyahMenu.verse?.arabic_text_tajweed || activeAyahMenu.arabicText || "") : stripTajweedTags(activeAyahMenu.verse?.arabic_text_tajweed || activeAyahMenu.arabicText || "")
            }} />

            {/* Play/Pause Button for this verse */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                className="btn"
                onClick={() => {
                  const isCurrent = Number(playingAudio?.sura) === Number(activeAyahMenu.sura) && Number(playingAudio?.aya) === Number(activeAyahMenu.aya)
                  if (isCurrent && audioState === "playing") {
                    pause()
                  } else if (isCurrent && audioState === "paused") {
                    resume()
                  } else {
                    const currentList = selectedPage ? pageVerses : verses
                    play(activeAyahMenu.sura, activeAyahMenu.aya, SURA_LIST.find(s => Number(s.number) === Number(activeAyahMenu.sura))?.englishName || "", currentList)
                  }
                }}
                style={{
                  background: (Number(playingAudio?.sura) === Number(activeAyahMenu.sura) && Number(playingAudio?.aya) === Number(activeAyahMenu.aya) && audioState === "playing") ? "rgba(220, 38, 38, 0.06)" : "rgba(45, 190, 160, 0.06)",
                  border: (Number(playingAudio?.sura) === Number(activeAyahMenu.sura) && Number(playingAudio?.aya) === Number(activeAyahMenu.aya) && audioState === "playing") ? "0.5px solid #dc2626" : "0.5px solid var(--teal)",
                  color: (Number(playingAudio?.sura) === Number(activeAyahMenu.sura) && Number(playingAudio?.aya) === Number(activeAyahMenu.aya) && audioState === "playing") ? "#dc2626" : "var(--teal)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 12,
                  padding: "8px 16px",
                  borderRadius: 16,
                  cursor: "pointer",
                  fontWeight: 500,
                  width: "100%",
                  transition: "all 0.2s"
                }}
              >
                <i className={(Number(playingAudio?.sura) === Number(activeAyahMenu.sura) && Number(playingAudio?.aya) === Number(activeAyahMenu.aya) && audioState === "playing") ? "ti ti-player-pause" : "ti ti-player-play"} style={{ fontSize: 13 }}></i>
                {(Number(playingAudio?.sura) === Number(activeAyahMenu.sura) && Number(playingAudio?.aya) === Number(activeAyahMenu.aya) && audioState === "playing") ? "หยุดฟังเสียงอายะฮ์นี้" : "ฟังเสียงอายะฮ์นี้"}
              </button>
            </div>

            {/* Translation & Tafsir Load/Display */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
              {modalDetails.loading ? (
                <div style={{ padding: "12px 0", textAlign: "center" }}>
                  <i className="ti ti-loader-2 spin" style={{ fontSize: 16, color: "var(--teal)", marginBottom: 4 }}></i>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>กำลังโหลดคำแปลและตัฟซีร...</div>
                </div>
              ) : modalDetails.error ? (
                <div style={{ fontSize: 11, color: "var(--red)", textAlign: "center", padding: "6px 0" }}>
                  {modalDetails.error}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text)" }}>
                    <strong style={{ display: "block", fontSize: 11, color: "var(--quran-teal)", marginBottom: 4 }}>คำแปลภาษาไทย:</strong>
                    {modalDetails.translation}
                  </div>
                  {modalDetails.tafsir && (
                    <div style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: "var(--t2)",
                      background: "var(--quran-acc2)",
                      padding: 10,
                      borderRadius: 6,
                      borderLeft: "2.5px solid var(--quran-teal)"
                    }}>
                      <strong style={{ display: "block", fontSize: 10, color: "var(--quran-teal)", marginBottom: 4 }}>ตัฟซีรย่อภาษาไทย:</strong>
                      {modalDetails.tafsir}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* คั่นหน้า / ยกเลิกคั่นหน้า */}
              <button
                className="btn btn-teal"
                style={{
                  width: "100%",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 0"
                }}
                onClick={() => {
                  updateLastRead(activeAyahMenu.sura, activeAyahMenu.aya)
                  setActiveAyahMenu(null)
                }}
              >
                <i className={(lastRead?.sura === activeAyahMenu.sura && lastRead?.aya === activeAyahMenu.aya) ? "ti ti-flag-2-filled" : "ti ti-flag-2"} style={{ fontSize: 14 }}></i>
                {(lastRead?.sura === activeAyahMenu.sura && lastRead?.aya === activeAyahMenu.aya) ? "ยกเลิกคั่นหน้าการอ่านล่าสุด" : "คั่นหน้านี้เป็นจุดอ่านล่าสุด"}
              </button>

              {/* บันทึกข้อคิด */}
              <button
                className="btn btn-outline"
                style={{
                  width: "100%",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 0",
                  borderColor: "var(--quran-br)"
                }}
                onClick={() => {
                  const bookmark = getBookmarkForVerse(activeAyahMenu.aya)
                  const tr = modalDetails.translation || getVerseTranslation(activeAyahMenu.sura, activeAyahMenu.aya)
                  handleOpenBookmarkModal(
                    {
                      id: activeAyahMenu.verse.id,
                      sura: activeAyahMenu.sura,
                      aya: activeAyahMenu.aya,
                      arabic_text: activeAyahMenu.arabicText,
                      translation: tr || "เปิดโหมดคำแปลเพื่ออ่านคำแปลและการอธิบายความหมายย่อสำหรับอายะฮ์นี้"
                    },
                    bookmark
                  )
                  setActiveAyahMenu(null)
                }}
              >
                <i className={getBookmarkForVerse(activeAyahMenu.aya) ? "ti ti-bookmark-filled" : "ti ti-bookmark"} style={{ fontSize: 14 }}></i>
                {getBookmarkForVerse(activeAyahMenu.aya) ? "แก้ไขหรือลบบันทึกข้อคิด" : "เขียนบันทึกข้อคิด / ประโยชน์"}
              </button>
            </div>
          </div>
        </div>,
        document.querySelector(".app") || document.body
      )}
    </>
  );
}
