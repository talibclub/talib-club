import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"

export function QuizModal({ shelfItem, onClose, onSaveScore, theme, user }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [quizSource, setQuizSource] = useState("ai")
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [completed, setCompleted] = useState(false)

  const book = shelfItem.book || shelfItem.customBook || {}

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true)
        setError(null)
        const idToken = user ? await user.getIdToken() : ""
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ book })
        })
        if (!res.ok) throw new Error(`HTTP Error Status ${res.status}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setQuestions(data.quiz || [])
        setQuizSource(data.source || "ai")
      } catch (err) {
        console.error("Failed to load quiz", err)
        setError("ไม่สามารถโหลดข้อสอบได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [shelfItem, user])

  const handleSelectOption = (idx) => {
    if (showExplanation) return
    setSelectedOption(idx)
    setShowExplanation(true)
    const nextAnswers = [...answers]
    nextAnswers[currentIndex] = idx
    setAnswers(nextAnswers)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
    } else {
      const finalScore = questions.reduce((score, q, i) => {
        return score + (answers[i] === q.answerIndex ? 1 : 0)
      }, 0)
      onSaveScore(shelfItem.id, finalScore)
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setAnswers([])
    setSelectedOption(null)
    setShowExplanation(false)
    setCompleted(false)
    setStarted(false)
  }

  const correctAnswersCount = useMemo(() => {
    return questions.reduce((score, q, i) => {
      return score + (answers[i] === q.answerIndex ? 1 : 0)
    }, 0)
  }, [questions, answers])

  return createPortal(
    <div className={`app ${theme || "light"}`} style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(4px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      fontFamily: "'Prompt', sans-serif"
    }}>
      <div className="card" style={{
        maxWidth: 600,
        width: "100%",
        padding: 24,
        background: "var(--card)",
        border: "0.5px solid var(--br)",
        borderRadius: 24,
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        animation: "pageFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--br2)", paddingBottom: 16, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, display: "flex", alignItems: "center", gap: 8, color: "var(--text)" }}>
            <i className="ti ti-help" style={{ color: "var(--teal)", fontSize: 20 }}></i>
            แบบทดสอบทบทวนความเข้าใจหลังอ่านจบ
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 20 }} aria-label="ปิด">
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginBottom: 16 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <i className="ti ti-loader-2 spin" style={{ fontSize: 36, color: "var(--teal)" }}></i>
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--t2)" }}>ระบบ AI กำลังวิเคราะห์เนื้อหาและเตรียมชุดแบบทดสอบ...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#e05555" }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 36, marginBottom: 12 }}></i>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{error}</p>
              <button className="btn btn-outline" onClick={onClose} style={{ marginTop: 16, borderRadius: 20 }}>ปิดหน้าต่าง</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {!started && !completed && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  {quizSource === "fallback" && (
                    <div style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#d97706",
                      marginBottom: 16,
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: 16 }}></i>
                      <span><strong>โหมดทบทวนทั่วไป (Practice Mode):</strong> ระบบกำลังจำลองแบบทดสอบพื้นฐานเนื่องจาก AI คีย์ไม่พร้อมใช้งาน</span>
                    </div>
                  )}
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--teal-bg)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <i className="ti ti-award" style={{ color: "var(--teal)", fontSize: 32 }}></i>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>{book.title}</h4>
                  <p style={{ fontSize: 12, color: "var(--t3)", margin: "0 0 16px" }}>ผู้เขียน: {book.author || "ไม่ระบุ"}</p>

                  <div style={{ background: "var(--bg3)", padding: 16, borderRadius: 16, textAlign: "left", fontSize: 13, lineHeight: 1.6, color: "var(--t2)", marginBottom: 20 }}>
                    <h5 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>คำแนะนำก่อนทำแบบทดสอบ:</h5>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      <li>แบบทดสอบประกอบด้วยคำถามทบทวนเนื้อหาและความเข้าใจ จำนวน 20 ข้อ</li>
                      <li>เกณฑ์การผ่าน: ตอบถูก 12 ข้อขึ้นไป (12/20)</li>
                      <li>เมื่อสอบผ่านจะได้รับ 💎 gems ประจำวันเพิ่มขึ้น</li>
                      <li>หากทำไม่สำเร็จ สามารถกลับมาสอบทบทวนได้เรื่อยๆ</li>
                    </ul>
                  </div>

                  <button className="btn btn-teal" onClick={() => setStarted(true)} style={{ width: "100%", padding: "10px 0", borderRadius: 20, fontSize: 13 }}>
                    เริ่มทำแบบทดสอบ (20 ข้อ)
                  </button>
                </div>
              )}

              {started && !completed && questions.length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                    <span>ข้อที่ {currentIndex + 1} จาก {questions.length}</span>
                    <span style={{ textTransform: "uppercase", fontWeight: 600, color: questions[currentIndex].difficulty === "hard" ? "#e05555" : questions[currentIndex].difficulty === "medium" ? "#3b73c4" : "var(--teal)" }}>
                      ระดับ: {questions[currentIndex].difficulty === "hard" ? "ยาก" : questions[currentIndex].difficulty === "medium" ? "ปานกลาง" : "ง่าย"}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg3)", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
                    <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: "100%", background: "var(--teal)", transition: "width 0.2s" }}></div>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16, lineHeight: 1.5 }}>
                    {questions[currentIndex].question}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {questions[currentIndex].options.map((option, idx) => {
                      const isSelected = selectedOption === idx
                      const isCorrect = idx === questions[currentIndex].answerIndex
                      let bg = "var(--bg3)"
                      let border = "1px solid var(--br)"
                      let color = "var(--text)"

                      if (showExplanation) {
                        if (isCorrect) {
                          bg = "rgba(45, 190, 160, 0.12)"
                          border = "1.5px solid var(--teal)"
                          color = "var(--teal)"
                        } else if (isSelected) {
                          bg = "rgba(224, 85, 85, 0.1)"
                          border = "1.5px solid #e05555"
                          color = "#e05555"
                        }
                      } else if (isSelected) {
                        border = "1.5px solid var(--teal)"
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={showExplanation}
                          style={{
                            textAlign: "left",
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: bg,
                            border: border,
                            color: color,
                            fontSize: 13,
                            cursor: showExplanation ? "default" : "pointer",
                            transition: "all 0.15s ease",
                            fontFamily: "'Prompt', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span>{option}</span>
                          {showExplanation && (
                            isCorrect ? (
                              <i className="ti ti-circle-check" style={{ fontSize: 16, color: "var(--teal)" }}></i>
                            ) : isSelected ? (
                              <i className="ti ti-circle-x" style={{ fontSize: 16, color: "#e05555" }}></i>
                            ) : null
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {showExplanation && (
                    <div style={{ animation: "pageFadeIn 0.2s ease-out" }}>
                      <div style={{ background: "rgba(45, 190, 160, 0.05)", borderLeft: "3px solid var(--teal)", padding: "10px 14px", borderRadius: "0 8px 8px 0", fontSize: 12, color: "var(--t2)", lineHeight: 1.5, marginBottom: 16 }}>
                        <strong style={{ display: "block", color: "var(--teal)", marginBottom: 4 }}>คำอธิบายความรู้:</strong>
                        {questions[currentIndex].explanation}
                      </div>

                      <button className="btn btn-teal" onClick={handleNext} style={{ width: "100%", padding: "10px 0", borderRadius: 20, fontSize: 13 }}>
                        {currentIndex < questions.length - 1 ? "ทำข้อถัดไป ➔" : "ดูผลลัพธ์การทดสอบ"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {completed && (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: correctAnswersCount >= 12 ? "rgba(45, 190, 160, 0.12)" : "rgba(224, 85, 85, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <i className={`ti ${correctAnswersCount >= 12 ? "ti-circle-check-filled" : "ti-circle-x-filled"}`} style={{ color: correctAnswersCount >= 12 ? "var(--teal)" : "#e05555", fontSize: 44 }}></i>
                  </div>

                  <h4 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>
                    {correctAnswersCount >= 12 ? "สอบผ่านเกณฑ์ทบทวนความรู้! 🎉" : "คะแนนยังไม่ผ่านเกณฑ์"}
                  </h4>
                  <p style={{ fontSize: 24, fontWeight: 700, color: correctAnswersCount >= 12 ? "var(--teal)" : "#e05555", margin: "8px 0" }}>
                    {correctAnswersCount} / 20 คะแนน
                  </p>
                  <p style={{ fontSize: 13, color: "var(--t2)", margin: "0 0 20px", lineHeight: 1.5 }}>
                    {correctAnswersCount >= 12
                      ? "ยอดเยี่ยมมากครับ! คุณจดจำและทำความเข้าใจหนังสือเรื่องนี้ได้ดีมาก ได้ทบทวนบทเรียนและทำภารกิจสำเร็จ"
                      : "พยายามอีกนิดครับ! ลองอ่านทวนบทเรียนในหนังสือหรือสมุดข้อคิด จากนั้นเข้ามาเริ่มทำแบบทดสอบใหม่อีกครั้งนะ"
                    }
                  </p>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-outline" onClick={handleRestart} style={{ flex: 1, borderRadius: 20 }}>
                      ทำแบบทดสอบอีกครั้ง
                    </button>
                    <button className="btn btn-teal" onClick={onClose} style={{ flex: 1, borderRadius: 20 }}>
                      ปิดหน้าต่าง
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
