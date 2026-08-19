import React, { useRef } from 'react';
import { autoformatPlainText } from './textAutoformat.js';

// In-place editor for a sticky note's text, positioned over the note on canvas.
// Presentational: the parent owns the value, the textarea ref, and the
// commit/delete logic.
export default function StickyNoteEditor({ x, y, scale, round, value, onChange, textareaRef, onCommit, onDelete, box }) {
  // Matching the canvas text exactly is worth doing, but never at the cost of
  // being able to see what you are typing: the canvas <Text> is hidden while the
  // editor is open, so if this box is mis-sized for any reason the note just
  // looks empty until you close it — which is exactly what was reported.
  //
  // So: fall back to sane numbers if anything arrives missing, and never render
  // below a readable size, whatever the zoom works out to.
  const safe = (n, fallback) => (Number.isFinite(n) && n > 0 ? n : fallback);
  const fontSize = Math.max(13, safe(box?.fontSize, 16 * scale));
  const boxLeft = safe(box?.left, 12 * scale);
  const boxTop = safe(box?.top, 24 * scale);
  const boxWidth = Math.max(90, safe(box?.width, 126 * scale));
  const boxHeight = Math.max(48, safe(box?.height, 116 * scale));
  const noteHeight = safe(box?.noteHeight, 150 * scale);

  // At a small board zoom the readable floors above make the editor wider than
  // the note itself. Let it read as a deliberate little editing card in that
  // case rather than a misaligned overlay.
  const overflowsNote = boxWidth > safe(box?.width, boxWidth) + 1;

  // onBlur used to commit unconditionally. The textarea mounts in the same
  // commit as the Konva pointer handling, which takes focus straight back off
  // it — so the editor opened and closed again before the parent's 60ms
  // re-focus could run, and tapping a note looked like it did nothing at all.
  // A blur can only close the editor once the textarea has actually held focus.
  const hasFocused = useRef(false);
  return (
    // The wrapper used to be a zero-by-zero box, because everything inside it
    // is absolutely positioned. Harmless on its own — but global.css styles
    // every input on the site with `width:100%; max-width:100%`, and 100% of
    // zero is zero. The textarea's own `width` was set and simply lost to that
    // max-width, so it rendered 0px wide: the text was there the whole time
    // (scrollHeight said so) with no width to show it in. Giving the wrapper the
    // note's real size, and taking the max-width cap off below, fixes it.
    <div style={{ position: 'absolute', top: y, left: x, width: noteHeight, height: noteHeight, zIndex: 100 }}>
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
          left: boxLeft,
          top: boxTop,
          margin: 0,
          padding: 0,
          // A faint wash and ring, so an open editor always reads as a field you
          // can type into rather than a blank note.
          border: 'none',
          boxShadow: overflowsNote
            ? '0 0 0 2px rgba(15,110,86,0.45), 0 6px 20px rgba(0,0,0,0.18)'
            : '0 0 0 2px rgba(15,110,86,0.35)',
          borderRadius: 6,
          background: overflowsNote ? '#FFFDF5' : 'rgba(255,255,255,0.55)',
          color: '#111827',
          caretColor: '#0f6e56',
          fontSize: `${fontSize}px`,
          lineHeight: 1.25,
          textAlign: box?.align || 'left',
          fontFamily: 'Kanit, sans-serif',
          outline: 'none',
          resize: 'none',
          width: boxWidth,
          height: boxHeight,
          // Both of these override the site-wide input rule. Without them the
          // box collapses to nothing and typing looks like it does not work.
          maxWidth: 'none',
          minWidth: 0,
          overflow: 'auto',
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
        style={{ position: 'absolute', top: noteHeight + 8, left: 0, background: '#c0392b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontFamily: 'Kanit, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(192,57,43,0.25)' }}
      >
        ลบโพสต์อิท
      </button>
    </div>
  );
}
