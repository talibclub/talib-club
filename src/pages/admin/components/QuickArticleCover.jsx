import { useRef, useState } from 'react';
import ImageWithFallback from '../../../components/ImageWithFallback.jsx';
import { compressImage } from '../../../utils/image.js';
import { getDownloadURL, ref, uploadBytes } from '../../../lib/driveStorage.js';

export default function QuickArticleCover({ article, disabled, saveCover, onBusyChange }) {
  const input = useRef(null);
  const inFlight = useRef(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  async function upload(file) {
    if (!file || disabled || inFlight.current) return;
    if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) {
      setError('เลือกไฟล์ JPG, PNG, WebP, GIF หรือ AVIF');
      return;
    }
    inFlight.current = true;
    setUploading(true); onBusyChange(true); setError(''); setStatus('กำลังอัปโหลด…');
    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
      const target = ref(null, `article_covers/${crypto.randomUUID()}_${compressed.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      await uploadBytes(target, compressed);
      const coverUrl = await getDownloadURL(target);
      setStatus('กำลังบันทึกปก…');
      await saveCover(article, coverUrl);
      setStatus('บันทึกปกแล้ว');
    } catch (err) {
      setStatus(''); setError(err.message || 'บันทึกปกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      inFlight.current = false; setUploading(false); onBusyChange(false);
    }
  }
  return <div style={{ width: 110, flexShrink: 0 }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); upload(event.dataTransfer.files?.[0]); }}>
    <button type="button" disabled={disabled || uploading} onClick={() => input.current?.click()} aria-label={`เปลี่ยนรูปปก ${article.title}`} title="เลือกรูป หรือลากรูปมาวาง — บันทึกปกอัตโนมัติ" style={{ display: 'block', width: '100%', padding: 0, border: '1px solid var(--br2)', borderRadius: 8, overflow: 'hidden', background: 'var(--card)', color: 'var(--text)', cursor: uploading ? 'wait' : 'pointer' }}>
      <ImageWithFallback src={article.coverUrl} alt={article.title} style={{ width: '100%', height: 65, objectFit: 'cover', display: 'block' }} />
      <span style={{ display: 'block', padding: '5px 2px', fontSize: 11 }}>{uploading ? 'กำลังบันทึก…' : 'เปลี่ยนรูปปก'}</span>
    </button>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" style={{ display: 'none' }} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; upload(file); }} />
    <div role={error ? 'alert' : 'status'} style={{ fontSize: 10, marginTop: 4, color: error ? '#b42318' : 'var(--teal)', overflowWrap: 'anywhere' }}>{error || status}</div>
  </div>;
}
