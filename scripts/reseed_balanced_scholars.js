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
function translateNameToThai(nameEn) {
  if (!nameEn) return "";
  let name = nameEn;
  const replacements = [
    { en: /Imam\s+/gi, th: "อิมาม " },
    { en: /Shaykh\s+|Sheikh\s+|Sheik\s+/gi, th: "เชค " },
    { en: /Allamah\s+|Alamah\s+/gi, th: "ปราชญ์ " },
    { en: /Mufti\s+/gi, th: "มุฟตี " },
    { en: /Professor\s+/gi, th: "ศาสตราจารย์ " },
    { en: /Dr\.?\s+/gi, th: "ดร. " },
    { en: /\bibn\b|\bbin\b/gi, th: "อิบน์" },
    { en: /\bAbu\b/g, th: "อะบู" },
    { en: /\bAbi\b/g, th: "อะบี" },
    { en: /\bAl-|\bal-/g, th: "อัล-" },
    { en: /\bMuhammad\b|\bMuhammed\b|\bMohammad\b/gi, th: "มุฮัมมัด" },
    { en: /\bAhmad\b|\bAhmed\b/gi, th: "อะฮ์มัด" },
    { en: /\bAbdullah\b|\bAbdyllah\b/gi, th: "อับดุลลอฮ์" },
    { en: /\bAbdurrahman\b|\bAbdur-Rahman\b|\bAbd al-Rahman\b|\bAbdur Rahman\b/gi, th: "อับดุรเราะห์มาน" },
    { en: /\bAbdul\b/gi, th: "อับดุล" },
    { en: /\bAli\b/gi, th: "อะลี" },
    { en: /\bHasan\b|\bHassan\b/gi, th: "ฮะซัน" },
    { en: /\bHusayn\b|\bHussein\b/gi, th: "ฮุเซน" },
    { en: /\bIbrahim\b/gi, th: "อิบรอฮีม" },
    { en: /\bUmar\b/gi, th: "โอมัร" },
    { en: /\bUthman\b|\bUthmān\b/gi, th: "อุษมาน" },
    { en: /\bSaad\b|\bSa'd\b/gi, th: "ซะอ์ด" },
    { en: /\bSaleh\b|\bSalih\b/gi, th: "ศอลิห์" },
    { en: /\bKhalid\b|\bKhaalid\b/gi, th: "คอลิด" },
    { en: /\bYusuf\b/gi, th: "ยูซุฟ" },
    { en: /\bSulayman\b|\bSulaymān\b/gi, th: "สุไลมาน" },
    { en: /\bYahya\b/gi, th: "ยะห์ยา" },
    { en: /\bIsmail\b|\bIsma'il\b/gi, th: "อิสมาอีล" },
    { en: /\bZakaria\b|\bZakariyya\b/gi, th: "ซะกะรียา" },
    { en: /\bAisha\b/gi, th: "อาอิชะฮ์" },
    { en: /\bFatima\b/gi, th: "ฟาฏิมะฮ์" },
    { en: /\bMustafa\b|\bMustapha\b/gi, th: "มุศเฏาะฟา" },
    { en: /\bSaeed\b/gi, th: "สะีด" },
    { en: /\bTirmidhi\b/gi, th: "ติรมีซี" },
    { en: /\bBukhari\b/gi, th: "บุคอรี" },
    { en: /\bNawawi\b/gi, th: "นะวาวีย์" },
    { en: /\bQurtubi\b/gi, th: "กุรฏุบี" },
    { en: /\bSuyuti\b/gi, th: "สุยูฏีย์" },
    { en: /\bShawkani\b/gi, th: "เชากานี" },
    { en: /\bHakim\b/gi, th: "ฮากิม" },
    { en: /\bQudamah\b/gi, th: "กุดามะฮ์" },
    { en: /\bTaymiyyah\b/gi, th: "ตัยมียะฮ์" },
    { en: /\bGhazali\b/gi, th: "ฆอซาลี" },
    { en: /\bTabari\b/gi, th: "เฏาะบารี" },
    { en: /\bTahawi\b/gi, th: "เฏาะฮาวี" },
    { en: /\bMuslim\b/gi, th: "มุสลิม" }
  ];
  for (const r of replacements) {
    name = name.replace(r.en, r.th);
  }
  return name.replace(/\s+/g, ' ').trim();
}

function translateDescription(descEn, descAr) {
  if (!descEn) {
    if (descAr) return descAr;
    return "นักวิชาการศาสนาอิสลาม";
  }
  let desc = descEn.toLowerCase();
  const mapping = [
    { en: "islamic scholar", th: "นักวิชาการอิสลาม" },
    { en: "muslim scholar", th: "นักวิชาการมุสลิม" },
    { en: "sunni muslim scholar", th: "นักวิชาการมุสลิมซุนนีย์" },
    { en: "shia scholar", th: "นักวิชาการชีอะฮ์" },
    { en: "sufi scholar", th: "นักวิชาการซูฟีย์" },
    { en: "egyptian writer", th: "นักเขียนชาวอียิปต์" },
    { en: "egyptian scholar", th: "นักวิชาการชาวอียิปต์" },
    { en: "saudi arabian scholar", th: "นักวิชาการชาวซาอุดีอาระเบีย" },
    { en: "saudi scholar", th: "นักวิชาการชาวซาอุดีอาระเบีย" },
    { en: "yemeni scholar", th: "นักวิชาการชาวเยเมน" },
    { en: "syrian scholar", th: "นักวิชาการชาวซีเรีย" },
    { en: "persian scholar", th: "นักวิชาการชาวเปอร์เซีย" },
    { en: "moroccan scholar", th: "นักวิชาการชาวโมร็อกโก" },
    { en: "tunisian scholar", th: "นักวิชาการชาวตูนิเซีย" },
    { en: "hadith scholar", th: "นักวิชาการหะดีษ" },
    { en: "islamic theologian", th: "นักเทววิทยาอิสลาม" },
    { en: "theologian", th: "นักเทววิทยา" },
    { en: "writer", th: "นักเขียน" },
    { en: "jurist", th: "นักนิติศาสตร์" },
    { en: "faqih", th: "นักนิติศาสตร์ (ฟะกีฮ์)" },
    { en: "cleric", th: "โต๊ะครู / นักวิชาการศาสนา" },
    { en: "clergyman", th: "นักวิชาการศาสนา" },
    { en: "historian", th: "นักประวัติศาสตร์" },
    { en: "linguist", th: "นักภาษาศาสตร์" }
  ];
  for (const item of mapping) {
    if (desc.includes(item.en)) return item.th;
  }
  return descEn
    .replace(/Islamic scholar/gi, "นักวิชาการอิสลาม")
    .replace(/Muslim scholar/gi, "นักวิชาการมุสลิม")
    .replace(/theologian/gi, "นักเทววิทยา")
    .replace(/jurist/gi, "นักนิติศาสตร์")
    .replace(/historian/gi, "นักประวัติศาสตร์")
    .replace(/writer/gi, "นักเขียน");
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
  seenNames.add(cleaned.toLowerCase());
  
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
  
  let matched = null;
  for (const w of wikidataList) {
    if (
      (w.nameEn && w.nameEn.toLowerCase().includes(cleaned.toLowerCase())) ||
      (w.nameAr && w.nameAr.toLowerCase().includes(cleaned.toLowerCase())) ||
      (cleaned.toLowerCase().includes(String(w.nameEn || "").toLowerCase()))
    ) {
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
    formattedName = matchedThaiName ? `${matchedThaiName} (${matched.nameAr || matched.nameEn})` : (matched.nameAr ? `${formattedName} (${matched.nameAr})` : formattedName);
    
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
  
  // Custom checks from a Salafi perspective
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
  } else if (nameL.includes("tahawi")) {
    manhaj = "สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)";
  } else if (nameL.includes("taymiyyah")) {
    manhaj = "สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)";
  } else if (nameL.includes("uthaymeen") || nameL.includes("bin baz") || nameL.includes("albani") || nameL.includes("al-bany")) {
    manhaj = "สะลาฟีย์ (มันฮัจญ์สะลัฟ / อะษารีย์)";
  }
  
  eraGroups[era].push({
    id: `doc_${index}`,
    name: formattedName,
    hijri: hijriStr,
    ad: adStr,
    era: era,
    field: field,
    manhaj: manhaj,
    note: note,
    deleted: false
  });
});

// Compile balanced list (max 250 per era)
const balancedScholars = [];
const cap = 250;

[1, 2, 3, 4].forEach(eraNum => {
  const list = eraGroups[eraNum];
  console.log(`Era ${eraNum} has ${list.length} candidate scholars.`);
  
  // Slice to cap
  const sliced = list.slice(0, cap);
  balancedScholars.push(...sliced);
  console.log(`Selected ${sliced.length} scholars for Era ${eraNum}.`);
});

console.log(`Total balanced scholars ready for upload: ${balancedScholars.length}`);

// Wipe collection first to remove old unbalanced entries
async function reseedData() {
  console.log("Wiping current scholars from Firestore first to maintain balanced list...");
  const snapshot = await getDocs(collection(db, "content_scholars"));
  const deleteBatchSize = 400;
  
  const docs = snapshot.docs;
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
