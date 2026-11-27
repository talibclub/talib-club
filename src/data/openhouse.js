// ============================================================
//  TALIB LEARNING HUB (OPEN HOUSE) — ข้อมูลแหล่งเรียนรู้สะลัฟตั้งต้น
//  รวมแหล่งความรู้จาก al-maktabah.site/sources และเครือข่ายวิชาการ
//  แบ่งหมวดหมู่เนื้อหาภายในแต่ละแหล่งอย่างเป็นระบบ ทุกลิงก์ผ่านการตรวจสอบแล้ว
// ============================================================

export const OPENHOUSE_PLATFORM_ORDER = [
  "Website",
  "YouTube",
  "Facebook",
  "Instagram",
  "Telegram",
  "Podcast",
  "TikTok",
]

export const OPENHOUSE_CATEGORIES = [
  { id: "all", label: "ทั้งหมด", icon: "ti-layout-grid" },
  { id: "library", label: "ห้องสมุด & ตำรา PDF", icon: "ti-books" },
  { id: "articles", label: "บทความ & อะกีดะฮ์", icon: "ti-file-text" },
  { id: "quran-hadith", label: "อัลกุรอาน & หะดีษ", icon: "ti-book-2" },
  { id: "fatwa", label: "ฟัตวา & ถาม-ตอบ", icon: "ti-help-circle" },
  { id: "media", label: "ช่องบรรยาย & สื่อ", icon: "ti-video" },
  { id: "institution", label: "สถาบัน & สำนักพิมพ์", icon: "ti-building" },
]

export const OPENHOUSE_BOOTHS = [
  // ==========================================================
  //  1. ห้องสมุดดิจิทัล & สำนักพิมพ์ (ภาษาไทย)
  // ==========================================================
  {
    id: "almaktabah",
    slug: "almaktabah",
    name: "อัลมักตะบะฮ์ อัษรียะฮ์ (Al-Maktabah Al-Athariyyah)",
    category: "library",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.al-maktabah.site",
    },
    description:
      "ห้องสมุดดิจิทัลรวบรวมตำราอิสลามคลาสสิกภาษาไทย แผ่นพับดะอ์วะฮ์ และคลังแหล่งหนังสือสะลัฟ อ่านและดาวน์โหลดออนไลน์ได้ทันที",
    logoUrl: "https://al-maktabah-web.vercel.app/mark.png",
    themeColor: "#f59e0b",
    order: 1,
    networks: [],
    campuses: [
      {
        id: "almaktabah-library",
        name: "คลังตำราและห้องสมุดออนไลน์",
        description: "เข้าชมและค้นหาตำราอิสลามคลาสสิกฉบับเต็ม",
        order: 1,
        links: [
          {
            id: "almaktabah-home",
            title: "หน้าหลักห้องสมุดอัลมักตะบะฮ์ อัษรียะฮ์",
            url: "https://www.al-maktabah.site",
          },
          {
            id: "almaktabah-about",
            title: "เกี่ยวกับโครงการ Al-Maktabah",
            url: "https://www.al-maktabah.site/about",
          },
        ],
      },
      {
        id: "almaktabah-dawah",
        name: "แผ่นพับดะอ์วะฮ์และแหล่งหนังสือแนะนำ",
        description: "สื่อแผ่นพับดะอ์วะฮ์แจกฟรีและรวมลิงก์คลังตำราอื่นๆ",
        order: 2,
        links: [
          {
            id: "almaktabah-pamphlets",
            title: "คลังแผ่นพับดะอ์วะฮ์ (Pamphlets)",
            url: "https://www.al-maktabah.site/pamphlets",
          },
          {
            id: "almaktabah-sources",
            title: "รวมแหล่งหนังสืออื่นๆ (Sources)",
            url: "https://www.al-maktabah.site/sources",
          },
        ],
      },
    ],
  },
  {
    id: "assabiqoon",
    slug: "assabiqoon",
    name: "สำนักพิมพ์อัซซาบิกูน (Assabiqoon Publisher)",
    category: "institution",
    language: "Thai",
    platforms: ["YouTube", "Facebook", "Podcast", "TikTok", "Instagram", "Website"],
    socialLinks: {
      Website: "https://assabiqoon.com/",
      YouTube: "https://www.youtube.com/@AssabiqoonPublisher",
      Facebook: "https://www.facebook.com/AssabiqoonPublisher",
      Podcast:
        "https://open.spotify.com/show/0KQ1XxtEyUeTiIK2rFXM6E?si=26f56fc6735f433e&nd=1&dlsi=e87733e07dd34c17",
      TikTok: "https://www.tiktok.com/@assabiqoon",
      Instagram: "https://www.instagram.com/assabiqoonpublisher",
    },
    description:
      "ดะวะฮฺอัส-สะละฟียะฮฺ | พิสูจน์พระเจ้าเชิงประจักษ์ | เผยแผ่ความจริงและตอบข้อสงสัยต่างศาสนิก",
    logoUrl: "https://yt3.googleusercontent.com/gDlQvKGGtkhKHuS9ZTzdmNYoUuFM8jOVPk6O_ef41hKDeA86_10uuJj13AF36P7kduLH-wFcFA=s900-c-k-c0x00ffffff-no-rj",
    themeColor: "#111827",
    order: 2,
    networks: [],
    campuses: [
      {
        id: "assabiqoon-dawah",
        name: "หมวดพิสูจน์อิสลาม & ตอบข้อสงสัยต่างศาสนิก",
        description: "บทความเชิงเหตุผล หลักฐานเชิงประจักษ์ และคำตอบสำหรับผู้สนใจอิสลาม",
        order: 1,
        links: [
          {
            id: "asb-non-muslim",
            title: "ปัญหาคาใจต่างศาสนิก",
            url: "https://assabiqoon.com/category/non-muslim",
          },
          {
            id: "asb-true-reason",
            title: "การใช้เหตุผลและหลักฐาน",
            url: "https://assabiqoon.com/category/true-reason",
          },
        ],
      },
      {
        id: "assabiqoon-academic",
        name: "หมวดบทความซีรีส์ บทวิเคราะห์ & ประวัติอุละมาอ์",
        description: "งานเขียนเชิงลึก วิเคราะห์แนวคิด และชีวประวัติปราชญ์",
        order: 2,
        links: [
          {
            id: "asb-series",
            title: "บทความซีรีส์ทั้งหมด",
            url: "https://assabiqoon.com/series",
          },
          {
            id: "asb-indepth",
            title: "บทวิเคราะห์เชิงลึก",
            url: "https://assabiqoon.com/category/in-depth",
          },
          {
            id: "asb-scholars",
            title: "ประวัติอุละมาอ์",
            url: "https://assabiqoon.com/category/scholars",
          },
          {
            id: "asb-ikwan",
            title: "บทวิเคราะห์แนวคิดกลุ่มอิควานฯ",
            url: "https://assabiqoon.com/category/muslim-brotherhood",
          },
        ],
      },
      {
        id: "assabiqoon-media",
        name: "ช่องทางวิดีโอ พอดแคสต์ & คลิปสั้น",
        description: "เพลย์ลิสต์บรรยายศาสนาและพอดแคสต์ฟังย้อนหลัง",
        order: 3,
        links: [
          {
            id: "asb-yt-playlists",
            title: "เพลย์ลิสต์ทั้งหมดบน YouTube",
            url: "https://www.youtube.com/@AssabiqoonPublisher/playlists",
          },
          {
            id: "asb-spotify",
            title: "พอดแคสต์สำนักพิมพ์อัซซาบิกูน (Spotify)",
            url: "https://open.spotify.com/show/0KQ1XxtEyUeTiIK2rFXM6E",
          },
          {
            id: "asb-tiktok",
            title: "คลิปสั้นบน TikTok (@assabiqoon)",
            url: "https://www.tiktok.com/@assabiqoon",
          },
        ],
      },
    ],
  },
  {
    id: "rasypubs",
    slug: "rasypubs",
    name: "สำนักพิมพ์รอซี่ย์ (RasyPubs)",
    category: "library",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://rasypubs.pages.dev",
    },
    description:
      "สำนักพิมพ์และคลังบทความ/ตำราแปลแนวทางสะลัฟ แบ่งหมวดหมู่วิชาการครบถ้วนทั้งอะกีดะฮ์ มันฮัจญ์ ซุนนะฮ์ ฟิกฮ์ และตัซกียะฮ์",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 3,
    networks: [],
    campuses: [
      {
        id: "rasypubs-aqidah",
        name: "หมวดอะกีดะฮ์ มันฮัจญ์ & ซุนนะฮ์",
        description: "หลักศรัทธา แนวทางสะลัฟ และการยึดมั่นในซุนนะฮ์",
        order: 1,
        links: [
          {
            id: "rasy-aqidah",
            title: "หมวดอะกีดะฮ์ (หลักศรัทธา)",
            url: "https://rasypubs.pages.dev/category-aqidah.html",
          },
          {
            id: "rasy-manhaj",
            title: "หมวดมันฮัจญ์สะลัฟ",
            url: "https://rasypubs.pages.dev/category-manhaj.html",
          },
          {
            id: "rasy-sunnah",
            title: "หมวดซุนนะฮ์",
            url: "https://rasypubs.pages.dev/category-sunnah.html",
          },
          {
            id: "rasy-bidah",
            title: "หมวดชี้แจงเรื่องบิดอะฮ์",
            url: "https://rasypubs.pages.dev/category-bidah.html",
          },
        ],
      },
      {
        id: "rasypubs-fiqh",
        name: "หมวดฟิกฮ์ อัลกุรอาน & ขัดเกลาจิตใจ",
        description: "บทบัญญัติอิบาดะฮ์ กุรอาน-หะดีษ และมารยาทอิสลาม",
        order: 2,
        links: [
          {
            id: "rasy-fiqh",
            title: "หมวดฟิกฮ์และอิบาดะฮ์",
            url: "https://rasypubs.pages.dev/category-fiqh.html",
          },
          {
            id: "rasy-quran",
            title: "หมวดอัลกุรอานและหะดีษ",
            url: "https://rasypubs.pages.dev/category-quran.html",
          },
          {
            id: "rasy-tazkiyah",
            title: "หมวดขัดเกลาจิตใจและมารยาท",
            url: "https://rasypubs.pages.dev/category-tazkiyah.html",
          },
        ],
      },
    ],
  },
  {
    id: "alhaneefeeyah",
    slug: "alhaneefeeyah",
    name: "ห้องสมุดอัลฮะนีฟียะฮ์ (Alhaneefeeyah)",
    category: "library",
    language: "Thai",
    platforms: ["Website", "YouTube"],
    socialLinks: {
      Website: "https://www.alhaneefeeyah.net",
      YouTube: "https://www.youtube.com/@Alhaneefeeyah",
    },
    description:
      "ห้องสมุดออนไลน์และช่องยูทูบรวบรวมตำราสะลัฟ อะกีดะฮ์ หะดีษ ฟะตาวา ประวัติเศาะฮาบะฮ์ และซีรีส์สอนตำราภาษาไทย",
    logoUrl: "",
    themeColor: "#1e3a8a",
    order: 4,
    networks: [],
    campuses: [
      {
        id: "alh-texts",
        name: "หมวดอะกีดะฮ์ หะดีษ ตำราสะลัฟ & ฟะตาวา",
        description: "คลังตำราหลักศรัทธาและคำวินิจฉัยศาสนา",
        order: 1,
        links: [
          {
            id: "alh-aqidah",
            title: "หมวดอะกีดะฮ์",
            url: "https://www.alhaneefeeyah.net/%E0%B8%AD%E0%B8%B0%E0%B8%81-%E0%B8%94%E0%B8%B0%E0%B8%AE",
          },
          {
            id: "alh-salaf-books",
            title: "หมวดตำราซะลัฟ",
            url: "https://www.alhaneefeeyah.net/%E0%B8%95%E0%B8%B3%E0%B8%A3%E0%B8%B2%E0%B8%8B%E0%B8%B0%E0%B8%A5-%E0%B8%9F",
          },
          {
            id: "alh-hadith",
            title: "หมวดอัลฮะดีษ",
            url: "https://www.alhaneefeeyah.net/%E0%B8%AD-%E0%B8%A5%E0%B8%AE%E0%B8%B0%E0%B8%94-%E0%B8%A9",
          },
          {
            id: "alh-fatwa",
            title: "หมวดฟะตาวา",
            url: "https://www.alhaneefeeyah.net/%E0%B8%9F%E0%B8%B0%E0%B8%95%E0%B8%B2%E0%B8%A7%E0%B8%B2",
          },
        ],
      },
      {
        id: "alh-bio-yt",
        name: "หมวดประวัติสะลัฟ & คลิปสอนตำรา (YouTube)",
        description: "ชีวประวัติเศาะฮาบะฮ์ ชนรุ่นสะลัฟ และคลิปบรรยาย",
        order: 2,
        links: [
          {
            id: "alh-sahabah",
            title: "หมวดเศาะฮาบะฮ์",
            url: "https://www.alhaneefeeyah.net/%E0%B9%80%E0%B8%A8%E0%B8%B2%E0%B8%B0%E0%B8%AE%E0%B8%B2%E0%B8%9A%E0%B8%B0%E0%B8%AE",
          },
          {
            id: "alh-salaf",
            title: "หมวดซะละฟุศศอเลียห์",
            url: "https://www.alhaneefeeyah.net/%E0%B8%8B%E0%B8%B0%E0%B8%A5%E0%B8%B0%E0%B8%9F-%E0%B8%A8%E0%B8%A8%E0%B8%AD%E0%B9%80%E0%B8%A5-%E0%B8%A2%E0%B8%AB",
          },
          {
            id: "alh-yt",
            title: "ช่อง YouTube ห้องสมุดอัลฮะนีฟียะฮ์",
            url: "https://www.youtube.com/@Alhaneefeeyah",
          },
          {
            id: "alh-yt-pl",
            title: "เพลย์ลิสต์สอนตำราทั้งหมด",
            url: "https://www.youtube.com/@Alhaneefeeyah/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "salafi-book",
    slug: "salafi-book",
    name: "คลังหนังสือสะลัฟประเทศไทย (خزانة السلف)",
    category: "library",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://salafi-book.vercel.app",
    },
    description:
      "คลังรวมหนังสือและตำราอิสลามแนวทางสะลัฟในประเทศไทย รวบรวมรายชื่อและไฟล์ตำราสำคัญสำหรับผู้แสวงหาความรู้",
    logoUrl: "",
    themeColor: "#b45309",
    order: 5,
    networks: [],
    campuses: [
      {
        id: "salafi-book-main",
        name: "คลังหนังสือสะลัฟออนไลน์",
        description: "ค้นหาและเปิดดูรายการตำราสะลัฟภาษาไทย",
        order: 1,
        links: [
          {
            id: "sb-home",
            title: "เข้าสู่คลังหนังสือสะลัฟประเทศไทย →",
            url: "https://salafi-book.vercel.app",
          },
        ],
      },
    ],
  },
  {
    id: "salafythai",
    slug: "salafythai",
    name: "เพื่อนร่วมแนวทางสะลัฟ (SalafyThai)",
    category: "articles",
    language: "Thai",
    platforms: ["Website", "Facebook"],
    socialLinks: {
      Website: "https://salafythai.com/",
      Facebook: "https://www.facebook.com/ibntaymiyyahthai",
    },
    description:
      "คลังหนังสือ PDF แจกฟรี บทความอะกีดะฮ์-มันฮัจย์ บทเรียนหนังสือพื้นฐาน และคำชี้แจงเรื่องบิดอะฮ์และกลุ่มหลงผิดตามแนวทางสะลัฟ",
    logoUrl:
      "https://salafythai.com/wp-content/uploads/2020/02/cropped-logo-New-4-32x32.png",
    themeColor: "#0f766e",
    order: 6,
    networks: [],
    campuses: [
      {
        id: "salafythai-core",
        name: "หลักสูตรพื้นฐาน & อะกีดะฮ์-มันฮัจย์",
        description: "บทเรียนหนังสือพื้นฐานและหลักความเชื่อตามความเข้าใจของชาวสะลัฟ",
        order: 1,
        links: [
          {
            id: "st-basics",
            title: "เรียนหนังสือพื้นฐาน",
            url: "https://salafythai.com/?p=4180",
          },
          {
            id: "st-aqidah",
            title: "หมวดอะกีดะฮ์-มันฮัจย์",
            url: "https://salafythai.com/category/aqidah/",
          },
          {
            id: "st-vanguard",
            title: "บล็อกคลังบทความ Salafy Vanguard",
            url: "https://salafyvanguard.wordpress.com",
          },
        ],
      },
      {
        id: "salafythai-refutations",
        name: "หมวดชี้แจงกลุ่มหลงผิด & ฟัตวาในเครือ",
        description: "ข้อควรระวังด้านแนวคิดและค้นหาฟัตวาภาษาไทย",
        order: 2,
        links: [
          {
            id: "st-deviant",
            title: "ความรู้เรื่องกลุ่มหลงผิดและบิดอะฮ์",
            url: "https://salafythai.com/category/deviant/",
          },
          {
            id: "st-fatwathai",
            title: "ค้นหาฟัตวาถาม-ตอบ (FatwaThai)",
            url: "https://fatwathai.com/",
          },
        ],
      },
    ],
  },
  {
    id: "genfa",
    slug: "genfa",
    name: "GenFa (เก็นฟา — สื่ออิสลามสายซุนนะฮ์)",
    category: "articles",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://genfa.co",
    },
    description:
      "คลัง E-Book บทความ และสื่อความรู้อิสลามสายซุนนะฮ์ ครอบคลุมกุรอาน หะดีษ ดุอาอ์ ฟิกฮ์ ครอบครัว ประวัติศาสตร์ และภาษาอาหรับ",
    logoUrl: "",
    themeColor: "#059669",
    order: 7,
    networks: [],
    campuses: [
      {
        id: "genfa-quran",
        name: "หมวดอัลกุรอาน หะดีษ & ดุอาอ์",
        description: "บทความด้านคัมภีร์อัลกุรอาน หะดีษ และอัซการ์ประจำวัน",
        order: 1,
        links: [
          {
            id: "gf-quran",
            title: "อัลกุรอาน & หะดีษ",
            url: "https://genfa.co/category/%e0%b8%9a%e0%b8%97%e0%b8%84%e0%b8%a7%e0%b8%b2%e0%b8%a1/%e0%b8%ad%e0%b8%b1%e0%b8%a5%e0%b8%81%e0%b8%b8%e0%b8%a3%e0%b8%ad%e0%b9%88%e0%b8%b2%e0%b8%99-%e0%b8%ab%e0%b8%b0%e0%b8%94%e0%b8%b5%e0%b8%a9/",
          },
          {
            id: "gf-dua",
            title: "ดุอาอ์ & อัซการ์",
            url: "https://genfa.co/category/%e0%b8%9a%e0%b8%97%e0%b8%84%e0%b8%a7%e0%b8%b2%e0%b8%a1/%e0%b8%94%e0%b8%b8%e0%b8%ad%e0%b8%b2%e0%b8%ad%e0%b9%8c-%e0%b8%ad%e0%b8%b1%e0%b8%8b%e0%b8%81%e0%b8%b2%e0%b8%a3/",
          },
        ],
      },
      {
        id: "genfa-life",
        name: "หมวดฟิกฮ์ ครอบครัว ประวัติศาสตร์ & ภาษาอาหรับ",
        description: "ความรู้ด้านศาสนบัญญัติ การเลี้ยงลูก และภาษาอาหรับ",
        order: 2,
        links: [
          {
            id: "gf-fiqh",
            title: "ฟิกฮ์ & ถาม-ตอบ",
            url: "https://genfa.co/category/%e0%b8%9a%e0%b8%97%e0%b8%84%e0%b8%a7%e0%b8%b2%e0%b8%a1/%e0%b8%9f%e0%b8%b4%e0%b8%81%e0%b8%ae%e0%b8%ba-%e0%b8%96%e0%b8%b2%e0%b8%a1%e0%b8%95%e0%b8%ad%e0%b8%9a/",
          },
          {
            id: "gf-family",
            title: "ครอบครัว & การเลี้ยงลูก",
            url: "https://genfa.co/category/%e0%b8%9a%e0%b8%97%e0%b8%84%e0%b8%a7%e0%b8%b2%e0%b8%a1/%e0%b8%84%e0%b8%a3%e0%b8%ad%e0%b8%9a%e0%b8%84%e0%b8%a3%e0%b8%b1%e0%b8%a7-%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b9%80%e0%b8%a5%e0%b8%b5%e0%b9%89%e0%b8%a2%e0%b8%87%e0%b8%a5%e0%b8%b9%e0%b8%81/",
          },
          {
            id: "gf-history",
            title: "ประวัติศาสตร์อิสลาม",
            url: "https://genfa.co/category/%e0%b8%9a%e0%b8%97%e0%b8%84%e0%b8%a7%e0%b8%b2%e0%b8%a1/%e0%b8%9b%e0%b8%a3%e0%b8%b0%e0%b8%a7%e0%b8%b1%e0%b8%95%e0%b8%b4%e0%b8%a8%e0%b8%b2%e0%b8%aa%e0%b8%95%e0%b8%a3%e0%b9%8c/",
          },
          {
            id: "gf-arabic",
            title: "ภาษาอาหรับ",
            url: "https://genfa.co/category/%e0%b8%9a%e0%b8%97%e0%b8%84%e0%b8%a7%e0%b8%b2%e0%b8%a1/%e0%b8%a0%e0%b8%b2%e0%b8%a9%e0%b8%b2%e0%b8%ad%e0%b8%b2%e0%b8%ab%e0%b8%a3%e0%b8%b1%e0%b8%9a/",
          },
        ],
      },
    ],
  },
  {
    id: "rightpath",
    slug: "rightpath",
    name: "Right Path Salafi",
    category: "articles",
    language: "Thai",
    platforms: ["Website", "Facebook", "Instagram"],
    socialLinks: {
      Website: "https://rightpath.info",
      Facebook: "https://www.facebook.com/RightPath.219",
      Instagram: "https://www.instagram.com/right_path.219/",
    },
    description:
      "แหล่งบทความวิชาการด้านพิสูจน์อิสลามเชิงประจักษ์ หักล้างข้อกล่าวหา และหลักการเรียนรู้อิสลามที่ถูกต้องตามแนวทางสะลัฟ",
    logoUrl: "",
    themeColor: "#0284c7",
    order: 8,
    networks: [],
    campuses: [
      {
        id: "rp-articles",
        name: "หมวดบทความหลัก",
        description: "แบ่งหมวดหมู่บทความพิสูจน์ความจริงและเรียนรู้อิสลาม",
        order: 1,
        links: [
          {
            id: "rp-proof",
            title: "พิสูจน์อิสลามเชิงประจักษ์",
            url: "https://rightpath.info/browse/empirical-proof-of-islam",
          },
          {
            id: "rp-refute",
            title: "หักล้างข้อกล่าวหา",
            url: "https://rightpath.info/browse/refuting-false-claims",
          },
          {
            id: "rp-understand",
            title: "เรียนรู้อิสลาม",
            url: "https://rightpath.info/browse/understanding-islam",
          },
          {
            id: "rp-browse",
            title: "บทความทั้งหมด",
            url: "https://rightpath.info/browse",
          },
        ],
      },
      {
        id: "rp-social",
        name: "ช่องทางโซเชียลมีเดีย",
        description: "ติดตามอินโฟกราฟิกและบทความสั้นประจำวัน",
        order: 2,
        links: [
          {
            id: "rp-fb",
            title: "เพจ Facebook Right Path Salafi",
            url: "https://www.facebook.com/RightPath.219",
          },
          {
            id: "rp-ig",
            title: "Instagram (@right_path.219)",
            url: "https://www.instagram.com/right_path.219/",
          },
        ],
      },
    ],
  },
  {
    id: "darisslamm",
    slug: "darisslamm",
    name: "ดารุสสลาม (Darisslamm)",
    category: "articles",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://darisslamm.com",
    },
    description:
      "คลังบทความวิชาการอิสลามภาษาไทย แยกหมวดหมู่อย่างชัดเจนทั้งอะกีดะฮ์ หะดีษ ฟิกฮ์อิบาดาต-มุอามาลาต ประวัติศาสตร์ และขัดเกลาจิตใจ",
    logoUrl: "",
    themeColor: "#047857",
    order: 9,
    networks: [],
    campuses: [
      {
        id: "dar-foundations",
        name: "หมวดอะกีดะฮ์ หะดีษ ประวัติศาสตร์ & ขัดเกลาจิตใจ",
        description: "รากฐานศรัทธา วจนะนบี และพัฒนาจิตวิญญาณ",
        order: 1,
        links: [
          {
            id: "dar-aqidah",
            title: "หมวดอะกีดะฮ์",
            url: "https://darisslamm.com/category/aqidah/",
          },
          {
            id: "dar-hadith",
            title: "หมวดหะดีษ",
            url: "https://darisslamm.com/category/hadith/",
          },
          {
            id: "dar-history",
            title: "หมวดประวัติศาสตร์",
            url: "https://darisslamm.com/category/history/",
          },
          {
            id: "dar-tazkiyah",
            title: "หมวดขัดเกลาจิตใจ",
            url: "https://darisslamm.com/category/article/%e0%b8%82%e0%b8%b1%e0%b8%94%e0%b9%80%e0%b8%81%e0%b8%a5%e0%b8%b2%e0%b8%88%e0%b8%b4%e0%b8%95%e0%b9%83%e0%b8%88/",
          },
        ],
      },
      {
        id: "dar-fiqh",
        name: "หมวดฟิกฮ์อิบาดาต & มุอามาลาต",
        description: "บทบัญญัติการละหมาด รอมฎอน และธุรกรรมอิสลาม",
        order: 2,
        links: [
          {
            id: "dar-ibadah",
            title: "ฟิกฮ์อิบาดาตทั้งหมด",
            url: "https://darisslamm.com/category/%e0%b8%9f%e0%b8%b4%e0%b8%81%e0%b8%ae%e0%b9%8c%e0%b8%ad%e0%b8%b4%e0%b8%9a%e0%b8%b2%e0%b8%94%e0%b8%b2%e0%b8%95/",
          },
          {
            id: "dar-salah",
            title: "เกี่ยวกับการละหมาด",
            url: "https://darisslamm.com/category/%e0%b8%9f%e0%b8%b4%e0%b8%81%e0%b8%ae%e0%b9%8c%e0%b8%ad%e0%b8%b4%e0%b8%9a%e0%b8%b2%e0%b8%94%e0%b8%b2%e0%b8%95/%e0%b9%80%e0%b8%81%e0%b8%b5%e0%b9%88%e0%b8%a2%e0%b8%a7%e0%b8%81%e0%b8%b1%e0%b8%9a%e0%b8%81%e0%b8%b2%e0%b8%a3%e0%b8%a5%e0%b8%b0%e0%b8%ab%e0%b8%a1%e0%b8%b2%e0%b8%94/",
          },
          {
            id: "dar-ramadan",
            title: "เกี่ยวกับรอมฎอน",
            url: "https://darisslamm.com/category/%e0%b8%9f%e0%b8%b4%e0%b8%81%e0%b8%ae%e0%b9%8c%e0%b8%ad%e0%b8%b4%e0%b8%9a%e0%b8%b2%e0%b8%94%e0%b8%b2%e0%b8%95/ramdan/",
          },
          {
            id: "dar-muamalat",
            title: "ฟิกฮ์มุอามาลาต",
            url: "https://darisslamm.com/category/fiqh/",
          },
        ],
      },
    ],
  },
  {
    id: "islaminthailand",
    slug: "islaminthailand",
    name: "อิสลามในประเทศไทย (Islam in Thailand)",
    category: "articles",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.islaminthailand.org",
    },
    description:
      "ศูนย์รวมอัลกุรอาน อัซซุนนะฮ์ ประวัตินบี และคลังบทความ/เสียงบรรยายวิชาการโดยคณาจารย์และเชคริฎอ อะหมัด สมะดี",
    logoUrl: "",
    themeColor: "#0d9488",
    order: 10,
    networks: [],
    campuses: [
      {
        id: "iit-hubs",
        name: "ศูนย์รวมอัลกุรอาน หะดีษ & ซีเราะฮ์",
        description: "หมวดคัมภีร์หลักและชีวประวัติท่านนบี ﷺ",
        order: 1,
        links: [
          {
            id: "iit-quran",
            title: "ศูนย์อัลกุรอาน (AlQuranHub)",
            url: "https://islaminthailand.org/AlQuranHub",
          },
          {
            id: "iit-sunnah",
            title: "ศูนย์อัซซุนนะฮ์ / หะดีษ (AssunnahHub)",
            url: "https://islaminthailand.org/AssunnahHub",
          },
          {
            id: "iit-seerah",
            title: "ประวัตินบี (Seerah)",
            url: "https://islaminthailand.org/Seerah1",
          },
        ],
      },
      {
        id: "iit-browse",
        name: "หมวดหมู่บทความและคณาจารย์",
        description: "เลือกอ่านตามหมวดวิชาการและผู้บรรยาย",
        order: 2,
        links: [
          {
            id: "iit-cats",
            title: "สารบัญหมวดหมู่ทั้งหมด",
            url: "https://islaminthailand.org/Catagories",
          },
          {
            id: "iit-rida",
            title: "คลังบทเรียนเชคริฎอ อะหมัด สมะดี",
            url: "https://www.islaminthailand.org/dp8/taxonomy/term/49",
          },
        ],
      },
    ],
  },
  {
    id: "islamhouse-th",
    slug: "islamhouse-th",
    name: "IslamHouse ภาคภาษาไทย",
    category: "library",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://islamhouse.com/th/",
    },
    description:
      "คลังความรู้อิสลามนานาชาติภาคภาษาไทย รวบรวมหนังสือ PDF บทความ ฟัตวา ไฟล์เสียง และวิดีโอที่ผ่านการตรวจสอบ",
    logoUrl: "https://islamhouse.com/logo_IslamHouse.jpg",
    themeColor: "#1d4ed8",
    order: 11,
    networks: [],
    campuses: [
      {
        id: "islamhouse-reading",
        name: "คลังหนังสือ PDF บทความ & ฟัตวา",
        description: "เอกสารและตำราอิสลามภาษาไทยดาวน์โหลดฟรี",
        order: 1,
        links: [
          {
            id: "ih-books",
            title: "หนังสืออิสลามภาษาไทย (PDF / E-Book)",
            url: "https://islamhouse.com/th/books/th/1",
          },
          {
            id: "ih-articles",
            title: "บทความอิสลามภาษาไทย",
            url: "https://islamhouse.com/th/articles/th/1",
          },
          {
            id: "ih-fatwa",
            title: "ฟัตวาและคำวินิจฉัยศาสนา",
            url: "https://islamhouse.com/th/fatwa/th/1",
          },
        ],
      },
      {
        id: "islamhouse-av",
        name: "คลังสื่อเสียงและวิดีโอ",
        description: "ไฟล์เสียงบรรยายและวิดีโอความรู้ภาคภาษาไทย",
        order: 2,
        links: [
          {
            id: "ih-audios",
            title: "คลังเสียงบรรยายภาษาไทย",
            url: "https://islamhouse.com/th/audios/th/1",
          },
          {
            id: "ih-videos",
            title: "คลังวิดีโอภาษาไทย",
            url: "https://islamhouse.com/th/videos/th/1",
          },
        ],
      },
    ],
  },
  {
    id: "islamland-th",
    slug: "islamland-th",
    name: "IslamLand ภาษาไทย",
    category: "library",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://islamland.com/tha",
    },
    description:
      "คลังหนังสือ บทความ และสื่อดะอ์วะฮ์แปลไทย ครอบคลุมหลักศรัทธาอะกีดะตุสสะลัฟ ฟิกฮ์ และคู่มือมุสลิมหลายภาษา",
    logoUrl: "",
    themeColor: "#0e7490",
    order: 12,
    networks: [],
    campuses: [
      {
        id: "islamland-main",
        name: "คลังเนื้อหาภาษาไทยและนานาชาติ",
        description: "เข้าชมสื่ออิสลามแปลไทย อังกฤษ และอาหรับ",
        order: 1,
        links: [
          {
            id: "il-th",
            title: "IslamLand ภาคภาษาไทย",
            url: "https://islamland.com/tha",
          },
          {
            id: "il-en",
            title: "IslamLand (English)",
            url: "https://islamland.com/eng",
          },
          {
            id: "il-ar",
            title: "IslamLand (العربية)",
            url: "https://islamland.com/ara",
          },
        ],
      },
    ],
  },
  {
    id: "islamicbooks19",
    slug: "islamicbooks19",
    name: "IslamicBooks19 (สำนักพิมพ์ดิจิทัลอิสลาม)",
    category: "library",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://islamicbooks19.netlify.app",
    },
    description:
      "คลังบทความ ดุอาอ์ และหนังสือแนะนำอิสลามภาษาไทยที่ถ่ายทอดความรู้คลาสสิกให้อ่านเข้าใจง่ายและนำไปใช้ได้จริง",
    logoUrl: "",
    themeColor: "#15803d",
    order: 13,
    networks: [],
    campuses: [
      {
        id: "ib19-main",
        name: "คลังหนังสือและบทความแนะนำ",
        description: "เลือกดูหนังสือแนะนำและสื่อความรู้ดิจิทัล",
        order: 1,
        links: [
          {
            id: "ib19-home",
            title: "เข้าสู่หน้าหลัก IslamicBooks19 →",
            url: "https://islamicbooks19.netlify.app",
          },
        ],
      },
    ],
  },

  // ==========================================================
  //  2. อัลกุรอาน ตัฟซีร หะดีษ & ฟัตวา (ภาษาไทย)
  // ==========================================================
  {
    id: "sunnahthai",
    slug: "sunnahthai",
    name: "ซุนนะห์ไทย (SunnahThai)",
    category: "quran-hadith",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://sunnahthai.com/",
    },
    description:
      "แหล่งค้นคว้าอัลกุรอานพร้อมตัฟซีรและบทความวิชาการอิสลามภาษาไทยที่อ่านง่ายและเป็นระบบ",
    logoUrl: "https://sunnahthai.com/upload/logo/launchericon-192x192.png",
    themeColor: "#047857",
    order: 14,
    networks: [],
    campuses: [
      {
        id: "sunnahthai-sections",
        name: "คลังอัลกุรอานและบทความวิชาการ",
        description: "ศึกษาอัลกุรอานพร้อมคำแปลและบทความศาสนา",
        order: 1,
        links: [
          {
            id: "sunnahthai-quran",
            title: "อัลกุรอานและคำแปลภาษาไทย",
            url: "https://sunnahthai.com/quran",
          },
          {
            id: "sunnahthai-articles",
            title: "คลังบทความวิชาการ",
            url: "https://sunnahthai.com/articles",
          },
        ],
      },
    ],
  },
  {
    id: "quranth",
    slug: "quranth",
    name: "QuranTH (อัลกุรอานแปลไทยและตัฟซีร)",
    category: "quran-hadith",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.quranth.com",
    },
    description:
      "เว็บอ่านอัลกุรอานพร้อมคำแปลภาษาไทยและตัฟซีร ค้นหาอายะฮ์และซูเราะฮ์ได้สะดวกรวดเร็ว",
    logoUrl: "",
    themeColor: "#065f46",
    order: 15,
    networks: [],
    campuses: [
      {
        id: "quranth-main",
        name: "อ่านอัลกุรอานและตัฟซีรภาษาไทย",
        description: "เข้าสู่หน้าอ่านอัลกุรอานออนไลน์",
        order: 1,
        links: [
          {
            id: "qth-home",
            title: "เข้าสู่ QuranTH →",
            url: "https://www.quranth.com",
          },
        ],
      },
    ],
  },
  {
    id: "hadeethenc",
    slug: "hadeethenc",
    name: "สารานุกรมหะดีษ (HadeethEnc)",
    category: "quran-hadith",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://hadeethenc.com/th/home",
    },
    description:
      "สารานุกรมหะดีษนบีพร้อมคำอธิบายและคำแปลหลายภาษารวมถึงภาษาไทย อังกฤษ และอาหรับ",
    logoUrl: "https://hadeethenc.com/assets_v2/images/og_new_logo.jpg",
    themeColor: "#0369a1",
    order: 16,
    networks: ["quranenc"],
    campuses: [
      {
        id: "hadeethenc-langs",
        name: "เลือกภาษาที่ต้องการศึกษา",
        description: "เข้าถึงสารานุกรมหะดีษพร้อมคำอธิบายอย่างเป็นระบบ",
        order: 1,
        links: [
          {
            id: "he-th",
            title: "สารานุกรมหะดีษ ภาคภาษาไทย",
            url: "https://hadeethenc.com/th/home",
          },
          {
            id: "he-en",
            title: "Hadeeth Encyclopedia (English)",
            url: "https://hadeethenc.com/en/home",
          },
          {
            id: "he-ar",
            title: "موسوعة الأحاديث النبوية (العربية)",
            url: "https://hadeethenc.com/ar/home",
          },
        ],
      },
    ],
  },
  {
    id: "quranenc",
    slug: "quranenc",
    name: "สารานุกรมอัลกุรอาน (QuranEnc)",
    category: "quran-hadith",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://quranenc.com/th/home",
    },
    description:
      "โครงการแปลความหมายอัลกุรอานที่เชื่อถือได้ในหลากหลายภาษา พร้อมเสียงอ่านและคำอธิบายประกอบ",
    logoUrl: "https://quranenc.com/assets/images/og_new_logo.jpg",
    themeColor: "#15803d",
    order: 17,
    networks: ["hadeethenc"],
    campuses: [
      {
        id: "quranenc-main",
        name: "อ่านและฟังอัลกุรอานพร้อมคำแปล",
        description: "ศึกษาความหมายอัลกุรอานภาษาไทยและไฟล์เสียง",
        order: 1,
        links: [
          {
            id: "qe-home",
            title: "หน้าหลักสารานุกรมอัลกุรอาน (ภาษาไทย)",
            url: "https://quranenc.com/th/home",
          },
          {
            id: "qe-audio",
            title: "คลังเสียงอ่านอัลกุรอาน",
            url: "https://quranenc.com/th/audio",
          },
        ],
      },
    ],
  },
  {
    id: "fatwathai",
    slug: "fatwathai",
    name: "ฟัตวาไทย (FatwaThai)",
    category: "fatwa",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://fatwathai.com/",
    },
    description:
      "คลังค้นหาคำวินิจฉัยปัญหาศาสนา (ฟัตวา) ภาษาไทยจากบรรดานักวิชาการอะฮ์ลิสซุนนะฮ์ วัลญะมาอะฮ์",
    logoUrl: "",
    themeColor: "#0d9488",
    order: 18,
    networks: [],
    campuses: [
      {
        id: "fatwathai-main",
        name: "ค้นหาฟัตวาภาษาไทย",
        description: "ระบบค้นหาคำตอบปัญหาศาสนาพร้อมอ้างอิงนักวิชาการ",
        order: 1,
        links: [
          {
            id: "ft-home",
            title: "เข้าสู่หน้าค้นหาฟัตวา →",
            url: "https://fatwathai.com/",
          },
        ],
      },
    ],
  },
  {
    id: "thaiislamqa",
    slug: "thaiislamqa",
    name: "ThaiIslamQA (แปลฟัตวา IslamQA ภาษาไทย)",
    category: "fatwa",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://thaiislamqa.com",
    },
    description:
      "คลังแปลคำวินิจฉัยปัญหาศาสนา (ฟัตวา) จาก IslamQA เป็นภาษาไทย พร้อมบล็อกบทความสะลัฟในเครือ",
    logoUrl: "",
    themeColor: "#0369a1",
    order: 19,
    networks: [],
    campuses: [
      {
        id: "tiqa-fatwas",
        name: "คลังฟัตวาแปลไทย",
        description: "รวมคำตอบปัญหาศาสนาแยกตามหัวข้อและรายการล่าสุด",
        order: 1,
        links: [
          {
            id: "tiqa-home",
            title: "หน้าแรก ThaiIslamQA",
            url: "https://thaiislamqa.com",
          },
          {
            id: "tiqa-recent",
            title: "ฟัตวาล่าสุด 100 เรื่อง",
            url: "https://thaiislamqa.com/recent100fatwa/",
          },
        ],
      },
      {
        id: "tiqa-blogs",
        name: "คลังบทความในเครือ",
        description: "บทความชี้แจงเรื่องบิดอะฮ์และแนวทางสะลัฟ",
        order: 2,
        links: [
          {
            id: "tiqa-bidah",
            title: "ThaiBidah (ชี้แจงเรื่องบิดอะฮ์)",
            url: "https://thaibidah.wordpress.com/",
          },
          {
            id: "tiqa-salafis",
            title: "ThaiSalafis (บทความสะลัฟ)",
            url: "https://thaisalafis.wordpress.com/",
          },
        ],
      },
    ],
  },
  {
    id: "islammore",
    slug: "islammore",
    name: "อิสลามมอร์ (IslamMore)",
    category: "fatwa",
    language: "Thai",
    platforms: ["Website", "YouTube", "Facebook"],
    socialLinks: {
      Website: "https://www.islammore.com/",
      YouTube: "https://www.youtube.com/@Risalah_Radio/streams",
      Facebook:
        "https://www.facebook.com/pages/ISLAMMORE-xis-lam-mxr/107983492577066",
    },
    description:
      "เว็บไซต์ความรู้อิสลามภาษาไทยรุ่นบุกเบิก รวบรวมบทความศาสนา ฟัตวา และวิทยุ Risalah Radio ตามแนวทางอัลกุรอานและซุนนะฮ์",
    logoUrl: "",
    themeColor: "#0e7490",
    order: 20,
    networks: [],
    campuses: [
      {
        id: "islammore-archive",
        name: "คลังบทความและฟัตวา",
        description: "หมวดหมู่บทความศาสนาและตอบปัญหาศาสนา",
        order: 1,
        links: [
          {
            id: "im-religion",
            title: "หมวดบทความศาสนา",
            url: "https://www.islammore.com/archive/26",
          },
          {
            id: "im-fatwa",
            title: "หมวดฟัตวาตอบปัญหาศาสนา",
            url: "https://www.islammore.com/archive/49",
          },
        ],
      },
      {
        id: "islammore-radio",
        name: "สื่อเสียงและถ่ายทอดสด",
        description: "รับฟังการถ่ายทอดสดรายการศาสนาออนไลน์",
        order: 2,
        links: [
          {
            id: "im-radio",
            title: "ถ่ายทอดสด Risalah Radio (YouTube)",
            url: "https://www.youtube.com/@Risalah_Radio/streams",
          },
        ],
      },
    ],
  },

  // ==========================================================
  //  3. ช่องบรรยาย YouTube & สื่อวิดีโอสะลัฟ (ภาษาไทย)
  // ==========================================================
  {
    id: "alhamdtv",
    slug: "alhamdtv",
    name: "AlhamdTV (อัลฮัมดุลิลลาฮ์ กรุ๊ป)",
    category: "media",
    language: "Thai",
    platforms: ["Website", "YouTube"],
    socialLinks: {
      Website: "https://alhamdtv.com",
      YouTube: "https://www.youtube.com/@AlhamdTV",
    },
    description:
      "สถานีและคลังสื่อบรรยายศาสนาอิสลามสายซุนนะฮ์ จัดเก็บคลิปและรายการย้อนหลังแยกตามปี พ.ศ. อย่างเป็นระบบ",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 21,
    networks: [],
    campuses: [
      {
        id: "alhamd-years",
        name: "คลังรายการแยกตามปี (เว็บไซต์)",
        description: "เลือกชมบันทึกการบรรยายย้อนหลังแต่ละปี",
        order: 1,
        links: [
          {
            id: "ah-2569",
            title: "คลังรายการปี 2569",
            url: "https://alhamdtv.com/category/42",
          },
          {
            id: "ah-2568",
            title: "คลังรายการปี 2568",
            url: "https://alhamdtv.com/category/41",
          },
          {
            id: "ah-2567",
            title: "คลังรายการปี 2567",
            url: "https://alhamdtv.com/category/40",
          },
        ],
      },
      {
        id: "alhamd-yt",
        name: "ช่อง YouTube AlhamdTV",
        description: "รับชมวิดีโอและเพลย์ลิสต์ทั้งหมดบน YouTube",
        order: 2,
        links: [
          {
            id: "ah-yt-home",
            title: "หน้าหลักช่อง YouTube AlhamdTV",
            url: "https://www.youtube.com/@AlhamdTV",
          },
          {
            id: "ah-yt-pl",
            title: "เพลย์ลิสต์ทั้งหมด",
            url: "https://www.youtube.com/@AlhamdTV/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "ilmulnafi",
    slug: "ilmulnafi",
    name: "ศูนย์การเรียนรู้อิลมุนนาเฟียอ์ (مركز العلم النافع)",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@ilmulnafi",
    },
    description:
      "เผยแพร่ความรู้ที่ยังประโยชน์จากตำราอุละมาอ์ที่เจริญรอยตามสะลัฟ ในรูปแบบบรรยายซีรีส์ระยะยาวและบทเรียนศาสนา",
    logoUrl: "",
    themeColor: "#047857",
    order: 22,
    networks: [],
    campuses: [
      {
        id: "ilmulnafi-yt",
        name: "ซีรีส์บทเรียนและเพลย์ลิสต์สอนตำรา",
        description: "เรียนตำราวิชาการอิสลามอย่างต่อเนื่องเป็นซีรีส์",
        order: 1,
        links: [
          {
            id: "in-home",
            title: "หน้าหลักช่อง อิลมุนนาเฟียอ์",
            url: "https://www.youtube.com/@ilmulnafi",
          },
          {
            id: "in-pl",
            title: "เพลย์ลิสต์บทเรียนทั้งหมด",
            url: "https://www.youtube.com/@ilmulnafi/playlists",
          },
          {
            id: "in-streams",
            title: "บันทึกการสอนสดย้อนหลัง",
            url: "https://www.youtube.com/@ilmulnafi/streams",
          },
        ],
      },
    ],
  },
  {
    id: "thaisalafi",
    slug: "thaisalafi",
    name: "Salafiyoon — ชมรมอัซซะละฟิยูน",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@thaisalafi",
    },
    description:
      "ช่องยูทูบชมรมอัซซะละฟิยูน เผยแพร่คำบรรยาย บทเรียนตำราสะลัฟ และคลิปความรู้ศาสนาภาษาไทย",
    logoUrl: "",
    themeColor: "#1a5f7a",
    order: 23,
    networks: [],
    campuses: [
      {
        id: "thaisalafi-yt",
        name: "คลังวิดีโอและเพลย์ลิสต์",
        description: "รับชมบทเรียนและบรรยายจากชมรมอัซซะละฟิยูน",
        order: 1,
        links: [
          {
            id: "ts-home",
            title: "หน้าหลักช่อง @thaisalafi",
            url: "https://www.youtube.com/@thaisalafi",
          },
          {
            id: "ts-pl",
            title: "เพลย์ลิสต์ทั้งหมด",
            url: "https://www.youtube.com/@thaisalafi/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "sufumothman",
    slug: "sufumothman",
    name: "ซุฟอัม อุษมาน (Suf-um Othman)",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@sufumothman",
    },
    description:
      "ช่องบรรยายและสอนตำราศาสนาอิสลามโดย อ.ซุฟอัม อุษมาน ครอบคลุมตัฟซีร หะดีษ อะกีดะฮ์ และฟิกฮ์",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 24,
    networks: [],
    campuses: [
      {
        id: "sufum-yt",
        name: "บทเรียนและเพลย์ลิสต์บรรยาย",
        description: "คลังคลิปบรรยายและไลฟ์สดย้อนหลัง",
        order: 1,
        links: [
          {
            id: "so-home",
            title: "หน้าหลักช่อง อ.ซุฟอัม อุษมาน",
            url: "https://www.youtube.com/@sufumothman",
          },
          {
            id: "so-pl",
            title: "เพลย์ลิสต์บทเรียนทั้งหมด",
            url: "https://www.youtube.com/@sufumothman/playlists",
          },
          {
            id: "so-streams",
            title: "บันทึกการบรรยายสด (Live)",
            url: "https://www.youtube.com/@sufumothman/streams",
          },
        ],
      },
    ],
  },
  {
    id: "alflower",
    slug: "alflower",
    name: "อัลฟะวาเอ็ด (alflower.1)",
    category: "media",
    language: "Thai",
    platforms: ["YouTube", "Instagram"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@alflower.1",
      Instagram: "https://www.instagram.com/alflower.1/",
    },
    description:
      "ช่องบทเรียนศาสนา อรรถาธิบายพระนามอันวิจิตรของอัลลอฮ์ กฎเหล็กการขัดเกลาจิตใจ และแนะนำหนังสือแปลสายสะละฟี",
    logoUrl: "",
    themeColor: "#be185d",
    order: 25,
    networks: [],
    campuses: [
      {
        id: "alflower-yt",
        name: "บทเรียนวิดีโอและเพลย์ลิสต์ (YouTube)",
        description: "ซีรีส์พระนามของอัลลอฮ์และการขัดเกลาจิตใจ",
        order: 1,
        links: [
          {
            id: "af-yt",
            title: "ช่อง YouTube อัลฟะวาเอ็ด (@alflower.1)",
            url: "https://www.youtube.com/@alflower.1",
          },
          {
            id: "af-yt-pl",
            title: "เพลย์ลิสต์บทเรียนทั้งหมด",
            url: "https://www.youtube.com/@alflower.1/playlists",
          },
        ],
      },
      {
        id: "alflower-ig",
        name: "แนะนำหนังสือและข้อคิดสั้น (Instagram)",
        description: "รีวิวหนังสือแปลอิสลามและข้อคิดประจำวัน",
        order: 2,
        links: [
          {
            id: "af-ig-link",
            title: "Instagram (@alflower.1)",
            url: "https://www.instagram.com/alflower.1/",
          },
        ],
      },
    ],
  },
  {
    id: "alyaqeen",
    slug: "alyaqeen",
    name: "ALYAQEEN CHANNEL",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@ALYAQEENCHANNEL",
    },
    description:
      "ช่องสื่อวิดีโอความรู้ศาสนาอิสลาม คลิปบรรยาย และรายการตอบข้อสงสัยทางศาสนาภาษาไทย",
    logoUrl: "",
    themeColor: "#0369a1",
    order: 26,
    networks: [],
    campuses: [
      {
        id: "alyaqeen-yt",
        name: "คลังวิดีโอและเพลย์ลิสต์",
        description: "รับชมวิดีโอความรู้และรายการต่างๆ",
        order: 1,
        links: [
          {
            id: "ay-home",
            title: "หน้าหลักช่อง ALYAQEEN CHANNEL",
            url: "https://www.youtube.com/@ALYAQEENCHANNEL",
          },
          {
            id: "ay-pl",
            title: "เพลย์ลิสต์ทั้งหมด",
            url: "https://www.youtube.com/@ALYAQEENCHANNEL/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "manarah",
    slug: "manarah",
    name: "Manarah Channel",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@manarah",
    },
    description:
      "ช่องสื่อวิชาการอิสลาม บทเรียนศาสนา และคลิปแปลคำสอนของปราชญ์สายสะลัฟภาษาไทย",
    logoUrl: "",
    themeColor: "#b45309",
    order: 27,
    networks: [],
    campuses: [
      {
        id: "manarah-yt",
        name: "คลังวิดีโอและเพลย์ลิสต์",
        description: "รับชมคลิปบรรยายและซีรีส์ความรู้",
        order: 1,
        links: [
          {
            id: "mn-home",
            title: "หน้าหลักช่อง Manarah Channel",
            url: "https://www.youtube.com/@manarah",
          },
          {
            id: "mn-pl",
            title: "เพลย์ลิสต์ทั้งหมด",
            url: "https://www.youtube.com/@manarah/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "arifsalafi",
    slug: "arifsalafi",
    name: "Arif Salafi",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@ArifSalafi",
    },
    description:
      "ช่องคลิปแปลคำบรรยายและฟัตวาของบรรดาอุละมาอ์ใหญ่สายสะลัฟพร้อมซับไทย",
    logoUrl: "",
    themeColor: "#334155",
    order: 28,
    networks: [],
    campuses: [
      {
        id: "arif-yt",
        name: "คลังคลิปแปลอุละมาอ์ซับไทย",
        description: "รับชมคลิปคำสอนและฟัตวาของปราชญ์",
        order: 1,
        links: [
          {
            id: "as-home",
            title: "หน้าหลักช่อง Arif Salafi",
            url: "https://www.youtube.com/@ArifSalafi",
          },
          {
            id: "as-pl",
            title: "เพลย์ลิสต์ทั้งหมด",
            url: "https://www.youtube.com/@ArifSalafi/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "whitechannel",
    slug: "whitechannel",
    name: "White Channel (สถานีความดี 24 ชั่วโมง)",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@whitechannel24hr",
    },
    description:
      "สถานีโทรทัศน์และช่องยูทูบเผยแผ่ความรู้อิสลามสายซุนนะฮ์ ครอบคลุมรายการบรรยาย ถาม-ตอบปัญหาศาสนา และสารคดีอิสลาม",
    logoUrl: "",
    themeColor: "#1d4ed8",
    order: 29,
    networks: [],
    campuses: [
      {
        id: "white-yt",
        name: "รายการและเพลย์ลิสต์ White Channel",
        description: "รับชมรายการสดและรายการย้อนหลัง",
        order: 1,
        links: [
          {
            id: "wc-home",
            title: "หน้าหลักช่อง White Channel",
            url: "https://www.youtube.com/@whitechannel24hr",
          },
          {
            id: "wc-pl",
            title: "เพลย์ลิสต์รายการทั้งหมด",
            url: "https://www.youtube.com/@whitechannel24hr/playlists",
          },
          {
            id: "wc-live",
            title: "รายการถ่ายทอดสดย้อนหลัง",
            url: "https://www.youtube.com/@whitechannel24hr/streams",
          },
        ],
      },
    ],
  },
  {
    id: "yateemtv",
    slug: "yateemtv",
    name: "Yateem TV (YouTube)",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@YateemTV1433",
    },
    description:
      "ช่องยูทูบ Yateem TV รวมคลิปรายการศาสนา การสอนอัลกุรอาน ฟิกฮ์ และบรรยายวิชาการโดยคณาจารย์ไทย",
    logoUrl: "",
    themeColor: "#047857",
    order: 30,
    networks: [],
    campuses: [
      {
        id: "yateem-yt",
        name: "คลังรายการบน YouTube",
        description: "รับชมคลิปรายการและเพลย์ลิสต์ทั้งหมด",
        order: 1,
        links: [
          {
            id: "yt-home",
            title: "หน้าหลักช่อง Yateem TV",
            url: "https://www.youtube.com/@YateemTV1433",
          },
          {
            id: "yt-pl",
            title: "เพลย์ลิสต์รายการทั้งหมด",
            url: "https://www.youtube.com/@YateemTV1433/playlists",
          },
        ],
      },
    ],
  },
  {
    id: "evolution-about",
    slug: "evolution-about",
    name: "Evolution-About : วิวัฒนาการตามจริง",
    category: "media",
    language: "Thai",
    platforms: ["YouTube"],
    socialLinks: {
      YouTube: "https://www.youtube.com/@evolution-about7798",
    },
    description:
      "ช่องวิชาการให้ความรู้และวิพากษ์ทฤษฎีวิวัฒนาการตามข้อเท็จจริงทางวิทยาศาสตร์ สารคดีพากย์ไทย และพอดแคสต์เชิงศรัทธา",
    logoUrl: "",
    themeColor: "#4338ca",
    order: 31,
    networks: [],
    campuses: [
      {
        id: "evo-yt",
        name: "สารคดีพากย์ไทยและบทวิเคราะห์วิทยาศาสตร์",
        description: "รับชมวิดีโอและเพลย์ลิสต์ด้านวิทยาศาสตร์กับศรัทธา",
        order: 1,
        links: [
          {
            id: "evo-home",
            title: "หน้าหลักช่อง Evolution-About",
            url: "https://www.youtube.com/@evolution-about7798",
          },
          {
            id: "evo-pl",
            title: "เพลย์ลิสต์ทั้งหมด",
            url: "https://www.youtube.com/@evolution-about7798/playlists",
          },
        ],
      },
    ],
  },

  // ==========================================================
  //  4. สถาบัน มูลนิธิ ห้องเรียน & เพจสำนักพิมพ์ (ภาษาไทย)
  // ==========================================================
  {
    id: "alislahsamakom",
    slug: "alislahsamakom",
    name: "อัล-อิศลาหฺสมาคม (บางกอกน้อย)",
    category: "institution",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.alislahsamakom.org",
    },
    description:
      "สมาคมอิสลามเก่าแก่ย่านบางกอกน้อย มีคลังหิ้งหนังสือ E-Book อิสลามภาษาไทยให้อ่านออนไลน์ฟรีจำนวนมาก",
    logoUrl: "",
    themeColor: "#065f46",
    order: 32,
    networks: [],
    campuses: [
      {
        id: "alislah-info",
        name: "เว็บไซต์สมาคมและประวัติ",
        description: "ข้อมูลกิจกรรมและประวัติอัล-อิศลาหฺสมาคม",
        order: 1,
        links: [
          {
            id: "isl-home",
            title: "หน้าหลักอัล-อิศลาหฺสมาคม",
            url: "https://www.alislahsamakom.org/th/",
          },
          {
            id: "isl-history",
            title: "ประวัติความเป็นมาของสมาคม",
            url: "https://www.alislahsamakom.org/th/history/",
          },
        ],
      },
      {
        id: "alislah-books",
        name: "หิ้งหนังสือ E-Book ออนไลน์ (PubHTML5)",
        description: "เปิดอ่านหนังสือและเอกสารของสมาคมได้ทันที",
        order: 2,
        links: [
          {
            id: "isl-shelf-1",
            title: "หิ้งหนังสือ Al-Islah Bangkoknoi (หลัก)",
            url: "https://pubhtml5.com/bookcase/ysjh/",
          },
          {
            id: "isl-shelf-2",
            title: "หิ้งหนังสืออันดับพิเศษ",
            url: "https://pubhtml5.com/bookcase/golmx/",
          },
          {
            id: "isl-shelf-3",
            title: "หิ้งหนังสืออันดับทั้งหมด",
            url: "https://pubhtml5.com/bookcase/wccz/",
          },
        ],
      },
    ],
  },
  {
    id: "munadiya",
    slug: "munadiya",
    name: "Munadiya (มุนาดิยา — ห้องเรียนศาสนาออนไลน์)",
    category: "institution",
    language: "Thai",
    platforms: ["Website", "Instagram"],
    socialLinks: {
      Website: "https://linktr.ee/munadiya",
      Instagram: "https://www.instagram.com/munadiya_official/",
    },
    description:
      "ห้องเรียนศาสนาอิสลามออนไลน์และชุมชนเรียนรู้สำหรับผู้แสวงหาความรู้ยุคใหม่",
    logoUrl: "",
    themeColor: "#0d9488",
    order: 33,
    networks: [],
    campuses: [
      {
        id: "munadiya-links",
        name: "ช่องทางห้องเรียนและติดตามข่าวสาร",
        description: "รวมลิงก์คอร์สเรียนและอัปเดตกิจกรรมของมุนาดิยา",
        order: 1,
        links: [
          {
            id: "mun-linktree",
            title: "ศูนย์รวมลิงก์ห้องเรียน Munadiya (Linktree)",
            url: "https://linktr.ee/munadiya",
          },
          {
            id: "mun-ig",
            title: "Instagram ทางการ (@munadiya_official)",
            url: "https://www.instagram.com/munadiya_official/",
          },
        ],
      },
    ],
  },
  {
    id: "muslimfriend",
    slug: "muslimfriend",
    name: "มูลนิธิเพื่อนมุสลิม (Muslim's Friend Foundation)",
    category: "institution",
    language: "Thai",
    platforms: ["Website", "Facebook"],
    socialLinks: {
      Website: "https://muslimfriend.org",
      Facebook: "https://www.facebook.com/muslimsfriendfoundation",
    },
    description:
      "มูลนิธิเพื่อการเผยแผ่อิสลาม โครงการแจกหนังสือและสื่อความรู้สำหรับผู้สนใจอิสลามและมุสลิมใหม่",
    logoUrl: "",
    themeColor: "#0284c7",
    order: 34,
    networks: [],
    campuses: [
      {
        id: "mf-web",
        name: "โครงการและข้อมูลมูลนิธิ",
        description: "ติดตามโครงการดะอ์วะฮ์และกิจกรรมของมูลนิธิ",
        order: 1,
        links: [
          {
            id: "mf-home",
            title: "หน้าหลักมูลนิธิเพื่อนมุสลิม",
            url: "https://muslimfriend.org",
          },
          {
            id: "mf-projects",
            title: "โครงการต่างๆ ของมูลนิธิ",
            url: "https://muslimfriend.org/project",
          },
          {
            id: "mf-fb",
            title: "เพจ Facebook มูลนิธิเพื่อนมุสลิม",
            url: "https://www.facebook.com/muslimsfriendfoundation",
          },
        ],
      },
    ],
  },
  {
    id: "ftu",
    slug: "ftu",
    name: "มหาวิทยาลัยฟาฏอนี (Fatoni University)",
    category: "institution",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.ftu.ac.th",
    },
    description:
      "สถาบันอุดมศึกษาอิสลามในประเทศไทย เปิดสอนคณะอิสลามศึกษาและนิติศาสตร์ หลักสูตรวิชาการและบัณฑิตศึกษา",
    logoUrl: "",
    themeColor: "#065f46",
    order: 35,
    networks: [],
    campuses: [
      {
        id: "ftu-academic",
        name: "หลักสูตรและคณะวิชาการ",
        description: "ข้อมูลการศึกษาต่อด้านอิสลามศึกษาและบัณฑิตวิทยาลัย",
        order: 1,
        links: [
          {
            id: "ftu-programs",
            title: "หลักสูตรที่เปิดสอน",
            url: "https://ftu.ac.th/program/",
          },
          {
            id: "ftu-islamic",
            title: "คณะอิสลามศึกษาและนิติศาสตร์",
            url: "https://islamic.ftu.ac.th/",
          },
          {
            id: "ftu-grad",
            title: "บัณฑิตวิทยาลัย มหาวิทยาลัยฟาฏอนี",
            url: "https://grad.ftu.ac.th/",
          },
        ],
      },
    ],
  },
  {
    id: "ibnbaz-th",
    slug: "ibnbaz-th",
    name: "สถาบันอิบนุบาซเพื่ออิสลามศึกษา (Ibn Baz Institute)",
    category: "institution",
    language: "Thai",
    platforms: ["Facebook"],
    socialLinks: {
      Facebook: "https://www.facebook.com/IbnBazTh",
    },
    description:
      "สถาบันการเรียนการสอนอิสลามศึกษาและเผยแพร่ความรู้วิชาการตามแนวทางสะลัฟในประเทศไทย",
    logoUrl: "",
    themeColor: "#047857",
    order: 36,
    networks: [],
    campuses: [
      {
        id: "ibnbaz-th-fb",
        name: "เพจทางการและกิจกรรมวิชาการ",
        description: "ติดตามข่าวสารหลักสูตร บทความ และงานเสวนา",
        order: 1,
        links: [
          {
            id: "ibt-fb",
            title: "เพจ Facebook สถาบันอิบนุบาซฯ",
            url: "https://www.facebook.com/IbnBazTh",
          },
        ],
      },
    ],
  },
  {
    id: "islamic-advising-center",
    slug: "islamic-advising-center",
    name: "ศูนย์แนะนำรู้จักอิสลาม (Islamic Advising Center)",
    category: "institution",
    language: "Thai",
    platforms: ["Facebook"],
    socialLinks: {
      Facebook: "https://www.facebook.com/IslamicAdvisingCenter",
    },
    description:
      "ศูนย์ดะอ์วะฮ์อิสลามแห่งประเทศไทย (مركز الدعوة الإسلامية) ถ่ายทอดหลักการอิสลามที่ถูกต้องแก่มุสลิมและผู้สนใจอิสลาม",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 37,
    networks: [],
    campuses: [
      {
        id: "iac-main",
        name: "ช่องทางติดต่อและสื่อความรู้",
        description: "ติดตามบทความแนะนำอิสลามและกิจกรรมดะอ์วะฮ์",
        order: 1,
        links: [
          {
            id: "iac-fb",
            title: "เพจ Facebook ศูนย์แนะนำรู้จักอิสลาม",
            url: "https://www.facebook.com/IslamicAdvisingCenter",
          },
        ],
      },
    ],
  },
  {
    id: "punkwamro",
    slug: "punkwamro",
    name: "มูลนิธิปันความรู้ (Sharing Knowledge Foundation)",
    category: "institution",
    language: "Thai",
    platforms: ["Facebook"],
    socialLinks: {
      Facebook: "https://www.facebook.com/punkwame.ro",
    },
    description:
      "มูลนิธิเพื่อการแบ่งปันความรู้และสื่อหนังสืออิสลามเพื่อสังคม",
    logoUrl: "",
    themeColor: "#0369a1",
    order: 38,
    networks: [],
    campuses: [
      {
        id: "pkr-main",
        name: "เพจมูลนิธิปันความรู้",
        description: "ติดตามโครงการแบ่งปันความรู้และสื่อการเรียนรู้",
        order: 1,
        links: [
          {
            id: "pkr-fb",
            title: "เพจ Facebook มูลนิธิปันความรู้",
            url: "https://www.facebook.com/punkwame.ro",
          },
        ],
      },
    ],
  },
  {
    id: "madrasahalwabil",
    slug: "madrasahalwabil",
    name: "Madrasah Al-Wabil (مدرسة الوابل)",
    category: "institution",
    language: "Thai",
    platforms: ["Facebook"],
    socialLinks: {
      Facebook: "https://www.facebook.com/madrasahalwabil",
    },
    description:
      "สถาบันและเพจเผยแพร่บทเรียนภาษาอาหรับ ตำราศาสนา และความรู้สะลัฟ",
    logoUrl: "",
    themeColor: "#1e40af",
    order: 39,
    networks: [],
    campuses: [
      {
        id: "wabil-main",
        name: "เพจ Madrasah Al-Wabil",
        description: "ติดตามคอร์สเรียนและบทความวิชาการ",
        order: 1,
        links: [
          {
            id: "wabil-fb",
            title: "เพจ Facebook Madrasah Al-Wabil",
            url: "https://www.facebook.com/madrasahalwabil",
          },
        ],
      },
    ],
  },
  {
    id: "thai-salafi-publishers",
    slug: "thai-salafi-publishers",
    name: "เครือข่ายเพจหนังสือและสำนักพิมพ์สะลัฟไทย",
    category: "library",
    language: "Thai",
    platforms: ["Facebook", "Instagram"],
    socialLinks: {
      Facebook: "https://www.facebook.com/furhan621411005",
      Instagram: "https://www.instagram.com/_ibnuyusuf/",
    },
    description:
      "รวมเพจสำนักพิมพ์อิสระ มุมหนังสือ และนักแปลตำราสะลัฟภาษาไทยที่เผยแพร่หนังสือและบทความคุณภาพบน Facebook และ Instagram",
    logoUrl: "",
    themeColor: "#7c2d12",
    order: 40,
    networks: [],
    campuses: [
      {
        id: "tsp-publishers",
        name: "เพจสำนักพิมพ์และแปลตำรา (Facebook)",
        description: "ติดตามหนังสือออกใหม่และงานแปลตำราศาสนา",
        order: 1,
        links: [
          {
            id: "tsp-truthislam",
            title: "สำนักพิมพ์ผู้สนใจในอิสลาม (Truth Islam Publisher)",
            url: "https://www.facebook.com/profile.php?id=61565389662125",
          },
          {
            id: "tsp-humanwrite",
            title: "สำนักพิมพ์ Human Write",
            url: "https://www.facebook.com/profile.php?id=100063260017282",
          },
          {
            id: "tsp-attaymiyyah",
            title: "อัต-ตัยมียะฮ์ (التيمية)",
            url: "https://www.facebook.com/profile.php?id=61572292302402",
          },
        ],
      },
      {
        id: "tsp-readers",
        name: "มุมหนังสือและเพจแบ่งปันความรู้",
        description: "เพจแนะนำหนังสือ บทความแปล และบันทึกการอ่าน",
        order: 2,
        links: [
          {
            id: "tsp-ruknulkitab",
            title: "มุมหนังสือ ركن الكتاب (Facebook)",
            url: "https://www.facebook.com/furhan621411005",
          },
          {
            id: "tsp-abbas",
            title: "Abbas Mtp (Facebook)",
            url: "https://www.facebook.com/Abbas.M.salafi",
          },
          {
            id: "tsp-pinionmoon",
            title: "Pinion Moon (Facebook)",
            url: "https://www.facebook.com/profile.php?id=100075962754486",
          },
          {
            id: "tsp-ibnuyusuf",
            title: "Ibnu Yusuf (Instagram)",
            url: "https://www.instagram.com/_ibnuyusuf/",
          },
        ],
      },
    ],
  },

  // ==========================================================
  //  5. ภาษาอังกฤษ (English — Salafi Publications & Abu Iyaad Network)
  // ==========================================================
  {
    id: "spubs",
    slug: "spubs",
    name: "Salafi Publications (SPUBS)",
    category: "institution",
    language: "English",
    platforms: ["Website", "YouTube"],
    socialLinks: {
      Website: "https://www.spubs.com/sps/",
      YouTube: "https://www.youtube.com/@SalafiPubs",
    },
    description:
      "ศูนย์เผยแพร่และสำนักพิมพ์สะลัฟชั้นนำในสหราชอาณาจักร รวบรวมบทความแปลจากปราชญ์ใหญ่ด้านอะกีดะฮ์ อิบาดะฮ์ และมันฮัจย์",
    logoUrl: "",
    themeColor: "#1a5f7a",
    order: 41,
    networks: ["abukhadeejah", "salafisounds", "abuiyaad", "aqidah", "manhaj"],
    campuses: [
      {
        id: "spubs-portal",
        name: "คลังบทความและช่องวิดีโอหลัก",
        description: "บทความวิชาการและคลิปบรรยายจากเครือข่าย Salafi Publications",
        order: 1,
        links: [
          {
            id: "spubs-home",
            title: "เว็บไซต์หลัก SalafiPublications.com",
            url: "https://www.spubs.com/sps/",
          },
          {
            id: "spubs-yt",
            title: "ช่อง YouTube SalafiPubs",
            url: "https://www.youtube.com/@SalafiPubs",
          },
          {
            id: "spubs-recordings",
            title: "ช่อง YouTube Salafi Recordings",
            url: "https://www.youtube.com/@SalafiRecordings",
          },
        ],
      },
    ],
  },
  {
    id: "abukhadeejah",
    slug: "abukhadeejah",
    name: "AbuKhadeejah.com (Salafi Publications)",
    category: "articles",
    language: "English",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://abukhadeejah.com",
    },
    description:
      "คลังบทความ เอกสารแจกฟรี และหนังสือ PDF แนวทางสะละฟีภาษาอังกฤษ เหมาะสำหรับศึกษาค้นคว้าและนำมาแปลเผยแผ่เป็นภาษาไทย",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 42,
    networks: ["spubs", "salafisounds", "abuiyaad", "aqidah", "manhaj"],
    campuses: [
      {
        id: "ak-articles",
        name: "บทความหลักและหลักสูตรอิสลามศึกษา",
        description: "คลังบทความและหลักสูตรจาก Abu Khadeejah Abdul-Wahid",
        order: 1,
        links: [
          {
            id: "ak-home",
            title: "หน้าหลัก AbuKhadeejah.com",
            url: "https://abukhadeejah.com",
          },
          {
            id: "ak-salafiyyah",
            title: "The Salafi Dawah (บทความหลัก)",
            url: "https://abukhadeejah.com/what-is-salafism-and-salafiyyah/",
          },
          {
            id: "ak-about",
            title: "เกี่ยวกับผู้เขียนและเครือข่าย",
            url: "https://abukhadeejah.com/category/about-us/",
          },
        ],
      },
    ],
  },
  {
    id: "salafisounds",
    slug: "salafisounds",
    name: "Salafi Sounds",
    category: "media",
    language: "English",
    platforms: ["Website", "Podcast"],
    socialLinks: {
      Website: "https://www.salafisounds.com/",
      Podcast: "https://www.salafisounds.com/",
    },
    description:
      "คลังเสียงบรรยาย คุฏบะฮ์วันศุกร์ และบทเรียนอธิบายตำราคลาสสิกภาษาอังกฤษฟรีจากเครือข่าย Salafi Publications",
    logoUrl: "",
    themeColor: "#2563eb",
    order: 43,
    networks: ["spubs", "abukhadeejah", "abuiyaad", "aqidah", "manhaj"],
    campuses: [
      {
        id: "salafisounds-cats",
        name: "หมวดหมู่เสียงบรรยายและคุฏบะฮ์",
        description: "เลือกฟังบทเรียนและคุฏบะฮ์แยกตามหัวข้อ",
        order: 1,
        links: [
          {
            id: "ss-aqeedah",
            title: "หมวดอะกีดะฮ์ (Aqeedah)",
            url: "https://www.salafisounds.com/category/aqeedah/",
          },
          {
            id: "ss-khutbahs",
            title: "คุฏบะฮ์วันศุกร์ (Friday Khutbahs)",
            url: "https://www.salafisounds.com/category/friday-khutbahs/",
          },
          {
            id: "ss-family",
            title: "ครอบครัวและเยาวชน (Family & Children)",
            url: "https://www.salafisounds.com/category/family-children/",
          },
          {
            id: "ss-society",
            title: "สังคมร่วมสมัย (Society)",
            url: "https://www.salafisounds.com/category/society/",
          },
        ],
      },
    ],
  },
  {
    id: "abuiyaad",
    slug: "abuiyaad",
    name: "AbuIyaad.com",
    category: "articles",
    language: "English",
    platforms: ["Website", "Telegram"],
    socialLinks: {
      Website: "https://www.abuiyaad.com/",
      Telegram: "https://t.me/abuiyaadsp",
    },
    description:
      "คลังบทความวิจัยและงานแปลเชิงวิชาการโดยอบู อิยาด (Amjad Rafiq) ด้านอะกีดะฮ์ มันฮัจย์ และการวิเคราะห์กระแสความคิดร่วมสมัย",
    logoUrl: "",
    themeColor: "#334155",
    order: 44,
    networks: ["spubs", "abukhadeejah", "salafisounds", "aqidah", "manhaj"],
    campuses: [
      {
        id: "abuiyaad-sections",
        name: "รายงาน บทความ และช่องอัปเดต",
        description: "ติดตามงานเขียนและรายงานวิเคราะห์จาก AbuIyaad.com",
        order: 1,
        links: [
          {
            id: "ai-home",
            title: "หน้าหลัก AbuIyaad.com",
            url: "https://www.abuiyaad.com/",
          },
          {
            id: "ai-reports",
            title: "รายงานและบทวิเคราะห์ (Reports)",
            url: "https://www.abuiyaad.com/report",
          },
          {
            id: "ai-telegram",
            title: "ช่อง Telegram ทางการ (@abuiyaadsp)",
            url: "https://t.me/abuiyaadsp",
          },
        ],
      },
    ],
  },
  {
    id: "aqidah",
    slug: "aqidah",
    name: "Aqidah.com",
    category: "articles",
    language: "English",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.aqidah.com/creed/",
    },
    description:
      "เว็บไซต์เฉพาะทางด้านหลักศรัทธา (อะกีดะฮ์) ของอะฮ์ลิสซุนนะฮ์ วัลญะมาอะฮ์ พร้อมงานแปลตำราคลาสสิกและคำอธิบายของปราชญ์",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 45,
    networks: ["abuiyaad", "manhaj", "spubs", "abukhadeejah", "salafisounds"],
    campuses: [
      {
        id: "aqidah-cats",
        name: "หมวดหมู่หลักอะกีดะฮ์",
        description: "ศึกษาพื้นฐานอะกีดะฮ์ ตำราคลาสสิก และประวัติปราชญ์",
        order: 1,
        links: [
          {
            id: "aq-basics",
            title: "พื้นฐานอะกีดะฮ์ (Basics)",
            url: "https://www.aqidah.com/creed/categories/basics.cfm",
          },
          {
            id: "aq-texts",
            title: "ตำราคลาสสิก (Classical Texts)",
            url: "https://www.aqidah.com/creed/categories/classical-texts.cfm",
          },
          {
            id: "aq-scholars",
            title: "นักวิชาการอะฮ์ลิสซุนนะฮ์ (Scholars)",
            url: "https://www.aqidah.com/creed/categories/scholars.cfm",
          },
          {
            id: "aq-sects",
            title: "กลุ่มและแนวคิดต่างๆ (Sects)",
            url: "https://www.aqidah.com/creed/categories/sects.cfm",
          },
        ],
      },
    ],
  },
  {
    id: "manhaj",
    slug: "manhaj",
    name: "Manhaj.com",
    category: "articles",
    language: "English",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.manhaj.com/manhaj/",
    },
    description:
      "เว็บไซต์เฉพาะทางด้านมันฮัจย์ (แนวทางและระเบียบวิธีปฏิบัติ) ของชาวสะลัฟศอลิหฺ การดะวะฮ์ และหลักวิชาการอัลญัรหฺ วัตตะอ์ดีล",
    logoUrl: "",
    themeColor: "#475569",
    order: 46,
    networks: ["abuiyaad", "aqidah", "spubs", "abukhadeejah", "salafisounds"],
    campuses: [
      {
        id: "manhaj-cats",
        name: "หมวดหมู่หลักมันฮัจย์",
        description: "ศึกษาระเบียบวิธีคิดและการดะวะฮ์ตามแนวทางสะลัฟ",
        order: 1,
        links: [
          {
            id: "mj-basics",
            title: "พื้นฐานมันฮัจย์ (Basics)",
            url: "https://www.manhaj.com/manhaj/categories/basics.cfm",
          },
          {
            id: "mj-salafiyyah",
            title: "แนวทางสะละฟียะฮ์ (Salafiyyah)",
            url: "https://www.manhaj.com/manhaj/categories/salafiyyah.cfm",
          },
          {
            id: "mj-dawah",
            title: "หลักการดะวะฮ์ (Da'wah)",
            url: "https://www.manhaj.com/manhaj/categories/dawah.cfm",
          },
          {
            id: "mj-groups",
            title: "กลุ่มและขบวนการต่างๆ (Sects & Groups)",
            url: "https://www.manhaj.com/manhaj/categories/groups.cfm",
          },
        ],
      },
    ],
  },

  // ==========================================================
  //  6. ภาษาอาหรับ (Arabic — คลังตำราและเว็บไซต์ปราชญ์ใหญ่)
  // ==========================================================
  {
    id: "shamela",
    slug: "shamela",
    name: "المكتبة الشاملة (Al-Maktaba Al-Shamela)",
    category: "library",
    language: "Arabic",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://shamela.ws/",
    },
    description:
      "ห้องสมุดดิจิทัลตำราอิสลามคลาสสิกภาษาอาหรับที่ใหญ่ที่สุด ครอบคลุมอะกีดะฮ์ ตัฟซีร หะดีษ ฟิกฮ์ และประวัติศาสตร์ พร้อมระบบค้นหาฉบับมาตรฐาน",
    logoUrl: "https://shamela.ws/favicon.png",
    themeColor: "#b45309",
    order: 47,
    networks: [],
    campuses: [
      {
        id: "shamela-cats",
        name: "หมวดหมู่ตำราหลัก (الأقسام الرئيسية)",
        description: "เข้าถึงตำราคลาสสิกแยกตามสาขาวิชา",
        order: 1,
        links: [
          {
            id: "sh-aqidah",
            title: "หมวดอะกีดะฮ์ (العقيدة)",
            url: "https://shamela.ws/category/1",
          },
          {
            id: "sh-tafsir",
            title: "หมวดตัฟซีรอัลกุรอาน (التفسير)",
            url: "https://shamela.ws/category/3",
          },
          {
            id: "sh-ulum-quran",
            title: "หมวดอุลูมุลกุรอาน (علوم القرآن وأصول التفسير)",
            url: "https://shamela.ws/category/4",
          },
        ],
      },
      {
        id: "shamela-tools",
        name: "เครื่องมือค้นคว้าและรายนามผู้ประพันธ์",
        description: "ค้นหาข้อความในตำราและดูประวัติผู้ประพันธ์",
        order: 2,
        links: [
          {
            id: "sh-authors",
            title: "รายนามผู้ประพันธ์ (المؤلفون)",
            url: "https://shamela.ws/authors",
          },
          {
            id: "sh-search",
            title: "ระบบค้นหาตำรา (البحث)",
            url: "https://shamela.ws/search",
          },
        ],
      },
    ],
  },
  {
    id: "sarhaan",
    slug: "sarhaan",
    name: "ห้องสมุด ดร.ฮัยษม ซัรฮาน (Sarhaan Library)",
    category: "library",
    language: "Arabic",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://sarhaan.com/",
    },
    description:
      "คลังดาวน์โหลดตำรา คู่มืออธิบายหลักศรัทธา อะกีดะฮ์ ฟิกฮ์ สารานุกรมอัลกุรอาน และตารางสรุปวิชาการอิสลามหลายภาษา",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 48,
    networks: [],
    campuses: [
      {
        id: "sarhaan-quran",
        name: "สารานุกรมอัลกุรอานและมุศฮัฟ",
        description: "อ่าน ดาวน์โหลดมุศฮัฟ ตัฟซีร และฟังเสียงอ่านอัลกุรอาน",
        order: 1,
        links: [
          {
            id: "sr-quran",
            title: "สารานุกรมอัลกุรอาน (Quran Encyclopedia)",
            url: "https://sarhaan.com/quran/ar/",
          },
          {
            id: "sr-mushafs",
            title: "อ่านและดาวน์โหลดมุศฮัฟ (Mushafs)",
            url: "https://sarhaan.com/quran/ar/mushafs/",
          },
          {
            id: "sr-tafsir",
            title: "ตัฟซีรและความหมายคำศัพท์ (Tafsir)",
            url: "https://sarhaan.com/quran/ar/tafsir/",
          },
          {
            id: "sr-audio",
            title: "คลังเสียงอ่านอัลกุรอาน (Audio)",
            url: "https://sarhaan.com/quran/ar/audio/",
          },
        ],
      },
    ],
  },
  {
    id: "qurancomplex",
    slug: "qurancomplex",
    name: "ศูนย์กษัตริย์ฟะฮัดเพื่อการพิมพ์อัลกุรอาน (มะดีนะฮ์)",
    category: "quran-hadith",
    language: "Arabic",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://qurancomplex.gov.sa",
    },
    description:
      "เว็บไซต์ทางการของศูนย์กษัตริย์ฟะฮัด ณ นครมะดีนะฮ์ รวบรวมมุศฮัฟมาตรฐาน คำแปลอัลกุรอานหลายภาษา และฟอนต์อุษมานีย์ทางการ",
    logoUrl: "",
    themeColor: "#065f46",
    order: 49,
    networks: [],
    campuses: [
      {
        id: "qc-resources",
        name: "มุศฮัฟและฟอนต์อัลกุรอานทางการ",
        description: "ดาวน์โหลดฟอนต์อัลกุรอานมาตรฐานและศึกษาข้อมูลศูนย์พิมพ์",
        order: 1,
        links: [
          {
            id: "qc-home",
            title: "หน้าหลักศูนย์กษัตริย์ฟะฮัด (مجمع الملك فهد)",
            url: "https://qurancomplex.gov.sa",
          },
          {
            id: "qc-fonts",
            title: "ฟอนต์อัลกุรอานมาตรฐาน (الخطوط الحاسوبية)",
            url: "https://qurancomplex.gov.sa/fonts",
          },
        ],
      },
    ],
  },
  {
    id: "binbaz",
    slug: "binbaz",
    name: "موقع الشيخ ابن باز (Shaykh Ibn Baz)",
    category: "fatwa",
    language: "Arabic",
    platforms: ["Website", "Facebook", "Podcast"],
    socialLinks: {
      Website: "https://binbaz.org.sa/",
      Facebook: "https://www.facebook.com/binbaz1420/",
      Podcast: "https://soundcloud.com/user-717428351-221846106",
    },
    description:
      "เว็บไซต์ทางการของเชค อับดุลอะซีซ บิน บาซ (ร.ฮ.) รวบรวมมัจมูอ์ฟัตวา รายการนูรอะลัดดัรบ์ คำอธิบายตำรา และหนังสือทั้งหมด",
    logoUrl: "https://binbaz.org.sa/img/square-logo.png",
    themeColor: "#065f46",
    order: 50,
    networks: [],
    campuses: [
      {
        id: "binbaz-fatwas",
        name: "คลังฟัตวาและหนังสือ (الفتاوى والكتب)",
        description: "คำวินิจฉัยศาสนาของเชค อิบนุ บาซ ทั้งฉบับลายลักษณ์อักษรและเสียง",
        order: 1,
        links: [
          {
            id: "bb-majmu",
            title: "มัจมูอ์ ฟัตวา (مجموع الفتاوى)",
            url: "https://binbaz.org.sa/fatwas/kind/1",
          },
          {
            id: "bb-noor",
            title: "รายการนูร อะลัดดัรบ์ (نور على الدرب)",
            url: "https://binbaz.org.sa/fatwas/kind/2",
          },
          {
            id: "bb-books",
            title: "คลังหนังสือ (كتب الشيخ)",
            url: "https://binbaz.org.sa/books",
          },
        ],
      },
      {
        id: "binbaz-audios",
        name: "บทเรียนอธิบายตำราและเสียงบรรยาย",
        description: "คลังเสียงอธิบายตำราวิชาการและบรรยายทั่วไป",
        order: 2,
        links: [
          {
            id: "bb-shuruh",
            title: "คำอธิบายตำรา (شروح الكتب)",
            url: "https://binbaz.org.sa/audios/kind/1",
          },
          {
            id: "bb-lectures",
            title: "บทเรียนและบรรยาย (دروس ومحاضرات)",
            url: "https://binbaz.org.sa/audios/kind/2",
          },
        ],
      },
    ],
  },
  {
    id: "al-badr",
    slug: "al-badr",
    name: "موقع الشيخ عبد الرزاق البدر (Shaykh Al-Badr)",
    category: "articles",
    language: "Arabic",
    platforms: ["Website", "Telegram", "Facebook"],
    socialLinks: {
      Website: "https://www.al-badr.net/",
      Telegram: "https://t.me/mtoon_altawheed",
      Facebook: "https://www.facebook.com/abdulrazaqelbadr",
    },
    description:
      "เว็บไซต์ทางการของเชค ดร.อับดุรร็อซซาก อัล-บัดร์ รวบรวมบทเรียนอธิบายมุตูนวนวิชาการ อะกีดะฮ์ หะดีษ อัซการ์ และจริยธรรมอิสลาม",
    logoUrl: "",
    themeColor: "#1e40af",
    order: 51,
    networks: [],
    campuses: [
      {
        id: "albadr-sciences",
        name: "หมวดวิชาการหลัก (الأقسام العلمية)",
        description: "บทเรียนและตำราแยกตามสาขาวิชาอิสลาม",
        order: 1,
        links: [
          {
            id: "ab-aqidah",
            title: "หมวดอะกีดะฮ์ (العقيدة)",
            url: "https://www.al-badr.net/category/9",
          },
          {
            id: "ab-hadith",
            title: "หมวดหะดีษ (الحديث)",
            url: "https://www.al-badr.net/category/11",
          },
          {
            id: "ab-tafsir",
            title: "หมวดตัฟซีรและอุลูมุลกุรอาน (التفسير وعلوم القرآن)",
            url: "https://www.al-badr.net/category/14",
          },
          {
            id: "ab-adab",
            title: "หมวดมารยาทและจริยธรรม (الآداب والأخلاق)",
            url: "https://www.al-badr.net/category/72",
          },
          {
            id: "ab-adhkar",
            title: "หมวดอัซการ์และดุอาอ์ (الأذكار والأدعية)",
            url: "https://www.al-badr.net/category/238",
          },
        ],
      },
      {
        id: "albadr-telegram",
        name: "ช่อง Telegram อัปเดตบทเรียน",
        description: "รับบทเรียนมุตูนวนเตาฮีดและอัซการ์ประจำวัน",
        order: 2,
        links: [
          {
            id: "ab-tg-tawheed",
            title: "Telegram: มุตูนวนเตาฮีด (@mtoon_altawheed)",
            url: "https://t.me/mtoon_altawheed",
          },
        ],
      },
    ],
  },
]

/**
 * Normalize a booth document from Firestore and extract a consistent slug.
 */
export function normalizeFirestoreBooth(docId, rawData = {}) {
  const slug =
    rawData.slug ||
    (rawData.id && rawData.id !== docId ? String(rawData.id) : docId)
  return {
    ...rawData,
    id: docId,
    slug,
    name: typeof rawData.name === "string" ? rawData.name.trim() : "",
    description:
      typeof rawData.description === "string" ? rawData.description.trim() : "",
  }
}

/**
 * Merge Firestore booths with curated OPENHOUSE_BOOTHS.
 * Firestore values always take precedence; empty fields on existing Firestore
 * records (like missing logoUrl/networks/category) are gently enriched from curated data.
 */
export function mergeOpenHouseBooths(firestoreBooths = []) {
  const curatedBySlug = new Map(OPENHOUSE_BOOTHS.map((b) => [b.slug, b]))
  const seenSlugs = new Set()
  const merged = []

  for (const fb of firestoreBooths) {
    const slug = fb.slug || fb.id
    seenSlugs.add(slug)
    const curated = curatedBySlug.get(slug)
    if (curated) {
      merged.push({
        ...curated,
        ...fb,
        id: fb.id,
        slug,
        category: fb.category || curated.category || "articles",
        name: fb.name || curated.name,
        description: fb.description || curated.description,
        logoUrl: (typeof fb.logoUrl === "string" ? fb.logoUrl.trim() : "") || curated.logoUrl,
        platforms:
          fb.platforms && fb.platforms.length > 0
            ? fb.platforms
            : curated.platforms,
        socialLinks:
          fb.socialLinks && Object.keys(fb.socialLinks).length > 0
            ? { ...curated.socialLinks, ...fb.socialLinks }
            : curated.socialLinks,
        networks:
          fb.networks && fb.networks.length > 0
            ? fb.networks
            : curated.networks,
        _curatedCampuses: curated.campuses || [],
      })
    } else {
      merged.push({
        category: "articles",
        ...fb,
      })
    }
  }

  for (const curated of OPENHOUSE_BOOTHS) {
    if (!seenSlugs.has(curated.slug)) {
      merged.push({
        ...curated,
        _curatedCampuses: curated.campuses || [],
        _isCuratedOnly: true,
      })
    }
  }

  return merged.sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999))
}

export function findCuratedBooth(boothIdOrSlug) {
  if (!boothIdOrSlug) return null
  return (
    OPENHOUSE_BOOTHS.find(
      (b) => b.slug === boothIdOrSlug || b.id === boothIdOrSlug
    ) || null
  )
}
