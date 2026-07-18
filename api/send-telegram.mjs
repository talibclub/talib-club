import admin, { verifyIdToken } from './_firebase-admin.mjs';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://talibclub.org";
const STAFF_ROLES = new Set(["staff", "admin", "owner"]);

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

async function requireStaff(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Unauthorized: Missing token");
    err.status = 401;
    throw err;
  }

  const decodedToken = await verifyIdToken(authHeader.substring(7));
  const userSnap = await admin.firestore().doc(`users/${decodedToken.uid}`).get();
  const role = userSnap.exists ? userSnap.data()?.role : null;
  if (!STAFF_ROLES.has(role)) {
    const err = new Error("Forbidden: Staff access required");
    err.status = 403;
    throw err;
  }

  return decodedToken;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    await requireStaff(req);
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }

  const { message } = parseBody(req)
  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  const topicId = process.env.TELEGRAM_TOPIC_ID

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Telegram configuration is missing on server' })
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
  const payload = {
    chat_id: chatId,
    text: String(message).slice(0, 3500)
  }

  if (topicId) {
    payload.message_thread_id = topicId
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Telegram API Error:", errorData)
      return res.status(502).json({ error: 'Failed to send message to Telegram', details: errorData })
    }

    const data = await response.json()
    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("Telegram API Request Error:", error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
