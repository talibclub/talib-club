import { describe, expect, it } from "vitest"
import { matchesContentSearch } from "../utils/contentSearch.js"

describe("content metadata search", () => {
  it("finds words across a title, author and tag list", () => {
    expect(matchesContentSearch("เตาฮีด   talib", "หลักการเตาฮีด", "Talib Club", ["เบื้องต้น"])).toBe(true)
    expect(matchesContentSearch("เบื้องต้น", "หลักการเตาฮีด", null, ["เบื้องต้น"])).toBe(true)
  })
  it("requires every search word and ignores surrounding whitespace", () => {
    expect(matchesContentSearch("  เตาฮีด ไม่มีคำนี้ ", "หลักการเตาฮีด")).toBe(false)
    expect(matchesContentSearch("   ", undefined, null)).toBe(true)
  })
  it("matches clip titles even when the playlist and channel do not match", () => {
    expect(matchesContentSearch("การละหมาด", "วิธีการละหมาด", "Talib Club", "คลิปแปล")).toBe(true)
    expect(matchesContentSearch("การละหมาด", "Talib Club", "คลิปแปล")).toBe(false)
  })
  it("normalizes canonically equivalent Unicode without losing Thai vowels", () => {
    expect(matchesContentSearch("café", "cafe\u0301")).toBe(true)
    expect(matchesContentSearch("ดี", "ดีน")).toBe(true)
    expect(matchesContentSearch("ดี", "ดู")).toBe(false)
  })
})
