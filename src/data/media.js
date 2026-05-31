// ============================================================
//  TALIB CLUB — ข้อมูลมีเดีย (YouTube / Spotify)
//  วิธีเพิ่มวิดีโอ YouTube: copy object แก้ embedId (ID จาก URL)
//  เช่น https://youtube.com/watch?v=ABC123 → embedId: "ABC123"
// ============================================================

export const MEDIA = [
  {
    id: 1,
    type: "youtube",        // "youtube" | "spotify"
    title: "อิสลามกับวิทยาศาสตร์ | EP.15",
    channel: "Talib Club",
    duration: "48:22",
    embedId: "dQw4w9WgXcQ", // ← เปลี่ยนเป็น YouTube Video ID จริง
    spotifyUrl: "",         // ← ใส่ถ้า type = "spotify"
    series: "Islam & Modernity",
    date: "2568-04-01",
  },
  {
    id: 2,
    type: "youtube",
    title: "ประวัติศาสตร์อิสลามในอุษาคเนย์ | EP.14",
    channel: "Talib Club",
    duration: "55:10",
    embedId: "dQw4w9WgXcQ",
    spotifyUrl: "",
    series: "Islamic History",
    date: "2568-03-15",
  },
  {
    id: 3,
    type: "spotify",
    title: "อิสลามกับสุขภาพจิต: เราไม่ต้องสู้คนเดียว",
    channel: "Talib Club Podcast",
    duration: "32:14",
    embedId: "",
    spotifyUrl: "https://open.spotify.com/episode/YOUR_EPISODE_ID",
    series: "Islam & Life",
    date: "2568-02-20",
  },
  {
    id: 4,
    type: "spotify",
    title: "เมื่อคนในบ้านไม่เข้าใจ — วิธีรักษาความสัมพันธ์",
    channel: "Talib Club Podcast",
    duration: "45:08",
    embedId: "",
    spotifyUrl: "https://open.spotify.com/episode/YOUR_EPISODE_ID",
    series: "Family Islam",
    date: "2568-01-10",
  },
]
