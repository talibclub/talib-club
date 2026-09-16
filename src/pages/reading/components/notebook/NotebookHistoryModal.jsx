import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getNotebookHistory } from '../../../../lib/driveStorage.js';

export default function NotebookHistoryModal({ uid, notebookId, onRestore, onClose, readonly }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const panel = useRef(null);
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    getNotebookHistory(uid, notebookId).then(result => { if (active) setData(result); })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [uid, notebookId, retry]);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  const restore = async () => {
    setBusy(true); setError('');
    try { await onRestore(selected, data.currentFileId); onClose(); }
    catch (err) { setError(err.message); setSelected(null); }
    finally { setBusy(false); }
  };
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="notebook-history-title"
        onKeyDown={e => {
          if (e.key === 'Escape' && !busy) onClose();
          if (e.key === 'Tab') {
            const buttons = [...panel.current.querySelectorAll('button:not(:disabled)')];
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (!first) e.preventDefault();
            else if (e.shiftKey && [first, panel.current].includes(document.activeElement)) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && [last, panel.current].includes(document.activeElement)) { e.preventDefault(); first.focus(); }
          }
        }} style={{ background: 'white', color: '#111827', borderRadius: 18, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90dvh', overflowY: 'auto' }}>
        <h3 id="notebook-history-title">ประวัติสมุดบนคลาวด์</h3>
        <p style={{ margin: '12px 0', color: '#4b5563' }}>เก็บฉบับล่าสุดและก่อนหน้า 1 รุ่น การบันทึกครั้งถัดไปจะเปลี่ยนรุ่นที่ย้อนคืนได้</p>
        {!data && !error && <p role="status">กำลังโหลดประวัติ…</p>}
        {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
        {data?.versions.map(version => <div key={version.id} style={{ border: '1px solid #d1d5db', padding: 14, borderRadius: 10, margin: '10px 0' }}>
          <strong>{version.current ? 'ฉบับปัจจุบัน' : 'ฉบับก่อนหน้า'}</strong>
          <p>{version.at ? new Date(version.at).toLocaleString('th-TH') : 'ไม่ทราบเวลาบันทึก'}</p>
          {!version.current && !readonly && <button disabled={busy} onClick={() => setSelected(version.id)}>เลือกรุ่นนี้เพื่อย้อนคืน</button>}
        </div>)}
        {data && data.versions.length < 2 && <p>ยังไม่มีฉบับก่อนหน้าให้ย้อนคืน</p>}
        {selected && <div style={{ background: '#fff7ed', padding: 12, borderRadius: 10, marginTop: 12 }}>
          <p>เปิดฉบับก่อนหน้าแทนเนื้อหาที่กำลังแสดงอยู่? ฉบับล่าสุดบนคลาวด์จะเก็บไว้ให้ย้อนกลับได้ งานที่ยังไม่ได้บันทึกจะไม่รวมอยู่ด้วย</p>
          <button disabled={busy} onClick={restore}>{busy ? 'กำลังย้อนคืน…' : 'ยืนยันย้อนคืน'}</button>
        </div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button disabled={busy} onClick={() => { setSelected(null); setRetry(value => value + 1); }}>รีเฟรชประวัติ</button>
          <button disabled={busy} onClick={onClose}>ปิด</button>
        </div>
      </section>
    </div>, document.body
  );
}
