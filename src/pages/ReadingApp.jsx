import { useState, useEffect, useMemo, useRef } from "react"
import toast from "react-hot-toast"
import { BOOKS, DEFAULT_TAXONOMY } from "../data/index.js"
import { useContentCollection, useTaxonomySettings } from "../lib/contentStore.js"
import { confirmAction } from "../utils/feedback.jsx"

const DAILY_READING_GOAL_MINUTES = 10
const MIN_VERIFIED_SECONDS = 180
const MIN_REFLECTION_CHARS = 20
const DEFAULT_FREEZE_CREDITS = 2
const DEFAULT_LEAVE_CREDITS = 1

// --- Helper Functions ---
function getMs(val) {
  if (!val) return 0
  if (typeof val.toDate === "function") return val.toDate().getTime()
  if (val.seconds) return val.seconds * 1000
  if (typeof val === "number") return val
  const parsed = Date.parse(val)
  return isNaN(parsed) ? 0 : parsed
}

function getLocalDayKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const ms = getMs(value)
  if (!ms) return ""
  const date = new Date(ms)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function addDaysToKey(dayKey, amount) {
  const date = new Date(`${dayKey}T00:00:00`)
  date.setDate(date.getDate() + amount)
  return getLocalDayKey(date.getTime())
}

function todayKey() {
  return getLocalDayKey(Date.now())
}

function formatReadingMinutes(seconds) {
  const minutes = Math.round(Number(seconds || 0) / 60)
  return minutes <= 0 ? "0 นาที" : `${minutes} นาที`
}

function getPagesRead(startPage, endPage) {
  const start = Number(startPage || 0)
  const end = Number(endPage || 0)
  if (!start || !end || end < start) return 0
  return end - start + 1
}

function getProgressFromSession(item, endPage, pagesRead) {
  const totalPages = Number(item.totalPages || item.customBook?.totalPages || 0)
  const currentProgress = Number(item.progress || 0)
  if (totalPages > 0 && Number(endPage || 0) > 0) {
    return Math.min(100, Math.round((Number(endPage) / totalPages) * 100))
  }
  return Math.min(100, currentProgress + Math.max(3, Math.min(12, Number(pagesRead || 1) * 3)))
}

function calculateVerificationReport({ activeSeconds = 0, inactiveSeconds = 0, startPage = 0, endPage = 0, reflection = "" }) {
  const pagesRead = getPagesRead(startPage, endPage)
  const reflectionLength = reflection.trim().length
  const totalSeconds = Number(activeSeconds || 0) + Number(inactiveSeconds || 0)
  const focusRatio = totalSeconds ? Number(activeSeconds || 0) / totalSeconds : 1
  const timeScore = Math.min(40, Math.round((Number(activeSeconds || 0) / MIN_VERIFIED_SECONDS) * 40))
  const pageScore = pagesRead > 0 ? 25 : 0
  const reflectionScore = Math.min(25, Math.round((reflectionLength / MIN_REFLECTION_CHARS) * 25))
  const focusScore = Math.round(Math.max(0, Math.min(1, focusRatio)) * 10)
  const score = Math.min(100, timeScore + pageScore + reflectionScore + focusScore)
  const verified = score >= 72 && Number(activeSeconds || 0) >= MIN_VERIFIED_SECONDS && pagesRead > 0 && reflectionLength >= MIN_REFLECTION_CHARS
  return { score, verified, pagesRead, focusRatio }
}

function normalizeStreakSettings(settings, uid) {
  const protectedDays = Array.isArray(settings?.protectedDays) ? settings.protectedDays : []
  return {
    id: uid,
    uid,
    freezeCredits: Number.isFinite(Number(settings?.freezeCredits)) ? Number(settings.freezeCredits) : DEFAULT_FREEZE_CREDITS,
    leaveCredits: Number.isFinite(Number(settings?.leaveCredits)) ? Number(settings.leaveCredits) : DEFAULT_LEAVE_CREDITS,
    protectedDays,
    claimedMissions: settings?.claimedMissions || {},
  }
}

function calculateReadingStreak(values, protections = []) {
  const days = new Set(values.map(getLocalDayKey).filter(Boolean))
  const protectedByDay = new Map(
    protections
      .map(item => ({
        ...item,
        date: item.date || item.dayKey || getLocalDayKey(item.createdAt || item.usedAt),
      }))
      .filter(item => item.date)
      .map(item => [item.date, item])
  )
  const coveredDays = new Set([...days, ...protectedByDay.keys()])
  const sorted = [...coveredDays].sort()
  let best = 0
  let run = 0
  let prevTime = 0

  sorted.forEach(day => {
    const currentTime = new Date(`${day}T00:00:00`).getTime()
    run = prevTime && currentTime - prevTime === 86400000 ? run + 1 : 1
    best = Math.max(best, run)
    prevTime = currentTime
  })

  let current = 0
  const today = todayKey()
  const yesterday = addDaysToKey(today, -1)
  const startDay = coveredDays.has(today) ? today : coveredDays.has(yesterday) ? yesterday : ""

  if (startDay) {
    const cursor = new Date(`${startDay}T00:00:00`)
    while (coveredDays.has(getLocalDayKey(cursor.getTime()))) {
      current += 1
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return {
    current,
    best,
    totalDays: days.size,
    protectedTotal: protectedByDay.size,
    todayKey: today,
    todayVerified: days.has(today),
    todayProtected: protectedByDay.get(today) || null,
    coveredDays,
  }
}

function getShelfBook(item, books) {
  return books.find(book => String(book.id) === String(item.bookId)) || item.customBook || null
}

function getPreviewUrl(url) {
  if (!url) return ""
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//)
  if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`
  return url
}

export default function ReadingApp({ authState, go }) {
  const uid = authState?.user?.uid
  const { items: books } = useContentCollection("books", BOOKS)
  const { items: shelfItems, saveItem: saveShelfItem, deleteItem: deleteShelfItem } = useContentCollection("bookshelf", [])
  const { items: readingSessions, saveItem: saveReadingSession } = useContentCollection("reading_sessions", [])
  const { items: streakRecords, saveItem: saveStreakSettings } = useContentCollection("reading_streaks", [])
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)

  // Reading Mode State
  const [activeBook, setActiveBook] = useState(null)
  
  // Stopwatch states
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef(null)
  const startTimestampRef = useRef(null)

  // Log Form states
  const [startPage, setStartPage] = useState("")
  const [endPage, setEndPage] = useState("")
  const [reflection, setReflection] = useState("")
  const [saving, setSaving] = useState(false)

  // Add Book Dropdown states
  const [selectedBookToAdd, setSelectedBookToAdd] = useState("")

  // --- Normalized Streak & Sessions ---
  const streakSettings = useMemo(() => {
    return normalizeStreakSettings(streakRecords.find(item => item.uid === uid || item.id === uid), uid)
  }, [streakRecords, uid])

  const streak = useMemo(() => {
    const verifiedDays = readingSessions
      .filter(item => item.uid === uid && item.verified)
      .map(item => item.dayKey || item.completedAt || item.createdAt)
    return calculateReadingStreak(verifiedDays, streakSettings.protectedDays)
  }, [readingSessions, streakSettings.protectedDays, uid])

  const todaySessions = useMemo(() => {
    return readingSessions.filter(item => item.uid === uid && item.verified && (item.dayKey || getLocalDayKey(item.completedAt)) === streak.todayKey)
  }, [readingSessions, streak.todayKey, uid])

  const todaySeconds = todaySessions.reduce((sum, item) => sum + Number(item.activeSeconds || 0), 0)
  const goalPercent = Math.min(100, Math.round((todaySeconds / (DAILY_READING_GOAL_MINUTES * 60)) * 100))

  const myActiveBooks = useMemo(() => {
    return shelfItems
      .filter(item => item.uid === uid && item.status !== "finished")
      .map(item => ({
        ...item,
        book: getShelfBook(item, books),
      }))
      .filter(item => item.book)
  }, [shelfItems, books, uid])

  const availableBooks = useMemo(() => {
    const savedIds = new Set(shelfItems.filter(item => item.uid === uid).map(item => String(item.bookId)))
    return books.filter(book => !savedIds.has(String(book.id)))
  }, [books, shelfItems, uid])

  const todayQuizPassed = useMemo(() => {
    return shelfItems.some(item => {
      if (item.uid !== uid || !item.lastQuiz) return false
      const dateKey = getLocalDayKey(item.lastQuiz.takenAt)
      return dateKey === streak.todayKey && item.lastQuiz.score >= 3
    })
  }, [shelfItems, streak.todayKey, uid])

  const last7Days = useMemo(() => {
    const list = []
    const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."]
    for (let i = 6; i >= 0; i--) {
      const key = addDaysToKey(streak.todayKey, -i)
      const dateObj = new Date(`${key}T00:00:00`)
      const name = dayNames[dateObj.getDay()]
      
      const daySessions = readingSessions.filter(
        item => item.uid === uid && item.verified && (item.dayKey || getLocalDayKey(item.completedAt)) === key
      )
      const secs = daySessions.reduce((sum, item) => sum + Number(item.activeSeconds || 0), 0)
      const minutes = Math.round(secs / 60)
      const metGoal = secs >= DAILY_READING_GOAL_MINUTES * 60
      
      const protection = streakSettings.protectedDays.find(
        p => (p.date || p.dayKey || getLocalDayKey(p.createdAt || p.usedAt)) === key
      )
      
      list.push({
        key,
        name,
        minutes,
        metGoal,
        protection,
        hasRead: daySessions.length > 0
      })
    }
    return list
  }, [readingSessions, streak.todayKey, streakSettings.protectedDays, uid])

  // --- Actions ---
  async function claimMission(missionId) {
    if (!uid) return
    const isM1 = missionId === "m1"
    const isM2 = missionId === "m2"
    const isM3 = missionId === "m3"
    
    const todayClaims = streakSettings.claimedMissions?.[streak.todayKey] || {}
    if (todayClaims[missionId]) {
      toast.success("คุณรับรางวัลภารกิจนี้ไปแล้ว")
      return
    }
    
    let completed = false
    if (isM1) completed = todaySeconds >= 600
    if (isM2) completed = todaySessions.some(s => s.reflection && s.reflection.length >= 100)
    if (isM3) completed = todayQuizPassed
    
    if (!completed) {
      toast.error("ภารกิจยังไม่เสร็จสมบูรณ์")
      return
    }
    
    let nextFreeze = streakSettings.freezeCredits
    let nextLeave = streakSettings.leaveCredits
    if (isM1 || isM3) nextFreeze += 1
    if (isM2) nextLeave += 1
    
    const nextClaimed = {
      ...streakSettings.claimedMissions,
      [streak.todayKey]: {
        ...(streakSettings.claimedMissions?.[streak.todayKey] || {}),
        [missionId]: true
      }
    }
    
    await saveStreakSettings({
      ...streakSettings,
      freezeCredits: nextFreeze,
      leaveCredits: nextLeave,
      claimedMissions: nextClaimed
    })
    
    toast.success(
      isM2
        ? "สำเร็จ! รับรางวัล สิทธิ์ลากิจ +1 📅"
        : "สำเร็จ! รับรางวัล น้ำแข็งคุ้มครอง +1 🧊"
    )
  }

  async function protectToday(type) {
    if (!uid) return
    if (streak.todayVerified) {
      toast.success("วันนี้ต่อไฟด้วยการอ่านจริงแล้ว")
      return
    }
    if (streak.todayProtected) {
      toast.success("วันนี้ได้รับการคุ้มครอง streak แล้ว")
      return
    }
    const key = streak.todayKey
    const isLeave = type === "leave"
    const creditKey = isLeave ? "leaveCredits" : "freezeCredits"
    if (Number(streakSettings[creditKey] || 0) <= 0) {
      toast.error(isLeave ? "สิทธิ์ลากิจหมดแล้ว" : "น้ำแข็งหมดแล้ว")
      return
    }
    await saveStreakSettings({
      ...streakSettings,
      [creditKey]: Number(streakSettings[creditKey] || 0) - 1,
      protectedDays: [
        ...streakSettings.protectedDays,
        { date: key, type, usedAt: Date.now() },
      ],
    })
    toast.success(isLeave ? "บันทึกวันลากิจแล้ว" : "ใช้น้ำแข็งคุ้มครอง streak วันนี้แล้ว")
  }

  async function addNewBookToShelf() {
    if (!selectedBookToAdd || !uid) return
    const book = books.find(item => String(item.id) === String(selectedBookToAdd))
    if (!book) return

    await saveShelfItem({
      id: `${uid}_book_${book.id}`,
      uid,
      bookId: String(book.id),
      status: "reading",
      progress: 0,
      note: "",
      totalPages: Number(book.totalPages || 0),
      sourceType: "library",
      addedAt: Date.now(),
    })
    setSelectedBookToAdd("")
    toast.success("เพิ่มเข้าชั้นหนังสือแล้ว! พร้อมเปิดห้องอ่านหนังสือ")
  }

  // --- Stopwatch logic ---
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const startReading = (shelfItem) => {
    setActiveBook(shelfItem)
    setSeconds(0)
    setIsRunning(true)
    setStartPage(shelfItem.currentPage || 1)
    setEndPage("")
    setReflection("")
    startTimestampRef.current = Date.now()
  }

  const toggleStopwatch = () => {
    setIsRunning(!isRunning)
  }

  const exitReadingRoom = async () => {
    if (seconds > 10) {
      const ok = await confirmAction({
        title: "ออกจากห้องอ่านหนังสือ?",
        message: "เวลาที่จับอยู่จะสูญหายหากคุณไม่อัปโหลดบันทึกการอ่าน คุณแน่ใจที่จะออกหรือไม่?",
        confirmText: "ยืนยันการออก",
        danger: true
      })
      if (!ok) return
    }
    setIsRunning(false)
    setActiveBook(null)
    setSeconds(0)
  }

  const saveReadingProgress = async () => {
    if (!activeBook) return
    const start = parseInt(startPage, 10)
    const end = parseInt(endPage, 10)
    
    if (isNaN(start) || isNaN(end) || end < start) {
      toast.error("กรุณาใส่หน้าเริ่มต้นและสิ้นสุดให้ถูกต้อง")
      return
    }
    if (seconds < 10) {
      toast.error("คุณพึ่งจะเริ่มอ่านเอง! กรุณารอจับเวลาอย่างน้อย 10 วินาที")
      return
    }
    
    setSaving(true)
    try {
      const payload = {
        startedAt: startTimestampRef.current || Date.now() - (seconds * 1000),
        activeSeconds: seconds,
        inactiveSeconds: 0,
        startPage: start,
        endPage: end,
        reflection: reflection.trim()
      }
      
      const report = calculateVerificationReport(payload)
      const sessionId = `${uid}_${activeBook.id}_${Date.now()}`
      
      await saveReadingSession({
        id: sessionId,
        uid,
        shelfItemId: activeBook.id,
        bookId: String(activeBook.bookId),
        bookTitle: activeBook.book.title,
        sourceType: activeBook.sourceType || "library",
        dayKey: todayKey(),
        startedAt: payload.startedAt,
        completedAt: Date.now(),
        activeSeconds: payload.activeSeconds,
        inactiveSeconds: payload.inactiveSeconds,
        startPage: Number(payload.startPage || 0),
        endPage: Number(payload.endPage || 0),
        pagesRead: report.pagesRead,
        reflection: payload.reflection.trim(),
        focusRatio: report.focusRatio,
        verificationScore: report.score,
        verified: report.verified,
      })

      if (!report.verified) {
        toast.error(`เซสชันนี้ยังไม่ผ่านเกณฑ์ทบทวนความรู้ (${report.score}/100) ลองอ่านสะสมเวลาต่อ หรือเพิ่มบันทึกข้อคิดสะท้อนธรรมยาวขึ้นอีกนิด (อย่างน้อย 20 ตัวอักษร)`)
        setSaving(false)
        return
      }

      const nextProgress = getProgressFromSession(activeBook, end, report.pagesRead)
      
      const cleanItem = { ...activeBook }
      delete cleanItem.book
      
      await saveShelfItem({
        ...cleanItem,
        progress: nextProgress,
        currentPage: end,
        status: nextProgress >= 100 ? "finished" : "reading",
        totalReadSeconds: Number(activeBook.totalReadSeconds || 0) + seconds,
        verifiedSessions: Number(activeBook.verifiedSessions || 0) + 1,
        lastReadAt: Date.now(),
        lastVerificationScore: report.score,
      })

      toast.success(`บันทึกการอ่านเสร็จสมบูรณ์! คะแนนยืนยันการเรียนรู้: ${report.score}/100`)
      setIsRunning(false)
      setActiveBook(null)
      setSeconds(0)
    } catch (err) {
      console.error(err)
      toast.error("บันทึกข้อมูลล้มเหลว กรุณาลองอีกครั้ง")
    } finally {
      setSaving(false)
    }
  }

  // Formatting stopwatch display
  const displayTimer = useMemo(() => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }, [seconds])

  if (activeBook) {
    // --- Focused Reading Room View ---
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "90vh", background: "var(--bg)", width: "100%", maxWidth: "1400px", margin: "0 auto", padding: 12 }}>
        {/* Header HUD */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--br2)", marginBottom: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600 }}>โหมดแอปอ่านหนังสือโฟกัส</span>
            <h2 style={{ fontSize: 16, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{activeBook.book.title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Digital Timer HUD */}
            <div style={{ background: seconds >= MIN_VERIFIED_SECONDS ? "var(--teal-bg)" : "var(--bg2)", border: seconds >= MIN_VERIFIED_SECONDS ? "1.5px solid var(--teal)" : "1px solid var(--br)", padding: "4px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <i className={`ti ${isRunning ? "ti-clock spin" : "ti-player-pause"}`} style={{ color: seconds >= MIN_VERIFIED_SECONDS ? "var(--teal)" : "var(--t3)", fontSize: 14 }}></i>
              <strong style={{ fontFamily: "monospace", fontSize: 16, color: seconds >= MIN_VERIFIED_SECONDS ? "var(--teal)" : "var(--text)" }}>{displayTimer}</strong>
            </div>

            <button onClick={toggleStopwatch} className={`btn ${isRunning ? "btn-outline" : "btn-teal"}`} style={{ padding: "6px 12px", fontSize: 12 }}>
              <i className={`ti ${isRunning ? "ti-player-pause" : "ti-player-play"}`}></i> {isRunning ? "หยุดจับเวลา" : "เริ่มจับเวลา"}
            </button>
            <button onClick={exitReadingRoom} className="btn" style={{ background: "#e05555", color: "#fff", padding: "6px 12px", fontSize: 12 }}>
              <i className="ti ti-logout"></i> ออก
            </button>
          </div>
        </div>

        {/* Workspace Split */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, flex: 1, minHeight: 0 }} className="reader-split">
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 900px) {
              .reader-split {
                grid-template-columns: 1fr !important;
              }
              .reader-preview {
                height: 50vh !important;
              }
            }
          `}} />

          {/* Left Panel: Embedded Google Preview Viewer */}
          <div className="reader-preview" style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--br2)", background: "var(--bg2)", height: "70vh" }}>
            {activeBook.book.fileUrl ? (
              <iframe 
                src={getPreviewUrl(activeBook.book.fileUrl)} 
                style={{ width: "100%", height: "100%", border: "none" }} 
                title="Book Preview"
                allow="autoplay"
              ></iframe>
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: "var(--t3)" }}>
                <i className="ti ti-book-off" style={{ fontSize: 48, marginBottom: 12 }}></i>
                <p>หนังสือเล่มนี้ไม่มีไฟล์ PDF พรีวิว</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>กรุณาเปิดอ่านผ่านเอกสารรูปเล่มจริงหรือไฟล์ภายนอกของท่าน ควบคู่กับการใช้ตัวจับเวลาด้านขวาครับ</p>
              </div>
            )}
          </div>

          {/* Right Panel: Reading Log Panel */}
          <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", height: "70vh" }}>
            <h3 style={{ fontSize: 14, borderBottom: "1.5px solid var(--br2)", paddingBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-notebook" style={{ color: "var(--teal)" }}></i> บันทึกผลการอ่าน
            </h3>

            {seconds < MIN_VERIFIED_SECONDS && (
              <div style={{ background: "rgba(255, 179, 0, 0.08)", border: "1px solid rgba(255, 179, 0, 0.2)", padding: 10, borderRadius: 8, fontSize: 11, color: "rgb(255, 160, 0)", lineHeight: 1.4 }}>
                <i className="ti ti-alert-circle" style={{ marginRight: 6 }}></i>
                ระบบต้องการเวลาการอ่านสะสมขั้นต่ำ **3 นาที (180 วินาที)** เพื่อนำไปคำนวณและยืนยัน Streak ของคุณ กรุณาเปิดหนังสืออ่านต่อและปล่อยตัวจับเวลาทำงาน
              </div>
            )}

            {seconds >= MIN_VERIFIED_SECONDS && (
              <div style={{ background: "var(--teal-bg)", border: "1px solid rgba(45, 190, 160, 0.2)", padding: 10, borderRadius: 8, fontSize: 11, color: "var(--teal)", lineHeight: 1.4 }}>
                <i className="ti ti-circle-check" style={{ marginRight: 6 }}></i>
                คุณผ่านเกณฑ์เวลาขั้นต่ำแล้ว! สามารถกรอกหน้าหนังสือที่จบ เขียนข้อคิดสะท้อนธรรม และกดปุ่มบันทึกได้เลยครับ
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 11, color: "var(--t2)" }}>หน้าเริ่มต้น *</span>
                <input 
                  type="number" 
                  value={startPage} 
                  onChange={e => setStartPage(e.target.value)} 
                  style={{ fontSize: 13, padding: "8px 10px" }} 
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 11, color: "var(--t2)" }}>อ่านถึงหน้า *</span>
                <input 
                  type="number" 
                  placeholder="เช่น 12" 
                  value={endPage} 
                  onChange={e => setEndPage(e.target.value)} 
                  style={{ fontSize: 13, padding: "8px 10px" }} 
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--t2)" }}>บันทึกข้อคิดที่ได้รับ (สั้นๆ) *</span>
                <span style={{ fontSize: 10, color: reflection.length >= MIN_REFLECTION_CHARS ? "var(--teal)" : "#e05555" }}>
                  {reflection.length}/{MIN_REFLECTION_CHARS} อักษร
                </span>
              </div>
              <textarea 
                value={reflection} 
                onChange={e => setReflection(e.target.value)} 
                rows={5} 
                placeholder="วันนี้ได้ข้อคิดสะกิดใจเรื่องอะไรบ้างจากการอ่านหัวข้อนี้? พิมพ์ข้อเขียนสั้นๆ (แนะนำอย่างน้อย 20 ตัวอักษรเพื่อรับสถิติยืนยัน)" 
                style={{ fontSize: 12, padding: 10, lineHeight: 1.5 }}
              />
            </label>

            <button 
              onClick={saveReadingProgress} 
              disabled={saving || seconds < MIN_VERIFIED_SECONDS || reflection.length < MIN_REFLECTION_CHARS || !endPage}
              className="btn btn-teal" 
              style={{ width: "100%", marginTop: "auto", padding: "10px 0", fontSize: 13 }}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกความคืบหน้า"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Reading App Home / Dashboard View ---
  return (
    <div style={{ maxWidth: 840, margin: "0 auto", paddingBottom: 40, width: "100%", textAlign: "left" }}>
      {/* Home Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 600, textTransform: "uppercase" }}>Talib Private Reader</span>
          <h1 style={{ fontSize: 24, marginTop: 4 }}>ห้องอ่านหนังสือส่วนตัว</h1>
          <p style={{ fontSize: 12, color: "var(--t2)" }}>Gamified Reading App - บันทึกเวลาอ่านอัตโนมัติ สะสมไอเทม และทำภารกิจรายวัน</p>
        </div>
        <button className="btn btn-outline" onClick={() => go("member", { view: "overview" })} style={{ fontSize: 12, padding: "8px 16px" }}>
          <i className="ti ti-layout-dashboard" style={{ marginRight: 6 }}></i>แดชบอร์ดหลัก
        </button>
      </div>

      {/* Gamified Streak Row (Duolingo Style) */}
      <section className="card streak-panel" style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", width: "100%", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div className="streak-flame" style={{ flexShrink: 0 }}>
            <i className="ti ti-flame"></i>
          </div>
          <div className="streak-main" style={{ flex: 1, minWidth: 200 }}>
            <span className="badge badge-teal" style={{ fontSize: 10 }}>ความต่อเนื่องในการอ่านสะสม</span>
            <h2 style={{ fontSize: 20, marginTop: 4 }}>{streak.current} วันต่อเนื่อง</h2>
            <p style={{ fontSize: 12, color: "var(--t2)" }}>
              เป้าหมายวันนี้ {formatReadingMinutes(todaySeconds)}/{DAILY_READING_GOAL_MINUTES} นาที 
              {streak.todayVerified ? " (สำเร็จแล้ววันนี้! 🔥)" : ""}
            </p>
            <div className="streak-progress" style={{ height: 8, background: "var(--bg3)", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
              <div style={{ width: `${goalPercent}%`, height: "100%", background: "var(--teal)", borderRadius: 4 }}></div>
            </div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", gap: 6 }}>
            <button className="btn btn-outline" onClick={() => protectToday("freeze")} disabled={streak.todayVerified || streak.todayProtected || streakSettings.freezeCredits <= 0} style={{ padding: "6px 12px", fontSize: 11 }}>
              <i className="ti ti-snowflake" style={{ color: "#64c8ff", marginRight: 4 }}></i>น้ำแข็ง {streakSettings.freezeCredits}
            </button>
            <button className="btn btn-outline" onClick={() => protectToday("leave")} disabled={streak.todayVerified || streak.todayProtected || streakSettings.leaveCredits <= 0} style={{ padding: "6px 12px", fontSize: 11 }}>
              <i className="ti ti-calendar-pause" style={{ color: "#3b73c4", marginRight: 4 }}></i>ลากิจ {streakSettings.leaveCredits}
            </button>
          </div>
        </div>

        {/* 7 Days Stats Grid */}
        <div style={{ paddingTop: 14, borderTop: "1px solid var(--br2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
            {last7Days.map(day => {
              let bg = "var(--bg3)"
              let border = "1px solid var(--br)"
              let color = "var(--t3)"
              let icon = null

              if (day.metGoal) {
                bg = "var(--teal-bg)"
                border = "1.5px solid var(--teal)"
                color = "var(--teal)"
                icon = <i className="ti ti-flame" style={{ fontSize: 16 }}></i>
              } else if (day.protection) {
                const isLeave = day.protection.type === "leave"
                bg = isLeave ? "rgba(59, 115, 196, 0.1)" : "rgba(100, 200, 255, 0.1)"
                border = isLeave ? "1.5px solid #3b73c4" : "1.5px solid #64c8ff"
                color = isLeave ? "#3b73c4" : "#64c8ff"
                icon = isLeave ? <i className="ti ti-calendar-pause" style={{ fontSize: 14 }}></i> : <i className="ti ti-snowflake" style={{ fontSize: 14 }}></i>
              } else if (day.hasRead) {
                bg = "var(--bg2)"
                border = "1px dashed var(--teal)"
                color = "var(--teal)"
                icon = <span style={{ fontSize: 10, fontWeight: "bold" }}>{day.minutes}ม</span>
              } else {
                icon = <i className="ti ti-minus" style={{ opacity: 0.3 }}></i>
              }

              const isToday = day.key === streak.todayKey

              return (
                <div key={day.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 40 }}>
                  <span style={{ fontSize: 10, color: isToday ? "var(--teal)" : "var(--t2)", fontWeight: isToday ? 600 : 300 }}>{day.name}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: bg, border: border, color: color,
                    position: "relative"
                  }}>
                    {icon}
                    {isToday && (
                      <span style={{
                        position: "absolute", bottom: -2, width: 5, height: 5,
                        borderRadius: "50%", background: "var(--teal)"
                      }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 🎯 Daily Missions Checklist */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <i className="ti ti-target" style={{ color: "var(--teal)", fontSize: 18 }}></i>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>ภารกิจสะสมไอเทมประจำวัน</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <MissionRow 
            title="1. นักอ่านผู้ทุ่มเท"
            desc="สะสมเวลาอ่านหนังสือให้ครบ 10 นาทีในวันนี้"
            progress={todaySeconds}
            target={600}
            formatProgress={(val) => `${Math.round(val / 60)}/10 นาที`}
            rewardText="+1 น้ำแข็ง 🧊"
            claimed={streakSettings.claimedMissions?.[streak.todayKey]?.m1}
            onClaim={() => claimMission("m1")}
          />

          <MissionRow 
            title="2. บันทึกธรรมสะกิดใจ"
            desc="บันทึกบันทึกการอ่านและเขียนข้อคิดที่มีความยาว 100 ตัวอักษรขึ้นไปในเซสชันเดียวกันวันนี้"
            progress={todaySessions.reduce((max, s) => Math.max(max, s.reflection?.length || 0), 0)}
            target={100}
            formatProgress={(val) => `${val}/100 ตัวอักษร`}
            rewardText="+1 สิทธิ์ลากิจ 📅"
            claimed={streakSettings.claimedMissions?.[streak.todayKey]?.m2}
            onClaim={() => claimMission("m2")}
          />

          <MissionRow 
            title="3. สอบควิซหนังสือ"
            desc="ทำแบบทดสอบ (Quiz) หนังสือใดๆ บนชั้นหนังสือ และสอบผ่านได้คะแนน 3/5 ข้อขึ้นไปวันนี้"
            progress={todayQuizPassed ? 1 : 0}
            target={1}
            formatProgress={(val) => val === 1 ? "สำเร็จ" : "ยังไม่สำเร็จ"}
            rewardText="+1 น้ำแข็ง 🧊"
            claimed={streakSettings.claimedMissions?.[streak.todayKey]?.m3}
            onClaim={() => claimMission("m3")}
          />
        </div>
      </div>

      {/* Active Bookshelf Shelf Section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-books" style={{ color: "var(--teal)", fontSize: 18 }}></i>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>หนังสือที่กำลังอ่านค้างไว้ ({myActiveBooks.length})</h3>
          </div>
          
          {/* Add Book Quick Dropdown Selector */}
          {availableBooks.length > 0 && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select 
                value={selectedBookToAdd} 
                onChange={e => setSelectedBookToAdd(e.target.value)} 
                style={{ fontSize: 11, padding: "5px 8px", borderRadius: 8, background: "var(--bg2)", border: "1px solid var(--br2)", maxWidth: 180 }}
              >
                <option value="">-- เลือกหนังสือเพื่อเพิ่มเข้าชั้น --</option>
                {availableBooks.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
              <button 
                onClick={addNewBookToShelf} 
                disabled={!selectedBookToAdd}
                className="btn btn-teal" 
                style={{ fontSize: 11, padding: "5px 12px" }}
              >
                + เพิ่ม
              </button>
            </div>
          )}
        </div>

        {myActiveBooks.length === 0 ? (
          <div className="card" style={{ padding: "32px 16px", textAlign: "center", color: "var(--t3)" }}>
            <i className="ti ti-book-2" style={{ fontSize: 36, marginBottom: 8, opacity: 0.5 }}></i>
            <p style={{ fontSize: 13 }}>ไม่มีหนังสืออยู่ในหน้าอ่านค้างไว้ในขณะนี้</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>กรุณาเลือกหนังสือจากกล่องเลือกด้านบนเพื่อเพิ่มเข้าชั้นหนังสือและเริ่มเซสชันจับเวลาอ่านจริงครับ</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
            {myActiveBooks.map(item => (
              <div key={item.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <span className="tag tag-teal" style={{ fontSize: 9, padding: "1px 6px" }}>{item.book.category || "หนังสือ"}</span>
                    <span className="tag" style={{ fontSize: 9, padding: "1px 6px", background: "var(--acc2)" }}>{item.book.type}</span>
                  </div>
                  <strong style={{ fontSize: 13, color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>{item.book.title}</strong>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, marginBottom: 12 }}>{item.book.author}</div>
                  
                  {/* Progress bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t2)", marginBottom: 4 }}>
                      <span>ความคืบหน้า</span>
                      <span>{item.progress || 0}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${item.progress || 0}%`, height: "100%", background: "var(--teal)", borderRadius: 3 }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button 
                    onClick={() => startReading(item)} 
                    className="btn btn-teal" 
                    style={{ flex: 1, padding: "6px 0", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                  >
                    <i className="ti ti-device-desktop"></i> เปิดห้องอ่าน (จับเวลา)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MissionRow({ title, desc, progress, target, formatProgress, rewardText, claimed, onClaim }) {
  const completed = progress >= target
  const percent = Math.min(100, Math.round((progress / target) * 100))
  
  return (
    <div style={{ 
      padding: "10px 12px", 
      background: "var(--bg2)", 
      borderRadius: 12, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      gap: 12,
      flexWrap: "wrap",
      textAlign: "left"
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <strong style={{ fontSize: 12, color: "var(--text)" }}>{title}</strong>
          <span style={{ fontSize: 9, fontWeight: 500, color: "var(--teal)", background: "var(--teal-bg)", padding: "1px 5px", borderRadius: 4 }}>
            {rewardText}
          </span>
        </div>
        <p style={{ fontSize: 10, color: "var(--t2)", marginBottom: 6, lineHeight: 1.3 }}>{desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, height: "100%", background: "var(--teal)", borderRadius: 2 }}></div>
          </div>
          <span style={{ fontSize: 9, color: "var(--t3)", fontWeight: 500, whiteSpace: "nowrap" }}>
            {formatProgress(progress)}
          </span>
        </div>
      </div>
      
      <div>
        {claimed ? (
          <button className="btn btn-outline" disabled style={{ padding: "4px 8px", fontSize: 10, opacity: 0.6, cursor: "not-allowed" }}>
            <i className="ti ti-check" style={{ marginRight: 2 }}></i>รับแล้ว
          </button>
        ) : (
          <button 
            onClick={onClaim}
            disabled={!completed}
            className={`btn ${completed ? "btn-teal" : "btn-outline"}`}
            style={{ 
              padding: "4px 10px", 
              fontSize: 10, 
              opacity: completed ? 1 : 0.6, 
              cursor: completed ? "pointer" : "not-allowed"
            }}
          >
            {completed ? "รับรางวัล" : "ยังไม่เสร็จ"}
          </button>
        )}
      </div>
    </div>
  )
}
