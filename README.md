# Talib Club — เว็บไซต์วิชาการอิสลาม

## โครงสร้างโปรเจกต์

```
talib-club/
├── src/
│   ├── data/               ← แก้ตรงนี้เพื่ออัปเดตข้อมูล
│   │   ├── site.js         ← ชื่อเว็บ, social links, อายะฮ์
│   │   ├── articles.js     ← บทความทั้งหมด
│   │   ├── books.js        ← หนังสือ/วารสาร/PDF
│   │   ├── media.js        ← YouTube / Spotify
│   │   ├── scholars.js     ← รายนามอุลามาอ์
│   │   ├── tracking.js     ← ออเดอร์ tracking
│   │   └── index.js        ← re-export (ไม่ต้องแตะ)
│   │
│   ├── pages/              ← แต่ละหน้าของเว็บ
│   │   ├── Home.jsx
│   │   ├── Articles.jsx + ArticleDetail.jsx
│   │   ├── Library.jsx
│   │   ├── Media.jsx
│   │   ├── Scholars.jsx
│   │   └── Tracking.jsx
│   │
│   ├── components/
│   │   ├── Nav.jsx         ← navigation bar
│   │   └── ui/index.js     ← Tag, Card, Pills, SearchInput, ...
│   │
│   ├── hooks/
│   │   └── useTheme.js     ← dark/light mode
│   │
│   ├── utils/
│   │   └── format.js       ← formatDate, truncate
│   │
│   ├── styles/
│   │   └── global.css      ← theme variables + global styles
│   │
│   ├── App.jsx             ← routing หลัก
│   └── main.jsx            ← entry point
│
├── public/                 ← static files (favicon ฯลฯ)
├── index.html
├── vite.config.js
└── package.json
```

## วิธีรัน

```bash
npm install
npm run dev     # development (http://localhost:5173)
npm run build   # build สำหรับ deploy
```

## วิธีอัปเดตข้อมูล (ไม่ต้องรู้โค้ด)

### เพิ่มบทความ
แก้ไฟล์ `src/data/articles.js` — copy object ที่มีอยู่แล้วแก้ข้อมูล:
```js
{
  id: 6,                    // ← เพิ่มทีละ 1
  type: "general",          // general | series | specific | social
  title: "ชื่อบทความ",
  category: "fiqh",         // ดู ARTICLE_CATEGORIES สำหรับ id ที่มี
  excerpt: "บทคัดย่อ",
  author: "ชื่อผู้เขียน",
  date: "2568-05-01",
  readTime: 10,
  coverEmoji: "📚",
  tags: ["tag1", "tag2"],
  body: `เนื้อหาบทความ...`,
}
```

### เพิ่มหนังสือ/PDF
แก้ไฟล์ `src/data/books.js` — ใส่ Google Drive link ใน `fileUrl`

### เพิ่มวิดีโอ YouTube
แก้ไฟล์ `src/data/media.js` — copy URL จาก YouTube แล้วเอา ID ใส่ `embedId`
เช่น `youtube.com/watch?v=ABC123` → `embedId: "ABC123"`

### เพิ่มอุลามาอ์
แก้ไฟล์ `src/data/scholars.js` — ระบุ `era` 1-4

## Deploy บน Netlify (ฟรี)

1. สมัคร [netlify.com](https://netlify.com)
2. "Add new site" → "Deploy manually"
3. รัน `npm run build` แล้วลาก folder `dist/` ไปวาง
4. ได้ URL เว็บทันที!

หรือเชื่อม GitHub แล้ว auto-deploy ทุกครั้งที่ push

## Roadmap

- [x] Phase 1: หน้าหลัก, บทความ, ห้องสมุด, มีเดีย, อุลามาอ์, Tracking
- [ ] Phase 2: ระบบ Login + สมาชิก (Supabase)
- [ ] Phase 2: Reading Streak แบบ Duolingo
- [ ] Phase 3: AI Quiz หลังอ่านหนังสือ (Claude API)
- [ ] Phase 3: My Bookshelf ส่วนตัว
