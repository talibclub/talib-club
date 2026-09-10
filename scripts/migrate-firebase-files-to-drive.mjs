import { mkdir, writeFile } from 'node:fs/promises';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'node:crypto';
import { database, driveFetch } from '../api/_drive.js';
import { pathKey, policy } from '../api/_drive-policy.js';

// Dry-run by default. Requires both Firebase Admin and the owner's Drive OAuth
// credentials. No deletions in Firebase and no automatic public Drive sharing.
const apply = process.argv.includes('--apply');
const bucketName = process.env.VITE_WEB_FIREBASE_STORAGE_BUCKET;
const origin = process.env.ALLOWED_ORIGIN || 'https://talibclub.org';
if (!bucketName) throw new Error('Set VITE_WEB_FIREBASE_STORAGE_BUCKET to the original Firebase bucket.');
const db = database();
const bucket = getStorage().bucket(bucketName);
const report = { mode: apply ? 'apply' : 'dry-run', migrated: [], skipped: [], failed: [], updatedDocuments: [] };
const urls = new Map();
const publicCoverPaths = new Set();
const existingPaths = new Map((await db.collection('_drivePaths').get()).docs.map(doc => [doc.id, doc.data()]));

// Historical imports used a separate prefix. Only treat these objects as
// public when a public content collection actually references them as covers.
for (const name of ['content_books', 'content_articles', 'content_media', 'book_campaigns']) {
  const snapshot = await db.collection(name).select('coverUrl').get();
  for (const doc of snapshot.docs) {
    const path = legacyPath(doc.data().coverUrl);
    if (path) publicCoverPaths.add(path);
  }
}

function accessFor(path) {
  const prefix = path.split('/')[0];
  if (prefix === 'migrated_covers' && publicCoverPaths.has(path)) return { access: 'public', owner: 'migration', imageOnly: true };
  if (prefix === 'user_pdfs' && path.split('/').length >= 3) return { access: 'owner', owner: path.split('/')[1] };
  const uid = prefix === 'slips' ? path.split('/')[1].split('_')[0]
    : ['notebooks', 'members', 'user_audio'].includes(prefix) ? path.split('/')[1] : 'migration';
  return policy(path, { uid, role: 'owner' });
}
function legacyPath(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.hostname !== 'firebasestorage.googleapis.com') return null;
    const match = /^\/v0\/b\/([^/]+)\/o\/(.+)$/.exec(url.pathname);
    if (!match || decodeURIComponent(match[1]) !== bucketName) return null;
    return decodeURIComponent(match[2]);
  } catch { return null; }
}
function replaceUrls(value) {
  const path = legacyPath(value);
  if (path && urls.has(path)) return urls.get(path);
  if (Array.isArray(value)) return value.map(replaceUrls);
  if (value && Object.getPrototypeOf(value) === Object.prototype) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceUrls(item)]));
  return value;
}

// Inventory first: a billing/permission error must abort, never imply an empty
// bucket. Migrate all supported objects, including path-based notebook JSON.
let files;
try { [files] = await bucket.getFiles(); }
catch (error) {
  console.error(`Cannot read the original Firebase bucket (status ${error.code || 'unknown'}). No files or database records were changed. Restore read access or re-upload originals.`);
  process.exit(1);
}
if (apply) await mkdir('backup_data/drive-migration', { recursive: true });
for (const file of files) {
  if (file.name.endsWith('/')) continue;
  try {
    let access;
    try { access = accessFor(file.name); } catch { report.skipped.push({ path: file.name, reason: 'Unknown/private legacy prefix; review manually' }); continue; }
    const key = pathKey(file.name);
    const current = existingPaths.get(key);
    if (current) { urls.set(file.name, `${origin}/api/files?id=${current.fileId}`); continue; }
    if (!apply) { report.migrated.push({ path: file.name, planned: true, access: access.access }); continue; }
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size);
    const type = metadata.contentType || 'application/octet-stream';
    if (!Number.isSafeInteger(size) || size <= 0) throw new Error('Invalid object size');
    const generated = await (await driveFetch('drive/v3/files/generateIds?count=1&space=drive')).json();
    const id = generated.ids[0];
    const uploadId = randomUUID();
    const init = await driveFetch('upload/drive/v3/files?uploadType=resumable', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Upload-Content-Length': String(size), 'X-Upload-Content-Type': type },
      body: JSON.stringify({ id, name: file.name.split('/').pop(), parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], mimeType: type, appProperties: { talibPath: key, talibUpload: uploadId } }),
    });
    const session = init.headers.get('location');
    if (!session?.startsWith('https://www.googleapis.com/upload/drive/')) throw new Error('Invalid upload session');
    // Raw stored bytes, especially .json.gz, must not be transparently decoded.
    const uploaded = await fetch(session, { method: 'PUT', headers: { 'Content-Type': type, 'Content-Length': String(size) }, body: file.createReadStream({ decompress: false }), duplex: 'half' });
    if (!uploaded.ok) throw new Error(`Upload failed (${uploaded.status})`);
    const verified = await (await driveFetch(`drive/v3/files/${id}?fields=size`)).json();
    if (Number(verified.size) !== size) throw new Error('Size mismatch');
    await db.runTransaction(async tx => {
      const target = db.doc(`_drivePaths/${key}`);
      if ((await tx.get(target)).exists) throw new Error('Path changed during migration; rerun');
      tx.set(db.doc(`_driveFiles/${id}`), { fileId: id, path: file.name, key, size, type, ...access, completed: true, migrated: true, createdAt: Date.now() });
      tx.set(target, { fileId: id, path: file.name });
    });
    urls.set(file.name, `${origin}/api/files?id=${id}`);
    report.migrated.push({ path: file.name, fileId: id });
  } catch (error) { report.failed.push({ path: file.name, error: error.message }); }
}

async function visit(collection) {
  const docs = await collection.get();
  for (const snap of docs.docs) {
    if (apply) {
      const before = snap.data();
      const after = replaceUrls(before);
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        await writeFile(`backup_data/drive-migration/${pathKey(snap.ref.path)}.json`, JSON.stringify({ path: snap.ref.path, before }, null, 2), { mode: 0o600 });
        await db.runTransaction(async tx => {
          const latest = await tx.get(snap.ref);
          if (!latest.updateTime.isEqual(snap.updateTime)) throw new Error(`Document changed during migration: ${snap.ref.path}`);
          tx.set(snap.ref, after);
        });
        report.updatedDocuments.push(snap.ref.path);
      }
    }
    for (const child of await snap.ref.listCollections()) await visit(child);
  }
}
try {
  if (apply) for (const collection of await db.listCollections()) {
    if (!collection.id.startsWith('_drive')) await visit(collection);
  }
} catch (error) { report.failed.push({ stage: 'Firestore URL replacement', error: error.message }); }
await writeFile('drive-migration-report.json', JSON.stringify(report, null, 2), { mode: 0o600 });
console.log(`${report.mode}: ${report.migrated.length} files, ${report.skipped.length} skipped, ${report.failed.length} failed. Review drive-migration-report.json.`);
if (report.failed.length) process.exitCode = 1;
