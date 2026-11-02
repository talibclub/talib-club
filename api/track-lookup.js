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

function rateLimited(uid, max = RATE_LIMIT.max) {
  const now = Date.now();
  const entry = hits.get(uid);
  if (!entry || entry.resetAt <= now) {
    hits.set(uid, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
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

// Name searches return identifying information only. A full exact phone lookup
// may also return the shipping address so the recipient can check it.
function toPublicResult(docSnap, includeAddress = false) {
  const d = docSnap.data() || {};
  const result = {
    fullName: d.fullName || "",
    phone: d.phone || "",
    trackingNumber: d.trackingNumber || "",
    bonusNote: d.bonusNote || "",
  };
  if (includeAddress) {
    result.address = d.address || "";
    result.postalCode = d.postalCode || d.zipcode || "";
  }
  return result;
}

async function exactMatches(db, collectionName, clauses, includeAddress = false) {
  const seen = new Map();
  for (const [field, values] of clauses) {
    for (const value of (Array.isArray(values) ? values : [values])) {
      if (!value) continue;
      const snap = await db.collection(collectionName).where(field, "==", value).limit(5).get();
      snap.docs.forEach((docSnap) => { if (!seen.has(docSnap.id)) seen.set(docSnap.id, docSnap); });
      if (seen.size >= 5) break;
    }
    if (seen.size >= 5) break;
  }
  return [...seen.values()].slice(0, 5).map(docSnap => toPublicResult(docSnap, includeAddress));
}

export default async function handler(req, res) {
  const method = req.method || req.httpMethod;
  if (method === "OPTIONS") return send(res, 200, { ok: true });
  if (method !== "POST") return send(res, 405, { error: "Method Not Allowed" });

  let token;
  try { token = await requireUser(req); } catch (err) { return send(res, err.status || 401, { error: err.message }); }
  const body = parseBody(req);
  const mode = body.mode === "recipient" ? "recipient" : "record";
  const rawQuery = String(body.query || "").trim().slice(0, 120);
  if (!rawQuery) return send(res, 400, { error: "Missing query" });
  const digits = rawQuery.replace(/\D/g, "");
  const isPhoneLookup = (digits.length === 10 && digits.startsWith("0")) || (digits.length === 11 && digits.startsWith("66"));
  if (rateLimited(token.uid, isPhoneLookup ? 5 : 15)) return send(res, 429, { error: "Too many searches, please wait a minute" });

  const qClean = rawQuery;
  const qPhone = rawQuery.replace(/[-\s]/g, "");
  const qTrack = rawQuery.replace(/\s/g, "").toUpperCase();
  const phoneValues = [...new Set([rawQuery, qPhone, digits])];
  if (digits.startsWith("0") && digits.length === 10) phoneValues.push(`+66${digits.slice(1)}`, `66${digits.slice(1)}`);
  if (digits.startsWith("66") && digits.length === 11) phoneValues.push(`0${digits.slice(2)}`, `+${digits}`);

  try {
    const db = admin.firestore();
    let results;
    if (mode === "recipient") {
      results = isPhoneLookup
        ? await exactMatches(db, "recipients", [["phone", phoneValues]], true)
        : await exactMatches(db, "recipients", [["fullName", qClean], ["phone", phoneValues]]);
    } else if (isPhoneLookup) {
      // Keep numeric tracking numbers searchable without exposing addresses for them.
      results = await exactMatches(db, "records", [["phone", phoneValues]], true);
      if (!results.length) results = await exactMatches(db, "records", [["trackingNumber", qTrack]]);
    } else {
      results = await exactMatches(db, "records", [["fullName", qClean], ["phone", phoneValues], ["trackingNumber", qTrack]]);
    }

    return send(res, 200, { results });
  } catch (error) {
    console.error("track-lookup failed:", error);
    return send(res, 500, { error: "Lookup failed" });
  }
}
