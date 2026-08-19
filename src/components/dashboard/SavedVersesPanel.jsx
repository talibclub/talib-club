import { useState, useMemo, useEffect } from "react"
import toast from 'react-hot-toast'
import DOMPurify from "dompurify"
import { useUserCollection } from "../../lib/contentStore.js"
import { confirmAction } from "../../utils/feedback.jsx"

// Shared across every row and every mount of the panel: the text of an ayah
// does not change, so it is fetched once per session at most.
// Firestore Timestamp, the optimistic-path number, or an ISO string.
const toMillis = (v) => {
  if (!v) return 0
  if (typeof v.toMillis === "function") return v.toMillis()
  if (typeof v.seconds === "number") return v.seconds * 1000
  const n = typeof v === "number" ? v : Date.parse(v)
  return Number.isFinite(n) ? n : 0
}

const verseCache = new Map()
const inFlight = new Map()

const VerseDisplay = ({ item }) => {
  const [data, setData] = useState({
    arabic: item.arabicText || "",
    translation: item.translation || "",
    tafsir: item.tafsir || ""
  })
  const [loading, setLoading] = useState(!item.arabicText)

  useEffect(() => {
    let active = true
    if (!item.arabicText && active) {
      const key = `${item.sura}:${item.aya}`
      const cached = verseCache.get(key)
      if (cached) {
        setData(cached)
        setLoading(false)
        return () => { active = false }
      }
      // Three network calls per saved verse with nothing in front of them: a
      // member with 50 bookmarks fired 150 requests every time this panel
      // opened, and the same three again on the next visit. One in-flight
      // promise per verse, memoised for the session.
      const pending = inFlight.get(key) || (() => {
        const p = Promise.all([
          fetch(`https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?verse_key=${key}`).then(r => r.json()),
          fetch(`https://api.quran.com/api/v4/quran/translations/155?verse_key=${key}`).then(r => r.json()),
          fetch(`https://api.alquran.cloud/v1/ayah/${key}/th.thai`).then(r => r.json())
        ]).then(([tajweedRes, tafsirRes, translationRes]) => {
          const next = {
            arabic: tajweedRes.verses?.[0]?.text_uthmani_tajweed || "",
            tafsir: tafsirRes.translations?.[0]?.text || "",
            translation: translationRes.data?.text || "",
          }
          verseCache.set(key, next)
          return next
        }).finally(() => inFlight.delete(key))
        inFlight.set(key, p)
        return p
      })()

      pending
        .then((next) => {
          if (!active) return
          setData(next)
          setLoading(false)
        })
        .catch(() => {
          if (active) setLoading(false)
        })
    }
    return () => { active = false }
  }, [item])

  if (loading) {
    return <div style={{ padding: 12, textAlign: "center", color: "var(--t3)" }}><i className="ti ti-loader-2 spin"></i> กำลังโหลดอายะฮ์...</div>
  }

  return (
    <div style={{ padding: 16, background: "var(--bg)", borderRadius: 8, marginBottom: 16, border: "0.5px solid var(--br)" }}>
      {data.arabic && (
        <div 
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 26,
            direction: "rtl",
            textAlign: "right",
            marginBottom: 16,
            lineHeight: 2.2,
            color: "var(--text)"
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.arabic.replace(/\u25cc/g, "").replace(/\u0672/g, "\u0670"), { ADD_TAGS: ["tajweed"] }) }}
        />
      )}
      
      {data.translation && (
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 12, paddingBottom: 12, borderBottom: "0.5px dashed var(--br)" }}>
          <strong style={{ color: "var(--teal)" }}>ความหมาย:</strong> {data.translation}
        </div>
      )}
      
      {data.tafsir && (
        <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text)" }}>ตัฟซีรย่อ:</strong> <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.tafsir) }} />
        </div>
      )}
    </div>
  )
}

export default function SavedVersesPanel({ authState, go, setView, setQuranSura, setQuranAyah }) {
  const uid = authState?.user?.uid;
  const { items: savedVerses, loading, deleteItem, saveItem } = useUserCollection("quran_bookmarks", uid)
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState("");

  const userSaved = useMemo(() => {
    if (!uid) return [];
    // `updatedAt` comes back from Firestore as a Timestamp, not a date string.
    // new Date(Timestamp) is an Invalid Date, so every comparison was NaN and
    // the list was left in whatever order it arrived in.
    return savedVerses.filter(v => v.uid === uid).sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
  }, [savedVerses, uid]);

  const filteredSaved = useMemo(() => {
    if (!search.trim()) return userSaved;
    const q = search.toLowerCase();
    return userSaved.filter(v =>
      v.notes?.toLowerCase().includes(q) ||
      v.translation?.toLowerCase().includes(q) ||
      v.suraName?.toLowerCase().includes(q) ||
      String(v.sura).includes(q)
    );
  }, [userSaved, search]);

  const handleOpenVerse = (sura, aya) => {
    setQuranSura(sura)
    setQuranAyah(aya)
    setView("quran")
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditNote(item.notes || "");
  };

  const handleSaveNote = async (item) => {
    const toastId = toast.loading("กำลังบันทึก...");
    try {
      await saveItem({
        ...item,
        notes: editNote,
        updatedAt: new Date().toISOString()
      });
      toast.success("บันทึกข้อคิดเรียบร้อยแล้ว", { id: toastId });
      setEditingId(null);
    } catch {
      toast.error("ไม่สามารถบันทึกได้", { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmAction({
      title: "ลบอายะฮ์ที่บันทึก?",
      message: "คุณต้องการยกเลิกการบันทึกอายะฮ์นี้ใช่หรือไม่?",
      confirmText: "ลบออก",
      danger: true
    });
    if (ok) {
      const toastId = toast.loading("กำลังลบ...");
      try {
        await deleteItem(id);
        toast.success("ลบรายการแล้ว", { id: toastId });
      } catch {
        toast.error("ลบไม่สำเร็จ", { id: toastId });
      }
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}><i className="ti ti-loader-2 spin" style={{ fontSize: 24, color: "var(--teal)" }}></i></div>

  return (
    <div className="profile-layout" style={{ maxWidth: 840, margin: "0 auto" }}>
      <button
        onClick={() => setView("overview")}
        className="sec-link"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, background: "none", border: "none", fontFamily: "'Prompt', sans-serif", cursor: "pointer", color: "var(--t2)" }}
      >
        <i className="ti ti-arrow-left"></i> กลับหน้าแดชบอร์ด
      </button>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-notebook" style={{ color: "var(--teal)", fontSize: 20 }}></i>
          </div>
          <div>
            <h2 style={{ fontSize: 18 }}>อายะฮ์อัลกุรอานที่บันทึกไว้</h2>
            <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{filteredSaved.length} รายการ (บันทึกข้อคิดและประโยชน์จากอายะฮ์)</p>
          </div>
        </div>

        {userSaved.length === 0 ? (
          <div className="empty" style={{ padding: "40px 0" }}>
            คุณยังไม่มีอายะฮ์ที่บันทึกไว้ ไปเปิดคัมภีร์อัลกุรอานเพื่อบันทึกและจดข้อคิดกันเลยครับ!
          </div>
        ) : (
          <>
            {/* ค้นหา */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <i className="ti ti-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", fontSize: 14 }}></i>
              <input
                placeholder="ค้นหาตามข้อคิด คำแปล หรือซูเราะห์..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: "100%", height: 38 }}
              />
            </div>

            {filteredSaved.length === 0 ? (
              <div className="empty" style={{ padding: "30px 0" }}>ไม่พบรายการที่ค้นหา</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filteredSaved.map(item => (
                  <div key={item.id} className="card" style={{ padding: 20, border: "0.5px solid var(--br)", background: "var(--bg3)" }}>

                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <span className="badge badge-teal" style={{ fontSize: 11, cursor: "pointer" }} onClick={() => handleOpenVerse(item.sura, item.aya)}>
                        <i className="ti ti-book" style={{ marginRight: 4 }}></i>
                        ซูเราะฮ์ {item.suraName} [{item.sura}:{item.aya}]
                      </span>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleOpenVerse(item.sura, item.aya)}>
                          <i className="ti ti-eye"></i> เปิดอ่าน
                        </button>
                        <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleEdit(item)}>
                          <i className="ti ti-edit"></i> แก้ไข
                        </button>
                        <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: "var(--red)", borderColor: "rgba(220,38,38,0.2)" }} onClick={() => handleDelete(item.id)}>
                          <i className="ti ti-trash"></i> ลบ
                        </button>
                      </div>
                    </div>

                    <VerseDisplay item={item} />

                    {/* Reflection / Notes Box */}
                    {editingId === item.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 11, fontWeight: 500, color: "var(--teal)" }}>
                          แก้ไขข้อคิด/ประโยชน์ที่ได้รับจากอายะฮ์นี้:
                        </label>
                        <textarea
                          value={editNote}
                          onChange={e => setEditNote(e.target.value)}
                          placeholder="เขียนบันทึกสิ่งที่คุณได้รับ หรือข้อคิดสำหรับเตือนตนเอง..."
                          style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 8, border: "0.5px solid var(--teal)", fontFamily: "'Prompt', sans-serif", fontSize: 13, background: "var(--card)", color: "var(--text)" }}
                        />
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button className="btn btn-outline" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => setEditingId(null)}>
                            ยกเลิก
                          </button>
                          <button className="btn btn-teal" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => handleSaveNote(item)}>
                            บันทึก
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: "rgba(45, 190, 160, 0.05)",
                        borderLeft: "3px solid var(--teal)",
                        padding: "12px 16px",
                        borderRadius: "0 8px 8px 0"
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--teal)", marginBottom: 4 }}>
                          ประโยชน์และข้อคิดเตือนใจที่คุณบันทึกไว้:
                        </div>
                        <div style={{ fontSize: 13, color: item.notes ? "var(--text)" : "var(--t3)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                          {item.notes || "ไม่มีข้อบันทึก (กดแก้ไขเพื่อเพิ่มข้อคิดเตือนใจ)"}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
