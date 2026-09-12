import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

// One stable session ID makes retries safe even when the commit response is lost.
export async function commitReadingSession({ db, uid, sessionId, session, shelfId, seconds, gems, progress, normalizeStreakSettings }) {
  const sessionRef = doc(db, 'content_reading_sessions', sessionId);
  const shelfRef = doc(db, 'content_bookshelf', shelfId);
  const streakRef = doc(db, 'content_reading_streaks', uid);
  return runTransaction(db, async (tx) => {
    const existing = await tx.get(sessionRef);
    if (existing.exists()) return;
    const shelfSnap = await tx.get(shelfRef);
    const streakSnap = await tx.get(streakRef);
    if (!shelfSnap.exists() || shelfSnap.data().deleted || shelfSnap.data().uid !== uid) {
      throw new Error('ไม่พบหนังสือในชั้น กรุณาเปิดห้องอ่านหนังสือใหม่');
    }
    const shelf = shelfSnap.data();
    const streak = normalizeStreakSettings(streakSnap.exists() ? streakSnap.data() : null, uid);
    const nextProgress = Math.max(Number(shelf.progress || 0), progress);
    tx.set(sessionRef, { ...session, id: sessionId, deleted: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    tx.set(streakRef, { ...streak, gems: Number(streak.gems || 0) + gems, deleted: false, updatedAt: serverTimestamp() }, { merge: true });
    tx.update(shelfRef, {
      progress: nextProgress,
      currentPage: Math.max(Number(shelf.currentPage || 0), session.endPage),
      status: nextProgress >= 100 ? 'finished' : 'reading',
      totalReadSeconds: Number(shelf.totalReadSeconds || 0) + seconds,
      verifiedSessions: Number(shelf.verifiedSessions || 0) + 1,
      lastReadAt: session.completedAt,
      lastVerificationScore: session.verificationScore,
      updatedAt: serverTimestamp(),
    });
  });
}
