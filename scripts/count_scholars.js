import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const defaultWebFirebaseConfig = {
  apiKey: "AIzaSyC8HoWaAu0XWy3he_pMxqUIWwREDPdeUpg",
  authDomain: "talib-club-web.firebaseapp.com",
  projectId: "talib-club-web",
  storageBucket: "talib-club-web.firebasestorage.app",
  messagingSenderId: "300903382422",
  appId: "1:300903382422:web:887e6f03a6c4f0092db1b7",
  measurementId: "G-CQ5R964GMN",
};

const app = initializeApp(defaultWebFirebaseConfig);
const db = getFirestore(app);

async function count() {
  const snapshot = await getDocs(collection(db, "content_scholars"));
  console.log("Total scholars in Firestore content_scholars collection:", snapshot.size);
  if (snapshot.size > 0) {
    console.log("Sample 5 scholars:");
    snapshot.docs.slice(0, 5).forEach((d, i) => {
      console.log(`[${i + 1}]`, JSON.stringify(d.data()));
    });
  }
}

count().catch(console.error);
