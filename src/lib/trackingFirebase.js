import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const trackingFirebaseConfig = {
  apiKey: "AIzaSyAqz8d5xKNI-2LRAzFlTURJgYva0hOe3UE",
  authDomain: "talib-trackingnumber.firebaseapp.com",
  projectId: "talib-trackingnumber",
  storageBucket: "talib-trackingnumber.firebasestorage.app",
  messagingSenderId: "495823490887",
  appId: "1:495823490887:web:59062f61596514eb764662",
  measurementId: "G-RTDQS2WN6X",
}

const trackingApp = getApps().find(item => item.name === "talib-tracking")
  || initializeApp(trackingFirebaseConfig, "talib-tracking")

export const trackingDb = getFirestore(trackingApp)
