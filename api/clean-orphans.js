import admin from "./_firebase-admin.js";

export default async function handler(req, res) {
  try {
    const db = admin.firestore();
    const regsSnap = await db.collection("book_registrations").get();
    
    let deletedCount = 0;
    
    for (const doc of regsSnap.docs) {
      const data = doc.data();
      const campaignId = data.campaignId;
      
      if (campaignId) {
        // Check if campaign still exists
        const campSnap = await db.collection("book_campaigns").doc(campaignId).get();
        if (!campSnap.exists) {
          await doc.ref.delete();
          deletedCount++;
        }
      } else {
        await doc.ref.delete();
        deletedCount++;
      }
    }
    
    res.status(200).json({ success: true, deletedCount });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({ error: error.message });
  }
}
