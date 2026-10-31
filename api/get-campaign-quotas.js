import admin from "./_firebase-admin.js";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://talibclub.org";

function send(res, status, data) {
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-store, max-age=0");
  }
  if (typeof res.status === "function") return res.status(status).json(data);
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "no-store, max-age=0",
    },
    body: JSON.stringify(data),
  };
}

export default async function handler(req, res) {
  const method = req.method || req.httpMethod;
  if (method === "OPTIONS") return send(res, 200, { ok: true });
  if (method !== "GET") return send(res, 405, { error: "Method Not Allowed" });

  try {
    const db = admin.firestore();
    const campaignsSnap = await db.collection("book_campaigns").where("status", "==", "active").get();
    
    const quotas = {};
    const nowMs = Date.now();

    await Promise.all(campaignsSnap.docs.map(async (doc) => {
      const campaign = doc.data();
      const quota = Number(campaign.quota || 0);
      
      const [holdsSnap, registrationsSnap] = await Promise.all([
        db.collection(`book_campaigns/${doc.id}/holds`).get(),
        db.collection("book_registrations").where("campaignId", "==", doc.id).get(),
      ]);
      
      let activeCount = 0;
      // Registrations are the source of truth for completed quota. Old admin
      // deletions could leave completed hold documents behind indefinitely.
      const completedCount = registrationsSnap.size;
      
      holdsSnap.forEach(holdDoc => {
        const d = holdDoc.data();
        const expiryMs = d.expiresAt?.toMillis?.() ?? (d.expiresAt instanceof Date ? d.expiresAt.getTime() : Number(d.expiresAt));
        if (d.status === "reserved" && Number.isFinite(expiryMs) && expiryMs > nowMs) {
          activeCount++;
        }
      });
      
      quotas[doc.id] = {
        total: quota,
        used: activeCount + completedCount,
        remaining: Math.max(0, quota - (activeCount + completedCount)),
        activeHolds: activeCount,
        completed: completedCount
      };
    }));

    return send(res, 200, quotas);
  } catch (error) {
    console.error("get-campaign-quotas failed:", error);
    return send(res, 500, { error: "Internal Server Error" });
  }
}
