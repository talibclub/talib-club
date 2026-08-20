import { describe, it, expect } from "vitest"
import { comparableDate, toGregorianDateString, toSchemaDate } from "../utils/dates.js"
import { mediaDescription, mediaSummary } from "../utils/mediaSeo.js"

// 174 of 178 articles were telling Google they were published in the year 2569.
describe("toGregorianDateString", () => {
  it("converts a Buddhist year and leaves the rest of the string alone", () => {
    expect(toGregorianDateString("2569-05-19")).toBe("2026-05-19")
    expect(toGregorianDateString("2567-10-16")).toBe("2024-10-16")
    expect(toGregorianDateString("2569")).toBe("2026")
  })

  it("leaves Gregorian dates untouched", () => {
    // The admin's bulk-edit control writes these: <input type="date"> always
    // produces a Gregorian year, so both eras exist in the same field.
    expect(toGregorianDateString("2023-02-16")).toBe("2023-02-16")
    expect(toGregorianDateString("2026-07-21T18:51:55.655159Z")).toBe("2026-07-21T18:51:55.655159Z")
  })

  it("hands back anything that is not a leading four-digit year", () => {
    expect(toGregorianDateString("ไม่ระบุ")).toBe("ไม่ระบุ")
    expect(toGregorianDateString("")).toBeUndefined()
    expect(toGregorianDateString(null)).toBeUndefined()
  })
})

describe("toSchemaDate", () => {
  it("keeps a date-only value date-only so the SPA and the prerender match", () => {
    expect(toSchemaDate("2569-05-19")).toBe("2026-05-19")
    expect(toSchemaDate("2023-05-13")).toBe("2023-05-13")
  })

  it("normalises the three shapes updatedAt arrives in", () => {
    const timestamp = { toDate: () => new Date("2026-07-21T18:51:55.000Z") }
    expect(toSchemaDate(timestamp)).toBe("2026-07-21T18:51:55.000Z")
    expect(toSchemaDate(1700000000000)).toBe("2023-11-14T22:13:20.000Z")
    expect(toSchemaDate("2026-07-21T18:51:55.655Z")).toBe("2026-07-21T18:51:55.655Z")
  })

  it("drops values it cannot read rather than emitting an invalid date", () => {
    expect(toSchemaDate("ไม่ระบุ")).toBeUndefined()
    expect(toSchemaDate(undefined)).toBeUndefined()
  })
})

describe("comparableDate", () => {
  it("sorts a Buddhist-dated record ahead of an older Gregorian-dated one", () => {
    const sorted = ["2023-02-16", "2569-05-19", "2026-01-01"]
      .sort((a, b) => comparableDate(b).localeCompare(comparableDate(a)))
    expect(sorted).toEqual(["2569-05-19", "2026-01-01", "2023-02-16"])
  })
})

describe("mediaSummary", () => {
  it("leads with the description an admin wrote", () => {
    const media = { title: "Talib Talk EP.1", series: "Talib Talk", desc: "ว่าด้วยการมองมนุษย์เป็นวัตถุ" }
    expect(mediaDescription(media)).toBe("ว่าด้วยการมองมนุษย์เป็นวัตถุ")
    expect(mediaSummary(media)).toBe("Talib Talk EP.1 — ว่าด้วยการมองมนุษย์เป็นวัตถุ")
  })

  it("falls back to the record's own metadata when nothing is written", () => {
    const media = { title: "Talib Talk EP.1", series: "Talib Talk", channel: "Talib Club" }
    expect(mediaDescription(media)).toBe("")
    expect(mediaSummary(media)).toContain("ซีรีส์ Talib Talk")
  })
})
