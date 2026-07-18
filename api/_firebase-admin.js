import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    } else {
      initializeApp();
    }
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export const getAdminFirestore = () => getFirestore();

export const verifyIdToken = async (token) => {
  if (!token) throw new Error("No token provided");
  return getAuth().verifyIdToken(token);
};

// Compatibility surface for existing API handlers while using Firebase Admin's ESM-safe APIs.
const firestore = () => getFirestore();
firestore.FieldValue = FieldValue;
firestore.Timestamp = Timestamp;

export default {
  auth: () => getAuth(),
  firestore,
  verifyIdToken,
  getAdminFirestore,
};
