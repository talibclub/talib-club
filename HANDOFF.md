# Talib Club — Handoff Document
# สำหรับส่งต่อให้ AI ตัวอื่น (Gemini / Claude / GPT)

## Context
เว็บไซต์วิชาการอิสลามของ "Talib Club" จาก Pattani, Thailand
- Facebook: https://www.facebook.com/TalibPublisher
- Deploy: Netlify (เชื่อมกับ GitHub repo: vmafia/talib-club)

---

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: CSS Variables (dark/light theme), Prompt font (Google Fonts)
- **Icons**: Tabler Icons (CDN)
- **Deploy**: Netlify (auto-deploy เมื่อ push ขึ้น GitHub)
- **Database (Phase 2)**: Supabase (ยังไม่ได้ทำ)

---

## โครงสร้างไฟล์ที่สำคัญ

```
src/
├── App.jsx              — routing หลัก (ใช้ state แทน react-router)
├── styles/global.css    — CSS variables dark/light + global styles
├── hooks/useTheme.js    — dark/light mode + localStorage
├── utils/format.js      — formatDate, truncate
│
├── data/                — แก้ตรงนี้เพื่ออัปเดตข้อมูล (ไม่ต้องรู้ React)
│   ├── site.js          — ชื่อเว็บ, social links, อายะฮ์
│   ├── articles.js      — บทความ (type: series/general/specific/social)
│   ├── books.js         — หนังสือ/วารสาร/PDF
│   ├── media.js         — YouTube embedId / Spotify URL
│   ├── scholars.js      — อุลามาอ์ (era 1-4)
│   ├── tracking.js      — orders (placeholder, ระบบจริงใช้ Firebase)
│   └── index.js         — re-export ทุกไฟล์
│
├── components/
│   ├── Nav.jsx          — sticky navbar + theme toggle + login button
│   └── ui/index.js      — Tag, Card, Pills, SearchInput, Empty, BackBtn, SecHeader
│
└── pages/
    ├── Home.jsx         — hero, ayah, stats, preview sections, donate banner
    ├── Articles.jsx     — filter by category/type, series groups, article grid
    ├── ArticleDetail.jsx — article body, tags, related articles
    ├── Library.jsx      — filter by type, download button
    ├── Media.jsx        — YouTube embed + Spotify, filter
    ├── Scholars.jsx     — timeline by era, search, field filter
    └── Tracking.jsx     — iframe embed ของระบบ tracking เดิม

public/
└── tracking-system.html — ระบบ tracking เดิมทั้งหมด (Firebase-based)
                           มี: ค้นหารายชื่อ, เลข track, admin dashboard,
                           PDF extractor, CSV matching, label printing
```

---

## CSS Theme System

```css
/* Dark mode variables (ดูใน src/styles/global.css) */
--bg, --bg2, --bg3      — backgrounds
--text, --t2, --t3      — text colors
--acc, --acc2, --acc-br — accent (off-white/charcoal)
--teal, --teal-bg       — teal accent color
--br, --br2             — borders
--card                  — card background
--inp                   — input background

/* ใช้งานแบบนี้ใน JSX */
style={{ color: "var(--text)", background: "var(--card)" }}
```

---

## Routing System
ไม่ใช้ react-router — ใช้ state ธรรมดาใน App.jsx:
```jsx
const go = (page, data = null) => { setPage(page); setCtx(data); }

// Navigate:
go("articles")           // ไปหน้า articles
go("article", articleObj) // ไปหน้า article พร้อมส่ง data
```

---

## สิ่งที่ทำเสร็จแล้ว (Phase 1)
- [x] Home page
- [x] Articles + ArticleDetail (filter, series, categories)
- [x] Library (filter by type, download)
- [x] Media (YouTube embed, Spotify)
- [x] Scholars timeline (era 1-4, search, field filter)
- [x] Tracking (iframe embed ระบบเดิม)
- [x] Dark/Light mode (localStorage)
- [x] Deploy บน Netlify

---

## สิ่งที่ต้องทำต่อ (Phase 2-3)

### Phase 2 — Login & Member System
- [ ] ติดตั้ง Supabase: `npm install @supabase/supabase-js`
- [ ] สร้างไฟล์ `src/lib/supabase.js` สำหรับ client
- [ ] หน้า Login/Register (`src/pages/Auth.jsx`)
- [ ] User profile + member dashboard
- [ ] Reading Streak แบบ Duolingo (เป้าหน้า/วัน + streak counter)
- [ ] My Bookshelf (เพิ่มหนังสือเข้า shelf + progress tracking)

### Phase 3 — AI Features
- [ ] AI Quiz หลังอ่านหนังสือจบ
  - ใช้ Claude API: `claude-sonnet-4-20250514`
  - Flow: อ่านหนังสือจบ → ส่ง text เข้า API → ได้ 5-10 ข้อสอบ → ทำแบบทดสอบ
  - Endpoint: POST https://api.anthropic.com/v1/messages
- [ ] ระบบ bookmark บทความ

---

## Prompt แนะนำสำหรับ AI ตัวถัดไป

```
คุณกำลังต่อเติมเว็บ "Talib Club" ซึ่งเป็นเว็บวิชาการอิสลามภาษาไทย
Tech stack: React 18 + Vite, ไม่มี react-router (ใช้ state routing)
Theme: CSS variables dark/light, Prompt font, Tabler Icons

โปรดอ่านไฟล์ HANDOFF.md และโครงสร้างใน src/ ก่อนเริ่มทำงาน

งานที่ต้องการ: [ระบุงานที่ต้องการ]
```

---

## วิธี Deploy หลังแก้ไข
1. แก้ไขไฟล์ใน GitHub โดยตรง (github.com/vmafia/talib-club)
2. กด Commit changes
3. Netlify auto-deploy ภายใน 2 นาที

