// ============================================================
//  TALIB CLUB — ข้อมูลห้องสมุด
//  วิธีเพิ่มหนังสือ/วารสาร: copy object แก้ข้อมูล แล้ว save
// ============================================================

export const BOOK_TYPES = ["หนังสือ", "วารสาร", "PDF", "รายงาน"]

export const BOOKS = [
  {
    id: 1,
    title: "เตาฮีดสำหรับผู้เริ่มต้น",
    author: "Talib Club",
    type: "หนังสือ",   // "หนังสือ" | "วารสาร" | "PDF" | "รายงาน"
    category: "อากีดะฮ์",
    year: 2567,
    desc: "คู่มือทำความเข้าใจหลักความเชื่ออิสลามเบื้องต้น เหมาะสำหรับผู้เริ่มศึกษา",
    fileUrl: "#",       // ← ใส่ลิงก์ Google Drive หรือ URL จริง
    coverUrl: "",       // ← ใส่ URL รูปปก (ถ้ามี)
    isNew: false,
  },
  {
    id: 2,
    title: "Talib Journal ฉบับที่ 5",
    author: "Talib Club",
    type: "วารสาร",
    category: "รวม",
    year: 2568,
    desc: "วารสารวิชาการอิสลามศึกษา รวมบทความคัดสรรจากนักวิชาการ",
    fileUrl: "#",
    coverUrl: "",
    isNew: true,
  },
  {
    id: 3,
    title: "รวมดุอาอ์จากซุนนะฮ์",
    author: "Talib Club",
    type: "PDF",
    category: "อิบาดะฮ์",
    year: 2567,
    desc: "รวบรวมดุอาอ์ที่ถูกต้องจากหะดีษที่เศาะฮีฮ์ พร้อมคำอ่านและความหมาย",
    fileUrl: "#",
    coverUrl: "",
    isNew: false,
  },
  {
    id: 4,
    title: "ประวัติศาสตร์อิสลามในอุษาคเนย์",
    author: "Talib Club",
    type: "หนังสือ",
    category: "ประวัติศาสตร์",
    year: 2568,
    desc: "ศึกษาการแพร่กระจายของอิสลามในภูมิภาคเอเชียตะวันออกเฉียงใต้",
    fileUrl: "#",
    coverUrl: "",
    isNew: true,
  },
]
