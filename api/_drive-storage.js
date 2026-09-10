import { randomUUID } from 'node:crypto';
import { database, driveFetch, identify, sameOrigin, sendError } from './_drive.js';
import { fail, pathKey, policy, validateUpload } from './_drive-policy.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  try {
    sameOrigin(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (body.action === 'logout') {
      res.setHeader('Set-Cookie', `talib_drive_auth=; Path=/api/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
      return res.json({ ok: true });
    }
    // Mutations always require a bearer token, not just a browser cookie.
    if (!req.headers.authorization?.startsWith('Bearer ')) throw fail(401, 'กรุณาเข้าสู่ระบบ');
    const user = await identify(req);
    if (body.action === 'session') {
      res.setHeader('Set-Cookie', `talib_drive_auth=${user.token}; Path=/api/; HttpOnly; SameSite=Lax; Max-Age=3500${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
      return res.json({ ok: true });
    }
    const db = database();
    if (body.action === 'init') {
      const { path, size, type } = body;
      const rules = validateUpload(path, user, size, type);
      const key = pathKey(path);
      const current = await db.doc(`_drivePaths/${key}`).get();
      const version = current.data()?.fileId || null;
      const day = new Date().toISOString().slice(0, 10);
      const quotaRef = db.doc(`_driveUsage/${user.uid}_${day}`);
      // Reserve quota before creating upload sessions; repeated abandoned uploads
      // also count, so a member cannot fill the owner's Drive with orphan files.
      await db.runTransaction(async tx => {
        const usage = (await tx.get(quotaRef)).data() || {};
        const max = ['staff', 'admin', 'owner'].includes(user.role) ? 2 * 1024 ** 3 : 250 * 1024 ** 2;
        if ((usage.bytes || 0) + size > max || (usage.count || 0) >= 300) throw fail(429, 'ถึงโควตาอัปโหลดรายวัน กรุณาลองใหม่วันถัดไป');
        tx.set(quotaRef, { bytes: (usage.bytes || 0) + size, count: (usage.count || 0) + 1 });
      });
      const ids = await (await driveFetch('drive/v3/files/generateIds?count=1&space=drive')).json();
      const fileId = ids.ids[0];
      const uploadId = randomUUID();
      const response = await driveFetch('upload/drive/v3/files?uploadType=resumable', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Upload-Content-Type': type, 'X-Upload-Content-Length': String(size) },
        body: JSON.stringify({ id: fileId, name: path.split('/').pop(), parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], mimeType: type, appProperties: { talibPath: key, talibUpload: uploadId } }),
      });
      const sessionUrl = response.headers.get('location');
      if (!sessionUrl?.startsWith('https://www.googleapis.com/upload/drive/')) throw fail(502, 'ไม่สามารถเริ่มอัปโหลดได้');
      await db.doc(`_driveUploads/${uploadId}`).set({ fileId, key, path, size, type, ...rules, uploader: user.uid, version, createdAt: Date.now() });
      return res.json({ uploadId, sessionUrl });
    }
    if (body.action === 'complete') {
      if (!/^[a-f0-9-]{36}$/.test(body.uploadId || '')) throw fail(400, 'Invalid upload');
      const pendingRef = db.doc(`_driveUploads/${body.uploadId}`);
      const pending = (await pendingRef.get()).data();
      if (!pending || pending.uploader !== user.uid) throw fail(404, 'ไม่พบรายการอัปโหลด');
      if (pending.completed) return res.json({ fileId: pending.fileId });
      if (Date.now() - pending.createdAt > 24 * 60 * 60 * 1000) throw fail(410, 'รายการอัปโหลดหมดอายุ กรุณาลองใหม่');
      policy(pending.path, user);
      const remote = await (await driveFetch(`drive/v3/files/${pending.fileId}?fields=id,size,mimeType,parents,appProperties,trashed`)).json();
      if (remote.trashed || Number(remote.size) !== pending.size || remote.mimeType !== pending.type ||
          !remote.parents?.includes(process.env.GOOGLE_DRIVE_FOLDER_ID) || remote.appProperties?.talibUpload !== body.uploadId) {
        throw fail(409, 'ข้อมูลไฟล์ที่อัปโหลดไม่ตรงกัน');
      }
      // Publish only fully uploaded files. Compare-and-swap avoids silently
      // overwriting a notebook saved by another device while uploading.
      let obsoleteFileId;
      await db.runTransaction(async tx => {
        const pathRef = db.doc(`_drivePaths/${pending.key}`);
        const current = (await tx.get(pathRef)).data();
        if (current?.fileId === pending.fileId) return;
        if ((current?.fileId || null) !== pending.version) throw fail(409, 'ไฟล์ถูกแก้ไขจากอุปกรณ์อื่น กรุณาโหลดข้อมูลล่าสุดก่อนบันทึก');
        tx.set(db.doc(`_driveFiles/${pending.fileId}`), { ...pending, completed: true });
        obsoleteFileId = current?.previousFileId;
        tx.set(pathRef, { fileId: pending.fileId, path: pending.path, previousFileId: current?.fileId || null });
        tx.update(pendingRef, { completed: true });
      });
      // Notebook autosave retains the current and one previous generation.
      // Only app-created older generations are removed, after a successful commit.
      if (obsoleteFileId && /^notebooks\/[^/]+\/[^/]+\.json\.gz$/.test(pending.path)) {
        try {
          await driveFetch(`drive/v3/files/${obsoleteFileId}`, { method: 'DELETE' });
          await db.doc(`_driveFiles/${obsoleteFileId}`).set({ deleted: true }, { merge: true });
        } catch { /* A cleanup failure must not turn a completed save into a failure. */ }
      }
      return res.json({ fileId: pending.fileId });
    }
    if (body.action === 'lookup' || body.action === 'delete') {
      policy(body.path, user);
      const pathRef = db.doc(`_drivePaths/${pathKey(body.path)}`);
      const current = (await pathRef.get()).data();
      if (!current) throw fail(404, 'ไม่พบไฟล์ใน Google Drive',
        body.path.startsWith('notebooks/') && process.env.GOOGLE_DRIVE_LEGACY_NOTEBOOKS_MIGRATED === 'true'
          ? 'drive/new-notebook' : 'storage/object-not-found');
      if (body.action === 'delete') {
        // Remove access first; a failed Drive trash request is safe to retry.
        await db.doc(`_driveFiles/${current.fileId}`).set({ deleted: true }, { merge: true });
        await driveFetch(`drive/v3/files/${current.fileId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trashed: true }) });
        await db.runTransaction(async tx => {
          const latest = (await tx.get(pathRef)).data();
          if (latest?.fileId === current.fileId) tx.delete(pathRef);
        });
      }
      return res.json({ fileId: current.fileId });
    }
    throw fail(400, 'Unknown action');
  } catch (error) { return sendError(res, error); }
}
