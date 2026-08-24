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
      style={{ width: 330, maxWidth: '92vw', background: 'rgba(255,255,255,0.96)', backdropFilter: 'saturate(200%) blur(26px)', borderRadius: 20, boxShadow: '0 16px 48px rgba(15,110,86,0.16), 0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(15,110,86,0.12)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: HW.accent, fontFamily: 'Kanit, sans-serif' }}>✨ อิโมจิ & ไอคอน</span>
        <button onClick={onClose} className="cute-btn-press" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', display: 'flex', padding: 4, borderRadius: '50%' }}>
          <X size={18} />
        </button>
      </div>
      
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15,110,86,0.05)', borderRadius: 999, padding: '6px 12px', gap: 8, border: '1px solid rgba(15,110,86,0.1)' }}>
         <Search size={15} color="#0f6e56" />
         <input 
            type="text" 
            placeholder="ค้นหาไอคอน (ภาษาอังกฤษ)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none', fontSize: 12.5, fontFamily: 'Kanit, sans-serif' }}
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
              className="cute-btn-press"
              style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 999, border: 'none', background: cat === c ? HW.accent : 'rgba(0,0,0,0.04)', color: cat === c ? 'white' : HW.textDim, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'Kanit, sans-serif', whiteSpace: 'nowrap', boxShadow: cat === c ? '0 2px 6px rgba(15,110,86,0.25)' : 'none' }}
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
                className="cute-swatch-bubble"
                style={{ aspectRatio: '1', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
              >
                {isIcon && IconComponent ? <IconComponent size={22} strokeWidth={1.6} /> : item.value}
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={onUpload}
        className="cute-btn-press"
        style={{ height: 36, borderRadius: 999, border: `1.5px dashed ${HW.accent}`, background: 'rgba(15,110,86,0.06)', color: HW.accent, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Kanit, sans-serif' }}
      >
        <Upload size={15} /> นำเข้าสติกเกอร์ของคุณเอง
      </button>
    </div>
  );
}
