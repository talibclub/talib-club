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

async function search() {
  const snapshot = await getDocs(collection(db, "content_scholars"));
  const names = ['อัจลูนี', 'สุยูฏี', 'ซัรกะชี'];
  console.log("Searching among", snapshot.size, "scholars in Firestore...");
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const name = data.name || "";
    names.forEach(n => {
      if (name.includes(n)) {
        console.log(`Found:`, JSON.stringify(data));
      }
    });
  });
}

search().catch(console.error);
