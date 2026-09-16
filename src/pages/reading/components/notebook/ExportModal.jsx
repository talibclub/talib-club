import { createPortal } from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, FileText, FileStack, Columns, Download } from 'lucide-react';
import { HW } from './theme.js';

const Choice = ({ selected, onClick, disabled, icon, title, sub }) => (
  <button type="button" aria-pressed={selected} onClick={onClick} disabled={disabled} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 14, border: `2px solid ${selected ? HW.accent : 'rgba(0,0,0,0.08)'}`, background: selected ? HW.accentSoft : 'white', cursor: disabled ? 'default' : 'pointer', transition: 'all 0.15s' }}>
    {icon}
    <span style={{ fontSize: 14, fontWeight: 700, color: selected ? HW.accent : '#111827', fontFamily: 'Kanit, sans-serif' }}>{title}</span>
    {sub && <span style={{ fontSize: 11.5, color: '#9CA3AF', fontFamily: 'Kanit, sans-serif' }}>{sub}</span>}
  </button>
);

// Modal for choosing export format (image / PDF) and scope (this page / all).
// Presentational: the parent owns the format/scope state and the export action.
export default function ExportModal({ format, setFormat, scope, setScope, exporting, pageCount, currentIndex, onExport, onClose }) {
  const [layout, setLayout] = useState('content');
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  useEffect(() => { setPreview(null); setPreviewError(''); }, [scope, layout]);
  const makePreview = async () => {
    setPreviewError('');
    const shots = await onExport('preview', scope, layout);
    if (shots?.length) setPreview(shots);
    else setPreviewError('สร้างตัวอย่างไม่สำเร็จ กรุณาลองอีกครั้ง');
  };
  const dialogRef = useRef(null);
  useEffect(() => { if (exporting) dialogRef.current?.focus(); }, [exporting]);
  const latest = useRef({ exporting, onClose });
  latest.current = { exporting, onClose };
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    dialog.focus();
    const onKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!latest.current.exporting) latest.current.onClose();
      }
      if (event.key !== 'Tab') return;
      const buttons = [...dialog.querySelectorAll('button:not(:disabled), select:not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', onKey);
    return () => {
      dialog.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return createPortal(
    <div onPointerDown={(e) => { if (e.target === e.currentTarget && !exporting) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="notebook-export-title" tabIndex={-1} style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 620, maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', overscrollBehavior: 'contain', boxSizing: 'border-box', padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 id="notebook-export-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827', fontFamily: 'Kanit, sans-serif' }}>ส่งออกสมุดโน้ต</h3>
          <button type="button" aria-label="ปิดหน้าต่างส่งออก" disabled={exporting} onClick={() => !exporting && onClose()} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', display: 'flex' }}><X size={22} /></button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8, fontFamily: 'Kanit, sans-serif' }}>รูปแบบไฟล์</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <Choice selected={format === 'png'} disabled={exporting} onClick={() => { setFormat('png'); if (layout === 'a4') setLayout('content'); }} icon={<ImageIcon size={26} color={format === 'png' ? HW.accent : '#6B7280'} />} title="รูปภาพ" sub="ไฟล์ .png" />
          <Choice selected={format === 'pdf'} disabled={exporting} onClick={() => setFormat('pdf')} icon={<FileText size={26} color={format === 'pdf' ? HW.accent : '#6B7280'} />} title="PDF" sub="รวมทุกหน้าในไฟล์เดียว" />
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 8, fontFamily: 'Kanit, sans-serif' }}>ขอบเขต</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          <Choice selected={scope === 'current'} disabled={exporting} onClick={() => setScope('current')} icon={<FileStack size={26} color={scope === 'current' ? HW.accent : '#6B7280'} />} title="เฉพาะหน้านี้" sub={`หน้า ${currentIndex + 1}`} />
          <Choice selected={scope === 'all'} disabled={exporting} onClick={() => setScope('all')} icon={<Columns size={26} color={scope === 'all' ? HW.accent : '#6B7280'} />} title="ทุกหน้า" sub={`${pageCount} หน้า`} />
        </div>

        <label style={{ display: 'block', marginBottom: 16, color: '#374151', fontSize: 13 }}>
          การจัดหน้า
          <select value={layout} disabled={exporting} onChange={e => { setLayout(e.target.value); if (e.target.value === 'a4') setFormat('pdf'); }} style={{ display: 'block', width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 10, marginTop: 6, color: '#111827', background: 'white' }}>
            <option value="content">เฉพาะเนื้อหา — ตัดพื้นที่ว่างรอบกระดาน</option>
            <option value="paper">เต็มกระดาษ — คงขนาดหน้าเดิม</option>
            <option value="a4">PDF A4 หลายหน้า — แบ่งกระดาน ไม่ย่อจนอ่านยาก</option>
          </select>
        </label>
        <button type="button" onClick={makePreview} disabled={exporting} style={{ padding: 12, width: '100%', borderRadius: 10, border: '1px solid #0f766e', background: '#f0fdfa', color: '#115e59', marginBottom: 12, cursor: 'pointer' }}>
          {exporting ? 'กำลังเตรียมไฟล์…' : preview ? 'สร้างตัวอย่างใหม่' : 'ดูตัวอย่างก่อนดาวน์โหลด'}
        </button>
        {previewError && <p role="alert" style={{ color: '#b91c1c', marginBottom: 12 }}>{previewError}</p>}
        {preview && <div style={{ marginBottom: 16 }}>
          <p role="status" style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>ตัวอย่างไฟล์จริง {preview.length} หน้า — ตรวจลายมือและรูปก่อนดาวน์โหลด</p>
          <div style={{ maxHeight: 320, overflowY: 'auto', background: '#e5e7eb', padding: 12, borderRadius: 10 }}>
            {preview.map((shot, index) => <figure key={index} style={{ margin: '0 0 12px' }}>
              <div style={layout === 'a4' ? { aspectRatio: '210 / 297', background: 'white', padding: '4.7619%', boxSizing: 'border-box' } : undefined}>
                <img src={shot.url} alt={'ตัวอย่างส่งออกหน้า ' + (index + 1)} style={{ width: layout === 'a4' ? `${shot.w / 800 * 100}%` : '100%', display: 'block', background: 'white' }} />
              </div>
              <figcaption style={{ color: '#374151', fontSize: 12, textAlign: 'center' }}>หน้า {index + 1}</figcaption>
            </figure>)}
          </div>
        </div>}
        <button onClick={() => onExport(format, scope, layout, preview)} disabled={exporting || !preview} style={{ width: '100%', height: 46, borderRadius: 12, border: 'none', background: HW.accent, color: 'white', fontWeight: 700, fontSize: 15, cursor: exporting ? 'default' : 'pointer', fontFamily: 'Kanit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: exporting || !preview ? 0.5 : 1 }}>
          {exporting ? 'กำลังส่งออก...' : (<><Download size={18} /> ดาวน์โหลด</>)}
        </button>
        {scope === 'all' && format === 'png' && (
          <p style={{ fontSize: 11.5, color: '#9CA3AF', textAlign: 'center', marginTop: 10, marginBottom: 0, fontFamily: 'Kanit, sans-serif' }}>* จะดาวน์โหลดแยกเป็นไฟล์รูปทีละหน้า</p>
        )}
      </div>
    </div>, document.body
  );
}
