import { fail, pathKey, policy } from './_drive-policy.js';

export async function notebookVersions(db, user, body) {
  policy(body.path, user);
  if (!/^notebooks\/[^/]+\/[^/]+\.json\.gz$/.test(body.path)) throw fail(400, 'รองรับเฉพาะสมุดโน้ต');
  const pathRef = db.doc(`_drivePaths/${pathKey(body.path)}`);
  return db.runTransaction(async tx => {
    const current = (await tx.get(pathRef)).data();
    if (!current?.fileId) throw fail(404, 'ยังไม่มีสมุดบนคลาวด์');
    const versions = [];
    for (const id of [current.fileId, current.previousFileId].filter(Boolean)) {
      const file = (await tx.get(db.doc(`_driveFiles/${id}`))).data();
      if (!file || file.owner !== user.uid || file.path !== body.path || file.access !== 'owner' || !file.completed || file.deleted) continue;
      versions.push({ id, at: file.createdAt || null, current: id === current.fileId });
    }
    if (body.action === 'restore-notebook') {
      if (body.expectedFileId !== current.fileId || body.fileId !== current.previousFileId) throw fail(409, 'มีการบันทึกใหม่ กรุณาเปิดประวัติอีกครั้ง');
      if (!versions.some(version => version.id === body.fileId)) throw fail(404, 'ไม่พบฉบับก่อนหน้าที่กู้คืนได้');
      // Swap pointers atomically. The replaced current version remains recoverable.
      tx.set(pathRef, { ...current, fileId: current.previousFileId, previousFileId: current.fileId });
      return { restored: true };
    }
    return { versions, currentFileId: current.fileId };
  });
}
