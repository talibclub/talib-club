// ============================================================
//  TALIB LEARNING HUB (OPEN HOUSE) — ข้อมูลแหล่งเรียนรู้สะลัฟตั้งต้น
//  ทุกลิงก์ผ่านการตรวจสอบการเข้าถึงจริงแล้ว
// ============================================================

export const OPENHOUSE_PLATFORM_ORDER = [
  "Website",
  "YouTube",
  "Facebook",
  "Telegram",
  "Podcast",
  "Instagram",
  "TikTok",
]

export const OPENHOUSE_BOOTHS = [
  // ==========================================================
  //  ภาษาไทย (Thai)
  // ==========================================================
  {
    id: "almaktabah",
    slug: "almaktabah",
    name: "อัลมักตะบะฮ์ อัษรียะฮ์",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://al-maktabah-web.vercel.app",
    },
    description:
      "ห้องสมุดดิจิทัลรวบรวมตำราอิสลามคลาสสิกภาษาไทย ค้นหาและอ่านออนไลน์ได้ทันที",
    logoUrl: "https://al-maktabah-web.vercel.app/mark.png",
    themeColor: "#f59e0b",
    order: 1,
    networks: ["shamela", "sunnahthai"],
    campuses: [
      {
        id: "almaktabah-library",
        name: "ห้องสมุดออนไลน์",
        description: "เข้าชมห้องสมุดตำราอิสลามฉบับเต็มได้ที่นี่",
        order: 1,
        links: [
          {
            id: "almaktabah-home",
            title: "เข้าสู่ห้องสมุดอัลมักตะบะฮ์ อัษรียะฮ์ →",
            url: "https://al-maktabah-web.vercel.app",
          },
        ],
      },
    ],
  },
  {
    id: "assabiqoon",
    slug: "assabiqoon",
    name: "สำนักพิมพ์อัซซาบิกูน",
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
    logoUrl: "https://assabiqoon.com/favicon.svg",
    themeColor: "#111827",
    order: 2,
    networks: ["salafythai", "sunnahthai"],
    campuses: [
      {
        id: "assabiqoon-articles",
        name: "หมวดบทความและซีรีส์วิชาการ",
        description: "บทความวิเคราะห์เชิงลึก ประวัติอุละมาอ์ และตอบปัญหาคาใจต่างศาสนิก",
        order: 1,
        links: [
          {
            id: "asb-series",
            title: "บทความซีรีส์ทั้งหมด",
            url: "https://assabiqoon.com/series",
          },
          {
            id: "asb-non-muslim",
            title: "ปัญหาคาใจต่างศาสนิก",
            url: "https://assabiqoon.com/category/non-muslim",
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
        ],
      },
      {
        id: "assabiqoon-media",
        name: "ช่องทางวิดีโอและพอดแคสต์",
        description: "เพลย์ลิสต์บรรยายศาสนา คลิปตอบข้อสงสัย และพอดแคสต์ฟังย้อนหลัง",
        order: 2,
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
    id: "salafythai",
    slug: "salafythai",
    name: "เพื่อนร่วมแนวทางสะลัฟ (SalafyThai)",
    language: "Thai",
    platforms: ["Website", "Facebook"],
    socialLinks: {
      Website: "https://salafythai.com/",
      Facebook: "https://www.facebook.com/ibntaymiyyahthai",
    },
    description:
      "แหล่งรวบรวมบทความอะกีดะฮ์ มันฮัจย์ หนังสือพื้นฐาน และคำชี้แจงประเด็นกลุ่มหลงผิดตามแนวทางสะลัฟศอลิหฺ",
    logoUrl:
      "https://salafythai.com/wp-content/uploads/2020/02/cropped-logo-New-4-32x32.png",
    themeColor: "#0f766e",
    order: 3,
    networks: ["fatwathai", "assabiqoon"],
    campuses: [
      {
        id: "salafythai-core",
        name: "หลักสูตรพื้นฐานและอะกีดะฮ์-มันฮัจย์",
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
            id: "st-deviant",
            title: "ความรู้เรื่องกลุ่มหลงผิดและบิดอะฮ์",
            url: "https://salafythai.com/category/deviant/",
          },
        ],
      },
      {
        id: "salafythai-network",
        name: "คลังฟัตวาในเครือข่าย",
        description: "ค้นหาคำวินิจฉัยปัญหาศาสนาภาษาไทย",
        order: 2,
        links: [
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
    id: "sunnahthai",
    slug: "sunnahthai",
    name: "ซุนนะห์ไทย (SunnahThai)",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://sunnahthai.com/",
    },
    description:
      "แหล่งค้นคว้าอัลกุรอานพร้อมตัฟซีรและบทความวิชาการอิสลามภาษาไทยที่อ่านง่ายและเป็นระบบ",
    logoUrl: "https://sunnahthai.com/upload/logo/launchericon-192x192.png",
    themeColor: "#047857",
    order: 4,
    networks: ["almaktabah", "quranenc", "hadeethenc"],
    campuses: [
      {
        id: "sunnahthai-sections",
        name: "คลังอัลกุรอานและบทความ",
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
    id: "islamhouse-th",
    slug: "islamhouse-th",
    name: "IslamHouse ภาคภาษาไทย",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://islamhouse.com/th/",
    },
    description:
      "คลังความรู้อิสลามนานาชาติภาคภาษาไทย รวบรวมหนังสือ PDF บทความ ฟัตวา ไฟล์เสียง และวิดีโอที่ผ่านการตรวจสอบ",
    logoUrl: "https://islamhouse.com/logo_IslamHouse.jpg",
    themeColor: "#1d4ed8",
    order: 5,
    networks: ["hadeethenc", "quranenc"],
    campuses: [
      {
        id: "islamhouse-reading",
        name: "คลังหนังสือ บทความ และฟัตวา",
        description: "เอกสารและตำราอิสลามภาษาไทยดาวน์โหลดฟรี",
        order: 1,
        links: [
          {
            id: "ih-books",
            title: "หนังสืออิสลามภาษาไทย",
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
        name: "สื่อเสียงและวิดีโอ",
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
    id: "islammore",
    slug: "islammore",
    name: "อิสลามมอร์ (IslamMore)",
    language: "Thai",
    platforms: ["Website", "YouTube", "Facebook"],
    socialLinks: {
      Website: "https://www.islammore.com/",
      YouTube: "https://www.youtube.com/@Risalah_Radio/streams",
      Facebook:
        "https://www.facebook.com/pages/ISLAMMORE-xis-lam-mxr/107983492577066",
    },
    description:
      "เว็บไซต์ความรู้อิสลามภาษาไทยรุ่นบุกเบิก รวบรวมบทความศาสนา ฟัตวา และสื่อเสียงตามแนวทางอัลกุรอานและซุนนะฮ์",
    logoUrl: "",
    themeColor: "#0e7490",
    order: 6,
    networks: ["islamhouse-th", "salafythai"],
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
          {
            id: "im-radio",
            title: "ถ่ายทอดสด Risalah Radio (YouTube)",
            url: "https://www.youtube.com/@Risalah_Radio/streams",
          },
        ],
      },
    ],
  },
  {
    id: "hadeethenc",
    slug: "hadeethenc",
    name: "สารานุกรมหะดีษ (HadeethEnc)",
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://hadeethenc.com/th/home",
    },
    description:
      "สารานุกรมหะดีษนบีพร้อมคำอธิบายและคำแปลหลายภาษารวมถึงภาษาไทย อังกฤษ และอาหรับ",
    logoUrl: "https://hadeethenc.com/assets_v2/images/og_new_logo.jpg",
    themeColor: "#0369a1",
    order: 7,
    networks: ["quranenc", "islamhouse-th", "sunnahthai"],
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
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://quranenc.com/th/home",
    },
    description:
      "โครงการแปลความหมายอัลกุรอานที่เชื่อถือได้ในหลากหลายภาษา พร้อมเสียงอ่านและคำอธิบายประกอบ",
    logoUrl: "https://quranenc.com/assets/images/og_new_logo.jpg",
    themeColor: "#15803d",
    order: 8,
    networks: ["hadeethenc", "sunnahthai", "islamhouse-th"],
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
    language: "Thai",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://fatwathai.com/",
    },
    description:
      "คลังค้นหาคำวินิจฉัยปัญหาศาสนา (ฟัตวา) ภาษาไทยจากบรรดานักวิชาการอะฮ์ลิสซุนนะฮ์ วัลญะมาอะฮ์",
    logoUrl: "",
    themeColor: "#0d9488",
    order: 9,
    networks: ["salafythai", "binbaz"],
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

  // ==========================================================
  //  ภาษาอังกฤษ (English — Salafi Publications & Abu Iyaad Network)
  // ==========================================================
  {
    id: "spubs",
    slug: "spubs",
    name: "Salafi Publications (SPUBS)",
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
    order: 10,
    networks: ["salafisounds", "abuiyaad", "aqidah", "manhaj"],
    campuses: [
      {
        id: "spubs-portal",
        name: "คลังบทความและวิดีโอหลัก",
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
    id: "salafisounds",
    slug: "salafisounds",
    name: "Salafi Sounds",
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
    order: 11,
    networks: ["spubs", "abuiyaad", "aqidah", "manhaj"],
    campuses: [
      {
        id: "salafisounds-cats",
        name: "หมวดหมู่เสียงบรรยาย",
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
    order: 12,
    networks: ["spubs", "aqidah", "manhaj", "salafisounds"],
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
    language: "English",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.aqidah.com/creed/",
    },
    description:
      "เว็บไซต์เฉพาะทางด้านหลักศรัทธา (อะกีดะฮ์) ของอะฮ์ลิสซุนนะฮ์ วัลญะมาอะฮ์ พร้อมงานแปลตำราคลาสสิกและคำอธิบายของปราชญ์",
    logoUrl: "",
    themeColor: "#0f766e",
    order: 13,
    networks: ["abuiyaad", "manhaj", "spubs"],
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
    language: "English",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://www.manhaj.com/manhaj/",
    },
    description:
      "เว็บไซต์เฉพาะทางด้านมันฮัจย์ (แนวทางและระเบียบวิธีปฏิบัติ) ของชาวสะลัฟศอลิหฺ การดะวะฮ์ และหลักวิชาการอัลญัรหฺ วัตตะอ์ดีล",
    logoUrl: "",
    themeColor: "#475569",
    order: 14,
    networks: ["abuiyaad", "aqidah", "spubs"],
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
  //  ภาษาอาหรับ (Arabic — คลังตำราและเว็บไซต์ปราชญ์ใหญ่)
  // ==========================================================
  {
    id: "shamela",
    slug: "shamela",
    name: "المكتبة الشاملة (Al-Maktaba Al-Shamela)",
    language: "Arabic",
    platforms: ["Website"],
    socialLinks: {
      Website: "https://shamela.ws/",
    },
    description:
      "ห้องสมุดดิจิทัลตำราอิสลามคลาสสิกภาษาอาหรับที่ใหญ่ที่สุด ครอบคลุมอะกีดะฮ์ ตัฟซีร หะดีษ ฟิกฮ์ และประวัติศาสตร์ พร้อมระบบค้นหาฉบับมาตรฐาน",
    logoUrl: "https://shamela.ws/favicon.png",
    themeColor: "#b45309",
    order: 15,
    networks: ["almaktabah", "binbaz", "al-badr"],
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
    id: "binbaz",
    slug: "binbaz",
    name: "موقع الشيخ ابن باز (Shaykh Ibn Baz)",
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
    order: 16,
    networks: ["al-badr", "shamela", "fatwathai"],
    campuses: [
      {
        id: "binbaz-fatwas",
        name: "คลังฟัตวา (الفتاوى)",
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
    order: 17,
    networks: ["binbaz", "shamela"],
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
 * records (like missing logoUrl/networks) are gently enriched from curated data.
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
        name: fb.name || curated.name,
        description: fb.description || curated.description,
        logoUrl: fb.logoUrl || curated.logoUrl,
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
      merged.push(fb)
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
