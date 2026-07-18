import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import admin from "./api/_firebase-admin.js";

async function cleanupOrphanedRegistrations() {
  const db = admin.firestore();
  try {
    console.log("Fetching book_registrations...");
    const regsSnap = await db.collection("book_registrations").get();
    
    let deletedCount = 0;
    
    for (const doc of regsSnap.docs) {
      const data = doc.data();
      const campaignId = data.campaignId;
      
      if (campaignId) {
        // Check if campaign still exists
        const campSnap = await db.collection("book_campaigns").doc(campaignId).get();
        if (!campSnap.exists) {
          console.log(`Deleting orphaned registration ${doc.id} (Campaign ${campaignId} missing)`);
          await doc.ref.delete();
          deletedCount++;
        }
      } else {
        console.log(`Deleting registration ${doc.id} with no campaignId`);
        await doc.ref.delete();
        deletedCount++;
      }
    }
    
    console.log(`Cleanup complete! Deleted ${deletedCount} orphaned registrations.`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

cleanupOrphanedRegistrations();
