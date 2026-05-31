import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocs, collection, deleteDoc, writeBatch } from "firebase/firestore";

const defaultWebFirebaseConfig = {
  apiKey: "AIzaSyC8HoWaAu0XWy3he_pMxqUIWwREDPdeUpg",
  authDomain: "talib-club-web.firebaseapp.com",
  projectId: "talib-club-web",
  storageBucket: "talib-club-web.firebasestorage.app",
  messagingSenderId: "300903382422",
  appId: "1:300903382422:web:887e6f03a6c4f0092db1b7",
  measurementId: "G-CQ5R964GMN",
};

// Hand-curated scholars with high-quality Thai transliterations and descriptions
const CURATED_SCHOLARS = [
  {
    name: "อิมาม อะบู ฮะนีฟะฮฺ (النعمان بن ثابت)",
    hijri: "80–150 AH",
    ad: "699–767 CE",
    era: 1,
    field: "ฟิกฮ์",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้ก่อตั้งมัซฮับฮะนะฟี หนึ่งในสี่มัซฮับหลัก มีความโดดเด่นในการใช้อนุกรมนัย (กิยาส) และการวิเคราะห์ข้อกฎหมายในเรื่องฟิกฮ์",
    matchNames: ["Abu Hanifa", "Abu Hanifah", "أبو حنيفة النعمان", "أبو حنيفة"]
  },
  {
    name: "อิมาม มาลิก บิน อะนัส",
    hijri: "93–179 AH",
    ad: "711–795 CE",
    era: 1,
    field: "ฟิกฮ์/หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้ก่อตั้งมัซฮับมาลิกีและนักบันทึกหะดีษเล่มแรกๆ (คัมภีร์อัล-มุวัฏเฏาะอ์) ตามแนวทางของชาวมะดีนะฮ์ในยุคสะลัฟ",
    matchNames: ["Malik ibn Anas", "Imam Malik", "مالك بن أنس"]
  },
  {
    name: "อิมาม อัล-ลัยษ์ บิน ซะอฺด",
    hijri: "94–175 AH",
    ad: "713–791 CE",
    era: 1,
    field: "ฟิกฮ์/หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "มุจญ์ตาฮิดและนักวิชาการผู้ยิ่งใหญ่แห่งอียิปต์ร่วมสมัยกับอิมามมาลิก โดดเด่นด้านความเชี่ยวชาญข้อกฎหมายและการอธิบายหะดีษ",
    matchNames: ["Al-Layth ibn Sa'd", "الليث بن سعد"]
  },
  {
    name: "อิมาม อัช-ชาฟิอี",
    hijri: "150–204 AH",
    ad: "767–820 CE",
    era: 1,
    field: "ฟิกฮ์/อุศูล",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้ก่อตั้งมัซฮับชาฟิอีและบิดาแห่งวิชาอุศูลุลฟิกฮ์ (หลักการนิติศาสตร์อิสลาม) วางรากฐานการผสานระหว่างรายงานหะดีษและการวิเคราะห์ด้วยปัญญา",
    matchNames: ["Al-Shafi'i", "Al-Shafi'ee", "الشافعي", "محمد بن إدريس الشافعي"]
  },
  {
    name: "อิมาม อะหฺมัด บิน หัมบัล",
    hijri: "164–241 AH",
    ad: "780–855 CE",
    era: 1,
    field: "ฟิกฮ์/อากีดะฮ์",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ-อะษารีย์)",
    note: "ผู้ก่อตั้งมัซฮับฮัมบะลีและอิมามแห่งสุนนะฮ์ผู้ยืนหยัดต่อสู้นวัตกรรมความเชื่อ (บิดอะฮ์) ในยุคฟิตนะฮ์กอ้ลุคกุรอาน รวบรวมคัมภีร์มุสนัดอะฮ์มัด",
    matchNames: ["Ahmad ibn Hanbal", "Ahmed ibn Hanbal", "Ahmad bin Hanbal", "أحمد بن حنبل"]
  },
  {
    name: "อิมาม อัล-บุคอรี",
    hijri: "194–256 AH",
    ad: "810–870 CE",
    era: 1,
    field: "หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "นักวิชาการหะดีษที่ยิ่งใหญ่ที่สุด ผู้รวบรวม 'เศาะฮีฮ์ อัล-บุคอรี' ซึ่งได้รับการยอมรับว่าเป็นหนังสือที่ถูกต้องที่สุดรองจากคัมภีร์อัลกุรอาน",
    matchNames: ["Muhammad al-Bukhari", "Al-Bukhari", "البخاري", "محمد بن إسماعيل البخاري"]
  },
  {
    name: "อิมาม มุสลิม บิน อัล-หัจญัจญ์",
    hijri: "206–261 AH",
    ad: "821–875 CE",
    era: 1,
    field: "หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ศิษย์เอกของอิมามบุคอรี ผู้รวบรวม 'เศาะฮีฮ์ มุสลิม' ที่ได้รับการยอมรับอย่างสูงสุดในด้านความถูกต้องและการจัดหมวดหมู่สายรายงาน",
    matchNames: ["Muslim ibn al-Hajjaj", "Imam Muslim", "مسلم بن الحجاج"]
  },
  {
    name: "อิมาม อะบูดาวูด อัส-สิญิสตานีย์",
    hijri: "202–275 AH",
    ad: "817–889 CE",
    era: 1,
    field: "หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "นักวิชาการหะดีษผู้รวบรวม 'สุนัน อะบูดาวูด' ซึ่งเน้นหนักในเรื่องรายงานหะดีษที่เกี่ยวข้องกับประเด็นข้อกฎหมาย (ฟิกฮ์)",
    matchNames: ["Abu Dawud al-Sijistani", "Abu Dawud", "أبو داود", "أبو داود السجستاني"]
  },
  {
    name: "อิมาม อัต-ติรมีซี",
    hijri: "209–279 AH",
    ad: "824–892 CE",
    era: 1,
    field: "หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้รวบรวม 'สุนัน อัต-ติรมีซี' โดดเด่นในการระบุระดับความถูกต้องของหะดีษและบันทึกทัศนะเปรียบเทียบระหว่างมัซฮับต่างๆ",
    matchNames: ["Al-Tirmidhi", "ترمذي", "أبو عيسى محمد الترمذي"]
  },
  {
    name: "อิมาม อัน-นะสาอี",
    hijri: "215–303 AH",
    ad: "829–915 CE",
    era: 1,
    field: "หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้รวบรวม 'สุนัน อัน-นะซาอี' (อัล-มุจญ์ตาบา) มีความเข้มงวดสูงมากในการคัดกรองสายรายงานและตัวผู้รายงานหะดีษ",
    matchNames: ["Al-Nasa'i", "النسائي", "أحمد بن شعيب النسائي"]
  },
  {
    name: "อิมาม อิบนุ มาญะฮ์",
    hijri: "209–273 AH",
    ad: "824–887 CE",
    era: 1,
    field: "หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้รวบรวม 'สุนัน อิบนุมาญะฮ์' หนึ่งในคัมภีร์หลักทั้งหก (อัล-กุตุบ อัส-ซิตตะฮ์) ของชาวซุนนีย์",
    matchNames: ["Ibn Majah", "ابน มาเจฮ์", "ابน มาجة"]
  },
  {
    name: "อิมาม อัต-เฏาะบารีย์",
    hijri: "224–310 AH",
    ad: "839–923 CE",
    era: 1,
    field: "ตัฟซีร/ประวัติศาสตร์",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "อิมามแห่งการตัฟซีรอัลกุรอานด้วยรายงานอ้างอิง และผู้บันทึกประวัติศาสตร์อิสลามยุคแรกที่สมบูรณ์ที่สุด",
    matchNames: ["Muhammad ibn Jarir al-Tabari", "Al-Tabari", "الطبري", "محمد بن جرير الطبري"]
  },
  {
    name: "อิมาม อัต-เฏาะฮาวีย์",
    hijri: "239–321 AH",
    ad: "853–933 CE",
    era: 1,
    field: "อากีดะฮ์/ฟิกฮ์",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ผู้รวบรวม 'อัล-อะกีดะฮ์ อัต-เฏาะฮาวียะฮ์' ตำราอธิบายหลักความเชื่อที่ถูกต้องตามความเข้าใจ of สะลัฟและปราชญ์รุ่นแรก",
    matchNames: ["Al-Tahawi", "الطحاوي", "أبو جعفر الطحاوي"]
  },
  {
    name: "อิมาม อัล-บัรบะฮารีย์",
    hijri: "253–329 AH",
    ad: "867–941 CE",
    era: 2,
    field: "อากีดะฮ์/มันฮัจญ์",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ-อะษารีย์)",
    note: "ผู้แต่ง 'ชัรฮุสซุนนะฮ์' ผู้นำการปกป้องแนวทางสะลัฟและการต่อต้านกลุ่มอุตริกรรมความเชื่อ (บิดอะฮ์) ในแบกแดด",
    matchNames: ["Al-Barbahari", "البربهاري", "الحسن بن علي البربهاري"]
  },
  {
    name: "อิมาม อัล-อาญุรรีย์",
    hijri: "280–360 AH",
    ad: "893–970 CE",
    era: 2,
    field: "อากีดะฮ์/มันฮัจญ์",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ-อะษารีย์)",
    note: "ผู้ประพันธ์ตำราอันทรงคุณค่าอย่าง 'อัช-ชะรีอะฮ์' ซึ่งรวบรวมหลักความเชื่อและมันฮัจญ์ของสะลัฟไว้อย่างเป็นระเบียบ",
    matchNames: ["Al-Ajurri", "الآجري", "أبو بكر الآجري"]
  },
  {
    name: "อิมาม อัด-ดารุกุฏนีย์",
    hijri: "306–385 AH",
    ad: "918–995 CE",
    era: 2,
    field: "ฮะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "นักวิชาการหะดีษระดับปรมาจารย์ ผู้เชี่ยวชาญการตรวจสอบสายรายงานที่บกพร่อง (อิลัล) และผู้แต่งสุนันอันเลื่องชื่อ",
    matchNames: ["Al-Daraqutni", "الدارقطني", "أبو الحسن الدารقطني"]
  },
  {
    name: "อิบนุ กุดามะฮ์ อัล-มักดิสีย์",
    hijri: "541–620 AH",
    ad: "1147–1223 CE",
    era: 2,
    field: "ฟิกฮ์/อากีดะฮ์",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "นักวิชาการผู้รวบรวมสารานุกรมฟิกฮ์เปรียบเทียบ 'อัล-มุฆนี' และตำราอากีดะฮ์สะลัฟยอดนิยม 'ลุมอัต อัล-อิอ์ติกอด'",
    matchNames: ["Ibn Qudamah", "Ibn Qudamah al-Maqdisi", "ابن قدامة", "ابن قدامة المقدسي"]
  },
  {
    name: "อิมาม อัน-นะวาวีย์",
    hijri: "631–676 AH",
    ad: "1233–1277 CE",
    era: 2,
    field: "ฟิกฮ์/หะดีษ",
    manhaj: null,
    note: "นักวิชาการผู้เสียสละและเปี่ยมด้วยจริยธรรม แต่งอรรถาธิบายเศาะฮีฮ์มุสลิม รวบรวมหะดีษ 40 อัล-นะวาวีย์ และ 'ริยาฎุศศอลิฮีน'",
    matchNames: ["Al-Nawawi", "النووي", "ยหยา บิน ชัรฟ์ อัล-นะวาวี"]
  },
  {
    name: "อิบนุ ตัยมียะฮฺ (ชัยคุลอิสลาม)",
    hijri: "661–728 AH",
    ad: "1263–1328 CE",
    era: 2,
    field: "อากีดะฮ์/ฟิกฮ์",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "ชัยคุลอิสลามผู้ฟื้นฟูมันฮัจญ์สะลัฟในยุคกลาง ยืนหยัดในการใช้อัลกุรอานและสุนนะฮ์เป็นหลักในการอธิบายอากีดะฮ์และขจัดความบิดเบือน",
    matchNames: ["Ibn Taymiyyah", "Ibn Taymiya", "ابن تيمية", "أحمد بن عبد الحليم بن تيمية"]
  },
  {
    name: "อิบนุ อัล-กอยยิม อัล-เญาซียะฮฺ",
    hijri: "691–751 AH",
    ad: "1292–1350 CE",
    era: 2,
    field: "อากีดะฮ์/ตัซกียะฮ์",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "ศิษย์เอกของชัยคุลอิสลาม อิบนุ ตัยมียะฮ์ เชี่ยวชาญการเขียนตำราฟิกฮ์ อากีดะฮ์ และการขัดเกลาจิตวิญญาณตามแนวทางสุนนะฮ์",
    matchNames: ["Ibn al-Qayyim", "Ibn Qayyim al-Jawziyya", "Ibn Qayyium", "ابن قيم الجوزية", "ابن القيم"]
  },
  {
    name: "อิบนุ กะษีร",
    hijri: "701–774 AH",
    ad: "1301–1373 CE",
    era: 2,
    field: "ตัฟซีร/ประวัติศาสตร์",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "นักตัฟซีรระดับแนวหน้าผู้เรียบเรียง 'ตัฟซีร อิบนุกะษีร' ซึ่งอรรถาธิบายกุรอานด้วยรายงานจากสะลัฟ และประวัติศาสตร์ 'อัล-บิดายะฮ์ วัล-นิฮายะฮ์'",
    matchNames: ["Ibn Kathir", "Ibn Katheer", "ابن كثير", "إسماعيل بن عمر بن كثير"]
  },
  {
    name: "อิมาม อัด-ซะฮะบีย์",
    hijri: "673–748 AH",
    ad: "1274–1348 CE",
    era: 2,
    field: "ประวัติศาสตร์/หะดีษ",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "นักบันทึกประวัติศาสตร์ปราชญ์อิสลามและนักวจนะวิเคราะห์ผู้แต่ง 'สิยัร อะอ์ลาม อัน-นุบะลาอ์' ที่รวบรวมชีวประวัติปราชญ์ศาสนาไว้อย่างละเอียดยิบ",
    matchNames: ["Al-Dhahabi", "الذهبي", "شمس الدين الذهبي"]
  },
  {
    name: "อิบนุ รอญับ อัล-ฮัมบะลีย์",
    hijri: "736–795 AH",
    ad: "1336–1393 CE",
    era: 2,
    field: "ฮะดีษ/ฟิกฮ์",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "ผู้แต่ง 'ญามิอฺ อัล-อุลูม วัล-หิกัม' อธิบายหะดีษในด้านนิติศาสตร์ จริยธรรม และการปฏิบัติตนตามวิถีทางสะลัฟ",
    matchNames: ["Ibn Rajab", "ابن رجب الحنبلي", "ابن رجب"]
  },
  {
    name: "อิบนุ หะญัร อัล-อัสเกาะลานีย์",
    hijri: "773–852 AH",
    ad: "1372–1449 CE",
    era: 2,
    field: "ฮะดีษ",
    manhaj: null,
    note: "ผู้นำนักวิชาการหะดีษผู้รวบรวมตำราอภิมหาคำอธิบายเศาะฮีฮ์อัล-บุคอรี 'ฟัตหุลบารี' และคัมภีร์เตรียมตัวนักศึกษา 'บลูฆุลมะรอม'",
    matchNames: ["Ibn Hajar al-Asqalani", "Ibn Hajar", "ابن حجر العسقلاني", "ابن حجر"]
  },
  {
    name: "อิมาม อัล-สุยูฏีย์",
    hijri: "849–911 AH",
    ad: "1445–1505 CE",
    era: 2,
    field: "ตัฟซีร/ฮะดีษ",
    manhaj: null,
    note: "ปราชญ์ผู้เชี่ยวชาญการประพันธ์ตำราตัฟซีร หะดีษ และประวัติศาสตร์มากกว่า 500 เล่ม ผู้ร่วมแต่งตัฟซีรอัล-ญะลาลัยน์",
    matchNames: ["Al-Suyuti", "السيوطي", "جلال الدين السيوطي"]
  },
  {
    name: "มุฮัมมัด บิน อับดุลวะฮ์ฮาบ",
    hijri: "1115–1206 AH",
    ad: "1703–1792 CE",
    era: 3,
    field: "อากีดะฮ์/ฟื้นฟู",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "ผู้นำการปฏิรูปและฟื้นฟูวิถีสะลัฟในคาบสมุทรอาหรับ เน้นย้ำเตาฮีด (การมอบเอกภาพแด่อัลลอฮ์) และปราบปรามชิริกผ่านผลงาน 'กิตาบุตเตาฮีด'",
    matchNames: ["Muhammad ibn Abd al-Wahhab", "Muhammad bin Abdul Wahab", "محمد بن عبد الوهاب"]
  },
  {
    name: "อิมาม อัส-ศ็อนอานีย์",
    hijri: "1099–1182 AH",
    ad: "1688–1768 CE",
    era: 3,
    field: "ฮะดีษ/ฟิกฮ์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "ผู้เขียนตำรา 'สุบุลุสสะลาม' (คำอธิบายบลูฆุลมะรอม) สนับสนุนแนวคิดปฏิบัติตามหลักฐานโดยตรง",
    matchNames: ["Muhammad al-San'ani", "Al-Sanani", "الصنعاني", "محمد بن إسماعيل الصنعاني"]
  },
  {
    name: "อิมาม อัช-เชากานีย์",
    hijri: "1173–1250 AH",
    ad: "1759–1834 CE",
    era: 3,
    field: "ฟิกฮ์/ตัฟซีร",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "ปราชญ์เยเมนผู้ปฏิเสธการตามมัซฮับอย่างหลับตา (ตักลีด) และสนับสนุนการค้นคว้าหาความจริงจากหลักฐานกุรอานและสุนนะฮ์โดยตรง (อิจญ์ติฮาด)",
    matchNames: ["Muhammad al-Shawkani", "Shawkani", "الشوكاني", "محمد الشوكاني"]
  },
  {
    name: "ชัยคฺ อับดุรเราะหฺมาน อัส-สะอ์ดี",
    hijri: "1307–1376 AH",
    ad: "1889–1956 CE",
    era: 4,
    field: "ตัฟซีร/อากีดะฮ์",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "ผู้รวบรวม 'ตัฟซีรอัสสะอ์ดี' อันมีชื่อเสียง โดดเด่นในแนวทางการอธิบายกุรอานแบบสั้นกระชับและเน้นการนำไปปฏิบัติจริง",
    matchNames: ["Abd al-Rahman al-Sa'di", "as Saadi", "عبد الرحمن بن ناصر السعدي", "السعدي"]
  },
  {
    name: "ชัยคฺ มุฮัมมัด อัล-อะมีน อัช-ชังกีฏีย์",
    hijri: "1325–1393 AH",
    ad: "1905–1974 CE",
    era: 4,
    field: "ตัฟซีร/อุศูล",
    manhaj: "สะลาฟีย์ (อะษารีย์)",
    note: "นักวิชาการมอริเตเนียผู้ย้ายมาสอนที่มะดีนะฮ์ ผู้รจนา 'อัฎวาอุล บะยาน' ซึ่งเป็นตัฟซีรอรรถาธิบายอัลกุรอานด้วยอัลกุรอาน",
    matchNames: ["Muhammad al-Amin al-Shinqiti", "محمد الأمين الشنقيطي", "الشنقيطي"]
  },
  {
    name: "ชัยคฺ มุฮัมมัด นาศิรุดดีน อัลลานี",
    hijri: "1333–1420 AH",
    ad: "1914–1999 CE",
    era: 4,
    field: "ฮะดีษ",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "มุหัดดิษผู้ทุ่มเทชีวิตตรวจสอบสถานะความถูกต้องของสายรายงานหะดีษ แยกแยะรายงานปลอมออกจากรายงานจริงในยุคปัจจุบัน",
    matchNames: ["Muhammad Nasiruddin al-Albani", "Al-Albani", "Albani", "الألباني", "محمد ناصر الدين الألباني"]
  },
  {
    name: "ชัยคฺ อับดุลอะซีซ บิน บาซ",
    hijri: "1330–1420 AH",
    ad: "1912–1999 CE",
    era: 4,
    field: "ฟิกฮ์/อากีดะฮ์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "อดีตมุฟตีใหญ่แห่งซาอุดีอาระเบีย ผู้นำทางวิชาการและดาวะฮ์ของสะลาฟียะฮ์ที่เป็นที่เคารพรักอย่างกว้างขวาง",
    matchNames: ["Abdul-Aziz ibn Baz", "Bin Baz", "Ibn Baz", "ابن باز", "عبد العزيز بن عبد الله بن باز"]
  },
  {
    name: "ชัยคฺ มุฮัมมัด บิน ศอลิหฺ อัล-อุษัยมีน",
    hijri: "1347–1421 AH",
    ad: "1929–2001 CE",
    era: 4,
    field: "ฟิกฮ์/อากีดะฮ์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "ปราชญ์ผู้เชี่ยวชาญการถอดรหัสวิชาการยากๆ ทั้งวิชาฟิกฮ์ อากีดะฮ์ และอุศูล มาถ่ายทอดเป็นบทเรียนที่ทุกคนเข้าใจได้อย่างลึกซึ้ง",
    matchNames: ["Muhammad ibn al-Uthaymeen", "al-Uthaymeen", "Ibn Uthaymeen", "ابن عثيمين", "محمد بن صالح العثيمين"]
  },
  {
    name: "ชัยคฺ มุกบิล บิน ฮาดี อัล-วาดิอี",
    hijri: "1356–1422 AH",
    ad: "1937–2001 CE",
    era: 4,
    field: "ฮะดีษ",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "ผู้ฟื้นฟูขบวนการเรียนรู้สุนนะฮ์และมันฮัจญ์สะลัฟในประเทศเยเมน ก่อตั้งสถาบันดารุลหะดีษแห่งดัมมาจญ์ที่โด่งดัง",
    matchNames: ["Muqbil bin Hadi al-Wadi'i", "Al Wadie", "مقبل بن هادي الوادعي"]
  },
  {
    name: "ชัยคฺ ศอลิหฺ อัล-เฟาซาน",
    hijri: "1354 AH–ปัจจุบัน",
    ad: "1935 CE–ปัจจุบัน",
    era: 4,
    field: "อากีดะฮ์/ฟิกฮ์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "ปราชญ์อาวุโสผู้ยืนหยัดอธิบายและชำระอากีดะฮ์สะลาฟียะฮ์ in ปัจจุบัน มีตำราอธิบายหลักความเชื่อที่ใช้เรียนอย่างแพร่หลาย",
    matchNames: ["Saleh Al-Fawzan", "صالح الفوزان", "صالح بن فوزان الفوزان"]
  },
  {
    name: "ชัยคฺ อับดุลมุหฺสิน อัล-อับบาด",
    hijri: "1353 AH–ปัจจุบัน",
    ad: "1934 CE–ปัจจุบัน",
    era: 4,
    field: "ฮะดีษ/ฟิกฮ์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "นักหะดีษอาวุโสแห่งมะดีนะฮ์ผู้อธิบายสุนันหลักทั้งหกเล่มในมัสยิดนะบะวีย์ ยืนหยัดในการสอนหะดีษและวิถีสะลัฟ",
    matchNames: ["Abdul Muhsin al-Abbad", "al Abbaad", "عبد المحسن العباد", "عبد المحสน بن حمد العباد"]
  },
  {
    name: "ชัยคฺ เราะบีอฺ บิน ฮาดี อัล-มัดคอลีย์",
    hijri: "1351 AH–ปัจจุบัน",
    ad: "1931 CE–ปัจจุบัน",
    era: 4,
    field: "มันฮัจญ์/หะดีษ",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "อดีตหัวหน้าภาควิชาสุนนะฮ์ของมหาวิทยาลัยมะดีนะฮ์ ผู้โดดเด่นในด้านความเชี่ยวชาญหะดีษและการเขียนตำราวิเคราะห์ปกป้องความบริสุทธิ์ของมันฮัจญ์สะลัฟ",
    matchNames: ["Rabee al-Madkhali", "al Madkhali", "ربيع المدخلي", "ربيع بن هادي المدخلي"]
  },
  {
    name: "ชัยคฺ บักรฺ อะบู ซัยด์",
    hijri: "1365–1429 AH",
    ad: "1946–2008 CE",
    era: 4,
    field: "ฟิกฮ์/มันฮัจญ์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "สมาชิกสภาอุลามาอ์อาวุโส ผู้แต่งตำรา 'ฮิลยะฮ์ ฏอลิบิล อิลมฺ' (มารยาทผู้แสวงหาความรู้) และหนังสือวิจัยนิติศาสตร์มากมาย",
    matchNames: ["Bakr Abu Zayd", "بكر أبو زيد"]
  },
  {
    name: "ชัยคฺ ตะกียุดดีน อัล-ฮิลาลี",
    hijri: "1311–1407 AH",
    ad: "1893–1987 CE",
    era: 4,
    field: "อากีดะฮ์/ภาษาอาหรับ",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "ปราชญ์ชาวโมร็อกโก นักเผยแผ่สะลาฟียะฮ์ในยุโรปและเอเชีย และผู้ร่วมแปลความหมายกุรอานเป็นภาษาอังกฤษ (Noble Quran)",
    matchNames: ["Taqi-ud-Din al-Hilali", "Taqi ud Din Hilali", "تقي الدين الهلالي"]
  },
  {
    name: "ชัยคฺ อุษมาน อัล-คามิส",
    hijri: "1381 AH–ปัจจุบัน",
    ad: "1962 CE–ปัจจุบัน",
    era: 4,
    field: "อากีดะฮ์/ประวัติศาสตร์",
    manhaj: "สะลาฟีย์ (มันฮัจญ์สะลัฟ)",
    note: "นักวิชาการร่วมสมัยชาวคูเวต โดดเด่นในด้านการชี้แจงความเชื่ออากีดะฮ์ที่ถูกต้องและอภิปรายเปรียบเทียบในประเด็นประวัติศาสตร์",
    matchNames: ["Othman al-Khamis", "عثمان الخميس"]
  },
  {
    name: "หะซัน อัล-บันนา",
    hijri: "1324–1368 AH",
    ad: "1906–1949 CE",
    era: 4,
    field: "ดาวะฮ์/การเมือง",
    manhaj: "อิควานุลมุสลิมีน",
    note: "ผู้ก่อตั้งสมาคมภราดรภาพมุสลิม (อิควานุลมุสลิมีน) ในอียิปต์ เน้นหนักการรวมกลุ่มและการเคลื่อนไหวทางสังคมและการเมือง",
    matchNames: ["Hassan al-Banna", "حسن البنا"]
  },
  {
    name: "ซัยยิด กุฏบฺ",
    hijri: "1324–1386 AH",
    ad: "1906–1966 CE",
    era: 4,
    field: "ตัฟซีร/การเมือง",
    manhaj: "อิควานุลมุสลิมีน / กุฏบีย์",
    note: "นักคิดคนสำคัญของกลุ่มอิควานุลมุสลิมีน ผู้แต่งตัฟซีร 'ฟี ซิลาล อัล-กุรอาน' และหนังสือ 'มะอาลิม ฟิต-เฏาะรีก' ซึ่งส่งอิทธิพลต่อขบวนการเมืองแนวสุดโต่งจำนวนมาก",
    matchNames: ["Sayyid Qutb", "سيد قطب"]
  },
  {
    name: "ชัยคฺ อะบูลอะลา เมาดูดี",
    hijri: "1321–1399 AH",
    ad: "1903–1979 CE",
    era: 4,
    field: "ตัฟซีร/การเมือง",
    manhaj: "การเมืองอิสลาม (ญะมาอัต-อิสลามี)",
    note: "ผู้ก่อตั้งพรรคญะมาอัต-อิสลามีในอินเดียและปากีสถาน ผู้วางรากฐานแนวคิดรัฐอิสลามยุคใหม่และการเมืองเชิงศาสนาในเอเชียใต้",
    matchNames: ["Abul A'la Maududi", "أبو الأعلى المودودي"]
  },
  {
    name: "ชัยคฺ ยูซุฟ อัล-เกาะเราะฎอวีย์",
    hijri: "1345–1444 AH",
    ad: "1926–2022 CE",
    era: 4,
    field: "ฟิกฮ์/ดาวะฮ์",
    manhaj: "อิควานุลมุสลิมีน / วะสะฏียะฮ์",
    note: "อดีตประธานสหภาพนักวิชาการมุสลิมนานาชาติ มีบทบาทในการวินิจฉัยปัญหาฟิกฮ์ร่วมสมัยโดยอิงความยืดหยุ่นสายกลาง",
    matchNames: ["Yusuf al-Qaradawi", "ยوسف القرضاوي"]
  },
  {
    name: "ชัยคฺ ตะกียุดดีน อัน-นับฮานี",
    hijri: "1332–1398 AH",
    ad: "1914–1977 CE",
    era: 4,
    field: "อุศูล/การเมือง",
    manhaj: "การเมืองอิสลาม (ฮิซบุตตะห์รีร)",
    note: "ผู้ก่อตั้งพรรคการเมือง 'ฮิซบุตตะห์รีร' ที่มุ่งเป้าเรียกร้องสถาปนารัฐคิลาฟะฮ์อิสลามกลับคืนมาในระดับสากล",
    matchNames: ["Taqi al-Din al-Nabhani", "تقي الدين النبهاني"]
  },
  {
    name: "หะซัน อัล-บัศรี",
    hijri: "21–110 AH",
    ad: "642–728 CE",
    era: 1,
    field: "ตัซกียะฮ์/หะดีษ",
    manhaj: "อะฮ์ลุสซุนนะฮ์ (สะลัฟ)",
    note: "ตาบิอีนผู้ยิ่งใหญ่แห่งกูฟะฮ์และบัศเราะฮ์ โดดเด่นด้านความยำเกรงศาสนา คำเทศนาขัดเกลาจิตวิญญาณ และการยืนหยัดพูดความจริงต่อผู้มีอำนาจ",
    matchNames: ["Hasan al-Basri", "الحسن البصري"]
  },
  {
    name: "วาศิล บิน อะฏอ",
    hijri: "80–131 AH",
    ad: "699–748 CE",
    era: 1,
    field: "อากีดะฮ์/ปรัชญา",
    manhaj: "มุอ์ตาซิละฮ์ (ผู้ก่อตั้ง)",
    note: "ผู้ก่อตั้งสำนักคิดมุอ์ตาซิละฮ์ (กลุ่มเน้นปัญญา/เหตุผลเหนือตัวบท) แยกตัวออกจากวงความรู้ของท่านหะซัน อัล-บัศรี",
    matchNames: ["Wasil ibn Ata", "واصل بن وعطاء"]
  },
  {
    name: "อะบู อัล-หะสัน อัล-อัชอะรีย์",
    hijri: "260–324 AH",
    ad: "874–936 CE",
    era: 1,
    field: "อากีดะฮ์",
    manhaj: "อาชาอิเราะฮ์ (ผู้ก่อตั้ง)",
    note: "ผู้สถาปนาสำนักคิดทางสัญวิทยา 'อาชาอิเราะฮ์' อดีตมุอ์ตาซิละฮ์ผู้ละทิ้งแนวคิดเดิมแล้วหันมาปกป้องสุนนะฮ์ด้วยวิธีการโต้แย้งทางตรรกวิทยา",
    matchNames: ["Abu al-Hasan al-Ash'ari", "أبو الحسن الأشعري"]
  },
  {
    name: "อะบูมันศูร อัล-มาตูรีดีย์",
    hijri: "238–333 AH",
    ad: "853–944 CE",
    era: 1,
    field: "อากีดะฮ์",
    manhaj: "มาตุรีดียะฮ์ (ผู้ก่อตั้ง)",
    note: "อิมามผู้สถาปนาสำนักคิดอากีดะฮ์ 'มาตุรีดียะฮ์' ในแถบเปอร์เซีย/เอเชียกลาง คู่ขนานไปกับสำนักอาชาอิเราะฮ์",
    matchNames: ["Abu Mansur al-Maturidi", "أبو منصور الماتريدي"]
  },
  {
    name: "อิบนุ อะรอบี (อัล-ศูฟีย์)",
    hijri: "560–638 AH",
    ad: "1165–1240 CE",
    era: 2,
    field: "ปรัชญา/ศูฟีย์",
    manhaj: "ซูฟีย์ (วะห์ดะตุลวุญูด)",
    note: "ปราชญ์ซูฟีย์ผู้โด่งดังและมีข้อถกเถียงสูงสุด นำเสนอแนวคิด 'วะห์ดะตุลวุญูด' (เอกภาพแห่งการดำรงอยู่) ผ่านคัมภีร์ฟุศูศ อัล-หิกัม",
    matchNames: ["Ibn Arabi", "ابن عربي", "محيي الدين بن عربي"]
  },
  {
    name: "ญะลาลุดดีน รูมี",
    hijri: "604–672 AH",
    ad: "1207–1273 CE",
    era: 2,
    field: "กวี/ศูฟีย์",
    manhaj: "ซูฟีย์ (กวี)",
    note: "กวีเปอร์เซียและปราชญ์ซูฟีย์ผู้ประพันธ์ 'มัษนาวี' รวบรวมแนวคิดความรักต่อพระเจ้าอย่างลึกซึ้ง ผู้ก่อตั้งพิธีเต้นรำหมุนตัวเมฟเลวี",
    matchNames: ["Rumi", "Jalal ad-Din Muhammad Rumi", "جلال الدين الرومي"]
  },
  {
    name: "ญะอ์ฟัร อัศ-ศอดิก",
    hijri: "83–148 AH",
    ad: "702–765 CE",
    era: 1,
    field: "ฟิกฮ์/ความรู้",
    manhaj: null,
    note: "เหลนของท่านศาสดา เป็นปราชญ์ผู้ยิ่งใหญ่ที่เหล่านักนิติศาสตร์ยุคแรกศึกษาด้วย และถือเป็นบุคคลสำคัญอย่างยิ่งในหน้าประวัติศาสตร์",
    matchNames: ["Ja'far al-Sadiq", "جعفر الصادق"]
  },
  {
    name: "นาฟิอฺ บิน อัล-อัซร็อก",
    hijri: "d. 65 AH",
    ad: "d. 685 CE",
    era: 1,
    field: "อากีดะฮ์",
    manhaj: "คอวาริจญ์ (ขวาจัด)",
    note: "ผู้ก่อตั้งกลุ่มสุดโต่งที่สุดของพวกคอวาริจญ์ (กลุ่มอัซร็อก) ถือว่าผู้เห็นต่างไม่ใช่ผู้ศรัทธาและลบล้างสายเลือดผู้ปฏิเสธการร่วมอุดมการณ์",
    matchNames: ["Nafi ibn al-Azraq", "นาفع بن الأزرق"]
  },
  {
    name: "อับดุลลอฮฺ บิน อิบาฎ",
    hijri: "d. 86 AH",
    ad: "d. 705 CE",
    era: 1,
    field: "อากีดะฮ์",
    manhaj: "อิบาดิยะฮ์ (คอวาริจญ์สายกลาง)",
    note: "ผู้วางแนวคิดและก่อตั้งนิกาย 'อิบาฎีย์' (กลุ่มคอวาริจญ์สายกลางที่ไม่ยอมรับลัทธิสุดโต่งรุนแรง) ปัจจุบันเป็นประชากรส่วนใหญ่ในโอมาน",
    matchNames: ["Abdullah ibn Ibadh", "عبد الله بن إباض"]
  },
  {
    name: "ญะฮ์มฺ บิน ศ็อฟวาน",
    hijri: "d. 128 AH",
    ad: "d. 746 CE",
    era: 1,
    field: "อากีดะฮ์",
    manhaj: "ญะฮ์มียะฮ์ (ผู้ก่อตั้ง)",
    note: "ผู้ริเริ่มลัทธิ 'ญะฮ์มียะฮ์' ปฏิเสธคุณลักษณะของพระเจ้า (ตะอ์ฏีล) และเผยแพร่แนวคิดมุรญีอะฮ์แบบสุดโต่งและญับรียะฮ์ (ปฏิเสธเจตจำนงเสรีมนุษย์)",
    matchNames: ["Jahm ibn Safwan", "جهم بن صفوان"]
  },
  {
    name: "มุฮัมมัด อับดุฮฺ",
    hijri: "1266–1323 AH",
    ad: "1849–1905 CE",
    era: 4,
    field: "ปฏิรูป/ฟิกฮ์",
    manhaj: "โมเดิร์นนิสต์",
    note: "อดีตมุฟตีใหญ่แห่งอียิปต์ ผู้นำกระบวนการปฏิรูปอิสลามสมัยใหม่ (Modernist Reform) มุ่งเน้นการปรับตัวบทศาสนาให้ตอบสนองเหตุผลและวิทยาศาสตร์",
    matchNames: ["Muhammad Abduh", "محمد عبده"]
  }
];

function getCuratedMatch(nameCleaned) {
  const normalize = (s) => s.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/ibn/g, 'bin')
    .replace(/y/g, 'i')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/h/g, '')
    .trim();
  
  const normCleaned = normalize(nameCleaned);
  if (normCleaned.length < 3) return null;
  
  for (const c of CURATED_SCHOLARS) {
    if (c.matchNames) {
      for (const pattern of c.matchNames) {
        const normPattern = normalize(pattern);
        if (normCleaned === normPattern || 
            (normCleaned.length > 5 && normPattern.includes(normCleaned)) || 
            (normPattern.length > 5 && normCleaned.includes(normPattern))) {
          return c;
        }
      }
    }
    const normCName = normalize(c.name);
    if (normCleaned === normCName || 
        (normCleaned.length > 5 && normCName.includes(normCleaned)) || 
        (normCName.length > 5 && normCleaned.includes(normCName))) {
      return c;
    }
  }
  return null;
}

const app = initializeApp(defaultWebFirebaseConfig);
const db = getFirestore(app);

// 1. Load Wikidata scholars
console.log("Loading raw scholars from Wikidata...");
let wikidataList = [];
try {
  wikidataList = JSON.parse(fs.readFileSync('C:/Users/HP/.gemini/antigravity/scratch/raw_scholars.json', 'utf8'));
} catch (e) {
  console.error("Could not load raw_scholars.json", e);
}

// Name translation function

// Compound replacements
const compoundReplacements = [
  { en: /\bPermanent Committee of Major Scholars\b/gi, th: "คณะกรรมการถาวรอุลามาอ์อาวุโส" },
  { en: /\bPermanent Committee\b/gi, th: "คณะกรรมการถาวร" },
  { en: /\bMajor Scholars\b/gi, th: "อุลามาอ์อาวุโส" },
  { en: /\bAbdurrahman\b|\bAbdur-Rahman\b|\bAbd al-Rahman\b|\bAbdur Rahman\b/gi, th: "อับดุรเราะหฺมาน" },
  { en: /\bAbdul-?Azeez\b|\bAbdul-?Aziz\b|\bAbdul-?Azeem\b|\bAbdul-?Azim\b/gi, th: "อับดุลอะซีซ" },
  { en: /\bAbdul-?Latif\b|\bAbdul-?Lateef\b/gi, th: "อับดุลละฏีฟ" },
  { en: /\bAbdul-?Qadir\b|\bAbdul-?Kadir\b/gi, th: "อับดุลกอดิร" },
  { en: /\bAbdul-?Ghani\b/gi, th: "อับดุลฆอนี" },
  { en: /\bAbdul-?Hayy\b|\bAbdul-?Hay\b/gi, th: "อับดุลหัยย์" },
  { en: /\bAbdul-?Muhsin\b/gi, th: "อับดุลมุหฺสิน" },
  { en: /\bAbdul-?Hamid\b|\bAbdul-?Hameed\b/gi, th: "อับดุลหะมีด" },
  { en: /\bAbdul-?Wahab\b|\bAbdul-?Wahhab\b/gi, th: "อับดุลวะฮ์ฮาบ" },
  { en: /\bAbdul-?Majid\b|\bAbdul-?Majeed\b/gi, th: "อับดุลมะญีด" },
  { en: /\bAbdul-?Rauf\b|\bAbdul-?Raouf\b/gi, th: "อับดุลราอุฟ" },
  { en: /\bAbdul-?Karim\b|\bAbdul-?Kareem\b/gi, th: "อับดุลกะรีม" },
  { en: /\bAbdul-?Razzaq\b|\bAbdul-?Razak\b/gi, th: "อับดุลร็อซซาก" },
  { en: /\bAbdul-?Khaliq\b/gi, th: "อับดุลคอลิก" },
  { en: /\bAbdul-?Salam\b/gi, th: "อับดุลสะลาม" },
  { en: /\bAbdul-?Hadi\b/gi, th: "อับดุลฮาดี" },
  { en: /\bAbdul-?Qahir\b/gi, th: "อับดุลกอฮิร" },
  { en: /\bAbdul-?Basit\b|\bAbdul-?Baset\b/gi, th: "อับดุลบาซิฏ" },
  { en: /\bAbdul-?Wadud\b/gi, th: "อับดุลวะดูด" },
  { en: /\bAbdul-?Malik\b/gi, th: "อับดุลมาลิก" },
  { en: /\bAbdul-?Jalil\b/gi, th: "อับดุลญะลีล" },
  { en: /\bAbdul-?Shakur\b/gi, th: "อับดุลชะกูร" },
  { en: /\bAbdul-?Quddus\b/gi, th: "อับดุลกุดดูส" },
  { en: /\bAbdul-?Jabbar\b/gi, th: "อับดุลญับบาร" },
  { en: /\bAbdul-?Rashid\b|\bAbdul-?Rasheed\b/gi, th: "อับดุลเราะชีด" },
  { en: /\bAbdul-?Fattah\b/gi, th: "อับดุลฟัตตาห์" },
  { en: /\bAbdul-?Wahid\b/gi, th: "อับดุลวาหิด" },
  { en: /\bAbdul-?Khabir\b/gi, th: "อับดุลเคาะบีร" },
  { en: /\bAbdul-?Muttalib\b/gi, th: "อับดุลมุฏฏอลิบ" },
  { en: /\bAbdul-?Ghaffar\b/gi, th: "อับดุลฆ็อฟฟาร" },
  { en: /\bAbdul-?Mannan\b/gi, th: "อับดุลมันนาน" },
  { en: /\bAbdul-?Rahim\b|\bAbdul-?Raheem\b/gi, th: "อับดุลระฮีม" },
  { en: /\bAbdul-?Ali\b/gi, th: "อับดุลอะลี" },
  { en: /\bAbdul-?Bari\b/gi, th: "อับดุลบารี" },
  { en: /\bAbdul-?Ahad\b/gi, th: "อับดุลอะฮัด" },
  { en: /\bAbdul-?Ilah\b/gi, th: "อับดุลอิลาฮ์" },
  { en: /\bAbdul-?Haq\b/gi, th: "อับดุลฮัก" },
  { en: /\bAbdul-?Jamil\b/gi, th: "อับดุลญะมีล" },
  { en: /\bAbdul-?Mu'ti\b|\bAbdul-?Muti\b/gi, th: "อับดุลมุอ์ฏี" },
  { en: /\bAbdul-?Qahhar\b/gi, th: "อับดุลเกาะฮ์ฮาร" },
  { en: /\bAbdus-?Salam\b/gi, th: "อับดุสสลาม" },
  { en: /\bAbdillah\b/gi, th: "อับดิลลาฮฺ" },
  { en: /\bAbdullah\b|\bAbdyllah\b/gi, th: "อับดุลลอฮฺ" },
  
  // Honorific compounds (-ud-din, -ad-din, etc.)
  { en: /\bJalal\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ญะลาลุดดีน" },
  { en: /\bTaqi\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ตะกียุดดีน" },
  { en: /\bSalah\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "เศาะลาฮุดดีน" },
  { en: /\bShihab\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ชิฮาบุดดีน" },
  { en: /\bSaif\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ไซฟุดดีน" },
  { en: /\bAla\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "อะลาอุดดีน" },
  { en: /\bBaha\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "บะฮาอุดดีน" },
  { en: /\bBahaa\s+(ud|ad|ud|ul|al|ur)\s+(din|deen)\b/gi, th: "บะฮาอุดดีน" },
  { en: /\bMuhyi\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "มุฮ์ยิดดีน" },
  { en: /\bImad\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "อิมาดุดดีน" },
  { en: /\bShams\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ชัมสุดดีน" },
  { en: /\bNur\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "นูรุดดีน" },
  { en: /\bNoor\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "นูรุดดีน" },
  { en: /\bZayn\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ซัยนุดดีน" },
  { en: /\bZein\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ซัยนุดดีน" },
  { en: /\bIzz\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "อิซซุดดีน" },
  { en: /\bKamal\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "กะมาลุดดีน" },
  { en: /\bJamal\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ญะมาลุดดีน" },
  { en: /\bWali\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "วะลียุดดีน" },
  { en: /\bWaliud\s+(din|deen)\b/gi, th: "วะลียุดดีน" },
  { en: /\bBadr\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "บัดรุดดีน" },
  { en: /\bNizam\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "นิซอมุดดีน" },
  { en: /\bSadr\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ศ็อดรุดดีน" },
  { en: /\bTaj\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ตาญุดดีน" },
  { en: /\bHusam\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ฮุสามุดดีน" },
  { en: /\bAmin\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "อะมีนุดดีน" },
  { en: /\bGhiyas\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "ฆิยาษุดดีน" },
  { en: /\bSiraj\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "สิรอญุดดีน" },
  { en: /\bNaseer\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "นาศิรุดดีน" },
  { en: /\bNasir\s+(ud|ad|ul|al|ur)\s+(din|deen)\b/gi, th: "นาศิรุดดีน" },
  { en: /\bHibatullah\b/gi, th: "ฮิบะตุลลอฮฺ" },
  { en: /\bSanaullah\b/gi, th: "ซะนาอุลลอฮฺ" },
  { en: /\bRahmatullah\b/gi, th: "เราะห์มะตุลลอฮฺ" },

  // -ur-rahman
  { en: /\bKhalil\s+(ur|ar)\s+Rahman\b/gi, th: "เคาะลีลุรเราะหฺมาน" },
  { en: /\bAnis\s+(ur|ar)\s+Rahman\b/gi, th: "อะนีสุรเราะหฺมาน" },
  { en: /\bHabib\s+(ur|ar)\s+Rahman\b/gi, th: "หะบีบุรเราะหฺมาน" },
  { en: /\bMizan\s+(ur|ar)\s+Rahman\b/gi, th: "มีซานุรเราะหฺมาน" },
  { en: /\bSaif\s+(ur|ar)\s+Rahman\b/gi, th: "ไซฟุรเราะหฺมาน" },
  { en: /\bLutf\s+(ur|ar)\s+Rahman\b/gi, th: "ลุตฟุรเราะหฺมาน" },
  { en: /\bFazl\s+(ur|ar)\s+Rahman\b/gi, th: "ฟัฎลุรเราะหฺมาน" },
  { en: /\bAziz\s+(ur|ar)\s+Rahman\b/gi, th: "อะซีซุรเราะหฺมาน" },
  { en: /\bAta\s+(ur|ar)\s+Rahman\b/gi, th: "อะฏออุรเราะหฺมาน" },
  { en: /\bWali\s+(ur|ar)\s+Rahman\b/gi, th: "วะลีอุรเราะหฺมาน" },
  { en: /\bHifz\s+(ur|ar)\s+Rahman\b/gi, th: "หิฟซุรเราะหฺมาน" },
  { en: /\bUbaid\s+(ur|ar)\s+Rahman\b/gi, th: "อุบัยดุรเราะหฺมาน" },
  { en: /\bObaid\s+(ur|ar)\s+Rahman\b/gi, th: "อุบัยดุรเราะหฺมาน" },
  { en: /\bMuti\s+(ur|ar)\s+Rahman\b/gi, th: "มุฏีอุรเราะหฺมาน" },

  // Famous Ibn / Abu combinations
  { en: /\bIbn Taymiyyah\b|\bIbn Taymiya\b/gi, th: "อิบนุ ตัยมียะฮฺ" },
  { en: /\bIbn Qayyim\b|\bIbn al-Qayyim\b|\bIbn Qayyium\b/gi, th: "อิบนุ อัล-เกาะยิม" },
  { en: /\bIbn Kathir\b|\bIbn Katheer\b/gi, th: "อิบนุ กะษีร" },
  { en: /\bIbn Hajar\b/gi, th: "อิบนุ หะญัร" },
  { en: /\bIbn al-?Jawzi\b/gi, th: "อิบนุ อัล-เญาซี" },
  { en: /\bIbn Qudamah\b|\bIbn Qadamah\b/gi, th: "อิบนุ กุดามะฮฺ" },
  { en: /\bIbn Majah\b/gi, th: "อิบนุ มาญะฮฺ" },
  { en: /\bIbn Hazm\b/gi, th: "อิบนุ หัซม์" },
  { en: /\bIbn Hibban\b/gi, th: "อิบนุ หิบบาน" },
  { en: /\bIbn Khuzaymah\b/gi, th: "อิบนุ คุซัยมะฮฺ" },
  { en: /\bIbn Asakir\b/gi, th: "อิบนุ อะสากิร" },
  { en: /\bIbn Hisham\b/gi, th: "อิบนุ ฮิชาม" },
  { en: /\bIbn Ishaq\b/gi, th: "อิบนุ อิสฮาก" },
  { en: /\bIbn Rajab\b/gi, th: "อิบนุ รอญับ" },
  { en: /\bIbn Ajrum\b/gi, th: "อิบนุ อาญุรรูม" },
  { en: /\bIbn Sina\b/gi, th: "อิบนุ ซีนา" },
  { en: /\bIbn Khaldun\b/gi, th: "อิบนุ ค็อลดูน" },
  { en: /\bIbn Rushd\b/gi, th: "อิบนุ รุชด์" },
  { en: /\bIbn Battuta\b/gi, th: "อิบนุ บะฏูเฏาะฮฺ" },
  { en: /\bAbu Hanifa\b|\bAbu Hanifah\b/gi, th: "อะบูหะนีฟะฮฺ" },
  { en: /\bAbu Dawood\b|\bAbu Dawud\b/gi, th: "อะบูดาวูด" },
  { en: /\bAbu Yusuf\b/gi, th: "อะบูยูซุฟ" },
  { en: /\bAbu Ubaid\b/gi, th: "อะบูกุบัยด์" },
  { en: /\bAbu Zura\b/gi, th: "อะบูซุรอะฮฺ" },
  { en: /\bAbul Hasan\b/gi, th: "อะบูลหะสัน" },
  { en: /\bAbu al-Hasan\b/gi, th: "อะบู อัล-หะสัน" }
];

const customWordMap = {
  // Titles
  'imam': 'อิมาม',
  'iman': 'อิมาม',
  'shaykh': 'ชัยคฺ',
  'sheikh': 'ชัยคฺ',
  'sheik': 'ชัยคฺ',
  'shayk': 'ชัยคฺ',
  'mufti': 'มุฟตี',
  'caliph': 'เคาะลีฟะฮฺ',
  'allamah': 'ปราชญ์',
  'alamah': 'ปราชญ์',
  'professor': 'ศาสตราจารย์',
  'dr': 'ดร.',
  'sidi': 'ซีดี',
  'hafiz': 'ฮาฟิซ',
  'hafez': 'ฮาฟิซ',
  'qadi': 'กอฎี',

  // Common Names
  'muhammad': 'มุฮัมมัด',
  'muhammed': 'มุฮัมมัด',
  'mohammad': 'มุฮัมมัด',
  'mohammed': 'มุฮัมมัด',
  'ahmad': 'อะหฺมัด',
  'ahmed': 'อะหฺมัด',
  'ali': 'อะลี',
  'ibrahim': 'อิบรอฮีม',
  'yusuf': 'ยูซุฟ',
  'yousef': 'ยูซุฟ',
  'yoosuf': 'ยูซุฟ',
  'khalid': 'คอลิด',
  'khaalid': 'คอลิด',
  'umar': 'อุมัร',
  'omar': 'อุมัร',
  'uthman': 'อุษมาน',
  'osman': 'อุษมาน',
  'ismail': 'อิสมาอีล',
  'isma\'il': 'อิสมาอีล',
  'yahya': 'ยะหฺยา',
  'saleh': 'ศอลิหฺ',
  'salih': 'ศอลิหฺ',
  'hasan': 'หะซัน',
  'hassan': 'หะซัน',
  'husayn': 'หุซัยน์',
  'hussein': 'หุซัยน์',
  'hussain': 'หุซัยน์',
  'saeed': 'สะอีด',
  'said': 'สะอีด',
  'sa\'d': 'ซะอฺด',
  'saad': 'ซะอฺด',
  'anas': 'อะนัส',
  'malik': 'มาลิก',
  'ishaq': 'อิสฮาก',
  'suleiman': 'สุลัยมาน',
  'sulayman': 'สุลัยมาน',
  'qasim': 'กอซิม',
  'hamid': 'ฮามิด',
  'hameed': 'หะมีด',
  'nasir': 'นาศิร',
  'naser': 'นาศิร',
  'bakr': 'บักรฺ',
  'tahir': 'ฏอฮิร',
  'khalil': 'เคาะลีล',
  'ghani': 'ฆอนี',
  'majid': 'มาจิด',
  'majeed': 'มะญีด',
  'hadi': 'ฮาดี',
  'haadee': 'ฮาดี',
  'badr': 'บัดร',
  'mansur': 'มันศูร',
  'mansoor': 'มันศูร',
  'hamad': 'หะมัด',
  'siddiq': 'ศิดดีก',
  'wahab': 'วะฮ์ฮาบ',
  'wahhab': 'วะฮ์ฮาบ',
  'nasr': 'นัศร',
  'razzaq': 'ร็อซซาก',
  'razak': 'ร็อซซาก',
  'abbas': 'อับบาส',
  'rashid': 'เราะชีด',
  'rasheed': 'เราะชีด',
  'adil': 'อาดิล',
  'karim': 'กะรีม',
  'kareem': 'กะรีม',
  'rafiq': 'เราะฟีก',
  'rafeeq': 'เราะฟีก',
  'azeez': 'อะซีซ',
  'aziz': 'อะซีซ',
  'zubair': 'ซุบัยรฺ',
  'zubayr': 'ซุบัยรฺ',
  'faisal': 'ไฟศ็อล',
  'latif': 'ละฏีฟ',
  'lateef': 'ละฏีฟ',
  'saud': 'สะอูด',
  'khaliq': 'คอลิก',
  'ameen': 'อะมีน',
  'amin': 'อะมีน',
  'arshad': 'อัรชัด',
  'asim': 'อาศิม',
  'ghazi': 'ฆอซี',
  'hanif': 'หะนีฟ',
  'sadiq': 'ศอดิก',
  'saleem': 'สะลีม',
  'salim': 'ซาลิม',
  'tariq': 'ฏอริก',
  'musa': 'มูซา',
  'jamal': 'ญะมาล',
  'sayyid': 'ซัยยิด',
  'syed': 'ซัยยิด',
  'ghulam': 'ฆุลาม',
  'badawi': 'บะดะวี',
  'sattar': 'ซัตตาร',
  'munir': 'มุนีร',
  'muneer': 'มุนีร',
  'hamza': 'ฮัมซะฮฺ',
  'zia': 'ซิยาอ์',
  'ashraf': 'อัชร็อฟ',
  'zafar': 'ซะฟัร',
  'iqbal': 'อิกบาล',
  'aslam': 'อัสลัม',
  'ayyoub': 'อัยยูบ',
  'ayyub': 'อัยยูบ',
  'bilal': 'บิลาล',
  'dawud': 'ดาวูด',
  'dawood': 'ดาวูด',
  'harun': 'ฮารูน',
  'haroon': 'ฮารูน',
  'idris': 'อิดรีส',
  'luqman': 'ลุกมาน',
  'mahmoud': 'มะห์มูด',
  'mahmud': 'มะห์มูด',
  'nuh': 'นูห์',
  'nooh': 'นูห์',
  'rida': 'ริฎอ',
  'ridha': 'ริฎอ',
  'taha': 'ฏอฮา',
  'talha': 'ฏ็อลฮะฮฺ',
  'yaser': 'ยาซิร',
  'yasir': 'ยาซิร',
  'zakaria': 'ซะกะรียา',
  'zakariya': 'ซะกะรียา',
  'yunus': 'ยูนุส',
  'umm': 'อุมม์',
  'ishaq': 'อิสฮาก',
  'abdul': 'อับดุล',
  'abdur': 'อับดุร',
  'abdus': 'อับดุส',
  'abdil': 'อับดิล',
  'abd': 'อับด',
  'ullah': 'อุลลอฮฺ',

  // Surnames / Nisbas
  'tirmidhi': 'ติรมีซี',
  'bukhari': 'บุคอรี',
  'nawawi': 'นะวาวี',
  'qurtubi': 'กุรฏุบี',
  'suyuti': 'สุยูฏี',
  'shawkani': 'เชากานี',
  'hakim': 'ฮากิม',
  'qudamah': 'กุดามะฮฺ',
  'taymiyyah': 'ตัยมียะฮฺ',
  'taymiya': 'ตัยมียะฮฺ',
  'ghazali': 'ฆอซาลี',
  'tabari': 'เฏาะบารี',
  'tahawi': 'เฏาะฮาวี',
  'muslim': 'มุสลิม',
  'bayhaqi': 'บัยฮะกี',
  'asqalani': 'อัสเกาะลานี',
  'nasa\'i': 'นะสาอี',
  'nasai': 'นะสาอี',
  'kathir': 'กะษีร',
  'katheer': 'กะษีร',
  'shaybah': 'ชัยบะฮฺ',
  'baydawi': 'บัยฎอวี',
  'jilani': 'ญีลานี',
  'gilani': 'ญีลานี',
  'ajrum': 'อาญุรรูม',
  'zurah': 'ซุรอะฮฺ',
  'zur\'ah': 'ซุรอะฮฺ',
  'dimashqi': 'ดิมัชกี',
  'boushaki': 'บูชาคี',
  'maturidi': 'มาตุรีดี',
  'ash\'ari': 'อัชอะรี',
  'ashari': 'อัชอะรี',
  'hanbal': 'หัมบัล',
  'makki': 'มักกี',
  'haji': 'ฮัจญี',
  'mubarakpuri': 'มุบารักฟูรี',
  'lucknawi': 'ลัคนาวี',
  'dehlvi': 'เดห์ลาวี',
  'dehlavi': 'เดห์ลาวี',
  'thanvi': 'ธานวี',
  'usmani': 'อุษมานี',
  'sindhi': 'สินธี',
  'wadi\'i': 'วาดิอี',
  'wadie': 'วาดิอี',
  'albani': 'อัลบานี',
  'uthaymeen': 'อุษัยมีน',
  'fawzan': 'เฟาซาน',
  'mubarak': 'มุบาร็อก',
  'jibreen': 'ญิบรีน',
  'nadvi': 'นัดวีย์',
  'sabuni': 'ศอบูนี',
  'lalakai': 'ลาละกาอี',
  'asaker': 'อะสากิร',
  'asakir': 'อะสากิร',
  'humaidi': 'หุไมดีย์',
  'waqidi': 'วากิดี',
  'samani': 'ซัมอานี',
  'isfraini': 'อิสฟะรอยีนี',
  'kalwadhani': 'กัลวาซานี',
  'bazzar': 'บัซซาร',
  'ajurri': 'อาญุรรีย์',
  'baghdadi': 'บัฆดาดี',
  'khallal': 'ค็อลลาล',
  'naysaburi': 'นัยซาบูรี',
  'shaheen': 'ชาฮีน',
  'yala': 'ยะอฺลา',
  'razee': 'รอซี',
  'razi': 'รอซี',
  'hayyan': 'หัยยาน',
  'andlusi': 'อันดะลุสี',
  'andalusi': 'อันดะลุสี',
  'darimi': 'ดาริมี',
  'yafei': 'ยาฟิอี',
  'haddad': 'ฮัดดาด',
  'alawi': 'อะลาวีย์',
  'qahtani': 'กะห์ฏอนี',
  'madkhali': 'มัดคอลีย์',
  'saadi': 'สะอ์ดี',
  'ajlouni': 'อัจญ์ลูนี',
  'maqdisi': 'มักดิสี',
  'munzari': 'มุนซิรี',
  'yumn': 'ยุมน์',
  'samad': 'ศอมัด',
  'zubair': 'ซุบัยรฺ',
  'qarshi': 'กุรชีย์',
  'fateh': 'ฟัตฮ์',
  'muzaffar': 'มุซ็อฟฟัร',
  'khattab': 'ค็อฏฏาบ',
  'mahfuz': 'มะห์ฟูซ',
  'arabi': 'อะรอบี',
  'ismaili': 'อิสมาอีลี',
  'mundhir': 'มุนซิร',
  'hafs': 'หัฟศฺ',
  'hatim': 'หาติม',
  
  // Particles & Helpers
  'bin': 'บิน',
  'ibn': 'บิน', // Will be adjusted to "อิบนุ" if at start of string
  'abu': 'อะบู',
  'abi': 'อะบี',
  'al': 'อัล',
  'as': 'อัส',
  'ash': 'อัช',
  'at': 'อัต',
  'an': 'อัน',
  'ar': 'อัร',
  'ad': 'อัต',
  'az': 'อัซ',
  'ad-din': 'อุดดีน',
  'ud-din': 'อุดดีน',
  'ur-rahman': 'ุรเราะหฺมาน'
};

function ruleBasedTransliterate(word) {
  let w = word.toLowerCase().trim();
  if (w.length === 0) return "";

  // 1. Handle leading vowels specifically
  let leading = "";
  if (/^[aeiou]/.test(w)) {
    if (w.startsWith('al-')) {
      leading = "อัล-";
      w = w.substring(3);
    } else if (w.startsWith('al')) {
      leading = "อัล";
      w = w.substring(2);
    } else if (w.startsWith('a')) {
      let secondChar = w[1] || '';
      let thirdChar = w[2] || '';
      const isConsonant = (c) => c && !['a','e','i','o','u'].includes(c);
      if (isConsonant(secondChar) && isConsonant(thirdChar)) {
        leading = "อั"; // Will combine with the second char, e.g. อัส
        w = w.substring(1);
      } else {
        leading = "อะ";
        w = w.substring(1);
      }
    } else if (w.startsWith('i')) {
      let secondChar = w[1] || '';
      let thirdChar = w[2] || '';
      const isConsonant = (c) => c && !['a','e','i','o','u'].includes(c);
      if (isConsonant(secondChar) && isConsonant(thirdChar)) {
        leading = "อิ";
        w = w.substring(1);
      } else {
        leading = "อิ";
        w = w.substring(1);
      }
    } else if (w.startsWith('u')) {
      leading = "อุ";
      w = w.substring(1);
    } else if (w.startsWith('e')) {
      leading = "เอ";
      w = w.substring(1);
    } else if (w.startsWith('o')) {
      leading = "โอ";
      w = w.substring(1);
    }
  }

  // 2. Perform the rest of the transliteration on the remaining word
  const patterns = [
    // Double vowels / special diphthongs
    { regex: /aa/g, replacement: 'า' },
    { regex: /ee/g, replacement: 'ี' },
    { regex: /oo/g, replacement: 'ู' },
    { regex: /ou/g, replacement: 'ู' },
    { regex: /ai/g, replacement: 'ัย' },
    { regex: /ay/g, replacement: 'ัย' },
    { regex: /ei/g, replacement: 'ัย' },
    { regex: /au/g, replacement: 'ออ' },
    { regex: /aw/g, replacement: 'เญา' },
    
    // Consonant clusters
    { regex: /sh/g, replacement: 'ช' },
    { regex: /kh/g, replacement: 'ค' },
    { regex: /gh/g, replacement: 'ฆ' },
    { regex: /th/g, replacement: 'ษ' },
    { regex: /dh/g, replacement: 'ซ' },
    { regex: /ph/g, replacement: 'ฟ' },
    { regex: /ch/g, replacement: 'ช' },
    
    // Specific consonants
    { regex: /q/g, replacement: 'ก' },
    { regex: /j/g, replacement: 'ญ' },
    { regex: /c/g, replacement: 'ค' },
    { regex: /b/g, replacement: 'บ' },
    { regex: /t/g, replacement: 'ต' },
    { regex: /d/g, replacement: 'ด' },
    { regex: /r/g, replacement: 'ร' },
    { regex: /z/g, replacement: 'ซ' },
    { regex: /s/g, replacement: 'ส' },
    { regex: /f/g, replacement: 'ฟ' },
    { regex: /k/g, replacement: 'ก' },
    { regex: /l/g, replacement: 'ล' },
    { regex: /m/g, replacement: 'ม' },
    { regex: /n/g, replacement: 'น' },
    { regex: /w/g, replacement: 'ว' },
    { regex: /y/g, replacement: 'ย' },
    { regex: /h/g, replacement: 'ฮ' },
    { regex: /p/g, replacement: 'ฟ' },
    { regex: /g/g, replacement: 'ก' },
    { regex: /x/g, replacement: 'ซ' },
    { regex: /v/g, replacement: 'ว' },
    
    // Single vowels
    { regex: /a/g, replacement: 'ะ' },
    { regex: /i/g, replacement: 'ิ' },
    { regex: /u/g, replacement: 'ุ' },
    { regex: /o/g, replacement: 'อ' },
    { regex: /e/g, replacement: 'ิ' }
  ];

  let result = w;
  for (const p of patterns) {
    result = result.replace(p.regex, p.replacement);
  }
  
  result = result
    .replace(/ะะ/g, 'ะ')
    .replace(/ิิ/g, 'ิ')
    .replace(/ุุ/g, 'ุ')
    .replace(/ออ/g, 'อ');
    
  let finalResult = leading + result;
  
  if (/^[ะิุีูัาัยเโแ]/.test(finalResult)) {
    finalResult = 'อ' + finalResult;
  }
  
  return finalResult;
}

function translateNameToThai(nameEn) {
  if (!nameEn) return "";
  let name = nameEn;
  for (const r of compoundReplacements) {
    name = name.replace(r.en, r.th);
  }
  let tokens = name.split(/([\s\-]+)/);
  let translatedTokens = [];
  
  tokens.forEach((token, index) => {
    let cleanToken = token.trim().toLowerCase().replace(/[^a-z']/g, '');
    if (token.trim() === "" || token.includes("-") || /[ก-ฮ]/.test(token)) {
      translatedTokens.push(token);
      return;
    }
    if ((cleanToken === 'ibn' || cleanToken === 'bin') && index === 0) {
      translatedTokens.push("อิบนุ");
      return;
    }
    if (customWordMap[cleanToken]) {
      translatedTokens.push(customWordMap[cleanToken]);
      return;
    }
    if (/^\d+$/.test(token)) {
      translatedTokens.push(token);
      return;
    }
    if (cleanToken.length > 0) {
      translatedTokens.push(ruleBasedTransliterate(cleanToken));
    } else {
      translatedTokens.push(token);
    }
  });
  
  let translatedName = translatedTokens.join("");
  return translatedName
    .replace(/อัล\s+([ก-ฮ])/g, 'อัล-$1')
    .replace(/อัส\s+([ก-ฮ])/g, 'อัส-$1')
    .replace(/อัช\s+([ก-ฮ])/g, 'อัช-$1')
    .replace(/อัต\s+([ก-ฮ])/g, 'อัต-$1')
    .replace(/อัน\s+([ก-ฮ])/g, 'อัน-$1')
    .replace(/อัร\s+([ก-ฮ])/g, 'อัร-$1')
    .replace(/อัซ\s+([ก-ฮ])/g, 'อัซ-$1')
    .replace(/อับดุร\s+เราะหฺมาน/g, 'อับดุรเราะหฺมาน')
    .replace(/อับดุล\s+อะซีซ/g, 'อับดุลอะซีซ')
    .replace(/อับดุล\s+กอดิร/g, 'อับดุลกอดิร')
    .replace(/อับดุล\s+ฆอนี/g, 'อับดุลฆอนี')
    .replace(/อับดุล\s+หัยย์/g, 'อับดุลหัยย์')
    .replace(/อับดุล\s+มุหฺสิน/g, 'อับดุลมุหฺสิน')
    .replace(/อับดุร\s+เราะห์มาน/g, 'อับดุรเราะหฺมาน')
    .replace(/อิบน์/g, 'บิน')
    .replace(/^บิน/g, 'อิบนุ')
    .replace(/\s+/g, ' ')
    .trim();
}

function translateDescription(descEn, descAr) {
  if (!descEn) {
    if (descAr) return descAr;
    return "นักวิชาการศาสนาอิสลาม";
  }
  let desc = descEn.toLowerCase().trim();
  const directMappings = [
    { en: "sunni muslim scholar", th: "นักวิชาการมุสลิมซุนนีย์" },
    { en: "islamic scholar", th: "นักวิชาการอิสลาม" },
    { en: "muslim scholar", th: "นักวิชาการมุสลิม" },
    { en: "shia scholar", th: "นักวิชาการชีอะฮ์" },
    { en: "sufi scholar", th: "นักวิชาการซูฟีย์" },
    { en: "hadith scholar", th: "นักวิชาการหะดีษ" },
    { en: "islamic theologian", th: "นักเทววิทยาอิสลาม" },
    { en: "faqih", th: "นักนิติศาสตร์อิสลาม" },
    { en: "jurist", th: "นักนิติศาสตร์" },
    { en: "theologian", th: "นักเทววิทยา" },
    { en: "historian", th: "นักประวัติศาสตร์" },
    { en: "linguist", th: "นักภาษาศาสตร์" },
    { en: "philosopher", th: "นักปรัชญา" },
    { en: "astronomer", th: "นักดาราศาสตร์" },
    { en: "physician", th: "แพทย์" },
    { en: "judge", th: "ผู้พิพากษา (กอฎี)" },
    { en: "calligrapher", th: "นักคัดลายมือ" },
    { en: "exegete", th: "นักอรรถาธิบายอัลกุรอาน" },
    { en: "mufassir", th: "นักตัฟซีร" },
    { en: "educator", th: "นักการศึกษา" },
    { en: "politician", th: "นักการเมือง" },
    { en: "scientist", th: "นักวิทยาศาสตร์" },
    { en: "poet", th: "กวี" },
    { en: "cleric", th: "นักวิชาการศาสนา" },
    { en: "preacher", th: "นักเผยแผ่ศาสนา" },
    { en: "writer", th: "นักเขียน" },
    { en: "author", th: "นักประพันธ์" }
  ];
  const countryMap = [
    { en: /\begyptian\b/g, th: "ชาวอียิปต์" },
    { en: /\bsaudi\b/g, th: "ชาวซาอุดีอาระเบีย" },
    { en: /\bsaudi arabian\b/g, th: "ชาวซาอุดีอาระเบีย" },
    { en: /\byemeni\b/g, th: "ชาวเยเมน" },
    { en: /\bsyrian\b/g, th: "ชาวซีเรีย" },
    { en: /\bpersian\b/g, th: "ชาวเปอร์เซีย" },
    { en: /\bmoroccan\b/g, th: "ชาวโมร็อกโก" },
    { en: /\btunisian\b/g, th: "ชาวตูนิเซีย" },
    { en: /\bpalestinian\b/g, th: "ชาวปาเลสไตน์" },
    { en: /\bjordanian\b/g, th: "ชาวจอร์แดน" },
    { en: /\bsudanese\b/g, th: "ชาวซูดาน" },
    { en: /\biraqi\b/g, th: "ชาวอิรัก" },
    { en: /\bindian\b/g, th: "ชาวอินเดีย" },
    { en: /\balgerian\b/g, th: "ชาวแอลจีเรีย" },
    { en: /\bturkish\b/g, th: "ชาวตุรกี" },
    { en: /\bottoman\b/g, th: "ในยุคออตโตมัน" },
    { en: /\bandalusian\b/g, th: "ชาวอันดาลุส" },
    { en: /\bspanish\b/g, th: "ชาวสเปน" },
    { en: /\blebanese\b/g, th: "ชาวเลบานอน" },
    { en: /\bkuwaiti\b/g, th: "ชาวคูเวต" },
    { en: /\blibyan\b/g, th: "ชาวลิเบีย" },
    { en: /\bsomali\b/g, th: "ชาวโซมาลี" },
    { en: /\bafghan\b/g, th: "ชาวอัฟกานิสถาน" },
    { en: /\bpakistani\b/g, th: "ชาวปากีสถาน" },
    { en: /\bindonesian\b/g, th: "ชาวอินโดนีเซีย" },
    { en: /\bmalaysian\b/g, th: "ชาวมาเลเซีย" },
    { en: /\biranian\b/g, th: "ชาวอิหร่าน" }
  ];
  const roleMap = [
    { en: /\bwriter\b/g, th: "นักเขียน" },
    { en: /\bauthor\b/g, th: "นักประพันธ์" },
    { en: /\bhistorian\b/g, th: "นักประวัติศาสตร์" },
    { en: /\bjurist\b/g, th: "นักนิติศาสตร์" },
    { en: /\btheologian\b/g, th: "นักเทววิทยา" },
    { en: /\bpoet\b/g, th: "กวี" },
    { en: /\beducator\b/g, th: "นักการศึกษา" },
    { en: /\bpolitician\b/g, th: "นักการเมือง" },
    { en: /\bscientist\b/g, th: "นักวิทยาศาสตร์" },
    { en: /\bcalligrapher\b/g, th: "นักคัดลายมือ" },
    { en: /\bexegete\b/g, th: "นักอรรถาธิบายอัลกุรอาน" },
    { en: /\bmufassir\b/g, th: "นักตัฟซีร" },
    { en: /\bcleric\b/g, th: "นักวิชาการศาสนา" },
    { en: /\bpreacher\b/g, th: "นักเผยแผ่ศาสนา" },
    { en: /\bscholar\b/g, th: "นักวิชาการ" },
    { en: /\band\b/g, th: "และ" }
  ];
  for (const m of directMappings) {
    if (desc === m.en) return m.th;
  }
  let translated = desc;
  roleMap.forEach(r => { translated = translated.replace(r.en, r.th); });
  countryMap.forEach(c => { translated = translated.replace(c.en, c.th); });
  translated = translated.replace(/(ชาว[ก-ฮะ-์]+)\s+(นัก[ก-ฮะ-์]+|กวี|แพทย์)/gi, '$2$1');
  if (/[a-zA-Z]/.test(translated)) {
    return "นักวิชาการศาสนาอิสลาม";
  }
  return translated.replace(/\s+/g, ' ').trim();
}


function mapField(descEn, nameEn) {
  const text = ((descEn || "") + " " + (nameEn || "")).toLowerCase();
  if (text.includes("hadith") || text.includes("muhaddith") || text.includes("หะดีษ") || text.includes("ฮะดีษ")) return "หะดีษ";
  if (text.includes("faqih") || text.includes("jurist") || text.includes("jurisprudent") || text.includes("fiqh") || text.includes("ฟิกฮ์")) return "ฟิกฮ์";
  if (text.includes("mufassir") || text.includes("tafsir") || text.includes("exegesis") || text.includes("ตัฟซีร")) return "ตัฟซีร";
  if (text.includes("theologian") || text.includes("theology") || text.includes("aqidah") || text.includes("aqeedah") || text.includes("อากีดะฮ์")) return "อากีดะฮ์";
  if (text.includes("historian") || text.includes("history") || text.includes("chronicler") || text.includes("ประวัติศาสตร์")) return "ประวัติศาสตร์";
  if (text.includes("linguist") || text.includes("arabic") || text.includes("grammar") || text.includes("ภาษาอาหรับ")) return "ภาษาอาหรับ";
  return "ทั่วไป";
}

// Clean and parse
console.log("Loading user-provided scholars file...");
const rawText = fs.readFileSync('C:/Users/HP/.gemini/antigravity/scratch/user_scholars_list.txt', 'utf8');
const lines = rawText.split(/[\r\n,;]+/);

const eraGroups = {
  1: [],
  2: [],
  3: [],
  4: []
};

const seenNames = new Set();
const prefixRegex = /^[.\-\s]*\b(Imam|Shaykh|Alamah|Mufti|Alama|Iman|Caliph|Saint|Dr|Dr\.|Professor|Molana|Shayk|Alama|Caliph)\b\s+/i;
const dateRegex = /\s*\(?(d\.?\s*)?\d{3,4}\s*[-–]\s*\d{3,4}\s*(H|AH|G|CE)?\)?/i;
const singleDateRegex = /\s*\(?(d\.?\s*)?\d{3,4}\s*(H|AH|G|CE)?\)?/i;

lines.forEach((line, index) => {
  let cleaned = line.trim();
  if (!cleaned || cleaned.toLowerCase() === 'ulama' || cleaned.toLowerCase() === 'anonymous' || cleaned.toLowerCase() === 'websites' || cleaned.toLowerCase() === 'publications') {
    return;
  }
  
  let prev;
  do {
    prev = cleaned;
    cleaned = cleaned.replace(prefixRegex, '');
  } while (cleaned !== prev);
  
  const dateMatch = cleaned.match(dateRegex);
  const singleDateMatch = cleaned.match(singleDateRegex);
  
  cleaned = cleaned.replace(dateRegex, '').replace(singleDateRegex, '').trim();
  cleaned = cleaned.replace(/^[.\-\s,;]+/, '').replace(/[.\-\s,;]+$/, '').trim();
  
  if (!cleaned || cleaned.length < 3 || seenNames.has(cleaned.toLowerCase())) {
    return;
  }
  
  // 1. Check hand-curated list first!
  const curatedMatch = getCuratedMatch(cleaned);
  if (curatedMatch) {
    seenNames.add(cleaned.toLowerCase());
    seenNames.add(curatedMatch.name.toLowerCase());
    if (curatedMatch.matchNames) {
      curatedMatch.matchNames.forEach(n => seenNames.add(n.toLowerCase()));
    }
    
    eraGroups[curatedMatch.era].push({
      name: curatedMatch.name,
      hijri: curatedMatch.hijri,
      ad: curatedMatch.ad,
      era: curatedMatch.era,
      field: curatedMatch.field,
      manhaj: curatedMatch.manhaj,
      note: curatedMatch.note
    });
    return;
  }
  
  seenNames.add(cleaned.toLowerCase());
  
  // 2. Otherwise match Wikidata or parse dates
  let parsedBirthYear = null;
  let parsedDeathYear = null;
  let isHijri = true;
  
  if (dateMatch) {
    const years = dateMatch[0].match(/\d{3,4}/g);
    if (years && years.length >= 2) {
      parsedBirthYear = parseInt(years[0]);
      parsedDeathYear = parseInt(years[1]);
      if (dateMatch[0].toLowerCase().includes('g') || dateMatch[0].toLowerCase().includes('ce')) {
        isHijri = false;
      }
    }
  } else if (singleDateMatch) {
    const year = singleDateMatch[0].match(/\d{3,4}/);
    if (year) {
      parsedDeathYear = parseInt(year[0]);
      if (singleDateMatch[0].toLowerCase().includes('g') || singleDateMatch[0].toLowerCase().includes('ce')) {
        isHijri = false;
      }
    }
  }
  
  // Wikidata matching logic
  let matched = null;
  const cleanL = cleaned.toLowerCase();
  for (const w of wikidataList) {
    if (!w.nameEn) continue;
    const wName = w.nameEn.toLowerCase();
    
    if (wName === cleanL || 
        (cleanL.length > 5 && wName.includes(cleanL)) || 
        (wName.length > 5 && cleanL.includes(wName))) {
      matched = w;
      break;
    }
  }
  
  let formattedName = translateNameToThai(cleaned);
  let hijriStr = "ไม่ระบุ";
  let adStr = "ไม่ระบุ";
  let era = 4;
  let field = "ทั่วไป";
  let note = "นักวิชาการศาสนาอิสลาม";
  let manhaj = null;
  
  if (matched) {
    const matchedThaiName = matched.nameTh ? translateNameToThai(matched.nameTh) : null;
    formattedName = matchedThaiName ? (matched.nameAr ? `${matchedThaiName} (${matched.nameAr})` : matchedThaiName) : (matched.nameAr ? `${formattedName} (${matched.nameAr})` : formattedName);
    
    const birthYear = matched.birthYear || (isHijri ? null : parsedBirthYear);
    const deathYear = matched.deathYear || (isHijri ? null : parsedDeathYear);
    
    const calculateAH = (ce) => ce ? Math.round((ce - 622) * 1.03) : null;
    const birthAH = calculateAH(birthYear);
    const deathAH = calculateAH(deathYear);
    
    if (birthAH && deathAH) hijriStr = `${birthAH}–${deathAH} AH`;
    else if (deathAH) hijriStr = `d. ${deathAH} AH`;
    
    if (birthYear && deathYear) adStr = `${birthYear}–${deathYear} CE`;
    else if (deathYear) adStr = `d. ${deathYear} CE`;
    
    if (deathYear) {
      if (deathYear <= 900) era = 1;
      else if (deathYear <= 1500) era = 2;
      else if (deathYear <= 1800) era = 3;
      else era = 4;
    }
    
    field = mapField(matched.descEn || matched.descAr || "", matched.nameEn || "");
    note = matched.descTh || translateDescription(matched.descEn, matched.descAr);
    
    const textDesc = ((matched.descEn || "") + " " + (matched.descAr || "")).toLowerCase();
    if (textDesc.includes("shia") || textDesc.includes("shi'ite")) manhaj = "ชีอะฮ์";
    else if (textDesc.includes("sufi") || textDesc.includes("mystic")) manhaj = "ซูฟีย์";
    else if (textDesc.includes("ash'ari") || textDesc.includes("asharite")) manhaj = "อาชาอิเราะฮ์";
    else if (textDesc.includes("mutazila") || textDesc.includes("mu'tazil")) manhaj = "มุอ์ตาซิละฮ์";
    else if (textDesc.includes("ibadi") || textDesc.includes("ibadh")) manhaj = "อิบาดิยะฮ์";
  } else {
    if (isHijri) {
      if (parsedBirthYear && parsedDeathYear) {
        hijriStr = `${parsedBirthYear}–${parsedDeathYear} AH`;
        const toCE = (ah) => Math.round(ah / 1.03 + 622);
        adStr = `${toCE(parsedBirthYear)}–${toCE(parsedDeathYear)} CE`;
        const ceDeath = toCE(parsedDeathYear);
        if (ceDeath <= 900) era = 1;
        else if (ceDeath <= 1500) era = 2;
        else if (ceDeath <= 1800) era = 3;
        else era = 4;
      } else if (parsedDeathYear) {
        hijriStr = `d. ${parsedDeathYear} AH`;
        const toCE = (ah) => Math.round(ah / 1.03 + 622);
        adStr = `d. ${toCE(parsedDeathYear)} CE`;
        const ceDeath = toCE(parsedDeathYear);
        if (ceDeath <= 900) era = 1;
        else if (ceDeath <= 1500) era = 2;
        else if (ceDeath <= 1800) era = 3;
        else era = 4;
      }
    } else {
      if (parsedBirthYear && parsedDeathYear) {
        adStr = `${parsedBirthYear}–${parsedDeathYear} CE`;
        const toAH = (ce) => Math.round((ce - 622) * 1.03);
        hijriStr = `${toAH(parsedBirthYear)}–${toAH(parsedDeathYear)} AH`;
        if (parsedDeathYear <= 900) era = 1;
        else if (parsedDeathYear <= 1500) era = 2;
        else if (parsedDeathYear <= 1800) era = 3;
        else era = 4;
      } else if (parsedDeathYear) {
        adStr = `d. ${parsedDeathYear} CE`;
        const toAH = (ce) => Math.round((ce - 622) * 1.03);
        hijriStr = `d. ${toAH(parsedDeathYear)} AH`;
        if (parsedDeathYear <= 900) era = 1;
        else if (parsedDeathYear <= 1500) era = 2;
        else if (parsedDeathYear <= 1800) era = 3;
        else era = 4;
      }
    }
    field = mapField("", cleaned);
  }
  
  // Post-process fallback classifications
  const nameL = cleaned.toLowerCase();
  if (nameL.includes("nawawi")) {
    manhaj = null;
    note = "อิมามผู้มีบทบาทสำคัญยิ่งในวิชาฟิกฮ์และหะดีษ แต่งตำราอภิธานเศาะฮีฮ์มุสลิมและริยาฎุศศอลิฮีน";
    field = "ฟิกฮ์/หะดีษ";
    era = 2;
    hijriStr = "631–676 AH";
    adStr = "1233–1277 CE";
  } else if (nameL.includes("asqalani") || nameL.includes("hajar")) {
    manhaj = null;
    note = "อิมามวิชาหะดีษผู้ยิ่งใหญ่ในประวัติศาสตร์ ประพันธ์ตำราฟัตฮุลบารีย์ชัรหฺบุคอรี และบลูฆุลมะรอม";
    field = "หะดีษ";
    era = 2;
    hijriStr = "773–852 AH";
    adStr = "1372–1449 CE";
  } else if (nameL.includes("tahawi")) {
    manhaj = "สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)";
  } else if (nameL.includes("taymiyyah")) {
    manhaj = "สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)";
  } else if (nameL.includes("uthaymeen") || nameL.includes("bin baz") || nameL.includes("albani") || nameL.includes("al-bany")) {
    manhaj = "สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)";
  }
  
  eraGroups[era].push({
    name: formattedName,
    hijri: hijriStr,
    ad: adStr,
    era: era,
    field: field,
    manhaj: manhaj,
    note: note
  });
});

// Supplement Eras 1, 2, and 3 from raw Wikidata list to make it fully balanced!
console.log("Supplementing Eras 1, 2, and 3 from raw Wikidata list...");
const addedNames = new Set([...seenNames].map(name => name.toLowerCase()));

// Add curated names to addedNames so they don't get duplicated
CURATED_SCHOLARS.forEach(c => {
  addedNames.add(c.name.toLowerCase());
  if (c.matchNames) {
    c.matchNames.forEach(n => addedNames.add(n.toLowerCase()));
  }
});

wikidataList.forEach(w => {
  if (!w.nameEn) return;
  const lowerName = w.nameEn.toLowerCase();
  if (addedNames.has(lowerName)) return;
  
  const deathYear = w.deathYear;
  if (!deathYear) return;
  
  let era = 4;
  if (deathYear <= 900) era = 1;
  else if (deathYear <= 1500) era = 2;
  else if (deathYear <= 1800) era = 3;
  else era = 4;
  
  // We only supplement Eras 1, 2, and 3 to keep it balanced
  if (era === 4) return;
  
  // If we already reached the cap of 250 for this era, skip
  if (eraGroups[era].length >= 250) return;
  
  const formattedName = w.nameTh ? (w.nameAr ? `${translateNameToThai(w.nameTh)} (${w.nameAr})` : translateNameToThai(w.nameTh)) : (w.nameAr ? `${translateNameToThai(w.nameEn)} (${w.nameAr})` : translateNameToThai(w.nameEn));
  
  const calculateAH = (ce) => ce ? Math.round((ce - 622) * 1.03) : null;
  const birthAH = calculateAH(w.birthYear);
  const deathAH = calculateAH(w.deathYear);
  
  let hijriStr = "ไม่ระบุ";
  let adStr = "ไม่ระบุ";
  if (birthAH && deathAH) hijriStr = `${birthAH}–${deathAH} AH`;
  else if (deathAH) hijriStr = `d. ${deathAH} AH`;
  
  if (w.birthYear && w.deathYear) adStr = `${w.birthYear}–${w.deathYear} CE`;
  else if (w.deathYear) adStr = `d. ${w.deathYear} CE`;
  
  const field = mapField(w.descEn || w.descAr || "", w.nameEn);
  const note = w.descTh || translateDescription(w.descEn, w.descAr);
  
  let manhaj = null;
  const textDesc = ((w.descEn || "") + " " + (w.descAr || "")).toLowerCase();
  if (textDesc.includes("shia") || textDesc.includes("shi'ite")) manhaj = "ชีอะฮ์";
  else if (textDesc.includes("sufi") || textDesc.includes("mystic")) manhaj = "ซูฟีย์";
  else if (textDesc.includes("ash'ari") || textDesc.includes("asharite")) manhaj = "อาชาอิเราะฮ์";
  
  eraGroups[era].push({
    name: formattedName,
    hijri: hijriStr,
    ad: adStr,
    era: era,
    field: field,
    manhaj: manhaj,
    note: note
  });
  
  addedNames.add(lowerName);
});

// Compile balanced list (max 250 per era)
const balancedScholars = [];
const cap = 250;

[1, 2, 3, 4].forEach(eraNum => {
  const list = eraGroups[eraNum];
  console.log(`Era ${eraNum} has ${list.length} candidate scholars after supplementation.`);
  const sliced = list.slice(0, cap);
  balancedScholars.push(...sliced);
  console.log(`Selected ${sliced.length} scholars for Era ${eraNum}.`);
});

console.log(`Total balanced scholars ready for upload: ${balancedScholars.length}`);

async function reseedData() {
  console.log("Wiping current scholars from Firestore first to maintain balanced list...");
  const snapshot = await getDocs(collection(db, "content_scholars"));
  const docs = snapshot.docs;
  const deleteBatchSize = 400;
  
  for (let i = 0; i < docs.length; i += deleteBatchSize) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + deleteBatchSize);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  console.log("Firestore content_scholars collection cleared.");
  
  // Upload balanced list
  let count = 0;
  const uploadBatchSize = 400;
  for (let i = 0; i < balancedScholars.length; i += uploadBatchSize) {
    const batch = writeBatch(db);
    const chunk = balancedScholars.slice(i, i + uploadBatchSize);
    
    chunk.forEach(scholar => {
      let hash = 0;
      const cleanName = scholar.name.replace(/\s+/g, '').toLowerCase();
      for (let j = 0; j < cleanName.length; j++) {
        hash = (hash << 5) - hash + cleanName.charCodeAt(j);
        hash = hash & hash;
      }
      const docId = `scholar_${Math.abs(hash)}`;
      
      const docRef = doc(db, "content_scholars", docId);
      batch.set(docRef, {
        ...scholar,
        id: docId,
        updatedAt: new Date()
      });
      count++;
    });
    
    console.log(`Uploading batch of ${chunk.length} items...`);
    await batch.commit();
  }
  
  console.log(`Seeding complete! Successfully uploaded ${count} balanced, Thai-translated scholars to Firestore!`);
  process.exit(0);
}

reseedData().catch(err => {
  console.error("Reseeding failed:", err);
  process.exit(1);
});
