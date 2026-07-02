// ============================================================
//  Utility functions ใช้ทั่วทั้งแอพ
// ============================================================

// แปลงวันที่ "2568-04-10" → "10 เม.ย. 2568"
export function formatDate(d) {
  if (!d) return ""
  if (typeof d !== "string" || !d.includes("-")) return String(d)
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]
  const [y, m, day] = d.split("-").map(Number)
  if (isNaN(y) || isNaN(m) || isNaN(day)) return String(d)
  return `${day} ${months[m - 1] || ""} ${y}`.trim()
}

// ตัด text ให้ไม่เกิน n ตัวอักษร
export function truncate(str, n = 80) {
  if (!str) return ""
  return str.length > n ? str.slice(0, n) + "…" : str
}

// แปลง Firebase Timestamp หรือ Date object เป็นวันที่แบบไทย
export function formatFirebaseDate(dateValue, includeTime = false) {
  if (!dateValue) return "-"
  const d = dateValue?.toDate ? dateValue.toDate() : (dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue))
  if (isNaN(d.getTime())) return "-"
  
  const options = { year: "numeric", month: "short", day: "numeric" }
  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }
  return new Intl.DateTimeFormat("th-TH", options).format(d)
}
