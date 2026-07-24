import React from 'react';
import { Crop, ScanText, Type, ChevronsUp, ChevronsDown, FileStack, Trash2, Check } from 'lucide-react';
import { HW, STICKY_COLORS } from './theme.js';

// Huawei-style floating action bar shown above a single selected object. Purely
// presentational — the parent computes the on-screen position and binds each
// action to the selected object. Kept compact and single-line: icon-only
// buttons (labels live in the tooltips) and small colour dots, so on a tablet it
// reads as a neat pill instead of wrapping into a full-width block.
export default function SelectionToolbar({ left, top, kind, canEdit, onCrop, onOcr, onEdit, onRecolor, onFront, onBack, onDuplicate, onDelete, onDone }) {
  const btn = { width: 34, height: 34, borderRadius: 9, border: 'none', background: 'transparent', color: HW.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const divider = <div style={{ width: 1, height: 18, background: HW.hairline, margin: '0 2px', flexShrink: 0 }} />;
  const swatches = kind === 'stickers' ? STICKY_COLORS.slice(0, 5) : ['#111827', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      className="hide-scroll"
      style={{ position: 'absolute', left, top: Math.max(8, top), transform: 'translateX(-50%)', zIndex: 60, display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 1, padding: '4px 6px', background: HW.surface, backdropFilter: HW.blur, WebkitBackdropFilter: HW.blur, borderRadius: 12, boxShadow: HW.shadow, border: `1px solid ${HW.hairline}`, maxWidth: 'min(96vw, 340px)', overflowX: 'auto' }}
    >
      {kind === 'images' && (
        <>
          <button style={btn} onClick={onCrop} title="ครอบตัด"><Crop size={17} strokeWidth={1.7} /></button>
          <button style={btn} onClick={onOcr} title="ดึงข้อความ (OCR)"><ScanText size={17} strokeWidth={1.7} /></button>
          {divider}
        </>
      )}

      {canEdit && (
        <>
          <button style={btn} onClick={onEdit} title="แก้ไขข้อความ"><Type size={17} strokeWidth={1.7} /></button>
          {divider}
        </>
      )}

      {kind !== 'images' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {swatches.map(c => (
              <div
                key={c}
                title="เปลี่ยนสี"
                onClick={() => onRecolor(c)}
                style={{ width: 16, height: 16, borderRadius: kind === 'stickers' ? 4 : '50%', background: c, cursor: 'pointer', flexShrink: 0, boxShadow: `inset 0 0 0 1px ${HW.hairline}` }}
              />
            ))}
          </div>
          {divider}
        </>
      )}

      <button style={btn} onClick={onFront} title="นำไปด้านหน้า"><ChevronsUp size={17} strokeWidth={1.7} /></button>
      <button style={btn} onClick={onBack} title="ส่งไปด้านหลัง"><ChevronsDown size={17} strokeWidth={1.7} /></button>
      {divider}
      <button style={btn} onClick={onDuplicate} title="ทำซ้ำ"><FileStack size={17} strokeWidth={1.7} /></button>
      <button style={{ ...btn, color: '#EF4444' }} onClick={onDelete} title="ลบ"><Trash2 size={17} strokeWidth={1.7} /></button>
      <button style={{ ...btn, color: HW.accent }} onClick={onDone} title="เสร็จสิ้น"><Check size={18} strokeWidth={2} /></button>
    </div>
  );
}
