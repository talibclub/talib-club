import React from 'react';
import { X, Spline } from 'lucide-react';
import { MINDMAP_STYLES, DEFAULT_MINDMAP_STYLE } from './mindmap.js';
import { HW } from './theme.js';

export default function MindmapStylePicker({ currentStyle, onPick, onClose }) {
  const styles = Object.values(MINDMAP_STYLES);
  
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{ width: 440, maxWidth: '92vw', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.16)', border: '1px solid rgba(0,0,0,0.06)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 100 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <Spline size={18} color={HW.accent} />
           <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: 'Kanit, sans-serif' }}>สไตล์มายแมพ</span>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 4, borderRadius: 8 }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxHeight: 300, overflowY: 'auto' }} className="hide-scroll">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => { onPick(style.id); onClose(); }}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, 
              borderRadius: 12, border: currentStyle === style.id ? `2px solid ${HW.accent}` : '2px solid transparent', 
              background: currentStyle === style.id ? HW.accentSoft : '#F3F4F6', cursor: 'pointer', 
              transition: 'all 0.15s' 
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
               {/* Tiny preview of the mindmap style */}
               <div style={{ display: 'flex', gap: 4, height: 28, alignItems: 'center' }}>
                 <div style={{ width: 14, height: 14, borderRadius: 4, background: style.colors[0] }} />
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={style.colors[1]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {style.type === 'angled' ? (
                       <path d="M 0 12 L 12 12 L 12 4 L 24 4 M 12 12 L 12 20 L 24 20" />
                    ) : style.type === 'straight' ? (
                       <path d="M 0 12 L 24 4 M 0 12 L 24 20" />
                    ) : (
                       <path d="M 0 12 C 12 12 12 4 24 4 M 0 12 C 12 12 12 20 24 20" />
                    )}
                 </svg>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: style.colors[1] }} />
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: style.colors[2] }} />
                 </div>
               </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: currentStyle === style.id ? HW.accent : '#4B5563', fontFamily: 'Kanit, sans-serif' }}>
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
