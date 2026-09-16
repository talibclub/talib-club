import React from "react"
import { useUserDoc } from "../lib/contentStore.js"

export default function HomeReadingShortcuts({ uid, go, readingSessions = [] }) {
  const { item: lastRead, loading } = useUserDoc("quran_last_read", uid, `${uid}_last_read`)
  // App already loads sessions newest first; reuse them without another query.
  const lastBook = readingSessions.find(session => session.uid === uid && session.shelfItemId && !session.deleted)
  return (
    <section className="card" aria-label="พื้นที่การอ่านของคุณ" style={{ padding: 20, marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>กลับมาเรียนรู้ต่อ</h2>
      <p style={{ marginBottom: 16 }}>
        {loading ? "กำลังโหลดตำแหน่งที่อ่านล่าสุด…" : lastRead?.sura && lastRead?.aya
          ? `อัลกุรอานล่าสุด: ซูเราะฮ์ ${lastRead.suraName || lastRead.sura} อายะฮ์ ${lastRead.aya}`
          : "เปิดชั้นหนังสือ สมุดโน้ต หรือบทความที่คุณบันทึกไว้"}
      </p>
      {lastBook && <p style={{ marginBottom: 16 }}>หนังสือล่าสุด: {lastBook.bookTitle || "หนังสือบนชั้นของคุณ"}{lastBook.endPage ? ` · หน้า ${lastBook.endPage}` : ""}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {lastBook && <button className="btn btn-teal" onClick={() => go("reader", { shelfItemId: lastBook.shelfItemId })}>อ่านหนังสือล่าสุดต่อ</button>}
        {lastRead?.sura && lastRead?.aya && <button className="btn btn-teal" onClick={() => go("quran", { sura: lastRead.sura, ayah: lastRead.aya })}>อ่านอัลกุรอานต่อ</button>}
        <button className="btn btn-outline" onClick={() => go("reader")}>ชั้นหนังสือของฉัน</button>
        <button className="btn btn-outline" onClick={() => go("member", { view: "notebooks" })}>สมุดโน้ตของฉัน</button>
        <button className="btn btn-outline" onClick={() => go("member", { view: "saved-articles" })}>บทความที่บันทึกไว้</button>
      </div>
    </section>
  )
}
