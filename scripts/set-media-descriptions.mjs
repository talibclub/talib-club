// Fills in `desc` on content_media. Media records hold only title, channel,
// playlist and duration — metadata that every clip in a series shares — so the
// media detail pages carried about 620 characters of body text and Search
// Console left them under "รวบรวมข้อมูลแล้ว - ยังไม่ได้จัดทำดัชนี". `desc` is the one
// field that can say something about a single clip, and both the SPA
// (src/pages/MediaDetail.jsx) and the crawler prerender (api/seo-prerender.js)
// print it.
//
// Requires FIREBASE_SERVICE_ACCOUNT in the environment, like the other admin
// scripts. Dry-run by default — nothing is written without --apply:
//
//   node scripts/set-media-descriptions.mjs            # show what would change
//   node scripts/set-media-descriptions.mjs --apply    # write it
//
// Only documents whose `desc` is still empty are touched, so anything edited in
// the admin afterwards wins and re-running is safe.

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Same env loading as scripts/import-almaktabah.mjs: the service account lives
// in .env.local, which dotenv does not pick up on its own.
if (process.env.NODE_ENV !== "production" && !process.env.CI) {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
}

// `source` records where each description came from, so a later reader can tell
// what was written from the clip's own audio and what was written from nothing
// but its title and needs a listen before it is trusted:
//
//   transcript           — written from YouTube's transcript of the clip
//   youtube-description  — written from the clip's own description on YouTube
//   title-only           — written from the title, speaker and series; VERIFY
const DESCRIPTIONS = [
  {
    id: "media-143",
    source: "transcript",
    desc: `รายการ Talib Talk ตอนแรก ว่าด้วยการทำให้มนุษย์กลายเป็นวัตถุทางเพศ (sex object) แบ่งการพูดคุยออกเป็นสามส่วน — ส่วนแรกคือกระบวนการสร้างตัวตนที่สังคมวางกฎเกณฑ์ไว้ผ่านอาชีพอย่างนางแบบ ดารา และนักร้อง โดยหยิบแนวคิดของมิเชล ฟูโกต์มาอธิบาย ส่วนที่สองคือระบบทุนนิยมและอุตสาหกรรมสื่อภาพยนตร์ที่ใช้เรือนร่างผู้หญิงเป็นเครื่องมือทางเศรษฐกิจ และส่วนที่สามคือแนวทางของอิสลามที่ไม่ปล่อยให้เรือนร่างของสตรีถูกครอบงำด้วยสายตาแบบนั้น พร้อมอ้างอิงงานวิจัยต่างประเทศประกอบ`,
  },
  {
    id: "media-144",
    source: "transcript",
    desc: `รายการ Talib Talk ตอนที่สอง ตั้งคำถามว่ากระแสการฟื้นฟูอิสลามเผยแพร่เข้าสู่ประเทศไทยมาอย่างไร และนำไปสู่การตื่นตัวทางการเมืองในสังคมมลายูสามจังหวัดชายแดนใต้ได้อย่างไร ผู้พูดเรียบเรียงจากงานวิจัย บทความและหนังสือที่อ่านมา เริ่มจากปัญหาที่แต่ละสำนักให้คำนิยามคำว่าการฟื้นฟูอิสลามไม่ตรงกัน แล้วไล่เส้นทางความคิดปฏิรูปศาสนาที่เชื่อมโยงจากอียิปต์และจากมินังกาเบา ประเทศอินโดนีเซีย เข้าสู่สังคมมลายูภาคใต้`,
  },
  {
    id: "media-145",
    source: "transcript",
    desc: `รายการ Talib Talk ตอนที่สาม เป็นฉบับเสียงของบทความเรื่องดนตรีที่เคยเผยแพร่ไว้ก่อนหน้า สำหรับคนที่ถนัดฟังมากกว่าอ่าน พร้อมข้อมูลที่เพิ่มเติมเข้ามาใหม่ ชวนคิดว่าทำไมดนตรีจึงกลายเป็นวิถีชีวิตที่อยู่กับเราตั้งแต่ชั้นอนุบาลจนถึงมหาวิทยาลัย มองปรากฏการณ์นี้ในฐานะการทำให้เป็นเรื่องปกติ (normalization) ที่มาพร้อมโลกาภิวัตน์และสื่ออินเทอร์เน็ต แล้วขยายไปถึงความสัมพันธ์ระหว่างเพลงกับรัฐ และการที่เพลงถูกผลักเข้าสู่การผลิตซ้ำในระบบทุนนิยมและอุตสาหกรรมดนตรี`,
  },
  {
    id: "media-147",
    source: "transcript",
    desc: `วงชาสลัฟ คุยสบาย ๆ เรื่องดนตรีกับผู้เขียนบทความในหัวข้อเดียวกัน เริ่มจากที่มาของคำถาม — เทศกาลต่าง ๆ ในปัตตานี ทั้งงานของจังหวัดและงานในสถาบัน ที่เนื้อหาหลักเป็นเรื่องอาหารการกินและประเพณีพื้นบ้าน แต่กลับต้องมีดนตรีประกอบเสมอ จนคนที่มางานมุ่งไปที่เวทีดนตรีแทนงานหลัก จากนั้นคุยต่อถึงดนตรีกับระบบทุนนิยม และคำถามที่มุสลิมถูกถามบ่อยว่าทำไมจึงห้ามฟังดนตรี โดยแยกให้เห็นว่าคำว่าเพลงนั้นประกอบด้วยเสียงร้องกับเครื่องดนตรีซึ่งเป็นคนละเรื่องกัน`,
  },
  {
    id: "media-148",
    source: "transcript",
    desc: `วงชาสลัฟแบบไม่ได้นัดหมายกันมาก่อน หยิบคำถามที่คนในพื้นที่พูดกันมาคุยตรง ๆ ว่าทำไมคนสามจังหวัดชายแดนใต้พอมีฐานะขึ้นมาแล้วมักลืมที่ทางเดิมของตัวเอง คุยจากสถิติความยากจนที่ทั้งสามจังหวัดติดอันดับต้นของประเทศ การเลื่อนสถานะทางสังคมของคนที่เคยลำบากมาก่อน ไปจนถึงคำถามว่าการพูดแบบนี้เป็นการเหมารวมหรือใส่ร้ายกันหรือไม่ และภาพบ้านหลังใหญ่ที่ตั้งอยู่ติดบ้านสังกะสีกับหน้าที่ที่มุสลิมมีต่อเพื่อนบ้าน`,
  },
  {
    id: "media-153",
    source: "youtube-description",
    desc: `คุฏบะฮฺวันศุกร์ครั้งแรกของ Ibn Yusuf ในหัวข้อหนทางที่จะทำให้รอดพ้นจากฟิตนะฮฺของสตรี บรรยายเมื่อวันศุกร์ที่ 14 ซุลฮิจญะฮฺ 1445 ตรงกับวันที่ 21 มิถุนายน 2024 ณ ห้องละหมาดชั้น 3 อาคารไปรษณีย์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตบางเขน มีไฟล์เนื้อหาคุฏบะฮฺฉบับตัวอักษรแนบไว้ในคำอธิบายคลิปบน YouTube สำหรับผู้ที่ต้องการอ่านทบทวน`,
  },
  {
    id: "media-154",
    source: "youtube-description",
    desc: `คุฏบะฮฺวันศุกร์ครั้งที่สองของ Ibn Yusuf ในหัวข้อสิ่งที่ยังประโยชน์ต่อหัวใจของผู้ศรัทธา บรรยายเมื่อวันศุกร์ที่ 28 ซุลฮิจญะฮฺ 1445 ตรงกับวันที่ 5 กรกฎาคม 2024 ณ ห้องละหมาดชั้น 3 อาคารไปรษณีย์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตบางเขน มีไฟล์เนื้อหาคุฏบะฮฺฉบับตัวอักษรแนบไว้ในคำอธิบายคลิปบน YouTube สำหรับผู้ที่ต้องการอ่านทบทวน`,
  },
  {
    id: "media-2",
    source: "youtube-description",
    desc: `คุฏบะฮฺวันศุกร์ครั้งที่สามของ Ibn Yusuf ในหัวข้อเราะมะฎอน เดือนแห่งการงดเว้น บรรยายเมื่อวันศุกร์ที่ 11 เราะมะฎอน 1445 ตรงกับวันที่ 22 มีนาคม 2024 ณ ห้องละหมาดชั้น 3 อาคารไปรษณีย์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตบางเขน เป็นคุฏบะฮฺที่บรรยายกลางเดือนถือศีลอด`,
  },
  {
    id: "media-150",
    source: "title-only",
    desc: `วงชาสลัฟ ชวนคุยว่าทุนนิยมคืออะไรกันแน่ และมุสลิมควรวางตัวอย่างไรกับระบบที่เราทุกคนใช้ชีวิตอยู่ในนั้น เป็นตอนที่ต่อเนื่องกับประเด็นทุนนิยมที่โผล่ขึ้นมาในวงสนทนาเรื่องดนตรีและเรื่องฐานะทางสังคมในตอนก่อนหน้าของรายการ`,
  },
  {
    id: "media-151",
    source: "title-only",
    desc: `วงชาสลัฟตอนยาวกว่าหนึ่งชั่วโมงยี่สิบนาที ว่าด้วยอิสลามกับประชาธิปไตย คำถามที่มุสลิมในสังคมไทยเจอทั้งจากคนนอกและจากกันเอง ทั้งที่มาของระบอบ การมีส่วนร่วมทางการเมือง และจุดที่หลักการอิสลามกับระบอบประชาธิปไตยสอดคล้องหรือขัดกัน เป็นตอนที่ยาวที่สุดของรายการ`,
  },
  {
    id: "media-152",
    source: "title-only",
    desc: `คลิปแปลสั้นจากชัยคฺฟาริซ อัล-ฮัมมาดี ว่าด้วยความหมายทั้งห้าประการของคำว่าอัซ-ซุนนะฮฺ คำเดียวกันที่ถูกใช้ในความหมายต่างกันไปตามบริบทที่มันปรากฏ ทั้งในตำราหะดีษ ตำราอุศูลุลฟิกฮฺ และตำราอะกีดะฮฺ พร้อมคำแปลภาษาไทย`,
  },
  {
    id: "media-3",
    source: "title-only",
    desc: `คลิปแปลจากชัยคฺมุฮัมมัด นาศิรุดดีน อัล-อัลบานีย์ และชัยคฺรอเบี๊ยะอฺ ว่าด้วยจุดต่างระหว่างแนวทางศูฟีย์ อาชาอิเราะฮฺ และอะฮฺลุซซุนนะฮฺ วัลญะมาอะฮฺ เป็นการชี้แจงหลักการมากกว่าการโต้เถียงกัน พร้อมคำแปลภาษาไทย`,
  },
  {
    id: "media-4",
    source: "title-only",
    desc: `คลิปแปลจากชัยคฺอับดุสสะลาม อัช-ชุวัยอิรฺ ว่าด้วยสิ่งที่มุสลิมควรเตรียมตัวไว้ก่อนเดือนรอมฎอนจะมาถึง ทั้งการเตรียมหัวใจ การตั้งเจตนา และการวางแผนอิบาดะฮฺล่วงหน้าเพื่อไม่ให้เดือนนี้ผ่านไปโดยเปล่าประโยชน์ พร้อมคำแปลภาษาไทย`,
  },
  {
    id: "media-5",
    source: "title-only",
    desc: `คลิปแปลฉบับยาวสิบสองนาทีจากชัยคฺอับดุสสะลาม อัช-ชุวัยอิรฺ ว่าด้วยการเตรียมตัวก่อนรอมฎอนมาถึง ขยายความละเอียดกว่าคลิปสั้นในหัวข้อเดียวกัน ทั้งเรื่องการเตรียมหัวใจ การชดใช้สิ่งที่ยังค้างอยู่ และการวางเป้าหมายของเดือนถือศีลอด พร้อมคำแปลภาษาไทย`,
  },
  {
    id: "media-6",
    source: "title-only",
    desc: `คลิปแปลสั้นจากชัยคฺฟาริซ อัล-ฮัมมาดี ว่าด้วยการแบ่งเตาฮีดออกเป็นสามประเภท คือเตาฮีดอัร-รุบูบียะฮฺ เตาฮีดอัล-อุลูฮียะฮฺ และเตาฮีดอัล-อัสมาอ์ วัศ-ศิฟาต โดยชี้ให้เห็นว่าการแบ่งเช่นนี้มีที่มาจากอัลกุรอานเอง ไม่ใช่การแบ่งที่นักวิชาการคิดขึ้นภายหลัง พร้อมคำแปลภาษาไทย`,
  },
  {
    id: "media-8",
    source: "title-only",
    desc: `คลิปแปลจากชัยคฺศอลิหฺ อัล-เฟาซาน ว่าด้วยเสาหลักและเงื่อนไขของคำปฏิญาณลาอิลาฮะอิลลัลลอฮฺ ทั้งสองเสาหลักคือการปฏิเสธ (นะฟีย์) และการยืนยัน (อิษบาต) และเงื่อนไขที่ต้องครบถ้วนคำปฏิญาณนี้จึงจะเกิดผลกับผู้กล่าว ไม่ใช่เพียงการกล่าวด้วยลิ้น พร้อมคำแปลภาษาไทย`,
  },
  {
    id: "media-9",
    source: "title-only",
    desc: `คลิปแปลจากชัยคฺอิฮฺซาน อิลาฮี ซอฮีร ว่าด้วยคำถามที่ตั้งไปยังผู้ที่อ้างความรักต่ออะฮฺลุลบัยตฺ วงศ์วานของท่านนบี ﷺ ว่าแท้จริงแล้วใครกันแน่ที่เดินตามแนวทางของพวกท่าน พร้อมคำแปลภาษาไทย`,
  },
];

async function main() {
  const apply = process.argv.includes("--apply");

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT in environment");
    process.exit(1);
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  const db = getFirestore();

  let written = 0;
  let skipped = 0;
  let missing = 0;

  for (const entry of DESCRIPTIONS) {
    const ref = db.collection("content_media").doc(entry.id);
    const snap = await ref.get();

    if (!snap.exists) {
      console.log(`MISSING ${entry.id} — no such document`);
      missing++;
      continue;
    }

    const current = String(snap.data().desc || snap.data().description || "").trim();
    if (current) {
      console.log(`SKIP    ${entry.id} — already has a description (${current.length} chars)`);
      skipped++;
      continue;
    }

    console.log(`${apply ? "WRITE  " : "WOULD  "} ${entry.id} [${entry.source}] ${entry.desc.slice(0, 55)}...`);
    if (apply) {
      await ref.update({ desc: entry.desc, updatedAt: FieldValue.serverTimestamp() });
    }
    written++;
  }

  console.log("");
  console.log(`${apply ? "written" : "would write"}: ${written}   already filled: ${skipped}   missing: ${missing}`);
  if (!apply) console.log("Dry run. Re-run with --apply to write.");
}

main().catch((err) => {
  console.error("Failed:", err?.message || err);
  process.exit(1);
});
