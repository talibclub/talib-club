import React, { useRef } from 'react';
import { autoformatPlainText } from './textAutoformat.js';

// In-place editor for a sticky note's text, positioned over the note on canvas.
// Presentational: the parent owns the value, the textarea ref, and the
// commit/delete logic.
export default function StickyNoteEditor({ x, y, scale, round, value, onChange, textareaRef, onCommit, onDelete, box }) {
  // onBlur used to commit unconditionally. The textarea mounts in the same
  // commit as the Konva pointer handling, which takes focus straight back off
  // it — so the editor opened and closed again before the parent's 60ms
  // re-focus could run, and tapping a note looked like it did nothing at all.
  // A blur can only close the editor once the textarea has actually held focus.
  const hasFocused = useRef(false);
  return (
    <div style={{ position: 'absolute', top: y, left: x, zIndex: 100 }}>
      <textarea
        ref={textareaRef}
        autoFocus
        placeholder="พิมพ์ข้อความที่นี่..."
        value={value}
        // Same "->" becomes an arrow behaviour as the text boxes. This is a
        // real <textarea>, so the rewrite is a plain string edit plus putting
        // the caret back — done in a microtask because React controls the value.
        onChange={(e) => {
          const el = e.target;
          const next = autoformatPlainText(el.value, el.selectionStart);
          if (!next) { onChange(el.value); return; }
          onChange(next.value);
          queueMicrotask(() => {
            if (textareaRef?.current) {
              textareaRef.current.selectionStart = next.caret;
              textareaRef.current.selectionEnd = next.caret;
            }
          });
        }}
        onFocus={() => { hasFocused.current = true; }}
        onBlur={() => { if (hasFocused.current) onCommit(); }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        // Mirrors the Konva <Text> on the note exactly. It used to sit at the
        // note's origin with 16px of padding and a flat 150x150 box, while the
        // canvas text is inset (12, 24) in a 126x116 box — so the words moved
        // and re-wrapped the moment you stopped typing.
        style={{
          position: 'absolute',
          left: box.left,
          top: box.top,
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: '#111827',
          fontSize: `${box.fontSize}px`,
          lineHeight: 1.2,
          textAlign: box.align,
          fontFamily: 'Kanit, sans-serif',
          outline: 'none',
          resize: 'none',
          width: box.width,
          height: box.height,
          overflow: 'hidden',
          borderRadius: round ? 16 * scale : 2 * scale,
        }}
      />
      {/* preventDefault keeps focus on the textarea. Without it the button
          steals focus, onBlur closes the editor, and this button unmounts
          before the click can land — so delete silently did nothing. */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onClick={onDelete}
        // Sits just under the note now that the textarea is absolutely placed.
        style={{ position: 'absolute', top: box.noteHeight + 8, left: 0, background: '#c0392b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontFamily: 'Kanit, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(192,57,43,0.25)' }}
      >
        ลบโพสต์อิท
      </button>
    </div>
  );
}
