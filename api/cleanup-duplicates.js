import admin from "./_firebase-admin.js";

export default async function handler(req, res) {
  try {
    const db = admin.firestore();
    let deletedCount = 0;
    const logs = [];
    
    // We will clean up these collections
    const collections = [
      "content_articles",
      "content_library",
      "content_scholars",
      "content_media",
      "book_campaigns"
    ];

    for (const col of collections) {
      const snap = await db.collection(col).get();
      const seenTitles = {};
      const batch = db.batch();
      let operations = 0;

      // Sort by ID so we keep the lowest ID (e.g. keep "1", delete "2")
      // Since IDs are strings of numbers, we parse them for sorting.
      const docs = snap.docs.sort((a, b) => {
        const numA = parseInt(a.id, 10);
        const numB = parseInt(b.id, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return a.id.localeCompare(b.id);
      });

      for (const doc of docs) {
        const data = doc.data();
        const title = data.title || data.name || data.originalTitle || data.id;
        
        if (!title) continue;

        if (seenTitles[title]) {
          // It's a duplicate, delete it
          batch.delete(doc.ref);
          operations++;
          deletedCount++;
          logs.push(`Deleted duplicate [${col}] ID: ${doc.id}, Title: ${title}`);
        } else {
          seenTitles[title] = true;
        }

        if (operations >= 400) {
          await batch.commit();
          operations = 0;
        }
      }

      if (operations > 0) {
        await batch.commit();
      }
    }

    // Also update content_meta to force refresh
    await db.collection("site_settings").doc("content_meta").set({
      lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      forceRefresh: true
    }, { merge: true });

    res.status(200).json({
      success: true,
      deletedCount,
      logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
