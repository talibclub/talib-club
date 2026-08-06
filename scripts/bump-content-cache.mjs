// Force every visitor's cached copy of a public collection to be refetched.
//
// Visitors read articles/books/media/scholars out of a localStorage and
// IndexedDB cache whose ONLY invalidation signal is content_settings/metadata:
// the client refetches when metadata.<collection> is newer than its cached
// copy, and there is no TTL behind that check. So any write that reaches
// Firestore without going through the app — the Firebase console, a batch
// script, a restore — stays invisible to returning visitors until this runs.
//
// Usage:
//   node scripts/bump-content-cache.mjs content_books
//   node scripts/bump-content-cache.mjs all
import { config } from "dotenv";
config({ path: ".env.local" });
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PUBLIC_COLLECTIONS = ["content_articles", "content_books", "content_media", "content_scholars"];

const target = process.argv[2];
if (!target || (target !== "all" && !PUBLIC_COLLECTIONS.includes(target))) {
  console.error(`Usage: node scripts/bump-content-cache.mjs <all|${PUBLIC_COLLECTIONS.join("|")}>`);
  process.exit(1);
}

if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();

const collections = target === "all" ? PUBLIC_COLLECTIONS : [target];
const now = Date.now();
const payload = { updatedAt: FieldValue.serverTimestamp() };
for (const name of collections) payload[name] = now;

await db.doc("content_settings/metadata").set(payload, { merge: true });
console.log(`Bumped ${collections.join(", ")} to ${now} (${new Date(now).toISOString()}).`);
console.log("Returning visitors will refetch on their next page load.");
process.exit(0);
