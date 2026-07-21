import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

// A wide emoji / sticker palette. Tapping an emoji drops it on the page as a
// scalable object; the upload button lets people bring their own PNG/sticker in.
const CATEGORIES = {
  'ยอดนิยม': ['⭐', '✅', '❗', '❓', '🔥', '💡', '📌', '📍', '✔️', '❌', '⚠️', '💯', '👉', '👈', '☑️', '🔖'],
  'อารมณ์': ['😀', '😁', '😂', '🥰', '😇', '🙂', '😉', '😍', '🤔', '😅', '😴', '😎', '🥳', '😭', '😡', '🤯', '😱', '🙄', '😌', '🤗'],
  'มือ/ท่าทาง': ['👍', '👎', '👏', '🙏', '💪', '✍️', '👀', '🫶', '🤝', '✊', '👋', '🤙'],
  'สัญลักษณ์': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💕', '💫', '✨', '🌟', '💥', '🎯', '🏆', '🎉'],
  'การเรียน': ['📚', '📖', '📝', '✏️', '🖊️', '📒', '📓', '🔍', '🧠', '💭', '🗒️', '📎', '🧮', '🎓', '⏰', '📅'],
  'ศาสนา/ธรรมชาติ': ['🕌', '🌙', '⭐', '🌿', '🌺', '🌸', '🌈', '☀️', '💧', '🍃', '🕋', '📿'],
};

export default function EmojiStickerPicker({ onPick, onUpload, onClose }) {
  const [cat, setCat] = useState('ยอดนิยม');

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{ width: 300, maxWidth: '92vw', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.16)', border: '1px solid rgba(0,0,0,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'Kanit, sans-serif' }}>อิโมจิ & สติกเกอร์</span>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', display: 'flex' }}>
          <X size={18} />
        </button>
      </div>

      {/* Category tabs */}
      <div className="hide-scroll" style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
        {Object.keys(CATEGORIES).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 8, border: 'none', background: cat === c ? '#0A59F7' : '#F3F4F6', color: cat === c ? 'white' : '#4B5563', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Kanit, sans-serif', whiteSpace: 'nowrap' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, maxHeight: 168, overflowY: 'auto' }}>
        {CATEGORIES[cat].map((e, i) => (
          <button
            key={`${e}-${i}`}
            onClick={() => onPick(e)}
            style={{ aspectRatio: '1', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}
            onMouseEnter={(ev) => (ev.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
          >
            {e}
          </button>
        ))}
      </div>

      <button
        onClick={onUpload}
        style={{ height: 38, borderRadius: 10, border: '1.5px dashed #C7D2FE', background: '#EEF2FF', color: '#0A59F7', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Kanit, sans-serif' }}
      >
        <Upload size={16} /> นำเข้าสติกเกอร์ของคุณเอง
      </button>
    </div>
  );
}
