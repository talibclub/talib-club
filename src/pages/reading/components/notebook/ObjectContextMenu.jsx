import React from 'react';
import { FileStack, ChevronsUp, ChevronsDown, Trash2, Copy, Scissors } from 'lucide-react';

const RECOLOR = ['#111827', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FEF08A'];

const Item = ({ icon, label, shortcut, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: danger ? '#EF4444' : '#111827', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'Kanit, sans-serif', borderRadius: 8, transition: 'background 0.15s' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = danger ? '#FEF2F2' : '#F3F4F6')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      {icon} <span>{label}</span>
    </div>
    {shortcut && <span style={{ fontSize: 11, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>{shortcut}</span>}
  </button>
);

// Long-press / right-click menu for a single object. The parent decides when to
// show it and supplies the action callbacks; each action closes the menu.
export default function ObjectContextMenu({ x, y, canRecolor, onClose, onCopy, onCut, onDuplicate, onFront, onBack, onRecolor, onDelete }) {
  const menuW = 190;
  const left = Math.min(x, window.innerWidth - menuW - 8);
  const top = Math.min(y, window.innerHeight - 340);
  const run = (fn) => () => { fn && fn(); onClose(); };

  return (
    <>
      <div onPointerDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
      <div style={{ position: 'fixed', left, top, zIndex: 201, width: menuW, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: '1px solid rgba(0,0,0,0.08)', padding: 6, overflow: 'hidden' }}>
        {onCopy && <Item icon={<Copy size={16} color="#4B5563" />} label="คัดลอก" shortcut="Ctrl+C" onClick={run(onCopy)} />}
        {onCut && <Item icon={<Scissors size={16} color="#4B5563" />} label="ตัด" shortcut="Ctrl+X" onClick={run(onCut)} />}
        <Item icon={<FileStack size={16} color="#4B5563" />} label="ทำซ้ำ" shortcut="Ctrl+D" onClick={run(onDuplicate)} />
        <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
        <Item icon={<ChevronsUp size={16} color="#4B5563" />} label="นำไปด้านหน้า" onClick={run(onFront)} />
        <Item icon={<ChevronsDown size={16} color="#4B5563" />} label="ส่งไปด้านหลัง" onClick={run(onBack)} />
        {canRecolor && (
          <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
            {RECOLOR.map((c) => (
              <div key={c} onClick={run(() => onRecolor(c))} style={{ width: 18, height: 18, borderRadius: '50%', background: c, cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }} />
            ))}
          </div>
        )}
        <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
          <Item icon={<Trash2 size={16} color="#EF4444" />} label="ลบ" shortcut="Del" onClick={run(onDelete)} danger />
        </div>
      </div>
    </>
  );
}
