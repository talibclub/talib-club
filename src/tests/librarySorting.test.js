import { describe, it, expect } from "vitest"
import { isJournal, getTimestampMs } from "../utils/library.js"

describe("library utilities", () => {
  it("correctly identifies journals in various representations", () => {
    expect(isJournal("journal")).toBe(true)
    expect(isJournal("Journal")).toBe(true)
    expect(isJournal("วารสาร")).toBe(true)
    expect(isJournal(" วารสาร ")).toBe(true)
    expect(isJournal("book")).toBe(false)
    expect(isJournal("หนังสือ")).toBe(false)
    expect(isJournal("pdf")).toBe(false)
    expect(isJournal(null)).toBe(false)
    expect(isJournal(undefined)).toBe(false)
    expect(isJournal("")).toBe(false)
  })

  it("converts timestamps from multiple formats to milliseconds", () => {
    const now = Date.now()
    expect(getTimestampMs(now)).toBe(now)

    // Firestore Timestamp mock with toDate()
    const firestoreMock = { toDate: () => new Date(1700000000000) }
    expect(getTimestampMs(firestoreMock)).toBe(1700000000000)

    // Serialized { seconds, nanoseconds }
    const serializedMock = { seconds: 1700000000, nanoseconds: 500000000 }
    expect(getTimestampMs(serializedMock)).toBe(1700000000500)

    // JS Date
    const d = new Date(1650000000000)
    expect(getTimestampMs(d)).toBe(1650000000000)

    // ISO string
    expect(getTimestampMs("2026-03-01T00:00:00.000Z")).toBe(Date.parse("2026-03-01T00:00:00.000Z"))

    // Null/undefined
    expect(getTimestampMs(null)).toBe(0)
    expect(getTimestampMs(undefined)).toBe(0)
    expect(getTimestampMs("invalid-date")).toBe(0)
  })

  describe("AdminLibrary sorting logic", () => {
    function sortLibraryItems(items, sortOrder = "newest") {
      const normalizeYear = (yr) => {
        let y = Number(yr) || 0
        if (y > 2400) y -= 543
        return y
      }

      return [...items].sort((a, b) => {
        const yearA = normalizeYear(a.year)
        const yearB = normalizeYear(b.year)

        if (sortOrder === "newest") {
          // 1. Year descending
          if (yearA !== yearB) return yearB - yearA

          // 2. If year is equal: If both are journals, sort by issueNumber descending
          const isJournalA = isJournal(a.type)
          const isJournalB = isJournal(b.type)
          if (isJournalA && isJournalB) {
            const issueA = Number(a.issueNumber) || 0
            const issueB = Number(b.issueNumber) || 0
            if (issueA !== issueB) return issueB - issueA
          } else if (a.issueNumber !== undefined && b.issueNumber !== undefined && a.issueNumber !== "" && b.issueNumber !== "") {
            const issueA = Number(a.issueNumber) || 0
            const issueB = Number(b.issueNumber) || 0
            if (issueA !== issueB) return issueB - issueA
          }

          // 3. Creation date descending
          const createdA = getTimestampMs(a.createdAt)
          const createdB = getTimestampMs(b.createdAt)
          if (createdA !== createdB) return createdB - createdA

          // 4. Update date fallback
          const updatedA = getTimestampMs(a.updatedAt)
          const updatedB = getTimestampMs(b.updatedAt)
          if (updatedA !== updatedB) return updatedB - updatedA

          // 5. Natural numeric-aware ID sort
          return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true })
        } else {
          if (yearA !== yearB) return yearA - yearB

          const isJournalA = isJournal(a.type)
          const isJournalB = isJournal(b.type)
          if (isJournalA && isJournalB) {
            const issueA = Number(a.issueNumber) || 0
            const issueB = Number(b.issueNumber) || 0
            if (issueA !== issueB) return issueA - issueB
          } else if (a.issueNumber !== undefined && b.issueNumber !== undefined && a.issueNumber !== "" && b.issueNumber !== "") {
            const issueA = Number(a.issueNumber) || 0
            const issueB = Number(b.issueNumber) || 0
            if (issueA !== issueB) return issueA - issueB
          }

          const createdA = getTimestampMs(a.createdAt)
          const createdB = getTimestampMs(b.createdAt)
          if (createdA !== createdB) return createdA - createdB

          const updatedA = getTimestampMs(a.updatedAt)
          const updatedB = getTimestampMs(b.updatedAt)
          if (updatedA !== updatedB) return updatedA - updatedB

          return String(a.id || "").localeCompare(String(b.id || ""), undefined, { numeric: true })
        }
      })
    }

    it("sorts journals by issueNumber (latest issue first) when year is the same", () => {
      const journals = [
        { id: "1", title: "เล่ม 1", type: "วารสาร", year: 2569, issueNumber: 1, createdAt: 1000 },
        { id: "2", title: "เล่ม 3", type: "journal", year: 2569, issueNumber: 3, createdAt: 3000 },
        { id: "3", title: "เล่ม 2", type: "วารสาร", year: 2569, issueNumber: 2, createdAt: 2000 },
      ]

      const sorted = sortLibraryItems(journals, "newest")
      expect(sorted.map(j => j.issueNumber)).toEqual([3, 2, 1])
    })

    it("sorts newest item to the top based on createdAt when year is identical and not journal", () => {
      const books = [
        { id: "1", title: "หนังสือ A", type: "book", year: 2569, createdAt: 1000 },
        { id: "2", title: "หนังสือ B ที่เพิ่งเพิ่มใหม่", type: "book", year: 2569, createdAt: 5000 },
        { id: "3", title: "หนังสือ C", type: "book", year: 2569, createdAt: 2000 },
      ]

      const sorted = sortLibraryItems(books, "newest")
      expect(sorted[0].title).toBe("หนังสือ B ที่เพิ่งเพิ่มใหม่")
      expect(sorted.map(b => b.id)).toEqual(["2", "3", "1"])
    })

    it("does not let older books with updatedAt overwrite createdAt when adding a new book", () => {
      const books = [
        { id: "old-1", title: "หนังสือเก่าที่เพิ่งกดซิงก์", type: "book", year: 2569, createdAt: 1000, updatedAt: 999999 },
        { id: "new-1", title: "หนังสือที่กดเพิ่มล่าสุด", type: "book", year: 2569, createdAt: 5000, updatedAt: 5000 },
      ]

      const sorted = sortLibraryItems(books, "newest")
      expect(sorted[0].id).toBe("new-1")
    })

    it("sorts by year first when years differ", () => {
      const items = [
        { id: "1", title: "ปี 2567", type: "book", year: 2567 },
        { id: "2", title: "ปี 2569", type: "book", year: 2569 },
        { id: "3", title: "ปี 2568", type: "book", year: 2568 },
      ]

      const sorted = sortLibraryItems(items, "newest")
      expect(sorted.map(i => i.year)).toEqual([2569, 2568, 2567])
    })

    it("sorts correctly in oldest order", () => {
      const journals = [
        { id: "1", title: "เล่ม 3", type: "วารสาร", year: 2569, issueNumber: 3 },
        { id: "2", title: "เล่ม 1", type: "วารสาร", year: 2569, issueNumber: 1 },
        { id: "3", title: "เล่ม 2", type: "วารสาร", year: 2569, issueNumber: 2 },
      ]

      const sorted = sortLibraryItems(journals, "oldest")
      expect(sorted.map(j => j.issueNumber)).toEqual([1, 2, 3])
    })
  })
})
