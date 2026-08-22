import React, { useState, useMemo } from 'react';
import { Upload, X, Search } from 'lucide-react';
import { ALL_ICONS, DEFAULT_ICONS } from './notebook/icons.js';
import { HW } from './notebook/theme.js';

// A wide emoji / sticker palette. Tapping an emoji drops it on the page as a
// scalable object; the upload button lets people bring their own PNG/sticker in.
const CATEGORIES = {
  'ยอดนิยม': ['⭐', '✅', '❗', '❓', '🔥', '💡', '📌', '📍', '✔️', '❌', '⚠️', '💯', '👉', '👈', '☑️', '🔖'],
  'ไอคอน': DEFAULT_ICONS,
  'อารมณ์': ['😀', '😁', '😂', '🥰', '😇', '🙂', '😉', '😍', '🤔', '😅', '😴', '😎', '🥳', '😭', '😡', '🤯', '😱', '🙄', '😌', '🤗'],
  'มือ/ท่าทาง': ['👍', '👎', '👏', '🙏', '💪', '✍️', '👀', '🫶', '🤝', '✊', '👋', '🤙'],
  'สัญลักษณ์': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💕', '💫', '✨', '🌟', '💥', '🎯', '🏆', '🎉'],
  'การเรียน': ['📚', '📖', '📝', '✏️', '🖊️', '📒', '📓', '🔍', '🧠', '💭', '🗒️', '📎', '🧮', '🎓', '⏰', '📅'],
  'ศาสนา/ธรรมชาติ': ['🕌', '🌙', '⭐', '🌿', '🌺', '🌸', '🌈', '☀️', '💧', '🍃', '🕋', '📿'],
};

const ALL_ICON_KEYS = Object.keys(ALL_ICONS);

export default function EmojiStickerPicker({ onPick, onPickIcon, onUpload, onClose }) {
  const [cat, setCat] = useState('ยอดนิยม');
  const [search, setSearch] = useState('');

  const displayedItems = useMemo(() => {
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      const matched = ALL_ICON_KEYS.filter(k => k.toLowerCase().includes(lowerSearch)).slice(0, 64);
      return matched.map(k => ({ type: 'icon', value: k }));
    }
    const catItems = CATEGORIES[cat] || [];
    const isIconCat = cat === 'ไอคอน';
    return catItems.map(item => ({
       type: isIconCat ? 'icon' : 'emoji',
       value: item
    }));
  }, [search, cat]);

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{ width: 320, maxWidth: '92vw', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.16)', border: '1px solid rgba(0,0,0,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'Kanit, sans-serif' }}>อิโมจิ & ไอคอน</span>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', display: 'flex' }}>
          <X size={18} />
        </button>
      </div>
      
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: '6px 10px', gap: 8 }}>
         <Search size={16} color="#9CA3AF" />
         <input 
            type="text" 
            placeholder="ค้นหาไอคอน (ภาษาอังกฤษ)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none', fontSize: 13, fontFamily: 'Kanit, sans-serif' }}
         />
         {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}><X size={14} /></button>}
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="hide-scroll" style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          {Object.keys(CATEGORIES).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 8, border: 'none', background: cat === c ? HW.accent : '#F3F4F6', color: cat === c ? 'white' : '#4B5563', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Kanit, sans-serif', whiteSpace: 'nowrap' }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Emoji / Icon grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, height: 168, overflowY: 'auto', alignContent: 'start' }} className="hide-scroll">
        {displayedItems.length === 0 ? (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px 0', fontSize: 13, color: '#9CA3AF', fontFamily: 'Kanit' }}>
              ไม่พบไอคอนที่ตรงกับ '{search}'
           </div>
        ) : (
          displayedItems.map((item, i) => {
            const isIcon = item.type === 'icon';
            const IconComponent = isIcon ? ALL_ICONS[item.value] : null;
            return (
              <button
                key={`${item.value}-${i}`}
                onClick={() => {
                   if (isIcon && onPickIcon) {
                      onPickIcon(item.value);
                   } else if (!isIcon) {
                      onPick(item.value);
                   }
                   onClose();
                }}
                title={item.value}
                style={{ aspectRatio: '1', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s', color: '#374151' }}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = '#F3F4F6')}
                onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
              >
                {isIcon && IconComponent ? <IconComponent size={24} strokeWidth={1.5} /> : item.value}
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={onUpload}
        style={{ height: 38, borderRadius: 10, border: `1.5px dashed ${HW.accentSoft}`, background: '#EEF2FF', color: HW.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Kanit, sans-serif' }}
      >
        <Upload size={16} /> นำเข้าสติกเกอร์ของคุณเอง
      </button>
    </div>
  );
}
