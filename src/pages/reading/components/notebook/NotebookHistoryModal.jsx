import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getNotebookHistory } from '../../../../lib/driveStorage.js';
import { History, X, RefreshCw, RotateCcw, Check, Clock3, AlertCircle } from 'lucide-react';
import './notebookHistory.css';

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
    <div className="nb-history-backdrop">
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
        }} className="nb-history-panel">
        <header className="nb-history-heading">
          <span className="nb-history-icon"><History size={22} /></span>
          <div><h3 id="notebook-history-title">ประวัติสมุด</h3><span className="nb-history-muted">ฉบับที่บันทึกบนคลาวด์</span></div>
          <button className="nb-history-close" disabled={busy} onClick={onClose} aria-label="ปิดประวัติสมุด"><X size={19} /></button>
        </header>
        <p className="nb-history-description">เก็บฉบับปัจจุบันและฉบับก่อนหน้า 1 รุ่น<br />เมื่อบันทึกใหม่ ฉบับที่ย้อนคืนได้จะเปลี่ยนตาม</p>
        {!data && !error && <p className="nb-history-message" role="status"><RefreshCw size={18} />กำลังโหลดประวัติ…</p>}
        {error && <p role="alert" className="nb-history-error"><AlertCircle size={18} />{error}</p>}
        {data?.versions.map(version => <div key={version.id} className={`nb-history-version${version.current ? ' is-current' : ''}${selected === version.id ? ' is-selected' : ''}`}>
          <div className="nb-history-version-title"><strong>{version.current ? 'ฉบับปัจจุบัน' : 'ฉบับก่อนหน้า'}</strong>{version.current && <span className="nb-history-badge"><Check size={13} />ล่าสุด</span>}</div>
          <p className="nb-history-date"><Clock3 size={14} />{version.at ? new Date(version.at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : 'ไม่ทราบเวลาบันทึก'}</p>
          {!version.current && !readonly && <button className="nb-history-restore" disabled={busy} aria-pressed={selected === version.id} onClick={() => setSelected(version.id)}><RotateCcw size={15} />{selected === version.id ? 'เลือกฉบับนี้แล้ว' : 'ย้อนคืนฉบับนี้'}</button>}
        </div>)}
        {data && data.versions.length < 2 && <p className="nb-history-muted">ยังไม่มีฉบับก่อนหน้าให้ย้อนคืน</p>}
        {selected && <div className="nb-history-confirm">
          <p>เปิดฉบับก่อนหน้าแทนเนื้อหาที่กำลังแสดงอยู่? ฉบับล่าสุดบนคลาวด์จะเก็บไว้ให้ย้อนกลับได้ งานที่ยังไม่ได้บันทึกจะไม่รวมอยู่ด้วย</p>
          <div className="nb-history-confirm-actions"><button disabled={busy} onClick={() => setSelected(null)}>ยกเลิก</button><button className="nb-history-primary" disabled={busy} onClick={restore}>{busy ? 'กำลังย้อนคืน…' : 'ยืนยันย้อนคืน'}</button></div>
        </div>}
        <div className="nb-history-footer">
          <button disabled={busy || (!data && !error)} onClick={() => { setSelected(null); setRetry(value => value + 1); }}><RefreshCw size={15} />รีเฟรชประวัติ</button>
          <button className="nb-history-primary" disabled={busy} onClick={onClose}>เสร็จสิ้น</button>
        </div>
      </section>
    </div>, document.body
  );
}
