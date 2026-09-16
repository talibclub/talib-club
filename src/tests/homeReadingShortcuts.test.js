import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, it, expect, vi } from "vitest"
import { useUserDoc } from "../lib/contentStore.js"
import HomeReadingShortcuts from "../components/HomeReadingShortcuts.jsx"

vi.mock("../lib/contentStore.js", () => ({ useUserDoc: vi.fn() }))

describe("home reading shortcuts", () => {
  it("does not expose a previous account's reading session", () => {
    useUserDoc.mockReturnValue({ item: null, loading: false })
    const html = renderToStaticMarkup(React.createElement(HomeReadingShortcuts, {
      uid: "current", go: vi.fn(), readingSessions: [
        { uid: "previous", shelfItemId: "other", bookTitle: "Private previous book" },
        { uid: "current", shelfItemId: "mine", bookTitle: "My latest book", endPage: 12 },
      ],
    }))
    expect(html).not.toContain("Private previous book")
    expect(html).toContain("My latest book")
    expect(html).toContain("หน้า 12")
    expect(useUserDoc).toHaveBeenCalledWith("quran_last_read", "current", "current_last_read")
  })

  it("keeps shortcuts available for a member without reading history", () => {
    useUserDoc.mockReturnValue({ item: null, loading: false })
    const html = renderToStaticMarkup(React.createElement(HomeReadingShortcuts, { uid: "new", go: vi.fn() }))
    expect(html).toContain("สมุดโน้ตของฉัน")
    expect(html).toContain("บทความที่บันทึกไว้")
    expect(html).not.toContain("อ่านหนังสือล่าสุดต่อ")
    expect(html).not.toContain("อ่านอัลกุรอานต่อ")
  })
})
