import { useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from '../lib/driveStorage.js';
import { compressImage } from '../utils/image.js';

export default function DriveUploadButton({ prefix, accept, onUploaded, onBusyChange, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(event) {
    const original = event.target.files?.[0];
    event.target.value = '';
    if (!original) return;
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      const file = original.type.startsWith('image/')
        ? await compressImage(original, { maxWidth: 1400, maxHeight: 1400, quality: 0.8 }) : original;
      const target = ref(null, `${prefix}/${Date.now()}_${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      await uploadBytes(target, file);
      onUploaded(await getDownloadURL(target));
    } catch (err) { setError(err.message || 'อัปโหลดไม่สำเร็จ'); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <div>
    <label className="btn btn-outline" style={{ cursor: busy ? 'wait' : 'pointer', marginTop: 8 }}>
      {busy ? 'กำลังอัปโหลดไป Google Drive…' : 'อัปโหลดไป Google Drive'}
      <input type="file" accept={accept} disabled={busy || disabled} onChange={upload} style={{ display: 'none' }} />
    </label>
    {error && <p role="alert" style={{ color: '#b42318', fontSize: 13 }}>{error}</p>}
  </div>;
}
