import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const webFirebaseConfig = {
  apiKey: import.meta.env.VITE_WEB_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_WEB_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_WEB_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_WEB_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_WEB_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_WEB_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_WEB_FIREBASE_MEASUREMENT_ID || "",
}

const hasWebFirebase = Boolean(webFirebaseConfig.apiKey && webFirebaseConfig.projectId && webFirebaseConfig.appId)
if (!hasWebFirebase) {
  console.warn("[Firebase] Missing VITE_WEB_FIREBASE_* environment variables. Firebase services will not work correctly.")
}
const firebaseConfig = webFirebaseConfig

export const app = getApps().find(item => item.name === "talib-web")
  || initializeApp(firebaseConfig, "talib-web")

export const auth = getAuth(app)

// Initialize firestore with persistent multi-tab cache
let firestoreInstance
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  })
} catch (e) {
  firestoreInstance = getFirestore(app)
}

export const db = firestoreInstance
export const storage = getStorage(app)
export const isUsingFallbackFirebase = !hasWebFirebase
