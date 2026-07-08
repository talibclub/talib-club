import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { app as mainApp, db as mainDb } from "./firebase.js"

const trackingFirebaseConfig = {
  apiKey: import.meta.env.VITE_TRACKING_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_TRACKING_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_TRACKING_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_TRACKING_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_TRACKING_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_TRACKING_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_TRACKING_FIREBASE_MEASUREMENT_ID || "",
}

const hasTrackingConfig = Boolean(trackingFirebaseConfig.apiKey && trackingFirebaseConfig.projectId);

if (!hasTrackingConfig) {
  console.info("[TrackingFirebase] No separate tracking config found. Falling back to main Firebase database.")
}

export const trackingApp = hasTrackingConfig 
  ? (getApps().find(item => item.name === "talib-tracking") || initializeApp(trackingFirebaseConfig, "talib-tracking"))
  : mainApp;

export const trackingDb = hasTrackingConfig ? getFirestore(trackingApp) : mainDb;
