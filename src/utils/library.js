/**
 * Helper to identify whether a book type represents a journal/periodical (วารสาร)
 */
export function isJournal(type) {
  if (!type) return false
  const t = String(type).trim().toLowerCase()
  return t === "journal" || t === "วารสาร"
}

/**
 * Robust conversion of any date/timestamp representation to millisecond epoch
 * Handles Firestore Timestamp instances, plain { seconds, nanoseconds } objects,
 * JS Date objects, ISO date strings, and raw millisecond numbers.
 */
export function getTimestampMs(val) {
  if (!val) return 0
  if (typeof val === "number") return val
  if (typeof val.toDate === "function") return val.toDate().getTime()
  if (val.seconds) return val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1e6 : 0)
  if (val instanceof Date) return val.getTime()
  if (typeof val === "string") {
    const parsed = Date.parse(val)
    if (!isNaN(parsed)) return parsed
  }
  return 0
}
