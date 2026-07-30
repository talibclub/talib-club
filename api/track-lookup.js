import admin, { verifyIdToken } from "./_firebase-admin.js";

// Server-side parcel/recipient lookup.
//
// Why this exists: Firestore security rules cannot force a `where` clause —
// the old client-side rule (`allow list: if signedIn() && limit <= 5`) let any
// signed-in member page through the whole recipients/records collections and
// read other people's names, phones and addresses. The rules are now
// staff-only, and members search through this endpoint which only ever returns
// exact matches, trimmed to the fields the UI actually shows.

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://talibclub.org";

// Best-effort per-instance limiter to slow down phone-number brute force.
const RATE_LIMIT = { windowMs: 60_000, max: 15 };
const hits = new Map(); // uid -> { count, resetAt }

function rateLimited(uid) {
  const now = Date.now();
  const entry = hits.get(uid);
  if (!entry || entry.resetAt <= now) {
    hits.set(uid, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

function send(res, status, data) {
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  if (typeof res.status === "function") return res.status(status).json(data);
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify(data),
  };
}

function parseBody(req) {
  if (!req.body) return {};
  if (Buffer.isBuffer(req.body)) {
    try { return JSON.parse(req.body.toString("utf8")); } catch { return {}; }
  }
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

async function requireUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Unauthorized: Missing authentication token");
    err.status = 401;
    throw err;
  }
  return verifyIdToken(authHeader.substring(7));
}

// Only the fields the public result card renders — never the full address.
function toPublicResult(docSnap) {
  const d = docSnap.data() || {};
  return {
    fullName: d.fullName || "",
    phone: d.phone || "",
    trackingNumber: d.trackingNumber || "",
    bonusNote: d.bonusNote || "",
  };
}

async function exactMatches(db, collectionName, clauses) {
  const seen = new Map();
  for (const [field, value] of clauses) {
    if (!value) continue;
    const snap = await db.collection(collectionName).where(field, "==", value).limit(5).get();
    snap.docs.forEach((docSnap) => { if (!seen.has(docSnap.id)) seen.set(docSnap.id, docSnap); });
    if (seen.size >= 5) break;
  }
  return [...seen.values()].slice(0, 5).map(toPublicResult);
}

export default async function handler(req, res) {
  const method = req.method || req.httpMethod;
  if (method === "OPTIONS") return send(res, 200, { ok: true });
  if (method !== "POST") return send(res, 405, { error: "Method Not Allowed" });

  let token;
  try { token = await requireUser(req); } catch (err) { return send(res, err.status || 401, { error: err.message }); }
  if (rateLimited(token.uid)) return send(res, 429, { error: "Too many searches, please wait a minute" });

  const body = parseBody(req);
  const mode = body.mode === "recipient" ? "recipient" : "record";
  const rawQuery = String(body.query || "").trim().slice(0, 120);
  if (!rawQuery) return send(res, 400, { error: "Missing query" });

  const qClean = rawQuery;
  const qPhone = rawQuery.replace(/[-\s]/g, "");
  const qTrack = rawQuery.replace(/\s/g, "").toUpperCase();

  try {
    const db = admin.firestore();
    const results = mode === "recipient"
      ? await exactMatches(db, "recipients", [["fullName", qClean], ["phone", qPhone]])
      : await exactMatches(db, "records", [["fullName", qClean], ["phone", qPhone], ["trackingNumber", qTrack]]);

    return send(res, 200, { results });
  } catch (error) {
    console.error("track-lookup failed:", error);
    return send(res, 500, { error: "Lookup failed" });
  }
}
