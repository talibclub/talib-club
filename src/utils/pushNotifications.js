import { collection, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../lib/firebase.js"

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Stable, collision-free Firestore document id for a push endpoint.
 *
 * This used to be `btoa(endpoint).slice(0, 50)`, which was broken twice over:
 *
 *  - 50 base64 characters encode only ~37 bytes of the endpoint, and every
 *    Chrome/Android endpoint starts with the same 36-character prefix
 *    ("https://fcm.googleapis.com/fcm/send/"). The id therefore varied by a
 *    single character, so the entire Chrome user base collapsed onto ~64 ids.
 *    Whoever subscribed second hit an existing document owned by somebody else,
 *    the `ownsExistingDocument()` rule rejected the write, the error was caught
 *    and swallowed — and their device silently never received a notification.
 *  - base64 also emits "/", which Firestore reads as a path separator in a
 *    document id.
 *
 * SHA-256 hex is fixed length, uses only [0-9a-f], and derives from the WHOLE
 * endpoint, so two devices can never land on the same row.
 */
async function getSubscriptionId(endpoint) {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Gets the current notification permission and active subscription status
 */
export async function getPushSubscriptionState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
    return { supported: false, permission: 'denied', subscribed: false };
  }

  const permission = Notification.permission;
  if (permission !== 'granted') {
    return { supported: true, permission, subscribed: false };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return {
      supported: true,
      permission,
      subscribed: !!subscription,
      subscription
    };
  } catch (err) {
    console.error('Error getting subscription state:', err);
    return { supported: true, permission, subscribed: false };
  }
}

/**
 * Requests notification permissions and registers the push subscription in Firestore
 */
export async function subscribeToPushNotifications(userId = null, isStaff = false) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
    throw new Error('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือนแบบพุช');
  }

  // 1. Request Permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('ผู้ใช้ปฏิเสธการอนุญาตการแจ้งเตือน');
  }

  // 2. Register / Get active service worker
  const registration = await navigator.serviceWorker.ready;
  
  // 3. Subscribe to Push Manager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  // 4. Save to Firestore
  const subscriptionJson = subscription.toJSON();
  const subId = await getSubscriptionId(subscription.endpoint);

  const effectiveUid = userId || auth.currentUser?.uid || null;
  if (!effectiveUid) {
    throw new Error('กรุณาล็อกอินก่อนเปิดรับการแจ้งเตือน');
  }
  const docData = {
    subscription: subscriptionJson,
    endpoint: subscription.endpoint,
    uid: effectiveUid,
    userId: effectiveUid,
    isStaff: !!isStaff,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "push_subscriptions", subId), docData);
    if (import.meta.env.DEV) console.log('Push subscription saved successfully:', subId);
    return subscription;
  } catch (err) {
    console.error('Failed to save push subscription to Firestore:', err);
    // Even if firestore fails, return subscription to UI
    return subscription;
  }
}

/**
 * Unsubscribes from push notifications and removes the registry from Firestore
 */
export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const subId = await getSubscriptionId(subscription.endpoint);
      await subscription.unsubscribe();
      
      try {
        await deleteDoc(doc(db, "push_subscriptions", subId));
        if (import.meta.env.DEV) console.log('Push subscription deleted from Firestore:', subId);
      } catch (err) {
        console.error('Failed to delete subscription from Firestore:', err);
      }
    }
  } catch (err) {
    console.error('Error during unsubscribe:', err);
    throw err;
  }
}

/**
 * Dispatches a push notification via the serverless helper API
 */
export async function triggerPushNotification(title, body, url = '/', filterOptions = {}) {
  try {
    // 1. Fetch subscriptions from Firestore based on filters
    const subscriptionsRef = collection(db, "push_subscriptions");
    let q = query(subscriptionsRef);

    if (filterOptions.isStaffOnly) {
      q = query(subscriptionsRef, where("isStaff", "==", true));
    } else if (filterOptions.targetUserId) {
      q = query(subscriptionsRef, where("userId", "==", filterOptions.targetUserId));
    }

    const querySnapshot = await getDocs(q);
    const subscriptions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.subscription) {
        subscriptions.push(data.subscription);
      }
    });

    if (subscriptions.length === 0) {
      if (import.meta.env.DEV) console.log('No subscribers found matching the filters.');
      return { success: true, count: 0 };
    }

    // 2. Post to API
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscriptions,
        payload: { title, body, url }
      })
    });

    const result = await response.json();
    if (import.meta.env.DEV) console.log('Push trigger response:', result);
    return { success: result.success, count: subscriptions.length, results: result.results };
  } catch (err) {
    console.error('Failed to trigger push notifications:', err);
    return { success: false, error: err.message };
  }
}
