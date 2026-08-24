import React from 'react';
import { X, Spline, Sparkles, Plus } from 'lucide-react';
import { MINDMAP_STYLES, DEFAULT_MINDMAP_STYLE } from './mindmap.js';
import { HW } from './theme.js';

export default function MindmapStylePicker({ currentStyle, onPick, onInsertMindmap, onClose }) {
  const styles = Object.values(MINDMAP_STYLES);
  
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{ width: 440, maxWidth: '94vw', background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', border: '1px solid rgba(15,110,86,0.12)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 100 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <div style={{ width: 32, height: 32, borderRadius: 10, background: HW.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Spline size={18} color={HW.accent} strokeWidth={2.2} />
           </div>
           <div>
             <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: 'Kanit, sans-serif' }}>สไตล์ Mindmap & ผังความคิด</div>
             <div style={{ fontSize: 11, color: '#6B7280' }}>เลือกธีมสีและรูปทรงเส้นเชื่อมกิ่งก้าน</div>
           </div>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 6, borderRadius: '50%' }}>
          <X size={16} />
        </button>
      </div>

      {onInsertMindmap && (
        <button
          onClick={() => onInsertMindmap(currentStyle)}
          className="cute-btn-press"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 14px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0F6E56, #14B8A6)',
            color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,110,86,0.25)',
            fontFamily: 'Kanit, sans-serif'
          }}
        >
          <Sparkles size={16} />
          <span>+ สร้างโครงผัง Mindmap ใหม่บนหน้านี้</span>
        </button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxHeight: 300, overflowY: 'auto' }} className="hide-scroll">
        {styles.map((style) => {
          const isSel = currentStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => { onPick(style.id); }}
              className="cute-btn-press"
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 8px', 
                borderRadius: 14, border: isSel ? `2px solid ${HW.accent}` : '1.5px solid rgba(0,0,0,0.06)', 
                background: isSel ? HW.accentSoft : '#F9FAFB', cursor: 'pointer', 
                boxShadow: isSel ? `0 4px 12px rgba(15,110,86,0.15), inset 0 0 0 1px ${HW.accentRing}` : 'none',
                transition: 'all 0.15s ease' 
              }}
            >
              <div style={{ display: 'flex', gap: 4, height: 26, alignItems: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: style.colors[0], boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={style.colors[1]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   {style.type === 'angled' ? (
                      <path d="M 0 12 L 12 12 L 12 4 L 24 4 M 12 12 L 12 20 L 24 20" />
                   ) : style.type === 'straight' ? (
                      <path d="M 0 12 L 24 4 M 0 12 L 24 20" />
                   ) : (
                      <path d="M 0 12 C 12 12 12 4 24 4 M 0 12 C 12 12 12 20 24 20" />
                   )}
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                   <div style={{ width: 9, height: 9, borderRadius: 2, background: style.colors[1] }} />
                   <div style={{ width: 9, height: 9, borderRadius: 2, background: style.colors[2] }} />
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: isSel ? 700 : 600, color: isSel ? HW.accent : '#374151', fontFamily: 'Kanit, sans-serif' }}>
                {style.name}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: 10, fontSize: 11, color: '#4B5563', lineHeight: 1.4, fontFamily: 'Kanit, sans-serif' }}>
        💡 <b>วิธีแตกกิ่ง Mindmap:</b> แตะที่กล่องข้อความใดๆ แล้วกดปุ่ม <b>[ ⚲ แตกกิ่ง ]</b> หรือกดปุ่ม <b>Tab</b> บนคีย์บอร์ด จะแตกกิ่งอัตโนมัติตามธีมสีนี้ทันที
      </div>
    </div>
  );
}
