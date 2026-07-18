import webpush from 'web-push';
import admin, { verifyIdToken } from './_firebase-admin.js';

const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// C5: Restrict CORS to actual domain instead of wildcard
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://talibclub.org';
const STAFF_ROLES = new Set(['staff', 'admin', 'owner']);

function setCorsHeaders(res) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:contact@talib.club',
    publicKey,
    privateKey
  );
}

async function requireStaff(idToken) {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  if (!uid) {
    const err = new Error('Unauthorized: Invalid authentication token');
    err.status = 401;
    throw err;
  }

  const userSnap = await admin.firestore().doc(`users/${uid}`).get();
  const role = userSnap.exists ? userSnap.data()?.role : null;
  if (!STAFF_ROLES.has(role)) {
    const err = new Error('Forbidden: Staff access required');
    err.status = 403;
    throw err;
  }

  return decodedToken;
}

export default async function handler(req, res) {
  // Support standard Vercel response formatting
  const sendResponse = (status, data) => {
    if (typeof res.status === 'function') {
      return res.status(status).json(data);
    } else {
      // Netlify function response format fallback
      return {
        statusCode: status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(data)
      };
    }
  };

  setCorsHeaders(res);

  if (!publicKey || !privateKey) {
    return sendResponse(500, { error: 'Push notification service is not configured (missing VAPID keys)' });
  }

  // Handle Netlify HTTP parser vs Vercel req.body parser
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // Ignore invalid JSON bodies; validation below will reject missing fields.
    }
  }

  const method = req.method || (req.httpMethod); // Vercel vs Netlify

  if (method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    } else {
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } };
    }
  }

  if (method !== 'POST') {
    return sendResponse(405, { error: 'Method Not Allowed' });
  }

  // C4: Authenticate the request
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  let idToken = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    idToken = authHeader.substring(7);
  }
  if (!idToken) {
    return sendResponse(401, { error: 'Unauthorized: Missing authentication token' });
  }
  try {
    await requireStaff(idToken);
  } catch (err) {
    return sendResponse(err.status || 401, { error: err.message || 'Unauthorized: Invalid authentication token' });
  }

  const { subscriptions, payload } = body || {};

  if (!subscriptions || !Array.isArray(subscriptions) || !payload) {
    return sendResponse(400, { error: 'Missing subscriptions or payload' });
  }

  const payloadString = JSON.stringify(payload);

  // M12: Use Promise.allSettled instead of concurrent push to shared array
  const settled = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      await webpush.sendNotification(sub, payloadString);
      return { endpoint: sub.endpoint, success: true };
    })
  );

  const results = settled.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error('Error sending push to endpoint:', subscriptions[i]?.endpoint, result.reason);
    return { endpoint: subscriptions[i]?.endpoint, success: false, error: result.reason?.message };
  });

  return sendResponse(200, { success: true, results });
}
