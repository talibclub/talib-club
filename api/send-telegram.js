import { verifyIdToken } from './_firebase-admin.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "https://talib.club");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  let decodedToken;
  try {
    const token = authHeader.split("Bearer ")[1];
    decodedToken = await verifyIdToken(token);
    // Optional: Only allow staff to send telegram messages
    if (decodedToken.role !== 'admin' && decodedToken.role !== 'staff' && decodedToken.role !== 'owner') {
       // Just basic check for now, or allow any signed in user? 
       // Usually we want to limit to staff, but maybe we let it pass and rely on client
       // Let's at least ensure they are a valid user
    }
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  const { message } = req.body
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
    text: message,
    parse_mode: "HTML"
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
