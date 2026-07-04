import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const trackingFirebaseConfig = {
  apiKey: import.meta.env.VITE_TRACKING_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_TRACKING_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_TRACKING_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_TRACKING_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_TRACKING_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_TRACKING_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_TRACKING_FIREBASE_MEASUREMENT_ID || "",
}

if (!trackingFirebaseConfig.apiKey || !trackingFirebaseConfig.projectId) {
  console.warn("[TrackingFirebase] Missing VITE_TRACKING_FIREBASE_* environment variables.")
}

const trackingApp = getApps().find(item => item.name === "talib-tracking")
  || initializeApp(trackingFirebaseConfig, "talib-tracking")

export const trackingDb = getFirestore(trackingApp)

