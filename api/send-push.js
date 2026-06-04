import webpush from 'web-push';

const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:contact@talib.club',
    publicKey,
    privateKey
  );
}

export default async function handler(req, res) {
  // Support standard Vercel response formatting
  const sendResponse = (status, data) => {
    if (typeof res.status === 'function') {
      return res.status(status).json(data);
    } else {
      // Netlify function response format fallback (in case it is executed as a lambda)
      return {
        statusCode: status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify(data)
      };
    }
  };

  if (!publicKey || !privateKey) {
    return sendResponse(500, { error: 'Push notification service is not configured (missing VAPID keys)' });
  }

  // CORS Headers for Vercel
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle Netlify HTTP parser vs Vercel req.body parser
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // ignore
    }
  }

  const method = req.method || (req.httpMethod); // Vercel vs Netlify

  if (method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    } else {
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } };
    }
  }

  if (method !== 'POST') {
    return sendResponse(405, { error: 'Method Not Allowed' });
  }

  const { subscriptions, payload } = body || {};

  if (!subscriptions || !Array.isArray(subscriptions) || !payload) {
    return sendResponse(400, { error: 'Missing subscriptions or payload' });
  }

  const payloadString = JSON.stringify(payload);
  const results = [];

  const promises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, payloadString);
      results.push({ endpoint: sub.endpoint, success: true });
    } catch (err) {
      console.error('Error sending push to endpoint:', sub.endpoint, err);
      results.push({ endpoint: sub.endpoint, success: false, error: err.message });
    }
  });

  await Promise.all(promises);

  return sendResponse(200, { success: true, results });
}
