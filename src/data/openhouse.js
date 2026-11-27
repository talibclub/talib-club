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
  {
    "id": "almaktabah",
    "slug": "almaktabah",
    "name": "อัลมักตะบะฮ์ อัษรียะฮ์ (Al-Maktabah Al-Athariyyah)",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.al-maktabah.site"
    },
    "description": "ห้องสมุดดิจิทัลรวบรวมตำราอิสลามคลาสสิกภาษาไทย แผ่นพับดะอ์วะฮ์ และคลังแหล่งหนังสือสะลัฟ อ่านและดาวน์โหลดออนไลน์ได้ทันที",
    "logoUrl": "https://al-maktabah-web.vercel.app/mark.png",
    "themeColor": "#f59e0b",
    "order": 1,
    "networks": [],
    "campuses": [
      {
        "id": "almaktabah-library",
        "name": "คลังตำราและห้องสมุดออนไลน์",
        "description": "เข้าชมและค้นหาตำราอิสลามคลาสสิกฉบับเต็ม",
        "order": 1,
        "links": [
          {
            "id": "almaktabah-home",
            "title": "หน้าหลักห้องสมุดอัลมักตะบะฮ์ อัษรียะฮ์",
            "url": "https://www.al-maktabah.site"
          },
          {
            "id": "almaktabah-about",
            "title": "เกี่ยวกับโครงการ Al-Maktabah",
            "url": "https://www.al-maktabah.site/about"
          }
        ]
      },
      {
        "id": "almaktabah-dawah",
        "name": "แผ่นพับดะอ์วะฮ์และแหล่งหนังสือแนะนำ",
        "description": "สื่อแผ่นพับดะอ์วะฮ์แจกฟรีและรวมลิงก์คลังตำราอื่นๆ",
        "order": 2,
        "links": [
          {
            "id": "almaktabah-pamphlets",
            "title": "คลังแผ่นพับดะอ์วะฮ์ (Pamphlets)",
            "url": "https://www.al-maktabah.site/pamphlets"
          },
          {
            "id": "almaktabah-sources",
            "title": "รวมแหล่งหนังสืออื่นๆ (Sources)",
            "url": "https://www.al-maktabah.site/sources"
          }
        ]
      }
    ]
  },
  {
    "id": "assabiqoon",
    "slug": "assabiqoon",
    "name": "สำนักพิมพ์อัซซาบิกูน (Assabiqoon Publisher)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "YouTube",
      "Facebook",
      "Podcast",
      "TikTok",
      "Instagram",
      "Website"
    ],
    "socialLinks": {
      "Website": "https://assabiqoon.com/",
      "YouTube": "https://www.youtube.com/@AssabiqoonPublisher",
      "Facebook": "https://www.facebook.com/AssabiqoonPublisher",
      "Podcast": "https://open.spotify.com/show/0KQ1XxtEyUeTiIK2rFXM6E?si=26f56fc6735f433e&nd=1&dlsi=e87733e07dd34c17",
      "TikTok": "https://www.tiktok.com/@assabiqoon",
      "Instagram": "https://www.instagram.com/assabiqoonpublisher"
    },
    "description": "ดะวะฮฺอัส-สะละฟียะฮฺ | พิสูจน์พระเจ้าเชิงประจักษ์ | เผยแผ่ความจริงและตอบข้อสงสัยต่างศาสนิก",
    "logoUrl": "https://yt3.googleusercontent.com/gDlQvKGGtkhKHuS9ZTzdmNYoUuFM8jOVPk6O_ef41hKDeA86_10uuJj13AF36P7kduLH-wFcFA=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#111827",
    "order": 2,
    "networks": [],
    "campuses": [
      {
        "id": "asb-aqidah-books",
        "name": "หมวดอะกีดะฮ์ ตำราสะลัฟ & อัลกุรอาน (YouTube)",
        "description": "ซีรีส์สอนตำราหลักศรัทธา การปูพื้นฐานฏอลิบุลอิลม์ และความเข้าใจอัลกุรอาน-ซุนนะฮ์",
        "order": 1,
        "links": [
          {
            "id": "asb-pl-tamam",
            "title": "อธิบายหนังสือ ตะมามุลมินนะฮ์ บิชัรห์ เอียะอ์ติกอด อะฮ์ลิสซุนนะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLsD2Riy9_YZF28Uet_qV0pMUwmJv6NHhq"
          },
          {
            "id": "asb-pl-ibnbaz",
            "title": "เดาเราะฮ์ อิมาม อิบนุบาซ ครั้งที่ 1 (ปูพื้นฐานสู่การเป็นฏอลิบุลอิลม์)",
            "url": "https://www.youtube.com/playlist?list=PLsD2Riy9_YZHcEQP6PyoG5xkLMhIvRg_V"
          },
          {
            "id": "asb-pl-quran",
            "title": "เข้าใจอัลกุรอานและซุนนะฮ์ในเชิงรายละเอียด",
            "url": "https://www.youtube.com/playlist?list=PLBy_UF6qoMks"
          },
          {
            "id": "asb-pl-fatihah",
            "title": "คำอธิบายประโยชน์จากซูเราะฮ์ อัล-ฟาติฮะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLSjZvWEAWoYI"
          }
        ]
      },
      {
        "id": "asb-scholars-series",
        "name": "หมวดบรรยายอุละมาอ์ต่างประเทศ & ซีรีส์ดร.อามีน",
        "description": "มัจญ์ลิสความรู้กับชัยค์จากต่างประเทศและซีรีส์บาปใหญ่",
        "order": 2,
        "links": [
          {
            "id": "asb-pl-asim1",
            "title": "มัจญ์ลิสความรู้ออนไลน์กับชัยค์ ศ.ดร.อาศิม อัลก็อรยูตีย์",
            "url": "https://www.youtube.com/playlist?list=PLsD2Riy9_YZH44EjSUR7fX2Qub7q4UzrG"
          },
          {
            "id": "asb-pl-asim2",
            "title": "รวมบรรยายชัยค์ ศ.ดร.อาศิม อัลก็อรยูตีย์",
            "url": "https://www.youtube.com/playlist?list=PLsD2Riy9_YZFTmMhZ3KgqiisFZM78hT_M"
          },
          {
            "id": "asb-pl-lafi",
            "title": "รวมบรรยาย ชัยค์ลาฟี บินยูซุฟ อัชชะเฏาะรอต",
            "url": "https://www.youtube.com/playlist?list=PLXjEPbRL4bLU"
          },
          {
            "id": "asb-pl-kabair",
            "title": "ซีรีส์ชุด \"บาปใหญ่\" ต้นเหตุแห่งความไร้มารยาท | ดร.อามีน ลอนา",
            "url": "https://www.youtube.com/playlist?list=PLsD2Riy9_YZG4Wv8TjG-hsbYbrFhxV1EN"
          }
        ]
      },
      {
        "id": "asb-dawah-newmuslim",
        "name": "หมวดพิสูจน์อิสลาม ต่างศาสนิก & มุสลิมใหม่",
        "description": "บทความพิสูจน์ความจริงเชิงเหตุผลและคู่มือฝึกละหมาดสำหรับมุสลิมใหม่",
        "order": 3,
        "links": [
          {
            "id": "asb-pl-salah",
            "title": "ฝึกละหมาดสำหรับมุสลิมใหม่ (YouTube)",
            "url": "https://www.youtube.com/playlist?list=PLsD2Riy9_YZEPzseQ0MkNNGO3O0lNRUw6"
          },
          {
            "id": "asb-non-muslim",
            "title": "ปัญหาคาใจต่างศาสนิก (บทความ)",
            "url": "https://assabiqoon.com/category/non-muslim"
          },
          {
            "id": "asb-true-reason",
            "title": "การใช้เหตุผลและหลักฐาน (บทความ)",
            "url": "https://assabiqoon.com/category/true-reason"
          }
        ]
      },
      {
        "id": "asb-articles-pod",
        "name": "หมวดบทความวิเคราะห์ ซีรีส์ & พอดแคสต์",
        "description": "บทความวิเคราะห์เชิงลึก ประวัติอุละมาอ์ และพอดแคสต์ฟังย้อนหลัง",
        "order": 4,
        "links": [
          {
            "id": "asb-series",
            "title": "บทความซีรีส์ทั้งหมด",
            "url": "https://assabiqoon.com/series"
          },
          {
            "id": "asb-indepth",
            "title": "บทวิเคราะห์เชิงลึก",
            "url": "https://assabiqoon.com/category/in-depth"
          },
          {
            "id": "asb-scholars",
            "title": "ประวัติอุละมาอ์",
            "url": "https://assabiqoon.com/category/scholars"
          },
          {
            "id": "asb-ikwan",
            "title": "บทวิเคราะห์แนวคิดกลุ่มอิควานฯ",
            "url": "https://assabiqoon.com/category/muslim-brotherhood"
          },
          {
            "id": "asb-spotify",
            "title": "พอดแคสต์สำนักพิมพ์อัซซาบิกูน (Spotify)",
            "url": "https://open.spotify.com/show/0KQ1XxtEyUeTiIK2rFXM6E"
          }
        ]
      }
    ]
  },
  {
    "id": "rasypubs",
    "slug": "rasypubs",
    "name": "สำนักพิมพ์รอซี่ย์ (RasyPubs)",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://rasypubs.pages.dev"
    },
    "description": "สำนักพิมพ์และคลังบทความ/ตำราแปลแนวทางสะลัฟ แบ่งหมวดหมู่วิชาการครบถ้วนทั้งอะกีดะฮ์ มันฮัจญ์ ซุนนะฮ์ ฟิกฮ์ และตัซกียะฮ์",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 3,
    "networks": [],
    "campuses": [
      {
        "id": "rasypubs-aqidah",
        "name": "หมวดอะกีดะฮ์ มันฮัจญ์ & ซุนนะฮ์",
        "description": "หลักศรัทธา แนวทางสะลัฟ และการยึดมั่นในซุนนะฮ์",
        "order": 1,
        "links": [
          {
            "id": "rasy-aqidah",
            "title": "หมวดอะกีดะฮ์ (หลักศรัทธา)",
            "url": "https://rasypubs.pages.dev/category-aqidah.html"
          },
          {
            "id": "rasy-manhaj",
            "title": "หมวดมันฮัจญ์สะลัฟ",
            "url": "https://rasypubs.pages.dev/category-manhaj.html"
          },
          {
            "id": "rasy-sunnah",
            "title": "หมวดซุนนะฮ์",
            "url": "https://rasypubs.pages.dev/category-sunnah.html"
          },
          {
            "id": "rasy-bidah",
            "title": "หมวดชี้แจงเรื่องบิดอะฮ์",
            "url": "https://rasypubs.pages.dev/category-bidah.html"
          }
        ]
      },
      {
        "id": "rasypubs-fiqh",
        "name": "หมวดฟิกฮ์ อัลกุรอาน & ขัดเกลาจิตใจ",
        "description": "บทบัญญัติอิบาดะฮ์ กุรอาน-หะดีษ และมารยาทอิสลาม",
        "order": 2,
        "links": [
          {
            "id": "rasy-fiqh",
            "title": "หมวดฟิกฮ์และอิบาดะฮ์",
            "url": "https://rasypubs.pages.dev/category-fiqh.html"
          },
          {
            "id": "rasy-quran",
            "title": "หมวดอัลกุรอานและหะดีษ",
            "url": "https://rasypubs.pages.dev/category-quran.html"
          },
          {
            "id": "rasy-tazkiyah",
            "title": "หมวดขัดเกลาจิตใจและมารยาท",
            "url": "https://rasypubs.pages.dev/category-tazkiyah.html"
          }
        ]
      }
    ]
  },
  {
    "id": "alhaneefeeyah",
    "slug": "alhaneefeeyah",
    "name": "ห้องสมุดอัลฮะนีฟียะฮ์ (Alhaneefeeyah)",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website",
      "YouTube"
    ],
    "socialLinks": {
      "Website": "https://www.alhaneefeeyah.net",
      "YouTube": "https://www.youtube.com/@Alhaneefeeyah"
    },
    "description": "ห้องสมุดออนไลน์และช่องยูทูบรวบรวมตำราสะลัฟ อะกีดะฮ์ หะดีษ ฟะตาวา ประวัติเศาะฮาบะฮ์ และซีรีส์สอนตำราภาษาไทย",
    "logoUrl": "https://yt3.googleusercontent.com/259kR-eLfPgwTvz5Lz-vsHwh_YoQ3U1bvBUMciKejdH33NyoG2zn1uw_E1Tl5NHCU-xHi0VjTw=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#1e3a8a",
    "order": 4,
    "networks": [],
    "campuses": [
      {
        "id": "alh-yt-tawheed",
        "name": "หมวดเตาฮีด & อะกีดะฮ์ (วิดีโอสอนตำรา)",
        "description": "เพลย์ลิสต์สอนตำราเตาฮีด สิ่งที่ทำให้เสียอิสลาม และมรดกความรู้ชาวสะลัฟ",
        "order": 1,
        "links": [
          {
            "id": "alh-pl-tawheed",
            "title": "สิ่งต่างๆ ที่ค้านกับเตาฮีด",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2djAUj1HIq9FNrvOZcFnUpW-"
          },
          {
            "id": "alh-pl-nawaqid",
            "title": "อธิบายสิ่งที่ทำให้เสียอิสลาม (ชัรห์นะวากิฎุลอิสลาม)",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dgbudMR23Jfg6nRmz6fV3s0"
          },
          {
            "id": "alh-pl-taghut",
            "title": "อธิบายความหมายอัฏฏอฆูต",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dicB9iCeFxbJeaP8zMlSoXN"
          },
          {
            "id": "alh-pl-salaf",
            "title": "มรดกความรู้จากชาวซะลัฟ",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dgDR4R6GdbHKPNUq_UIyXj2"
          }
        ]
      },
      {
        "id": "alh-yt-hadith-dua",
        "name": "หมวดหะดีษ ดุอาอ์ & อัลกุรอาน (YouTube)",
        "description": "ถอดบทเรียน 40 หะดีษอันนะวะวีย์ 100 หะดีษสตรี และอธิบายฮิศนุลมุสลิม",
        "order": 2,
        "links": [
          {
            "id": "alh-pl-40",
            "title": "ถอดบทเรียนจาก 40 หะดีษอันนะวะวีย์",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dgsS1EVBR4YtcHQHkZ1GY54"
          },
          {
            "id": "alh-pl-women",
            "title": "100 หะดีษหลักของสตรี",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2diXYMN9VDKGpE9AjzlaypI0"
          },
          {
            "id": "alh-pl-hisn",
            "title": "อธิบายฮิศนุลมุสลิม ดุอาอ์จากอัลกุรอานและซุนนะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dh1u6YIFxjVu9uGsD-22ODL"
          },
          {
            "id": "alh-pl-quran",
            "title": "การสอนอัลกุรอานในยุคซะลัฟ",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dhSjoudx7GxXfLI65Eop2yI"
          }
        ]
      },
      {
        "id": "alh-yt-family",
        "name": "หมวดครอบครัว มารยาท & อิบาดะฮ์ (YouTube)",
        "description": "การเลี้ยงลูกแบบอิสลาม มารยาทนักศึกษา อุมเราะฮ์ และคุฏบะฮ์นิกะฮ์",
        "order": 3,
        "links": [
          {
            "id": "alh-pl-kids",
            "title": "ตัรบียะตุลเอาลาด เลี้ยงลูกแบบอิสลาม",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dgvDFCeNpuW2tkg-S3AHHAF"
          },
          {
            "id": "alh-pl-adab",
            "title": "มารยาทของนักศึกษา",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dgi2P9Yru5A_Qcg5zUC3wGn"
          },
          {
            "id": "alh-pl-umrah",
            "title": "อุมเราะฮ์ครั้งแรก",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2dhZpNLeB9sgAvr0o-SWQAmI"
          },
          {
            "id": "alh-pl-nikah",
            "title": "คุฏบะฮ์นิกะฮ์ (แต่งงาน)",
            "url": "https://www.youtube.com/playlist?list=PLY_gMc0Hb2djfZnRLiG6I14ChQ3GhJkwI"
          }
        ]
      },
      {
        "id": "alh-web-texts",
        "name": "หมวดตำราและบทความออนไลน์ (เว็บไซต์)",
        "description": "อ่านตำราสะลัฟ หะดีษ ฟะตาวา และประวัติเศาะฮาบะฮ์",
        "order": 4,
        "links": [
          {
            "id": "alh-aqidah",
            "title": "หมวดอะกีดะฮ์",
            "url": "https://www.alhaneefeeyah.net/%E0%B8%AD%E0%B8%B0%E0%B8%81-%E0%B8%94%E0%B8%B0%E0%B8%AE"
          },
          {
            "id": "alh-salaf-books",
            "title": "หมวดตำราซะลัฟ",
            "url": "https://www.alhaneefeeyah.net/%E0%B8%95%E0%B8%B3%E0%B8%A3%E0%B8%B2%E0%B8%8B%E0%B8%B0%E0%B8%A5-%E0%B8%9F"
          },
          {
            "id": "alh-hadith",
            "title": "หมวดอัลฮะดีษ",
            "url": "https://www.alhaneefeeyah.net/%E0%B8%AD-%E0%B8%A5%E0%B8%AE%E0%B8%B0%E0%B8%94-%E0%B8%A9"
          },
          {
            "id": "alh-fatwa",
            "title": "หมวดฟะตาวา",
            "url": "https://www.alhaneefeeyah.net/%E0%B8%9F%E0%B8%B0%E0%B8%95%E0%B8%B2%E0%B8%A7%E0%B8%B2"
          },
          {
            "id": "alh-sahabah",
            "title": "หมวดเศาะฮาบะฮ์",
            "url": "https://www.alhaneefeeyah.net/%E0%B9%80%E0%B8%A8%E0%B8%B2%E0%B8%B0%E0%B8%AE%E0%B8%B2%E0%B8%9A%E0%B8%B0%E0%B8%AE"
          }
        ]
      }
    ]
  },
  {
    "id": "salafi-book",
    "slug": "salafi-book",
    "name": "คลังหนังสือสะลัฟประเทศไทย (خزانة السلف)",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://salafi-book.vercel.app"
    },
    "description": "คลังรวมหนังสือและตำราอิสลามแนวทางสะลัฟในประเทศไทย รวบรวมรายชื่อและไฟล์ตำราสำคัญสำหรับผู้แสวงหาความรู้",
    "logoUrl": "",
    "themeColor": "#b45309",
    "order": 5,
    "networks": [],
    "campuses": [
      {
        "id": "salafi-book-main",
        "name": "คลังหนังสือสะลัฟออนไลน์",
        "description": "ค้นหาและเปิดดูรายการตำราสะลัฟภาษาไทย",
        "order": 1,
        "links": [
          {
            "id": "sb-home",
            "title": "เข้าสู่คลังหนังสือสะลัฟประเทศไทย →",
            "url": "https://salafi-book.vercel.app"
          }
        ]
      }
    ]
  },
  {
    "id": "salafythai",
    "slug": "salafythai",
    "name": "เพื่อนร่วมแนวทางสะลัฟ (SalafyThai)",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Website",
      "Facebook"
    ],
    "socialLinks": {
      "Website": "https://salafythai.com/",
      "Facebook": "https://www.facebook.com/ibntaymiyyahthai"
    },
    "description": "คลังหนังสือ PDF แจกฟรี บทความอะกีดะฮ์-มันฮัจย์ บทเรียนหนังสือพื้นฐาน และคำชี้แจงเรื่องบิดอะฮ์และกลุ่มหลงผิดตามแนวทางสะลัฟ",
    "logoUrl": "https://salafythai.com/wp-content/uploads/2020/02/cropped-logo-New-4-32x32.png",
    "themeColor": "#0f766e",
    "order": 6,
    "networks": [],
    "campuses": [
      {
        "id": "salafythai-core",
        "name": "หลักสูตรพื้นฐาน & อะกีดะฮ์-มันฮัจย์",
        "description": "บทเรียนหนังสือพื้นฐานและหลักความเชื่อตามความเข้าใจของชาวสะลัฟ",
        "order": 1,
        "links": [
          {
            "id": "st-basics",
            "title": "เรียนหนังสือพื้นฐาน",
            "url": "https://salafythai.com/?p=4180"
          },
          {
            "id": "st-aqidah",
            "title": "หมวดอะกีดะฮ์-มันฮัจย์",
            "url": "https://salafythai.com/category/aqidah/"
          },
          {
            "id": "st-vanguard",
            "title": "บล็อกคลังบทความ Salafy Vanguard",
            "url": "https://salafyvanguard.wordpress.com"
          }
        ]
      },
      {
        "id": "salafythai-refutations",
        "name": "หมวดชี้แจงกลุ่มหลงผิด & ฟัตวาในเครือ",
        "description": "ข้อควรระวังด้านแนวคิดและค้นหาฟัตวาภาษาไทย",
        "order": 2,
        "links": [
          {
            "id": "st-deviant",
            "title": "ความรู้เรื่องกลุ่มหลงผิดและบิดอะฮ์",
            "url": "https://salafythai.com/category/deviant/"
          },
          {
            "id": "st-fatwathai",
            "title": "ค้นหาฟัตวาถาม-ตอบ (FatwaThai)",
            "url": "https://fatwathai.com/"
          }
        ]
      }
    ]
  },
  {
    "id": "rightpath",
    "slug": "rightpath",
    "name": "Right Path Salafi",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Website",
      "Facebook",
      "Instagram"
    ],
    "socialLinks": {
      "Website": "https://rightpath.info",
      "Facebook": "https://www.facebook.com/RightPath.219",
      "Instagram": "https://www.instagram.com/right_path.219/"
    },
    "description": "แหล่งบทความวิชาการด้านพิสูจน์อิสลามเชิงประจักษ์ หักล้างข้อกล่าวหา และหลักการเรียนรู้อิสลามที่ถูกต้องตามแนวทางสะลัฟ",
    "logoUrl": "",
    "themeColor": "#0284c7",
    "order": 7,
    "networks": [],
    "campuses": [
      {
        "id": "rp-articles",
        "name": "หมวดบทความหลัก",
        "description": "แบ่งหมวดหมู่บทความพิสูจน์ความจริงและเรียนรู้อิสลาม",
        "order": 1,
        "links": [
          {
            "id": "rp-proof",
            "title": "พิสูจน์อิสลามเชิงประจักษ์",
            "url": "https://rightpath.info/browse/empirical-proof-of-islam"
          },
          {
            "id": "rp-refute",
            "title": "หักล้างข้อกล่าวหา",
            "url": "https://rightpath.info/browse/refuting-false-claims"
          },
          {
            "id": "rp-understand",
            "title": "เรียนรู้อิสลาม",
            "url": "https://rightpath.info/browse/understanding-islam"
          },
          {
            "id": "rp-browse",
            "title": "บทความทั้งหมด",
            "url": "https://rightpath.info/browse"
          }
        ]
      },
      {
        "id": "rp-social",
        "name": "ช่องทางโซเชียลมีเดีย",
        "description": "ติดตามอินโฟกราฟิกและบทความสั้นประจำวัน",
        "order": 2,
        "links": [
          {
            "id": "rp-fb",
            "title": "เพจ Facebook Right Path Salafi",
            "url": "https://www.facebook.com/RightPath.219"
          },
          {
            "id": "rp-ig",
            "title": "Instagram (@right_path.219)",
            "url": "https://www.instagram.com/right_path.219/"
          }
        ]
      }
    ]
  },
  {
    "id": "islaminthailand",
    "slug": "islaminthailand",
    "name": "อิสลามในประเทศไทย (Islam in Thailand)",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.islaminthailand.org"
    },
    "description": "ศูนย์รวมอัลกุรอาน อัซซุนนะฮ์ ประวัตินบี และคลังบทความ/เสียงบรรยายวิชาการโดยคณาจารย์และเชคริฎอ อะหมัด สมะดี",
    "logoUrl": "",
    "themeColor": "#0d9488",
    "order": 8,
    "networks": [],
    "campuses": [
      {
        "id": "iit-hubs",
        "name": "ศูนย์รวมอัลกุรอาน หะดีษ & ซีเราะฮ์",
        "description": "หมวดคัมภีร์หลักและชีวประวัติท่านนบี ﷺ",
        "order": 1,
        "links": [
          {
            "id": "iit-quran",
            "title": "ศูนย์อัลกุรอาน (AlQuranHub)",
            "url": "https://islaminthailand.org/AlQuranHub"
          },
          {
            "id": "iit-sunnah",
            "title": "ศูนย์อัซซุนนะฮ์ / หะดีษ (AssunnahHub)",
            "url": "https://islaminthailand.org/AssunnahHub"
          },
          {
            "id": "iit-seerah",
            "title": "ประวัตินบี (Seerah)",
            "url": "https://islaminthailand.org/Seerah1"
          }
        ]
      },
      {
        "id": "iit-browse",
        "name": "หมวดหมู่บทความและคณาจารย์",
        "description": "เลือกอ่านตามหมวดวิชาการและผู้บรรยาย",
        "order": 2,
        "links": [
          {
            "id": "iit-cats",
            "title": "สารบัญหมวดหมู่ทั้งหมด",
            "url": "https://islaminthailand.org/Catagories"
          },
          {
            "id": "iit-rida",
            "title": "คลังบทเรียนเชคริฎอ อะหมัด สมะดี",
            "url": "https://www.islaminthailand.org/dp8/taxonomy/term/49"
          }
        ]
      }
    ]
  },
  {
    "id": "islamhouse-th",
    "slug": "islamhouse-th",
    "name": "IslamHouse ภาคภาษาไทย",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://islamhouse.com/th/"
    },
    "description": "คลังความรู้อิสลามนานาชาติภาคภาษาไทย รวบรวมหนังสือ PDF บทความ ฟัตวา ไฟล์เสียง และวิดีโอที่ผ่านการตรวจสอบ",
    "logoUrl": "https://islamhouse.com/logo_IslamHouse.jpg",
    "themeColor": "#1d4ed8",
    "order": 9,
    "networks": [],
    "campuses": [
      {
        "id": "islamhouse-reading",
        "name": "คลังหนังสือ PDF บทความ & ฟัตวา",
        "description": "เอกสารและตำราอิสลามภาษาไทยดาวน์โหลดฟรี",
        "order": 1,
        "links": [
          {
            "id": "ih-books",
            "title": "หนังสืออิสลามภาษาไทย (PDF / E-Book)",
            "url": "https://islamhouse.com/th/books/th/1"
          },
          {
            "id": "ih-articles",
            "title": "บทความอิสลามภาษาไทย",
            "url": "https://islamhouse.com/th/articles/th/1"
          },
          {
            "id": "ih-fatwa",
            "title": "ฟัตวาและคำวินิจฉัยศาสนา",
            "url": "https://islamhouse.com/th/fatwa/th/1"
          }
        ]
      },
      {
        "id": "islamhouse-av",
        "name": "คลังสื่อเสียงและวิดีโอ",
        "description": "ไฟล์เสียงบรรยายและวิดีโอความรู้ภาคภาษาไทย",
        "order": 2,
        "links": [
          {
            "id": "ih-audios",
            "title": "คลังเสียงบรรยายภาษาไทย",
            "url": "https://islamhouse.com/th/audios/th/1"
          },
          {
            "id": "ih-videos",
            "title": "คลังวิดีโอภาษาไทย",
            "url": "https://islamhouse.com/th/videos/th/1"
          }
        ]
      }
    ]
  },
  {
    "id": "islamland-th",
    "slug": "islamland-th",
    "name": "IslamLand ภาษาไทย",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://islamland.com/tha"
    },
    "description": "คลังหนังสือ บทความ และสื่อดะอ์วะฮ์แปลไทย ครอบคลุมหลักศรัทธาอะกีดะตุสสะลัฟ ฟิกฮ์ และคู่มือมุสลิมหลายภาษา",
    "logoUrl": "",
    "themeColor": "#0e7490",
    "order": 10,
    "networks": [],
    "campuses": [
      {
        "id": "islamland-main",
        "name": "คลังเนื้อหาภาษาไทยและนานาชาติ",
        "description": "เข้าชมสื่ออิสลามแปลไทย อังกฤษ และอาหรับ",
        "order": 1,
        "links": [
          {
            "id": "il-th",
            "title": "IslamLand ภาคภาษาไทย",
            "url": "https://islamland.com/tha"
          },
          {
            "id": "il-en",
            "title": "IslamLand (English)",
            "url": "https://islamland.com/eng"
          },
          {
            "id": "il-ar",
            "title": "IslamLand (العربية)",
            "url": "https://islamland.com/ara"
          }
        ]
      }
    ]
  },
  {
    "id": "sunnahthai",
    "slug": "sunnahthai",
    "name": "ซุนนะห์ไทย (SunnahThai)",
    "category": "quran-hadith",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://sunnahthai.com/"
    },
    "description": "แหล่งค้นคว้าอัลกุรอานพร้อมตัฟซีรและบทความวิชาการอิสลามภาษาไทยที่อ่านง่ายและเป็นระบบ",
    "logoUrl": "https://sunnahthai.com/upload/logo/launchericon-192x192.png",
    "themeColor": "#047857",
    "order": 11,
    "networks": [],
    "campuses": [
      {
        "id": "sunnahthai-sections",
        "name": "คลังอัลกุรอานและบทความวิชาการ",
        "description": "ศึกษาอัลกุรอานพร้อมคำแปลและบทความศาสนา",
        "order": 1,
        "links": [
          {
            "id": "sunnahthai-quran",
            "title": "อัลกุรอานและคำแปลภาษาไทย",
            "url": "https://sunnahthai.com/quran"
          },
          {
            "id": "sunnahthai-articles",
            "title": "คลังบทความวิชาการ",
            "url": "https://sunnahthai.com/articles"
          }
        ]
      }
    ]
  },
  {
    "id": "quranth",
    "slug": "quranth",
    "name": "QuranTH (อัลกุรอานแปลไทยและตัฟซีร)",
    "category": "quran-hadith",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.quranth.com"
    },
    "description": "เว็บอ่านอัลกุรอานพร้อมคำแปลภาษาไทยและตัฟซีร ค้นหาอายะฮ์และซูเราะฮ์ได้สะดวกรวดเร็ว",
    "logoUrl": "",
    "themeColor": "#065f46",
    "order": 12,
    "networks": [],
    "campuses": [
      {
        "id": "quranth-main",
        "name": "อ่านอัลกุรอานและตัฟซีรภาษาไทย",
        "description": "เข้าสู่หน้าอ่านอัลกุรอานออนไลน์",
        "order": 1,
        "links": [
          {
            "id": "qth-home",
            "title": "เข้าสู่ QuranTH →",
            "url": "https://www.quranth.com"
          }
        ]
      }
    ]
  },
  {
    "id": "hadeethenc",
    "slug": "hadeethenc",
    "name": "สารานุกรมหะดีษ (HadeethEnc)",
    "category": "quran-hadith",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://hadeethenc.com/th/home"
    },
    "description": "สารานุกรมหะดีษนบีพร้อมคำอธิบายและคำแปลหลายภาษารวมถึงภาษาไทย อังกฤษ และอาหรับ",
    "logoUrl": "https://hadeethenc.com/assets_v2/images/og_new_logo.jpg",
    "themeColor": "#0369a1",
    "order": 13,
    "networks": [
      "quranenc"
    ],
    "campuses": [
      {
        "id": "hadeethenc-langs",
        "name": "เลือกภาษาที่ต้องการศึกษา",
        "description": "เข้าถึงสารานุกรมหะดีษพร้อมคำอธิบายอย่างเป็นระบบ",
        "order": 1,
        "links": [
          {
            "id": "he-th",
            "title": "สารานุกรมหะดีษ ภาคภาษาไทย",
            "url": "https://hadeethenc.com/th/home"
          },
          {
            "id": "he-en",
            "title": "Hadeeth Encyclopedia (English)",
            "url": "https://hadeethenc.com/en/home"
          },
          {
            "id": "he-ar",
            "title": "موسوعة الأحاديث النبوية (العربية)",
            "url": "https://hadeethenc.com/ar/home"
          }
        ]
      }
    ]
  },
  {
    "id": "quranenc",
    "slug": "quranenc",
    "name": "สารานุกรมอัลกุรอาน (QuranEnc)",
    "category": "quran-hadith",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://quranenc.com/th/home"
    },
    "description": "โครงการแปลความหมายอัลกุรอานที่เชื่อถือได้ในหลากหลายภาษา พร้อมเสียงอ่านและคำอธิบายประกอบ",
    "logoUrl": "https://quranenc.com/assets/images/og_new_logo.jpg",
    "themeColor": "#15803d",
    "order": 14,
    "networks": [
      "hadeethenc"
    ],
    "campuses": [
      {
        "id": "quranenc-main",
        "name": "อ่านและฟังอัลกุรอานพร้อมคำแปล",
        "description": "ศึกษาความหมายอัลกุรอานภาษาไทยและไฟล์เสียง",
        "order": 1,
        "links": [
          {
            "id": "qe-home",
            "title": "หน้าหลักสารานุกรมอัลกุรอาน (ภาษาไทย)",
            "url": "https://quranenc.com/th/home"
          },
          {
            "id": "qe-audio",
            "title": "คลังเสียงอ่านอัลกุรอาน",
            "url": "https://quranenc.com/th/audio"
          }
        ]
      }
    ]
  },
  {
    "id": "fatwathai",
    "slug": "fatwathai",
    "name": "ฟัตวาไทย (FatwaThai)",
    "category": "fatwa",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://fatwathai.com/"
    },
    "description": "คลังค้นหาคำวินิจฉัยปัญหาศาสนา (ฟัตวา) ภาษาไทยจากบรรดานักวิชาการอะฮ์ลิสซุนนะฮ์ วัลญะมาอะฮ์",
    "logoUrl": "",
    "themeColor": "#0d9488",
    "order": 15,
    "networks": [],
    "campuses": [
      {
        "id": "fatwathai-main",
        "name": "ค้นหาฟัตวาภาษาไทย",
        "description": "ระบบค้นหาคำตอบปัญหาศาสนาพร้อมอ้างอิงนักวิชาการ",
        "order": 1,
        "links": [
          {
            "id": "ft-home",
            "title": "เข้าสู่หน้าค้นหาฟัตวา →",
            "url": "https://fatwathai.com/"
          }
        ]
      }
    ]
  },
  {
    "id": "thaiislamqa",
    "slug": "thaiislamqa",
    "name": "ThaiIslamQA (แปลฟัตวา IslamQA ภาษาไทย)",
    "category": "fatwa",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://thaiislamqa.com"
    },
    "description": "คลังแปลคำวินิจฉัยปัญหาศาสนา (ฟัตวา) จาก IslamQA เป็นภาษาไทย พร้อมบล็อกบทความสะลัฟในเครือ",
    "logoUrl": "",
    "themeColor": "#0369a1",
    "order": 16,
    "networks": [],
    "campuses": [
      {
        "id": "tiqa-fatwas",
        "name": "คลังฟัตวาแปลไทย",
        "description": "รวมคำตอบปัญหาศาสนาแยกตามหัวข้อและรายการล่าสุด",
        "order": 1,
        "links": [
          {
            "id": "tiqa-home",
            "title": "หน้าแรก ThaiIslamQA",
            "url": "https://thaiislamqa.com"
          },
          {
            "id": "tiqa-recent",
            "title": "ฟัตวาล่าสุด 100 เรื่อง",
            "url": "https://thaiislamqa.com/recent100fatwa/"
          }
        ]
      },
      {
        "id": "tiqa-blogs",
        "name": "คลังบทความในเครือ",
        "description": "บทความชี้แจงเรื่องบิดอะฮ์และแนวทางสะลัฟ",
        "order": 2,
        "links": [
          {
            "id": "tiqa-bidah",
            "title": "ThaiBidah (ชี้แจงเรื่องบิดอะฮ์)",
            "url": "https://thaibidah.wordpress.com/"
          },
          {
            "id": "tiqa-salafis",
            "title": "ThaiSalafis (บทความสะลัฟ)",
            "url": "https://thaisalafis.wordpress.com/"
          }
        ]
      }
    ]
  },
  {
    "id": "islammore",
    "slug": "islammore",
    "name": "อิสลามมอร์ (IslamMore)",
    "category": "fatwa",
    "language": "Thai",
    "platforms": [
      "Website",
      "YouTube",
      "Facebook"
    ],
    "socialLinks": {
      "Website": "https://www.islammore.com/",
      "YouTube": "https://www.youtube.com/@Risalah_Radio/streams",
      "Facebook": "https://www.facebook.com/pages/ISLAMMORE-xis-lam-mxr/107983492577066"
    },
    "description": "เว็บไซต์ความรู้อิสลามภาษาไทยรุ่นบุกเบิก รวบรวมบทความศาสนา ฟัตวา และวิทยุ Risalah Radio ตามแนวทางอัลกุรอานและซุนนะฮ์",
    "logoUrl": "",
    "themeColor": "#0e7490",
    "order": 17,
    "networks": [],
    "campuses": [
      {
        "id": "islammore-archive",
        "name": "คลังบทความและฟัตวา",
        "description": "หมวดหมู่บทความศาสนาและตอบปัญหาศาสนา",
        "order": 1,
        "links": [
          {
            "id": "im-religion",
            "title": "หมวดบทความศาสนา",
            "url": "https://www.islammore.com/archive/26"
          },
          {
            "id": "im-fatwa",
            "title": "หมวดฟัตวาตอบปัญหาศาสนา",
            "url": "https://www.islammore.com/archive/49"
          }
        ]
      },
      {
        "id": "islammore-radio",
        "name": "สื่อเสียงและถ่ายทอดสด",
        "description": "รับฟังการถ่ายทอดสดรายการศาสนาออนไลน์",
        "order": 2,
        "links": [
          {
            "id": "im-radio",
            "title": "ถ่ายทอดสด Risalah Radio (YouTube)",
            "url": "https://www.youtube.com/@Risalah_Radio/streams"
          }
        ]
      }
    ]
  },
  {
    "id": "ilmulnafi",
    "slug": "ilmulnafi",
    "name": "ศูนย์การเรียนรู้อิลมุนนาเฟียอ์ (مركز العلم النافع)",
    "category": "media",
    "language": "Thai",
    "platforms": [
      "YouTube"
    ],
    "socialLinks": {
      "YouTube": "https://www.youtube.com/@ilmulnafi"
    },
    "description": "เผยแพร่ความรู้ที่ยังประโยชน์จากตำราอุละมาอ์ที่เจริญรอยตามสะลัฟ ในรูปแบบบรรยายซีรีส์ระยะยาวและบทเรียนศาสนา",
    "logoUrl": "https://yt3.googleusercontent.com/FfbF-7OeURal1lop02CLX8o2D3VKRHbP69LGpopkf6SOJhZQmtBC2tFaFBOidTtM9gLjeGsipw=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#047857",
    "order": 18,
    "networks": [],
    "campuses": [
      {
        "id": "in-aqidah",
        "name": "หมวดอะกีดะฮ์ & อธิบายตำราสะลัฟ",
        "description": "ซีรีส์สอนหลักศรัทธาและตำราอุละมาอ์อย่างเป็นระบบ",
        "order": 1,
        "links": [
          {
            "id": "in-pl-aqidah",
            "title": "ซีรีส์ • อะกีดะฮ์ฉบับรวบรัด",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0jEC0GkEUYd_ORs0Khfprkq"
          },
          {
            "id": "in-pl-fadl",
            "title": "ซีรีส์ • อธิบายหนังสือฟัฎลุ้ลอิสลาม",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0hnFuHcf658hTe3AJBB4Byk"
          },
          {
            "id": "in-pl-shahadah",
            "title": "ซีรีส์ • ข้อเท็จจริงของคำปฏิญาณ",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0gLFe9jAyXEIBIhbYiwJryu"
          },
          {
            "id": "in-pl-jibril",
            "title": "ซีรีส์ • สิ่งที่ได้รับจากหะดีษญิบรีล",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0iF_wwsOivtQuCuy7L4e-RW"
          }
        ]
      },
      {
        "id": "in-modern",
        "name": "หมวดแนวคิดร่วมสมัย & ชี้แจงกลุ่มหลงผิด",
        "description": "วิเคราะห์กระแสเสรีนิยม อเทวนิยม และกลุ่มหลงผิดต่างๆ",
        "order": 2,
        "links": [
          {
            "id": "in-pl-modern",
            "title": "ซีรีส์ • ความศรัทธาในโลกสมัยใหม่",
            "url": "https://www.youtube.com/playlist?list=PLYA6pZjCDbH8"
          },
          {
            "id": "in-pl-liberal",
            "title": "ซีรีส์ • มุมมองของอิสลามต่อแนวคิดเสรีนิยมตะวันตก",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0jEn6534jDU-b2BSgJWbMmF"
          },
          {
            "id": "in-pl-atheist",
            "title": "ซีรีส์ • ชี้แจงความหลงผิดของผู้ปฏิเสธการมีอยู่ของพระเจ้า",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0jDkC55z39HQHTrmU-onQjk"
          },
          {
            "id": "in-pl-sects",
            "title": "ซีรีส์ • กลุ่มหลงผิดกับความเชื่อที่บิดเบือน",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0icWd0ZmH1uUEnAbJtA02mg"
          }
        ]
      },
      {
        "id": "in-arabic-ramadan",
        "name": "หมวดภาษาอาหรับ รอมฎอน & ขัดเกลาจิตใจ",
        "description": "วิชาศ็อรฟ์ บทเรียนรอมฎอน และรายการ SALAFI TALK",
        "order": 3,
        "links": [
          {
            "id": "in-pl-sarf",
            "title": "วิชาศ็อรฟ์ 101 (ภาษาอาหรับ)",
            "url": "https://www.youtube.com/playlist?list=PLBubjtuqLCko"
          },
          {
            "id": "in-pl-ramadan",
            "title": "ซีรีส์ • 5 อายะฮ์ในเราะมะฎอน",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0i-cJ5PuRtnwrAXNOooxjwh"
          },
          {
            "id": "in-pl-steadfast",
            "title": "ซีรีส์ • ยืนหยัดจนวินาทีสุดท้าย",
            "url": "https://www.youtube.com/playlist?list=PLW66qj6keZCU"
          },
          {
            "id": "in-pl-talk",
            "title": "SALAFI TALK",
            "url": "https://www.youtube.com/playlist?list=PL41LPNB4Pp0gYH3SbXwn1B1sOB_rsfzOV"
          }
        ]
      }
    ]
  },
  {
    "id": "thaisalafi",
    "slug": "thaisalafi",
    "name": "Salafiyoon — ชมรมอัซซะละฟิยูน",
    "category": "media",
    "language": "Thai",
    "platforms": [
      "YouTube"
    ],
    "socialLinks": {
      "YouTube": "https://www.youtube.com/@thaisalafi"
    },
    "description": "ช่องยูทูบชมรมอัซซะละฟิยูน เผยแพร่คำบรรยาย บทเรียนตำราสะลัฟ และคลิปความรู้ศาสนาภาษาไทย",
    "logoUrl": "https://yt3.googleusercontent.com/ytc/AIdro_mdppEaMMmJoT7JJ1NV36n7ctqXrfMfD8kiIRyn_nt-wZ8=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#1a5f7a",
    "order": 19,
    "networks": [],
    "campuses": [
      {
        "id": "ts-aqidah",
        "name": "หมวดเตาฮีด & อะกีดะฮ์",
        "description": "อธิบายกิตาบุตเตาฮีดและประเด็นหลักศรัทธาสำคัญ",
        "order": 1,
        "links": [
          {
            "id": "ts-pl-tawheed",
            "title": "เตาฮีดกับชีวิตประจำวัน (อธิบายกิตาบุตเตาฮีด)",
            "url": "https://www.youtube.com/playlist?list=PLllshWkSZxtgSADEPbsC7NA80PAlqatg-"
          },
          {
            "id": "ts-pl-where",
            "title": "อัลลอฮ์อยู่ที่ไหน",
            "url": "https://www.youtube.com/playlist?list=PLJIkiAvv9Ge0"
          },
          {
            "id": "ts-pl-tawassul",
            "title": "ตะวัซซุล",
            "url": "https://www.youtube.com/playlist?list=PLM66hrY6ftcA"
          },
          {
            "id": "ts-pl-hidayah",
            "title": "ฮิดายะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLXbSOEMAtzL0"
          }
        ]
      },
      {
        "id": "ts-fiqh",
        "name": "หมวดฟิกฮ์ & อิบาดะฮ์",
        "description": "อธิบายตำราฟิกฮ์ มุลัคค็อสอัลฟิกฮีย์ และบทบัญญัติญะนาซะฮ์",
        "order": 2,
        "links": [
          {
            "id": "ts-pl-mulakhkhas",
            "title": "อธิบายหนังสือ \"มุลัคค็อสอัลฟิกฮีย์\" (คลอง 24)",
            "url": "https://www.youtube.com/playlist?list=PLllshWkSZxtjOqauyt0PxwtfSoDOJyTuK"
          },
          {
            "id": "ts-pl-janazah",
            "title": "ญะนาซะฮ์ + อะลัมบัรซัค",
            "url": "https://www.youtube.com/playlist?list=PLllshWkSZxtjP-N3IF7fol5aCu77v3d_8"
          },
          {
            "id": "ts-pl-basics",
            "title": "พื้นฐานการปฏิบัติ",
            "url": "https://www.youtube.com/playlist?list=PLDatd8Zs_A_U"
          }
        ]
      },
      {
        "id": "ts-manhaj",
        "name": "หมวดมันฮัจญ์ & ชี้แจงบิดอะฮ์-กลุ่มหลงผิด",
        "description": "หลักการยึดมั่นตามอุละมาอ์และข้อควรระวังเรื่องกลุ่มหลงผิด",
        "order": 3,
        "links": [
          {
            "id": "ts-pl-sects",
            "title": "กลุ่มหลงผิด",
            "url": "https://www.youtube.com/playlist?list=PLllshWkSZxtiU5rVqkZCHrqKPDIv6mPjp"
          },
          {
            "id": "ts-pl-ulama",
            "title": "ถ้าไม่เอาอุละมาอ์ก็ต้องว่ากันเอง",
            "url": "https://www.youtube.com/playlist?list=PLllshWkSZxtiA2fHntLOLu-iO_JmBUsFe"
          },
          {
            "id": "ts-pl-mawlid",
            "title": "ประเด็นเมาลิด",
            "url": "https://www.youtube.com/playlist?list=PLXgiSaE5gv0A"
          }
        ]
      }
    ]
  },
  {
    "id": "alflower",
    "slug": "alflower",
    "name": "อัลฟะวาเอ็ด (alflower.1)",
    "category": "media",
    "language": "Thai",
    "platforms": [
      "YouTube",
      "Instagram"
    ],
    "socialLinks": {
      "YouTube": "https://www.youtube.com/@alflower.1",
      "Instagram": "https://www.instagram.com/alflower.1/"
    },
    "description": "ช่องบทเรียนศาสนา อรรถาธิบายพระนามอันวิจิตรของอัลลอฮ์ กฎเหล็กการขัดเกลาจิตใจ และแนะนำหนังสือแปลสายสะละฟี",
    "logoUrl": "https://yt3.googleusercontent.com/tJqHYC5TERk0WZs8RKyn2pxa60ZUKWZJ7zKCNb894zOLcWy3FEkSCibrKi_Y7vmMp9DZCqO9Sw=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#be185d",
    "order": 20,
    "networks": [],
    "campuses": [
      {
        "id": "af-aqidah-tafsir",
        "name": "หมวดอะกีดะฮ์ พระนามของอัลลอฮ์ & ตัฟซีร",
        "description": "อรรถาธิบายพระนามอันวิจิตร อายะฮ์อัลกุรซีย์ และซูเราะฮ์อัลฟาติฮะฮ์",
        "order": 1,
        "links": [
          {
            "id": "af-pl-names",
            "title": "อธิบายพระนามอันวิจิตร (ฉบับย่อ)",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9gzDRl79KuZqy6fVMWmy9YR"
          },
          {
            "id": "af-pl-aqidah",
            "title": "พื้นฐานหลักอะกีดะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9gF6SqxbuRa_HP2igeUYSz3"
          },
          {
            "id": "af-pl-kursi",
            "title": "อายะฮ์ \"อัล-กุรซีย์\" กับหลักฐานแห่งเตาฮีด",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9g3oSIXoZhbvlKrRsbRbHls"
          },
          {
            "id": "af-pl-fatihah",
            "title": "ตัฟซีรซูเราะฮ์อัลฟาติฮะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9ghTI6U38ZlcqrGqN1tmQFe"
          }
        ]
      },
      {
        "id": "af-tazkiyah",
        "name": "หมวดขัดเกลาจิตใจ มุตูนวน & อัซการ์",
        "description": "กฎเหล็กขัดเกลาจิตใจ มุตูนวนฏอลิบิ้ลอิลม์ และบทรำลึกเช้า-เย็น",
        "order": 2,
        "links": [
          {
            "id": "af-pl-10rules",
            "title": "10 กฎเหล็กในการขัดเกลาจิตใจให้บริสุทธิ์",
            "url": "https://www.youtube.com/playlist?list=PLCrTMcTwcBVU"
          },
          {
            "id": "af-pl-mutun",
            "title": "มุตูนวน ฏอลิบิ้ลอิลม์ ระดับเริ่มต้น (บทรำลึกและจรรยา)",
            "url": "https://www.youtube.com/playlist?list=PLPhxIY0HqJPo"
          },
          {
            "id": "af-pl-adhkar",
            "title": "อธิบายบทรำลึกยามเช้า-เย็น",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9g-1ppdKipHBBnuYfTIm1i6"
          },
          {
            "id": "af-pl-adab",
            "title": "มารยาทในอิสลาม",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9gZviUhiUxibUPQ9mY1UrAd"
          }
        ]
      },
      {
        "id": "af-family-hajj",
        "name": "หมวดอบรมลูก สอนเตาฮีดเด็ก & ฮัจญ์-อุมเราะฮ์",
        "description": "การปลูกฝังศรัทธาแก่เด็กและบทบัญญัติฮัจญ์-อุมเราะฮ์",
        "order": 3,
        "links": [
          {
            "id": "af-pl-kids-tawheed",
            "title": "การสอนเตาฮีดให้กับเด็กๆ",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9ikt5M-tnH5r5MJ6-1x9931"
          },
          {
            "id": "af-pl-kids-edu",
            "title": "การอบรมลูกๆ",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9jXNUNOXMLKDaQ7b5prsum1"
          },
          {
            "id": "af-pl-kids-qa",
            "title": "คำถามของเด็กๆ เกี่ยวกับหลักการศรัทธา",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9i5iF9p5XMw47dzyiMXwqqr"
          },
          {
            "id": "af-pl-hajj",
            "title": "อธิบายการประกอบพิธีฮัจญ์และอุมเราะฮ์",
            "url": "https://www.youtube.com/playlist?list=PLvTGcKl-DZ9iOMHqIEGNQTsRYwTkRY5zs"
          },
          {
            "id": "af-ig-link",
            "title": "แนะนำหนังสือแปลบน Instagram (@alflower.1)",
            "url": "https://www.instagram.com/alflower.1/"
          }
        ]
      }
    ]
  },
  {
    "id": "arifsalafi",
    "slug": "arifsalafi",
    "name": "Arif Salafi",
    "category": "media",
    "language": "Thai",
    "platforms": [
      "YouTube"
    ],
    "socialLinks": {
      "YouTube": "https://www.youtube.com/@ArifSalafi"
    },
    "description": "ช่องคลิปแปลคำบรรยายและฟัตวาของบรรดาอุละมาอ์ใหญ่สายสะลัฟพร้อมซับไทย",
    "logoUrl": "https://yt3.googleusercontent.com/hWBXgQR6LGV5jW6f7jRQs3xssXX9Wmuiug3KwIFxbxXugYirl14K038CbisTHxANzYA0hP84Vw=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#334155",
    "order": 21,
    "networks": [],
    "campuses": [
      {
        "id": "arif-proof",
        "name": "หมวดพิสูจน์พระเจ้า & วิพากษ์ปรัชญาสมัยใหม่",
        "description": "หลักฐานเชิงตรรกะ กุรอาน และวิพากษ์แนวคิดโมเดิร์นนิสม์",
        "order": 1,
        "links": [
          {
            "id": "arif-pl-modernist",
            "title": "ซีรีส์ วิพากษ์ปรัชญาสมัยใหม่ (The Modernist Menace to Islam)",
            "url": "https://www.youtube.com/playlist?list=PLRXRS_OA03lI"
          },
          {
            "id": "arif-pl-5ways",
            "title": "5 วิธีในการพิสูจน์พระเจ้าขั้นพื้นฐานแบบบ้านๆ",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb00_wYiKREAalZoin2Hi19z"
          },
          {
            "id": "arif-pl-quran",
            "title": "พิสูจน์ความจริงกับกุรอาน",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb1MnyEHcqCpksM_SB4VFR3I"
          },
          {
            "id": "arif-pl-universe",
            "title": "ซีรีส์ จากจักรวาลสู่ชีวิต: โอกาสอันมืดบอดหรือสาเหตุทรงปัญญา?",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb00ISZtZXtOvElnr2wHg_sN"
          }
        ]
      },
      {
        "id": "arif-science",
        "name": "หมวดวิทยาศาสตร์ & วิวัฒนาการ",
        "description": "ปริศนา DNA ความลับของเซลล์ และ Evolution News",
        "order": 2,
        "links": [
          {
            "id": "arif-pl-dna",
            "title": "ซีรีส์ DNA ENIGMA: ปริศนาดีเอ็นเอ",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb3kr7RdWw1agjzs_M9CuiOZ"
          },
          {
            "id": "arif-pl-cell",
            "title": "ความลับของเซลล์ (Michael Behe)",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb3_i-X3djDIAOUAnmdIv5UC"
          },
          {
            "id": "arif-pl-evonews",
            "title": "Evolution News-TH",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb0PnaYbkLY5WF1wOJcRBboL"
          }
        ]
      },
      {
        "id": "arif-dawah",
        "name": "หมวดดะอ์วะฮ์ เรื่องราวรับอิสลาม & พอดแคสต์",
        "description": "สอนต่างศาสนิกรับอิสลาม Convert Stories และรายการสนทนา",
        "order": 3,
        "links": [
          {
            "id": "arif-pl-newmuslim",
            "title": "สอนต่างศาสนิกรับอิสลาม",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb08Dn2jo-xQITYOV15XYGax"
          },
          {
            "id": "arif-pl-convert",
            "title": "Convert Stories | เรื่องราวรับอิสลามแปลไทย",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb02ZsFcc8yccMxUQRuDlCs7"
          },
          {
            "id": "arif-pl-teatime",
            "title": "TEA-TIME จิบชาสนทนา",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb05Eb6XXr2HIdSi6l2IvyKS"
          },
          {
            "id": "arif-pl-pod",
            "title": "ครอบจักรวาล PODCAST",
            "url": "https://www.youtube.com/playlist?list=PLluoe521BCb3mXlCMRX6Tvwd7Bf2Foyj0"
          }
        ]
      }
    ]
  },
  {
    "id": "evolution-about",
    "slug": "evolution-about",
    "name": "Evolution-About : วิวัฒนาการตามจริง",
    "category": "media",
    "language": "Thai",
    "platforms": [
      "YouTube"
    ],
    "socialLinks": {
      "YouTube": "https://www.youtube.com/@evolution-about7798"
    },
    "description": "ช่องวิชาการให้ความรู้และวิพากษ์ทฤษฎีวิวัฒนาการตามข้อเท็จจริงทางวิทยาศาสตร์ สารคดีพากย์ไทย และพอดแคสต์เชิงศรัทธา",
    "logoUrl": "https://yt3.googleusercontent.com/5g5jqwe_B9nyiOJMeM10ZJ-W5E70vju3-c7IRcB3m0B80ApngzsOGmuqseIBRVyqrBNqvDCc=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#4338ca",
    "order": 22,
    "networks": [],
    "campuses": [
      {
        "id": "evo-bio",
        "name": "หมวดชีววิทยาโมเลกุล & ปริศนาดีเอ็นเอ",
        "description": "หลักฐานการออกแบบอันทรงปัญญาในระดับเซลล์และโมเลกุล",
        "order": 1,
        "links": [
          {
            "id": "evo-pl-mol",
            "title": "เครื่องจักรโมเลกุล (Molecular Machines): หลักฐานของการออกแบบ",
            "url": "https://www.youtube.com/playlist?list=PL7Q1k3ZI9PD0YfN8ue4emKW-YdUhXjIug"
          },
          {
            "id": "evo-pl-dna",
            "title": "ซีรีส์ DNA ENIGMA: ปริศนาดีเอ็นเอ",
            "url": "https://www.youtube.com/playlist?list=PL7Q1k3ZI9PD05aYfxbo8XlG3k48dSSWSy"
          },
          {
            "id": "evo-pl-cell",
            "title": "ความลับของเซลล์ (Michael Behe)",
            "url": "https://www.youtube.com/playlist?list=PL7Q1k3ZI9PD249ECylb2dBJr0cT2k9-jJ"
          }
        ]
      },
      {
        "id": "evo-forum",
        "name": "หมวดงานเสวนา สารคดี & ข่าววิทยาศาสตร์",
        "description": "เวทีเสวนาวิชาการและสารคดีพากย์ไทย",
        "order": 2,
        "links": [
          {
            "id": "evo-pl-forum",
            "title": "SCI-SPACE FORUM 1 (2024)",
            "url": "https://www.youtube.com/playlist?list=PL7Q1k3ZI9PD1vAN0JGrwmniZlcYGzE2e9"
          },
          {
            "id": "evo-pl-doc",
            "title": "สารคดีและบรรยาย",
            "url": "https://www.youtube.com/playlist?list=PL7Q1k3ZI9PD1E6sOuwlpLbuMGpJhmoAcK"
          },
          {
            "id": "evo-pl-news",
            "title": "Evolution News",
            "url": "https://www.youtube.com/playlist?list=PL7Q1k3ZI9PD2T_O8N8Mgo9JkieTUdPqCj"
          }
        ]
      }
    ]
  },
  {
    "id": "alislahsamakom",
    "slug": "alislahsamakom",
    "name": "อัล-อิศลาหฺสมาคม (บางกอกน้อย)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.alislahsamakom.org"
    },
    "description": "สมาคมอิสลามเก่าแก่ย่านบางกอกน้อย มีคลังหิ้งหนังสือ E-Book อิสลามภาษาไทยให้อ่านออนไลน์ฟรีจำนวนมาก",
    "logoUrl": "",
    "themeColor": "#065f46",
    "order": 23,
    "networks": [],
    "campuses": [
      {
        "id": "alislah-info",
        "name": "เว็บไซต์สมาคมและประวัติ",
        "description": "ข้อมูลกิจกรรมและประวัติอัล-อิศลาหฺสมาคม",
        "order": 1,
        "links": [
          {
            "id": "isl-home",
            "title": "หน้าหลักอัล-อิศลาหฺสมาคม",
            "url": "https://www.alislahsamakom.org/th/"
          },
          {
            "id": "isl-history",
            "title": "ประวัติความเป็นมาของสมาคม",
            "url": "https://www.alislahsamakom.org/th/history/"
          }
        ]
      },
      {
        "id": "alislah-books",
        "name": "หิ้งหนังสือ E-Book ออนไลน์ (PubHTML5)",
        "description": "เปิดอ่านหนังสือและเอกสารของสมาคมได้ทันที",
        "order": 2,
        "links": [
          {
            "id": "isl-shelf-1",
            "title": "หิ้งหนังสือ Al-Islah Bangkoknoi (หลัก)",
            "url": "https://pubhtml5.com/bookcase/ysjh/"
          },
          {
            "id": "isl-shelf-2",
            "title": "หิ้งหนังสืออันดับพิเศษ",
            "url": "https://pubhtml5.com/bookcase/golmx/"
          },
          {
            "id": "isl-shelf-3",
            "title": "หิ้งหนังสืออันดับทั้งหมด",
            "url": "https://pubhtml5.com/bookcase/wccz/"
          }
        ]
      }
    ]
  },
  {
    "id": "munadiya",
    "slug": "munadiya",
    "name": "Munadiya (มุนาดิยา — ห้องเรียนศาสนาออนไลน์)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Website",
      "Instagram"
    ],
    "socialLinks": {
      "Website": "https://linktr.ee/munadiya",
      "Instagram": "https://www.instagram.com/munadiya_official/"
    },
    "description": "ห้องเรียนศาสนาอิสลามออนไลน์และชุมชนเรียนรู้สำหรับผู้แสวงหาความรู้ยุคใหม่",
    "logoUrl": "",
    "themeColor": "#0d9488",
    "order": 24,
    "networks": [],
    "campuses": [
      {
        "id": "munadiya-links",
        "name": "ช่องทางห้องเรียนและติดตามข่าวสาร",
        "description": "รวมลิงก์คอร์สเรียนและอัปเดตกิจกรรมของมุนาดิยา",
        "order": 1,
        "links": [
          {
            "id": "mun-linktree",
            "title": "ศูนย์รวมลิงก์ห้องเรียน Munadiya (Linktree)",
            "url": "https://linktr.ee/munadiya"
          },
          {
            "id": "mun-ig",
            "title": "Instagram ทางการ (@munadiya_official)",
            "url": "https://www.instagram.com/munadiya_official/"
          }
        ]
      }
    ]
  },
  {
    "id": "muslimfriend",
    "slug": "muslimfriend",
    "name": "มูลนิธิเพื่อนมุสลิม (Muslim's Friend Foundation)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Website",
      "Facebook"
    ],
    "socialLinks": {
      "Website": "https://muslimfriend.org",
      "Facebook": "https://www.facebook.com/muslimsfriendfoundation"
    },
    "description": "มูลนิธิเพื่อการเผยแผ่อิสลาม โครงการแจกหนังสือและสื่อความรู้สำหรับผู้สนใจอิสลามและมุสลิมใหม่",
    "logoUrl": "",
    "themeColor": "#0284c7",
    "order": 25,
    "networks": [],
    "campuses": [
      {
        "id": "mf-web",
        "name": "โครงการและข้อมูลมูลนิธิ",
        "description": "ติดตามโครงการดะอ์วะฮ์และกิจกรรมของมูลนิธิ",
        "order": 1,
        "links": [
          {
            "id": "mf-home",
            "title": "หน้าหลักมูลนิธิเพื่อนมุสลิม",
            "url": "https://muslimfriend.org"
          },
          {
            "id": "mf-projects",
            "title": "โครงการต่างๆ ของมูลนิธิ",
            "url": "https://muslimfriend.org/project"
          },
          {
            "id": "mf-fb",
            "title": "เพจ Facebook มูลนิธิเพื่อนมุสลิม",
            "url": "https://www.facebook.com/muslimsfriendfoundation"
          }
        ]
      }
    ]
  },
  {
    "id": "ibnbaz-th",
    "slug": "ibnbaz-th",
    "name": "สถาบันอิบนุบาซเพื่ออิสลามศึกษา (Ibn Baz Institute)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/IbnBazTh"
    },
    "description": "สถาบันการเรียนการสอนอิสลามศึกษาและเผยแพร่ความรู้วิชาการตามแนวทางสะลัฟในประเทศไทย",
    "logoUrl": "",
    "themeColor": "#047857",
    "order": 26,
    "networks": [],
    "campuses": [
      {
        "id": "ibnbaz-th-fb",
        "name": "เพจทางการและกิจกรรมวิชาการ",
        "description": "ติดตามข่าวสารหลักสูตร บทความ และงานเสวนา",
        "order": 1,
        "links": [
          {
            "id": "ibt-fb",
            "title": "เพจ Facebook สถาบันอิบนุบาซฯ",
            "url": "https://www.facebook.com/IbnBazTh"
          }
        ]
      }
    ]
  },
  {
    "id": "islamic-advising-center",
    "slug": "islamic-advising-center",
    "name": "ศูนย์แนะนำรู้จักอิสลาม (Islamic Advising Center)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/IslamicAdvisingCenter"
    },
    "description": "ศูนย์ดะอ์วะฮ์อิสลามแห่งประเทศไทย (مركز الدعوة الإسلامية) ถ่ายทอดหลักการอิสลามที่ถูกต้องแก่มุสลิมและผู้สนใจอิสลาม",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 27,
    "networks": [],
    "campuses": [
      {
        "id": "iac-main",
        "name": "ช่องทางติดต่อและสื่อความรู้",
        "description": "ติดตามบทความแนะนำอิสลามและกิจกรรมดะอ์วะฮ์",
        "order": 1,
        "links": [
          {
            "id": "iac-fb",
            "title": "เพจ Facebook ศูนย์แนะนำรู้จักอิสลาม",
            "url": "https://www.facebook.com/IslamicAdvisingCenter"
          }
        ]
      }
    ]
  },
  {
    "id": "punkwamro",
    "slug": "punkwamro",
    "name": "มูลนิธิปันความรู้ (Sharing Knowledge Foundation)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/punkwame.ro"
    },
    "description": "มูลนิธิเพื่อการแบ่งปันความรู้และสื่อหนังสืออิสลามเพื่อสังคม",
    "logoUrl": "",
    "themeColor": "#0369a1",
    "order": 28,
    "networks": [],
    "campuses": [
      {
        "id": "pkr-main",
        "name": "เพจมูลนิธิปันความรู้",
        "description": "ติดตามโครงการแบ่งปันความรู้และสื่อการเรียนรู้",
        "order": 1,
        "links": [
          {
            "id": "pkr-fb",
            "title": "เพจ Facebook มูลนิธิปันความรู้",
            "url": "https://www.facebook.com/punkwame.ro"
          }
        ]
      }
    ]
  },
  {
    "id": "madrasahalwabil",
    "slug": "madrasahalwabil",
    "name": "Madrasah Al-Wabil (مدرسة الوابل)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/madrasahalwabil"
    },
    "description": "สถาบันและเพจเผยแพร่บทเรียนภาษาอาหรับ ตำราศาสนา และความรู้สะลัฟ",
    "logoUrl": "",
    "themeColor": "#1e40af",
    "order": 29,
    "networks": [],
    "campuses": [
      {
        "id": "wabil-main",
        "name": "เพจ Madrasah Al-Wabil",
        "description": "ติดตามคอร์สเรียนและบทความวิชาการ",
        "order": 1,
        "links": [
          {
            "id": "wabil-fb",
            "title": "เพจ Facebook Madrasah Al-Wabil",
            "url": "https://www.facebook.com/madrasahalwabil"
          }
        ]
      }
    ]
  },
  {
    "id": "thai-salafi-publishers",
    "slug": "thai-salafi-publishers",
    "name": "เครือข่ายเพจหนังสือและสำนักพิมพ์สะลัฟไทย",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Facebook",
      "Instagram"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/furhan621411005",
      "Instagram": "https://www.instagram.com/_ibnuyusuf/"
    },
    "description": "รวมเพจสำนักพิมพ์อิสระ มุมหนังสือ และนักแปลตำราสะลัฟภาษาไทยที่เผยแพร่หนังสือและบทความคุณภาพบน Facebook และ Instagram",
    "logoUrl": "",
    "themeColor": "#7c2d12",
    "order": 30,
    "networks": [],
    "campuses": [
      {
        "id": "tsp-publishers",
        "name": "เพจสำนักพิมพ์และแปลตำรา (Facebook)",
        "description": "ติดตามหนังสือออกใหม่และงานแปลตำราศาสนา",
        "order": 1,
        "links": [
          {
            "id": "tsp-truthislam",
            "title": "สำนักพิมพ์ผู้สนใจในอิสลาม (Truth Islam Publisher)",
            "url": "https://www.facebook.com/profile.php?id=61565389662125"
          },
          {
            "id": "tsp-humanwrite",
            "title": "สำนักพิมพ์ Human Write",
            "url": "https://www.facebook.com/profile.php?id=100063260017282"
          },
          {
            "id": "tsp-attaymiyyah",
            "title": "อัต-ตัยมียะฮ์ (التيمية)",
            "url": "https://www.facebook.com/profile.php?id=61572292302402"
          }
        ]
      },
      {
        "id": "tsp-readers",
        "name": "มุมหนังสือและเพจแบ่งปันความรู้",
        "description": "เพจแนะนำหนังสือ บทความแปล และบันทึกการอ่าน",
        "order": 2,
        "links": [
          {
            "id": "tsp-ruknulkitab",
            "title": "มุมหนังสือ ركن الكتاب (Facebook)",
            "url": "https://www.facebook.com/furhan621411005"
          },
          {
            "id": "tsp-abbas",
            "title": "Abbas Mtp (Facebook)",
            "url": "https://www.facebook.com/Abbas.M.salafi"
          },
          {
            "id": "tsp-pinionmoon",
            "title": "Pinion Moon (Facebook)",
            "url": "https://www.facebook.com/profile.php?id=100075962754486"
          },
          {
            "id": "tsp-ibnuyusuf",
            "title": "Ibnu Yusuf (Instagram)",
            "url": "https://www.instagram.com/_ibnuyusuf/"
          }
        ]
      }
    ]
  },
  {
    "id": "spubs",
    "slug": "spubs",
    "name": "Salafi Publications (SPUBS)",
    "category": "institution",
    "language": "English",
    "platforms": [
      "Website",
      "YouTube"
    ],
    "socialLinks": {
      "Website": "https://www.spubs.com/sps/",
      "YouTube": "https://www.youtube.com/@SalafiPubs"
    },
    "description": "ศูนย์เผยแพร่และสำนักพิมพ์สะลัฟชั้นนำในสหราชอาณาจักร รวบรวมบทความแปลจากปราชญ์ใหญ่ด้านอะกีดะฮ์ อิบาดะฮ์ และมันฮัจย์",
    "logoUrl": "https://yt3.googleusercontent.com/ytc/AIdro_nuTdWXrzxA8Eenmb_lzKNAFsBW82CisrBQAL1OlcFTpg=s900-c-k-c0x00ffffff-no-rj",
    "themeColor": "#1a5f7a",
    "order": 31,
    "networks": [
      "abukhadeejah",
      "salafisounds",
      "abuiyaad",
      "aqidah",
      "manhaj"
    ],
    "campuses": [
      {
        "id": "spubs-portal",
        "name": "คลังบทความและช่องวิดีโอหลัก",
        "description": "บทความวิชาการและคลิปบรรยายจากเครือข่าย Salafi Publications",
        "order": 1,
        "links": [
          {
            "id": "spubs-home",
            "title": "เว็บไซต์หลัก SalafiPublications.com",
            "url": "https://www.spubs.com/sps/"
          },
          {
            "id": "spubs-yt",
            "title": "ช่อง YouTube SalafiPubs",
            "url": "https://www.youtube.com/@SalafiPubs"
          },
          {
            "id": "spubs-recordings",
            "title": "ช่อง YouTube Salafi Recordings",
            "url": "https://www.youtube.com/@SalafiRecordings"
          }
        ]
      }
    ]
  },
  {
    "id": "abukhadeejah",
    "slug": "abukhadeejah",
    "name": "AbuKhadeejah.com (Salafi Publications)",
    "category": "articles",
    "language": "English",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://abukhadeejah.com"
    },
    "description": "คลังบทความ เอกสารแจกฟรี และหนังสือ PDF แนวทางสะละฟีภาษาอังกฤษ เหมาะสำหรับศึกษาค้นคว้าและนำมาแปลเผยแผ่เป็นภาษาไทย",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 32,
    "networks": [
      "spubs",
      "salafisounds",
      "abuiyaad",
      "aqidah",
      "manhaj"
    ],
    "campuses": [
      {
        "id": "ak-articles",
        "name": "บทความหลักและหลักสูตรอิสลามศึกษา",
        "description": "คลังบทความและหลักสูตรจาก Abu Khadeejah Abdul-Wahid",
        "order": 1,
        "links": [
          {
            "id": "ak-home",
            "title": "หน้าหลัก AbuKhadeejah.com",
            "url": "https://abukhadeejah.com"
          },
          {
            "id": "ak-salafiyyah",
            "title": "The Salafi Dawah (บทความหลัก)",
            "url": "https://abukhadeejah.com/what-is-salafism-and-salafiyyah/"
          },
          {
            "id": "ak-about",
            "title": "เกี่ยวกับผู้เขียนและเครือข่าย",
            "url": "https://abukhadeejah.com/category/about-us/"
          }
        ]
      }
    ]
  },
  {
    "id": "salafisounds",
    "slug": "salafisounds",
    "name": "Salafi Sounds",
    "category": "media",
    "language": "English",
    "platforms": [
      "Website",
      "Podcast"
    ],
    "socialLinks": {
      "Website": "https://www.salafisounds.com/",
      "Podcast": "https://www.salafisounds.com/"
    },
    "description": "คลังเสียงบรรยาย คุฏบะฮ์วันศุกร์ และบทเรียนอธิบายตำราคลาสสิกภาษาอังกฤษฟรีจากเครือข่าย Salafi Publications",
    "logoUrl": "",
    "themeColor": "#2563eb",
    "order": 33,
    "networks": [
      "spubs",
      "abukhadeejah",
      "abuiyaad",
      "aqidah",
      "manhaj"
    ],
    "campuses": [
      {
        "id": "salafisounds-cats",
        "name": "หมวดหมู่เสียงบรรยายและคุฏบะฮ์",
        "description": "เลือกฟังบทเรียนและคุฏบะฮ์แยกตามหัวข้อ",
        "order": 1,
        "links": [
          {
            "id": "ss-aqeedah",
            "title": "หมวดอะกีดะฮ์ (Aqeedah)",
            "url": "https://www.salafisounds.com/category/aqeedah/"
          },
          {
            "id": "ss-khutbahs",
            "title": "คุฏบะฮ์วันศุกร์ (Friday Khutbahs)",
            "url": "https://www.salafisounds.com/category/friday-khutbahs/"
          },
          {
            "id": "ss-family",
            "title": "ครอบครัวและเยาวชน (Family & Children)",
            "url": "https://www.salafisounds.com/category/family-children/"
          },
          {
            "id": "ss-society",
            "title": "สังคมร่วมสมัย (Society)",
            "url": "https://www.salafisounds.com/category/society/"
          }
        ]
      }
    ]
  },
  {
    "id": "abuiyaad",
    "slug": "abuiyaad",
    "name": "AbuIyaad.com",
    "category": "articles",
    "language": "English",
    "platforms": [
      "Website",
      "Telegram"
    ],
    "socialLinks": {
      "Website": "https://www.abuiyaad.com/",
      "Telegram": "https://t.me/abuiyaadsp"
    },
    "description": "คลังบทความวิจัยและงานแปลเชิงวิชาการโดยอบู อิยาด (Amjad Rafiq) ด้านอะกีดะฮ์ มันฮัจย์ และการวิเคราะห์กระแสความคิดร่วมสมัย",
    "logoUrl": "",
    "themeColor": "#334155",
    "order": 34,
    "networks": [
      "spubs",
      "abukhadeejah",
      "salafisounds",
      "aqidah",
      "manhaj"
    ],
    "campuses": [
      {
        "id": "abuiyaad-sections",
        "name": "รายงาน บทความ และช่องอัปเดต",
        "description": "ติดตามงานเขียนและรายงานวิเคราะห์จาก AbuIyaad.com",
        "order": 1,
        "links": [
          {
            "id": "ai-home",
            "title": "หน้าหลัก AbuIyaad.com",
            "url": "https://www.abuiyaad.com/"
          },
          {
            "id": "ai-reports",
            "title": "รายงานและบทวิเคราะห์ (Reports)",
            "url": "https://www.abuiyaad.com/report"
          },
          {
            "id": "ai-telegram",
            "title": "ช่อง Telegram ทางการ (@abuiyaadsp)",
            "url": "https://t.me/abuiyaadsp"
          }
        ]
      }
    ]
  },
  {
    "id": "aqidah",
    "slug": "aqidah",
    "name": "Aqidah.com",
    "category": "articles",
    "language": "English",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.aqidah.com/creed/"
    },
    "description": "เว็บไซต์เฉพาะทางด้านหลักศรัทธา (อะกีดะฮ์) ของอะฮ์ลิสซุนนะฮ์ วัลญะมาอะฮ์ พร้อมงานแปลตำราคลาสสิกและคำอธิบายของปราชญ์",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 35,
    "networks": [
      "abuiyaad",
      "manhaj",
      "spubs",
      "abukhadeejah",
      "salafisounds"
    ],
    "campuses": [
      {
        "id": "aqidah-cats",
        "name": "หมวดหมู่หลักอะกีดะฮ์",
        "description": "ศึกษาพื้นฐานอะกีดะฮ์ ตำราคลาสสิก และประวัติปราชญ์",
        "order": 1,
        "links": [
          {
            "id": "aq-basics",
            "title": "พื้นฐานอะกีดะฮ์ (Basics)",
            "url": "https://www.aqidah.com/creed/categories/basics.cfm"
          },
          {
            "id": "aq-texts",
            "title": "ตำราคลาสสิก (Classical Texts)",
            "url": "https://www.aqidah.com/creed/categories/classical-texts.cfm"
          },
          {
            "id": "aq-scholars",
            "title": "นักวิชาการอะฮ์ลิสซุนนะฮ์ (Scholars)",
            "url": "https://www.aqidah.com/creed/categories/scholars.cfm"
          },
          {
            "id": "aq-sects",
            "title": "กลุ่มและแนวคิดต่างๆ (Sects)",
            "url": "https://www.aqidah.com/creed/categories/sects.cfm"
          }
        ]
      }
    ]
  },
  {
    "id": "manhaj",
    "slug": "manhaj",
    "name": "Manhaj.com",
    "category": "articles",
    "language": "English",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.manhaj.com/manhaj/"
    },
    "description": "เว็บไซต์เฉพาะทางด้านมันฮัจย์ (แนวทางและระเบียบวิธีปฏิบัติ) ของชาวสะลัฟศอลิหฺ การดะวะฮ์ และหลักวิชาการอัลญัรหฺ วัตตะอ์ดีล",
    "logoUrl": "",
    "themeColor": "#475569",
    "order": 36,
    "networks": [
      "abuiyaad",
      "aqidah",
      "spubs",
      "abukhadeejah",
      "salafisounds"
    ],
    "campuses": [
      {
        "id": "manhaj-cats",
        "name": "หมวดหมู่หลักมันฮัจย์",
        "description": "ศึกษาระเบียบวิธีคิดและการดะวะฮ์ตามแนวทางสะลัฟ",
        "order": 1,
        "links": [
          {
            "id": "mj-basics",
            "title": "พื้นฐานมันฮัจย์ (Basics)",
            "url": "https://www.manhaj.com/manhaj/categories/basics.cfm"
          },
          {
            "id": "mj-salafiyyah",
            "title": "แนวทางสะละฟียะฮ์ (Salafiyyah)",
            "url": "https://www.manhaj.com/manhaj/categories/salafiyyah.cfm"
          },
          {
            "id": "mj-dawah",
            "title": "หลักการดะวะฮ์ (Da'wah)",
            "url": "https://www.manhaj.com/manhaj/categories/dawah.cfm"
          },
          {
            "id": "mj-groups",
            "title": "กลุ่มและขบวนการต่างๆ (Sects & Groups)",
            "url": "https://www.manhaj.com/manhaj/categories/groups.cfm"
          }
        ]
      }
    ]
  },
  {
    "id": "shamela",
    "slug": "shamela",
    "name": "المكتبة الشاملة (Al-Maktaba Al-Shamela)",
    "category": "library",
    "language": "Arabic",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://shamela.ws/"
    },
    "description": "ห้องสมุดดิจิทัลตำราอิสลามคลาสสิกภาษาอาหรับที่ใหญ่ที่สุด ครอบคลุมอะกีดะฮ์ ตัฟซีร หะดีษ ฟิกฮ์ และประวัติศาสตร์ พร้อมระบบค้นหาฉบับมาตรฐาน",
    "logoUrl": "https://shamela.ws/favicon.png",
    "themeColor": "#b45309",
    "order": 37,
    "networks": [],
    "campuses": [
      {
        "id": "shamela-cats",
        "name": "หมวดหมู่ตำราหลัก (الأقسام الرئيسية)",
        "description": "เข้าถึงตำราคลาสสิกแยกตามสาขาวิชา",
        "order": 1,
        "links": [
          {
            "id": "sh-aqidah",
            "title": "หมวดอะกีดะฮ์ (العقيدة)",
            "url": "https://shamela.ws/category/1"
          },
          {
            "id": "sh-tafsir",
            "title": "หมวดตัฟซีรอัลกุรอาน (التفسير)",
            "url": "https://shamela.ws/category/3"
          },
          {
            "id": "sh-ulum-quran",
            "title": "หมวดอุลูมุลกุรอาน (علوم القرآن وأصول التفسير)",
            "url": "https://shamela.ws/category/4"
          }
        ]
      },
      {
        "id": "shamela-tools",
        "name": "เครื่องมือค้นคว้าและรายนามผู้ประพันธ์",
        "description": "ค้นหาข้อความในตำราและดูประวัติผู้ประพันธ์",
        "order": 2,
        "links": [
          {
            "id": "sh-authors",
            "title": "รายนามผู้ประพันธ์ (المؤلفون)",
            "url": "https://shamela.ws/authors"
          },
          {
            "id": "sh-search",
            "title": "ระบบค้นหาตำรา (البحث)",
            "url": "https://shamela.ws/search"
          }
        ]
      }
    ]
  },
  {
    "id": "sarhaan",
    "slug": "sarhaan",
    "name": "ห้องสมุด ดร.ฮัยษม ซัรฮาน (Sarhaan Library)",
    "category": "library",
    "language": "Arabic",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://sarhaan.com/"
    },
    "description": "คลังดาวน์โหลดตำรา คู่มืออธิบายหลักศรัทธา อะกีดะฮ์ ฟิกฮ์ สารานุกรมอัลกุรอาน และตารางสรุปวิชาการอิสลามหลายภาษา",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 38,
    "networks": [],
    "campuses": [
      {
        "id": "sarhaan-quran",
        "name": "สารานุกรมอัลกุรอานและมุศฮัฟ",
        "description": "อ่าน ดาวน์โหลดมุศฮัฟ ตัฟซีร และฟังเสียงอ่านอัลกุรอาน",
        "order": 1,
        "links": [
          {
            "id": "sr-quran",
            "title": "สารานุกรมอัลกุรอาน (Quran Encyclopedia)",
            "url": "https://sarhaan.com/quran/ar/"
          },
          {
            "id": "sr-mushafs",
            "title": "อ่านและดาวน์โหลดมุศฮัฟ (Mushafs)",
            "url": "https://sarhaan.com/quran/ar/mushafs/"
          },
          {
            "id": "sr-tafsir",
            "title": "ตัฟซีรและความหมายคำศัพท์ (Tafsir)",
            "url": "https://sarhaan.com/quran/ar/tafsir/"
          },
          {
            "id": "sr-audio",
            "title": "คลังเสียงอ่านอัลกุรอาน (Audio)",
            "url": "https://sarhaan.com/quran/ar/audio/"
          }
        ]
      }
    ]
  },
  {
    "id": "qurancomplex",
    "slug": "qurancomplex",
    "name": "ศูนย์กษัตริย์ฟะฮัดเพื่อการพิมพ์อัลกุรอาน (มะดีนะฮ์)",
    "category": "quran-hadith",
    "language": "Arabic",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://qurancomplex.gov.sa"
    },
    "description": "เว็บไซต์ทางการของศูนย์กษัตริย์ฟะฮัด ณ นครมะดีนะฮ์ รวบรวมมุศฮัฟมาตรฐาน คำแปลอัลกุรอานหลายภาษา และฟอนต์อุษมานีย์ทางการ",
    "logoUrl": "",
    "themeColor": "#065f46",
    "order": 39,
    "networks": [],
    "campuses": [
      {
        "id": "qc-resources",
        "name": "มุศฮัฟและฟอนต์อัลกุรอานทางการ",
        "description": "ดาวน์โหลดฟอนต์อัลกุรอานมาตรฐานและศึกษาข้อมูลศูนย์พิมพ์",
        "order": 1,
        "links": [
          {
            "id": "qc-home",
            "title": "หน้าหลักศูนย์กษัตริย์ฟะฮัด (مجمع الملك فهد)",
            "url": "https://qurancomplex.gov.sa"
          },
          {
            "id": "qc-fonts",
            "title": "ฟอนต์อัลกุรอานมาตรฐาน (الخطوط الحاسوبية)",
            "url": "https://qurancomplex.gov.sa/fonts"
          }
        ]
      }
    ]
  },
  {
    "id": "binbaz",
    "slug": "binbaz",
    "name": "موقع الشيخ ابن باز (Shaykh Ibn Baz)",
    "category": "fatwa",
    "language": "Arabic",
    "platforms": [
      "Website",
      "Facebook",
      "Podcast"
    ],
    "socialLinks": {
      "Website": "https://binbaz.org.sa/",
      "Facebook": "https://www.facebook.com/binbaz1420/",
      "Podcast": "https://soundcloud.com/user-717428351-221846106"
    },
    "description": "เว็บไซต์ทางการของเชค อับดุลอะซีซ บิน บาซ (ร.ฮ.) รวบรวมมัจมูอ์ฟัตวา รายการนูรอะลัดดัรบ์ คำอธิบายตำรา และหนังสือทั้งหมด",
    "logoUrl": "https://binbaz.org.sa/img/square-logo.png",
    "themeColor": "#065f46",
    "order": 40,
    "networks": [],
    "campuses": [
      {
        "id": "binbaz-fatwas",
        "name": "คลังฟัตวาและหนังสือ (الفتاوى والكتب)",
        "description": "คำวินิจฉัยศาสนาของเชค อิบนุ บาซ ทั้งฉบับลายลักษณ์อักษรและเสียง",
        "order": 1,
        "links": [
          {
            "id": "bb-majmu",
            "title": "มัจมูอ์ ฟัตวา (مجموع الفتاوى)",
            "url": "https://binbaz.org.sa/fatwas/kind/1"
          },
          {
            "id": "bb-noor",
            "title": "รายการนูร อะลัดดัรบ์ (نور على الدرب)",
            "url": "https://binbaz.org.sa/fatwas/kind/2"
          },
          {
            "id": "bb-books",
            "title": "คลังหนังสือ (كتب الشيخ)",
            "url": "https://binbaz.org.sa/books"
          }
        ]
      },
      {
        "id": "binbaz-audios",
        "name": "บทเรียนอธิบายตำราและเสียงบรรยาย",
        "description": "คลังเสียงอธิบายตำราวิชาการและบรรยายทั่วไป",
        "order": 2,
        "links": [
          {
            "id": "bb-shuruh",
            "title": "คำอธิบายตำรา (شروح الكتب)",
            "url": "https://binbaz.org.sa/audios/kind/1"
          },
          {
            "id": "bb-lectures",
            "title": "บทเรียนและบรรยาย (دروس ومحاضرات)",
            "url": "https://binbaz.org.sa/audios/kind/2"
          }
        ]
      }
    ]
  },
  {
    "id": "al-badr",
    "slug": "al-badr",
    "name": "موقع الشيخ عبد الرزاق البدر (Shaykh Al-Badr)",
    "category": "articles",
    "language": "Arabic",
    "platforms": [
      "Website",
      "Telegram",
      "Facebook"
    ],
    "socialLinks": {
      "Website": "https://www.al-badr.net/",
      "Telegram": "https://t.me/mtoon_altawheed",
      "Facebook": "https://www.facebook.com/abdulrazaqelbadr"
    },
    "description": "เว็บไซต์ทางการของเชค ดร.อับดุรร็อซซาก อัล-บัดร์ รวบรวมบทเรียนอธิบายมุตูนวนวิชาการ อะกีดะฮ์ หะดีษ อัซการ์ และจริยธรรมอิสลาม",
    "logoUrl": "",
    "themeColor": "#1e40af",
    "order": 41,
    "networks": [],
    "campuses": [
      {
        "id": "albadr-sciences",
        "name": "หมวดวิชาการหลัก (الأقسام العلمية)",
        "description": "บทเรียนและตำราแยกตามสาขาวิชาอิสลาม",
        "order": 1,
        "links": [
          {
            "id": "ab-aqidah",
            "title": "หมวดอะกีดะฮ์ (العقيدة)",
            "url": "https://www.al-badr.net/category/9"
          },
          {
            "id": "ab-hadith",
            "title": "หมวดหะดีษ (الحديث)",
            "url": "https://www.al-badr.net/category/11"
          },
          {
            "id": "ab-tafsir",
            "title": "หมวดตัฟซีรและอุลูมุลกุรอาน (التفسير وعلوم القرآن)",
            "url": "https://www.al-badr.net/category/14"
          },
          {
            "id": "ab-adab",
            "title": "หมวดมารยาทและจริยธรรม (الآداب والأخلاق)",
            "url": "https://www.al-badr.net/category/72"
          },
          {
            "id": "ab-adhkar",
            "title": "หมวดอัซการ์และดุอาอ์ (الأذكار والأدعية)",
            "url": "https://www.al-badr.net/category/238"
          }
        ]
      },
      {
        "id": "albadr-telegram",
        "name": "ช่อง Telegram อัปเดตบทเรียน",
        "description": "รับบทเรียนมุตูนวนเตาฮีดและอัซการ์ประจำวัน",
        "order": 2,
        "links": [
          {
            "id": "ab-tg-tawheed",
            "title": "Telegram: มุตูนวนเตาฮีด (@mtoon_altawheed)",
            "url": "https://t.me/mtoon_altawheed"
          }
        ]
      }
    ]
  },
  {
    "id": "truthislam",
    "slug": "truthislam",
    "name": "สำนักพิมพ์ผู้สนใจในอิสลาม (Truth Islam Publisher)",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/profile.php?id=61565389662125"
    },
    "description": "สำนักพิมพ์และเพจเผยแพร่หนังสือแปลอิสลาม บทความศาสนา และสื่อความรู้สำหรับมุสลิมและผู้สนใจอิสลาม",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 42,
    "networks": [],
    "campuses": [
      {
        "id": "truthislam-fb",
        "name": "เพจสำนักพิมพ์ผู้สนใจในอิสลาม (Facebook)",
        "description": "ติดตามหนังสือออกใหม่และบทความความรู้จากสำนักพิมพ์",
        "order": 1,
        "links": [
          {
            "id": "ti-fb-page",
            "title": "เข้าชมเพจ Facebook Truth Islam Publisher",
            "url": "https://www.facebook.com/profile.php?id=61565389662125"
          }
        ]
      }
    ]
  },
  {
    "id": "humanwrite",
    "slug": "humanwrite",
    "name": "สำนักพิมพ์ Human Write",
    "category": "institution",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/profile.php?id=100063260017282"
    },
    "description": "สำนักพิมพ์อิสระที่จัดทำและเผยแพร่หนังสืออิสลาม บทความ และงานเขียนเชิงวิชาการภาษาไทย",
    "logoUrl": "",
    "themeColor": "#1e3a8a",
    "order": 43,
    "networks": [],
    "campuses": [
      {
        "id": "humanwrite-fb",
        "name": "เพจสำนักพิมพ์ Human Write (Facebook)",
        "description": "ติดตามผลงานหนังสือและบทความของสำนักพิมพ์",
        "order": 1,
        "links": [
          {
            "id": "hw-fb-page",
            "title": "เข้าชมเพจ Facebook สำนักพิมพ์ Human Write",
            "url": "https://www.facebook.com/profile.php?id=100063260017282"
          }
        ]
      }
    ]
  },
  {
    "id": "attaymiyyah",
    "slug": "attaymiyyah",
    "name": "อัต-ตัยมียะฮ์ (التيمية)",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/profile.php?id=61572292302402"
    },
    "description": "เพจเผยแพร่บทความแปล ฟะวาอิด และคำสอนจากตำราของชัยคุลอิสลาม อิบนุ ตัยมียะฮ์ และปราชญ์สายสะลัฟ",
    "logoUrl": "",
    "themeColor": "#7c2d12",
    "order": 44,
    "networks": [],
    "campuses": [
      {
        "id": "attaymiyyah-fb",
        "name": "เพจอัต-ตัยมียะฮ์ (Facebook)",
        "description": "ติดตามบทความแปลและข้อคิดจากตำราอุละมาอ์สะลัฟ",
        "order": 1,
        "links": [
          {
            "id": "at-fb-page",
            "title": "เข้าชมเพจ Facebook อัต-ตัยมียะฮ์ — التيمية",
            "url": "https://www.facebook.com/profile.php?id=61572292302402"
          }
        ]
      }
    ]
  },
  {
    "id": "ruknulkitab",
    "slug": "ruknulkitab",
    "name": "มุมหนังสือ (ركن الكتاب)",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/furhan621411005"
    },
    "description": "เพจแนะนำหนังสืออิสลาม บทความแปล และแบ่งปันความรู้จากตำราวิชาการสายสะลัฟ",
    "logoUrl": "",
    "themeColor": "#b45309",
    "order": 45,
    "networks": [],
    "campuses": [
      {
        "id": "ruknulkitab-fb",
        "name": "เพจมุมหนังสือ (Facebook)",
        "description": "ติดตามรีวิวหนังสือและบทความแปลจากตำรา",
        "order": 1,
        "links": [
          {
            "id": "rk-fb-page",
            "title": "เข้าชมเพจ Facebook มุมหนังสือ ركن الكتاب",
            "url": "https://www.facebook.com/furhan621411005"
          }
        ]
      }
    ]
  },
  {
    "id": "abbas-salafi",
    "slug": "abbas-salafi",
    "name": "Abbas Mtp",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/Abbas.M.salafi"
    },
    "description": "เพจแบ่งปันบทความแปล ข้อคิดศาสนา และคำสอนตามแนวทางสะละฟุศศอลิห์",
    "logoUrl": "",
    "themeColor": "#047857",
    "order": 46,
    "networks": [],
    "campuses": [
      {
        "id": "abbas-fb",
        "name": "เพจ Abbas Mtp (Facebook)",
        "description": "ติดตามบทความและข้อคิดศาสนา",
        "order": 1,
        "links": [
          {
            "id": "abbas-fb-page",
            "title": "เข้าชมเพจ Facebook Abbas Mtp",
            "url": "https://www.facebook.com/Abbas.M.salafi"
          }
        ]
      }
    ]
  },
  {
    "id": "pinionmoon",
    "slug": "pinionmoon",
    "name": "Pinion Moon",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Facebook"
    ],
    "socialLinks": {
      "Facebook": "https://www.facebook.com/profile.php?id=100075962754486"
    },
    "description": "เพจแบ่งปันความรู้ ข้อคิดเตือนใจ และสื่ออ่านอิสลามภาษาไทย",
    "logoUrl": "",
    "themeColor": "#334155",
    "order": 47,
    "networks": [],
    "campuses": [
      {
        "id": "pinionmoon-fb",
        "name": "เพจ Pinion Moon (Facebook)",
        "description": "ติดตามบทความและสื่อความรู้บน Facebook",
        "order": 1,
        "links": [
          {
            "id": "pm-fb-page",
            "title": "เข้าชมเพจ Facebook Pinion Moon",
            "url": "https://www.facebook.com/profile.php?id=100075962754486"
          }
        ]
      }
    ]
  },
  {
    "id": "ibnuyusuf",
    "slug": "ibnuyusuf",
    "name": "Ibnu Yusuf",
    "category": "articles",
    "language": "Thai",
    "platforms": [
      "Instagram"
    ],
    "socialLinks": {
      "Instagram": "https://www.instagram.com/_ibnuyusuf/"
    },
    "description": "อินสตาแกรมแบ่งปันข้อคิดศาสนา คำสอนอุละมาอ์ และหนังสือแนะนำสายสะลัฟ",
    "logoUrl": "",
    "themeColor": "#be185d",
    "order": 48,
    "networks": [],
    "campuses": [
      {
        "id": "ibnuyusuf-ig",
        "name": "ช่องทาง Instagram (@_ibnuyusuf)",
        "description": "ติดตามโพสต์ข้อคิดและแนะนำหนังสือ",
        "order": 1,
        "links": [
          {
            "id": "iy-ig-page",
            "title": "เข้าชม Instagram @_ibnuyusuf",
            "url": "https://www.instagram.com/_ibnuyusuf/"
          }
        ]
      }
    ]
  },
  {
    "id": "troid",
    "slug": "troid",
    "name": "TROID (The Reign of Islamic Daʿwah)",
    "category": "articles",
    "language": "English",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://www.troid.org"
    },
    "description": "ศูนย์ดะอ์วะฮ์สะลัฟในแคนาดา แหล่งต้นฉบับแผ่นพับดะอ์วะฮ์ บทความวิชาการ และสื่อเสียงแนวทางสะละฟีภาษาอังกฤษคุณภาพสูง",
    "logoUrl": "",
    "themeColor": "#0f766e",
    "order": 49,
    "networks": [],
    "campuses": [
      {
        "id": "troid-main",
        "name": "คลังบทความ สื่อเสียง & แผ่นพับดะอ์วะฮ์",
        "description": "ศึกษาบทความและสื่อดะอ์วะฮ์ต้นฉบับภาษาอังกฤษ",
        "order": 1,
        "links": [
          {
            "id": "troid-home",
            "title": "หน้าหลัก TROID.org",
            "url": "https://www.troid.org"
          }
        ]
      }
    ]
  },
  {
    "id": "archive-th-islam",
    "slug": "archive-th-islam",
    "name": "Internet Archive — คลังหนังสืออิสลามภาษาไทย",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://archive.org/search?query=%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B4%E0%B8%AA%E0%B8%A5%E0%B8%B2%E0%B8%A1&and%5B%5D=mediatype%3A%22texts%22"
    },
    "description": "แหล่งรวมไฟล์ PDF และ E-Book อิสลามภาษาไทย เช่น อัลกุรอานแปลไทย หนังสือดุอาอ์ และตำราวิชาการเก่าหายาก",
    "logoUrl": "",
    "themeColor": "#475569",
    "order": 50,
    "networks": [],
    "campuses": [
      {
        "id": "archive-main",
        "name": "ค้นหาหนังสืออิสลามภาษาไทย (PDF / E-Book)",
        "description": "เข้าชมรายการเอกสารและหนังสือที่เก็บถาวรบน Internet Archive",
        "order": 1,
        "links": [
          {
            "id": "arc-th-books",
            "title": "คลังหนังสืออิสลามภาษาไทย (Internet Archive)",
            "url": "https://archive.org/search?query=%E0%B8%AB%E0%B8%99%E0%B8%B1%E0%B8%87%E0%B8%AA%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B4%E0%B8%AA%E0%B8%A5%E0%B8%B2%E0%B8%A1&and%5B%5D=mediatype%3A%22texts%22"
          }
        ]
      }
    ]
  },
  {
    "id": "anyflip-islam-th",
    "slug": "anyflip-islam-th",
    "name": "AnyFlip — คลัง E-Book หนังสืออิสลามภาษาไทย",
    "category": "library",
    "language": "Thai",
    "platforms": [
      "Website"
    ],
    "socialLinks": {
      "Website": "https://anyflip.com/explore?q=%E0%B8%AD%E0%B8%B4%E0%B8%AA%E0%B8%A5%E0%B8%B2%E0%B8%A1"
    },
    "description": "แหล่งรวม E-Book หนังสืออิสลามภาษาไทยแบบเปิดอ่านออนไลน์ได้ทันทีบนเบราว์เซอร์",
    "logoUrl": "",
    "themeColor": "#0284c7",
    "order": 51,
    "networks": [],
    "campuses": [
      {
        "id": "anyflip-main",
        "name": "ค้นหา E-Book อิสลามภาษาไทย",
        "description": "เปิดอ่านหนังสือ E-Book ออนไลน์บน AnyFlip",
        "order": 1,
        "links": [
          {
            "id": "af-th-books",
            "title": "คลัง E-Book อิสลามภาษาไทย (AnyFlip)",
            "url": "https://anyflip.com/explore?q=%E0%B8%AD%E0%B8%B4%E0%B8%AA%E0%B8%A5%E0%B8%B2%E0%B8%A1"
          }
        ]
      }
    ]
  }
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
 * - When Firestore already has booths, Firestore is the source of truth:
 *   we ONLY enrich missing fields (logoUrl/category/campuses) on existing booths
 *   and NEVER re-add booths that the admin has deleted.
 * - When Firestore is empty/offline, we fall back to curated booths (excluding deletedSlugs).
 */
export function mergeOpenHouseBooths(firestoreBooths = [], deletedSlugs = []) {
  const deletedSet = new Set(deletedSlugs || [])
  const curatedBySlug = new Map(OPENHOUSE_BOOTHS.map((b) => [b.slug, b]))

  if (firestoreBooths.length > 0) {
    const enriched = firestoreBooths.map((fb) => {
      const slug = fb.slug || fb.id
      const curated = curatedBySlug.get(slug)
      if (!curated) return { category: "articles", ...fb }
      return {
        ...curated,
        ...fb,
        id: fb.id,
        slug,
        category: fb.category || curated.category || "articles",
        name: fb.name || curated.name,
        description: fb.description || curated.description,
        logoUrl:
          (typeof fb.logoUrl === "string" ? fb.logoUrl.trim() : "") ||
          curated.logoUrl,
        platforms:
          fb.platforms && fb.platforms.length > 0
            ? fb.platforms
            : curated.platforms,
        socialLinks:
          fb.socialLinks && Object.keys(fb.socialLinks).length > 0
            ? fb.socialLinks
            : curated.socialLinks,
        networks: Array.isArray(fb.networks) ? fb.networks : curated.networks,
        _curatedCampuses: curated.campuses || [],
      }
    })
    return enriched.sort(
      (a, b) => (Number(a.order) || 999) - (Number(b.order) || 999)
    )
  }

  return OPENHOUSE_BOOTHS.filter((b) => !deletedSet.has(b.slug))
    .map((curated) => ({
      ...curated,
      _curatedCampuses: curated.campuses || [],
      _isCuratedOnly: true,
    }))
    .sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999))
}

export function findCuratedBooth(boothIdOrSlug) {
  if (!boothIdOrSlug) return null
  return (
    OPENHOUSE_BOOTHS.find(
      (b) => b.slug === boothIdOrSlug || b.id === boothIdOrSlug
    ) || null
  )
}
