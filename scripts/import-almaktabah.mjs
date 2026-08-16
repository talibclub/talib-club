// Syncs PUBLIC books from al-maktabah-al-athariyyah's Firestore into Talib
// Club's own content_books collection. Safe to run repeatedly (idempotent):
// - reads al-maktabah's `books` collection using its own PUBLIC client config
//   (no secret involved — same config their deployed site embeds in every
//   page, and the query below mirrors exactly what their own app runs for
//   an anonymous/unapproved reader: where('restricted','==',false))
// - keeps only Thai-language books (see isThaiBook) — Talib Club's audience is
//   Thai, so the English/Arabic half of the upstream library is skipped
// - adds books not yet imported (tracked via a `sourceId` field)
// - soft-deletes (deleted:true) previously-imported books that no longer
//   show up in that public query (they were turned restricted, or removed,
//   upstream) — this is intentional per the site owner
// - hard-deletes previously-imported books that are still public upstream but
//   not Thai (leftovers from before the language filter): they can never
//   qualify again, so there is nothing to keep them around for
//
// Usage:
//   node scripts/import-almaktabah.mjs --dry-run   (prints a plan, writes nothing)
//   node scripts/import-almaktabah.mjs             (writes for real)
//
// Requires FIREBASE_SERVICE_ACCOUNT in the environment (Talib Club's own
// service account — loaded from .env.local for local runs, or a GitHub
// Actions secret for the scheduled sync).

import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection, query, where, getDocs as getClientDocs } from "firebase/firestore";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (process.env.NODE_ENV !== "production" && !process.env.CI) {
  const { config } = await import("dotenv");
  config({ path: ".env.local" });
}

const DRY_RUN = process.argv.includes("--dry-run");
const SOURCE_NAME = "อัลมักตะบะฮ์ อัษรียะฮ์";
const SOURCE_SITE = "https://al-maktabah-web.vercel.app";
const BATCH_LIMIT = 400; // stay safely under Firestore's 500-op batch cap

// --- al-maktabah-al-athariyyah: public client config, not a secret ---
const sourceApp = initClientApp(
  {
    apiKey: "AIzaSyDynfVM7t9KaQsU1xvQ6YnPQsjOOEqRIUE",
    authDomain: "al-maktabah-al-athariyyah.firebaseapp.com",
    projectId: "al-maktabah-al-athariyyah",
    storageBucket: "al-maktabah-al-athariyyah.firebasestorage.app",
    messagingSenderId: "358716127965",
    appId: "1:358716127965:web:8ad2b9458d08c519f03934",
  },
  "almaktabah-source"
);
const sourceDb = getClientFirestore(sourceApp);

// --- Talib Club: admin write access ---
if (!getApps().length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT in environment");
    process.exit(1);
  }
  initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const destDb = getFirestore();

// Category mapping, built from real category tallies against Talib's live
// content_settings/taxonomy.articleCategories ids (Aqeedah/Fiqh/Seerah/
// Hadith/Social/Alquran/Tarbiyah) — the site owner accepted some lossy
// squashing rather than expanding the shared taxonomy.
const CATEGORY_MAP = {
  "ฟิกฮฺและอิบาดะฮฺ": "Fiqh",
  "การแต่งงานและครอบครัว": "Fiqh",
  "หะดีษและซุนนะฮฺ": "Hadith",
  "ตัซกียะฮฺและตัรบียะฮฺ": "Tarbiyah",
  "ผู้แสวงหาความรู้ (ฏอลิบุลอิลม์)": "Tarbiyah",
  "อัลกุรอานและตัฟซีร": "Alquran",
  "อะกีดะฮฺ": "Aqeedah",
  "เตาฮีด": "Aqeedah",
  "ซะละฟียะฮฺ": "Aqeedah",
  "มันฮัจญ์": "Aqeedah",
  "นิกายและอุตริกรรม": "Aqeedah",
  "กลุ่มและพรรคพวก": "Aqeedah",
  "อเทวนิยมและลัทธิบูชาวิทยาศาสตร์": "Aqeedah",
  "ความเข้าใจผิด": "Aqeedah",
  "ชีวประวัติและประวัติศาสตร์": "Seerah",
  "นักเผยแพร่และบุคคล": "Seerah",
  "ศาสนาต่างๆ": "Social",
  "ลัทธิสุดโต่งและการก่อการร้าย": "Social",
  "ประเด็นร่วมสมัย": "Social",
  "สุขภาพและพลานามัย": "Social",
  "สตรีและอิสลาม": "Social",
  "ถาม-ตอบ": "Social",
  "เบ็ดเตล็ด": "Social",
};

const TYPE_MAP = {
  "หนังสือ": "หนังสือ",
  "วารสาร": "วารสาร",
  "บทความ": "PDF",
  "ไฟล์ออนไลน์": "PDF",
  "วิทยานิพนธ์": "รายงาน",
};

// Upstream tags each book with a Thai-worded `language` ("ไทย" / "อังกฤษ" /
// "อาหรับ"), which is right for all but a handful of rows — a few genuinely
// Thai books sit under "อังกฤษ" and one is blank. So: trust the tag when it
// says Thai, and otherwise fall back to the title's script, which catches the
// mislabelled ones without dragging in any English/Arabic titles.
const THAI_SCRIPT = /[฀-๿]/;

function isThaiBook(book) {
  if (String(book.language || "").trim() === "ไทย") return true;
  return THAI_SCRIPT.test(book.title || "");
}

function mapCategory(cat) {
  return CATEGORY_MAP[cat] || "";
}

function mapType(type) {
  return TYPE_MAP[type] || "หนังสือ";
}

function mapYear(year) {
  const n = parseInt(year, 10);
  if (!n || Number.isNaN(n)) return null;
  return n + 543; // Gregorian -> Buddhist era, matching Talib's existing convention
}

function mapAuthor(author) {
  if (Array.isArray(author)) return author.filter(Boolean).join(", ");
  return author || "";
}

function mapCoverUrl(coverUrl) {
  if (!coverUrl) return "";
  return coverUrl.startsWith("http") ? coverUrl : `${SOURCE_SITE}${coverUrl}`;
}

async function fetchPublicSourceBooks() {
  const q = query(collection(sourceDb, "books"), where("restricted", "==", false));
  const snap = await getClientDocs(q);
  const all = snap.docs.map((d) => ({ sourceId: d.id, ...d.data() }));
  // Filtered here rather than in the query: the public set is small, and this
  // keeps the mislabelled-language fallback (and the skipped tally) possible.
  const thai = all.filter(isThaiBook);
  console.log(`Public books at source: ${all.length} (Thai: ${thai.length}, skipped non-Thai: ${all.length - thai.length})`);
  // `allIds` lets main() tell apart "still upstream, just not Thai" (purge for
  // good) from "gone/turned restricted upstream" (soft-delete, as before).
  return { thai, allIds: new Set(all.map((b) => b.sourceId)) };
}

async function fetchAlreadyImported() {
  const snap = await destDb.collection("content_books").where("source", "==", SOURCE_NAME).get();
  const map = new Map();
  snap.forEach((d) => {
    const data = d.data();
    if (data.sourceId) map.set(data.sourceId, { id: d.id, ...data });
  });
  return map;
}

async function ensureSourceTaxonomy() {
  const ref = destDb.doc("content_settings/taxonomy");
  const snap = await ref.get();
  const current = snap.exists ? snap.data().bookSources || [] : [];
  if (current.includes(SOURCE_NAME)) return;
  if (DRY_RUN) {
    console.log(`[dry-run] would add "${SOURCE_NAME}" to content_settings/taxonomy.bookSources`);
    return;
  }
  await ref.set({ bookSources: FieldValue.arrayUnion(SOURCE_NAME) }, { merge: true });
  console.log(`Added "${SOURCE_NAME}" to bookSources taxonomy`);
}

async function commitInChunks(ops) {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const chunk = ops.slice(i, i + BATCH_LIMIT);
    const batch = destDb.batch();
    chunk.forEach((op) => op(batch));
    await batch.commit();
    console.log(`Committed batch ${i / BATCH_LIMIT + 1} (${chunk.length} ops)`);
  }
}

async function main() {
  const [{ thai: sourceBooks, allIds }, existing] = await Promise.all([fetchPublicSourceBooks(), fetchAlreadyImported()]);
  const thaiIds = new Set(sourceBooks.map((b) => b.sourceId));

  const toCreate = sourceBooks.filter((b) => !existing.has(b.sourceId));
  // Sort out the books already in Talib that the Thai set no longer covers.
  // Non-Thai ones are leftovers from before this filter existed and can never
  // qualify again, so they go for good (site owner's call). Thai ones that
  // simply vanished upstream (turned restricted, or removed) keep the old
  // soft-delete, since those can legitimately come back later.
  const toPurge = [];
  const toHide = [];
  for (const doc of existing.values()) {
    if (thaiIds.has(doc.sourceId)) continue;
    const stillUpstream = allIds.has(doc.sourceId);
    if (stillUpstream || !THAI_SCRIPT.test(doc.title || "")) toPurge.push(doc);
    else if (!doc.deleted) toHide.push(doc);
  }
  // First run ever (nothing imported yet) is a historical backfill, not "new
  // arrivals" — don't badge all 442 as "ใหม่". Later incremental runs do.
  const isInitialBackfill = existing.size === 0;
  // The owner keeps this whole source hidden behind the admin toggle; if every
  // imported book is currently hidden, a new arrival should land hidden too
  // instead of popping onto the site on its own.
  const sourceIsHidden = existing.size > 0 && [...existing.values()].every((doc) => doc.deleted);

  console.log(`Already imported: ${existing.size}`);
  console.log(`New to import: ${toCreate.length}${sourceIsHidden ? " (as hidden — source is currently hidden on the site)" : ""}`);
  console.log(`To delete permanently (non-Thai): ${toPurge.length}`);
  console.log(`To hide (no longer public / removed upstream): ${toHide.length}`);

  if (DRY_RUN) {
    console.log("\n--dry-run sample (first 5 new imports):");
    for (const b of toCreate.slice(0, 5)) {
      console.log({
        sourceId: b.sourceId,
        title: b.title,
        author: mapAuthor(b.author),
        category: `${b.category || "(ว่าง)"} -> ${mapCategory(b.category) || "(ไม่ตั้งหมวด)"}`,
        type: `${b.type || "(ว่าง)"} -> ${mapType(b.type)}`,
        year: `${b.year || "(ว่าง)"} -> ${mapYear(b.year) ?? "(ไม่ตั้งปี)"}`,
        fileUrl: b.driveUrl || "",
        coverUrl: mapCoverUrl(b.coverUrl),
      });
    }
    if (toPurge.length) {
      console.log(`\n--dry-run: ${toPurge.length} non-Thai books that would be deleted permanently (first 10):`);
      for (const d of toPurge.slice(0, 10)) console.log({ id: d.id, sourceId: d.sourceId, title: d.title });
    }
    if (toHide.length) {
      console.log("\n--dry-run: books that would be hidden:");
      for (const d of toHide.slice(0, 10)) console.log({ id: d.id, sourceId: d.sourceId, title: d.title });
    }
    await ensureSourceTaxonomy();
    console.log("\nDry run — no book documents were written.");
    return;
  }

  await ensureSourceTaxonomy();

  const ops = [];
  for (const doc of toPurge) {
    ops.push((batch) => batch.delete(destDb.collection("content_books").doc(doc.id)));
  }
  for (const doc of toHide) {
    ops.push((batch) => batch.update(destDb.collection("content_books").doc(doc.id), { deleted: true, updatedAt: FieldValue.serverTimestamp() }));
  }
  for (const book of toCreate) {
    const ref = destDb.collection("content_books").doc();
    ops.push((batch) =>
      batch.set(ref, {
        title: book.title || "",
        author: mapAuthor(book.author),
        source: SOURCE_NAME,
        sourceId: book.sourceId,
        type: mapType(book.type),
        category: mapCategory(book.category),
        year: mapYear(book.year),
        fileUrl: book.driveUrl || "",
        coverUrl: mapCoverUrl(book.coverUrl),
        desc: book.description || "",
        views: 0,
        downloads: 0,
        isNew: !isInitialBackfill,
        deleted: sourceIsHidden,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    );
  }

  await commitInChunks(ops);

  // Visitors read the book list from a localStorage/IndexedDB cache whose only
  // invalidation signal is this timestamp — there is no TTL on that path, so
  // without the bump an import stays invisible to returning visitors.
  if (ops.length > 0) {
    await destDb.doc("content_settings/metadata").set(
      { content_books: Date.now(), updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    console.log("Bumped content_settings/metadata.content_books so client caches refetch.");
  }

  console.log(`\nDone. Imported ${toCreate.length}, deleted ${toPurge.length} non-Thai, hid ${toHide.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
