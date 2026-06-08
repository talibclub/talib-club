// ============================================================
//  TALIB CLUB — ข้อมูลหมวดหมู่บทความ (ดึงข้อมูลบทความจาก Firebase 100%)
// ============================================================

export const ARTICLE_CATEGORIES = [
  {
    "id": "all",
    "label": "ทั้งหมด"
  },
  {
    "id": "aqeedah",
    "label": "อากีดะฮ์"
  },
  {
    "id": "fiqh",
    "label": "ฟิกฮ์"
  },
  {
    "id": "seerah",
    "label": "ซีเราะฮ์"
  },
  {
    "id": "hadith",
    "label": "ฮะดีษ"
  },
  {
    "id": "social",
    "label": "สังคมศาสตร์"
  },
  {
    "id": "tafsir",
    "label": "ตัฟซีร"
  }
];

export const ARTICLE_TYPES = [
  {
    "id": "all",
    "label": "ทุกประเภท"
  },
  {
    "id": "series",
    "label": "ซีรีส์"
  },
  {
    "id": "general",
    "label": "บทความทั่วไป"
  },
  {
    "id": "specific",
    "label": "บทความเฉพาะเรื่อง"
  }
];

// เคลียร์บทความเดิมในโค้ดออกทั้งหมด เพื่อให้ระบบดึงข้อมูลจาก Firebase ออนไลน์เท่านั้น
export const ARTICLES = [];