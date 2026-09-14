const STAFF_ROLES = new Set(['staff', 'admin', 'owner']);

export function validPushEndpoint(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && (
      ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(url.hostname)
      || url.hostname.endsWith('.notify.windows.com')
    );
  } catch { return false; }
}

export async function selectPushRecipients(db, filter = {}) {
  if (filter.targetUserId != null && (typeof filter.targetUserId !== 'string' || !/^[^/]{1,128}$/.test(filter.targetUserId))) throw new Error('Invalid recipient');
  let query = db.collection('push_subscriptions');
  if (filter.targetUserId) query = query.where('uid', '==', filter.targetUserId);
  const snapshot = await query.limit(1001).get();
  if (snapshot.docs.length > 1000) throw new Error('Too many recipients; split this notification into smaller groups');
  const roles = new Map();
  const endpoints = new Set();
  const recipients = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (typeof data.uid !== 'string' || !/^[^/]{1,128}$/.test(data.uid)) continue;
    const sub = data.subscription;
    if (!validPushEndpoint(sub?.endpoint) || endpoints.has(sub.endpoint)) continue;
    if (filter.isStaffOnly) {
      // Never trust a subscription's client-written isStaff or userId fields.
      if (!roles.has(data.uid)) roles.set(data.uid, (await db.doc(`users/${data.uid}`).get()).data()?.role);
      if (!STAFF_ROLES.has(roles.get(data.uid))) continue;
    }
    endpoints.add(sub.endpoint);
    recipients.push(sub);
  }
  return recipients;
}
