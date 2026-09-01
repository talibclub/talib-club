import { describe, it, expect } from "vitest"
import { isJournal, getTimestampMs } from "../utils/library.js"

describe("Realtime Notifications Logic", () => {
  const parseDateToMs = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return 0
    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      let year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const day = parseInt(match[3], 10)
      if (year > 2400) year -= 543
      return new Date(year, month, day).getTime()
    }
    const parsed = Date.parse(dateStr)
    return isNaN(parsed) ? 0 : parsed
  }

  const getDocTime = (doc) => {
    return getTimestampMs(doc.createdAt) || parseDateToMs(doc.date) || getTimestampMs(doc.updatedAt) || 0
  }

  const sortBooks = (items) => {
    return [...items].sort((a, b) => {
      let yA = Number(a.year) || 0
      if (yA > 2400) yA -= 543
      let yB = Number(b.year) || 0
      if (yB > 2400) yB -= 543
      if (yA !== yB) return yB - yA

      const isJA = isJournal(a.type)
      const isJB = isJournal(b.type)
      if (isJA && isJB) {
        const issA = Number(a.issueNumber) || 0
        const issB = Number(b.issueNumber) || 0
        if (issA !== issB) return issB - issA
      }
      const tA = getTimestampMs(a.createdAt)
      const tB = getTimestampMs(b.createdAt)
      if (tA !== tB) return tB - tA
      return getTimestampMs(b.updatedAt) - getTimestampMs(a.updatedAt)
    })
  }

  it("sorts articles accurately regardless of BE / CE date format", () => {
    const articles = [
      { id: "1", title: "บทความปี 2568", date: "2568-12-01" },
      { id: "2", title: "บทความล่าสุดปี 2569", date: "2569-05-20" },
      { id: "3", title: "บทความปี ค.ศ. 2025", date: "2025-01-01" },
    ]

    const sorted = [...articles].sort((a, b) => getDocTime(b) - getDocTime(a))
    expect(sorted[0].id).toBe("2")
    expect(sorted[0].title).toBe("บทความล่าสุดปี 2569")
  })

  it("sorts books giving priority to newest journal issue number when years are the same", () => {
    const books = [
      { id: "j1", title: "วารสารตอลิบ", type: "วารสาร", year: 2569, issueNumber: 1, createdAt: 1000 },
      { id: "j5", title: "วารสารตอลิบ", type: "วารสาร", year: 2569, issueNumber: 5, createdAt: 5000 },
      { id: "j3", title: "วารสารตอลิบ", type: "journal", year: 2569, issueNumber: 3, createdAt: 3000 },
      { id: "b1", title: "หนังสือทั่วไป", type: "book", year: 2568, createdAt: 9000 },
    ]

    const sorted = sortBooks(books)
    expect(sorted[0].id).toBe("j5")
    expect(sorted[0].issueNumber).toBe(5)
  })

  it("filters out closed and inactive campaigns", () => {
    const campaigns = [
      { id: "c1", title: "แคมเปญเก่าปิดแล้ว", status: "closed", createdAt: 9000 },
      { id: "c2", title: "แคมเปญใหม่เปิดอยู่", status: "active", createdAt: 5000 },
      { id: "c3", title: "แคมเปญถูกระงับ", status: "inactive", createdAt: 6000 },
    ]

    const active = campaigns
      .filter(d => !d.deleted && d.status !== "closed" && d.status !== "inactive")
      .sort((a, b) => getDocTime(b) - getDocTime(a))

    expect(active.length).toBe(1)
    expect(active[0].id).toBe("c2")
  })

  it("formats notification items with proper journal tags and titles", () => {
    const bookDoc = { id: "101", title: "วารสารเสียงแห่งความรู้", type: "วารสาร", issueNumber: 4, year: 2569 }
    const isJr = isJournal(bookDoc.type)

    const notifItem = {
      id: `book-${bookDoc.id}`,
      title: isJr ? "วารสารฉบับใหม่" : "หนังสือและตำราใหม่",
      desc: isJr
        ? `วารสารล่าสุด: "${bookDoc.title}"${bookDoc.issueNumber !== undefined && bookDoc.issueNumber !== "" ? ` เล่มที่ ${bookDoc.issueNumber}` : ""}`
        : `ดาวน์โหลดผลงานล่าสุด: "${bookDoc.title}" หมวดหมู่ ${bookDoc.category || "ทั่วไป"}`,
      icon: isJr ? "ti-news" : "ti-book",
    }

    expect(notifItem.title).toBe("วารสารฉบับใหม่")
    expect(notifItem.desc).toContain("เล่มที่ 4")
    expect(notifItem.icon).toBe("ti-news")
  })
})
