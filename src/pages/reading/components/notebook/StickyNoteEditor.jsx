import React, { useRef } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Minus, Plus, Trash2, Underline } from 'lucide-react';
import { applyPlainListTrigger, autoformatPlainText, continuePlainList } from './textAutoformat.js';
import { stepTextSize } from './stickerText.js';
import { HW, TEXT_COLORS } from './theme.js';

// In-place editor for a sticky note's text, positioned over the note on canvas.
// Presentational: the parent owns the value, the textarea ref, and the
// commit/delete logic.
export default function StickyNoteEditor({ x, y, scale, round, value, onChange, textareaRef, onCommit, onDelete, box, format, onFormat }) {
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

  const fmt = format || {};

  // React owns the value, so the caret has to be restored after the re-render
  // that our rewrite causes — otherwise it jumps to the end of the text.
  const putCaret = (caret) => queueMicrotask(() => {
    if (textareaRef?.current) {
      textareaRef.current.selectionStart = caret;
      textareaRef.current.selectionEnd = caret;
    }
  });
  const set = (patch) => onFormat && onFormat(patch);

  // Every control here must leave focus on the textarea. A button that takes
  // focus fires the textarea's blur, which closes the editor and unmounts the
  // button before its own click can land — the control would look dead.
  const keepFocus = {
    onPointerDown: (e) => e.stopPropagation(),
    onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); },
  };
  const btn = (active) => ({
    width: 26, height: 26, borderRadius: 8, border: 'none', flexShrink: 0,
    background: active ? HW.accentSoft : 'transparent',
    color: active ? HW.accent : HW.textDim,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s, color 0.15s',
  });
  const divider = <div style={{ width: 1, height: 15, background: HW.hairline, margin: '0 2px', flexShrink: 0 }} />;
  const aligns = [
    { id: 'left', Icon: AlignLeft, label: 'ชิดซ้าย' },
    { id: 'center', Icon: AlignCenter, label: 'กึ่งกลาง' },
    { id: 'right', Icon: AlignRight, label: 'ชิดขวา' },
  ];
  const marks = [
    { id: 'bold', Icon: Bold, label: 'ตัวหนา' },
    { id: 'italic', Icon: Italic, label: 'ตัวเอียง' },
    { id: 'underline', Icon: Underline, label: 'ขีดเส้นใต้' },
  ];

  return (
    // The wrapper used to be a zero-by-zero box, because everything inside it
    // is absolutely positioned. Harmless on its own — but global.css styles
    // every input on the site with `width:100%; max-width:100%`, and 100% of
    // zero is zero. The textarea's own `width` was set and simply lost to that
    // max-width, so it rendered 0px wide: the text was there the whole time
    // (scrollHeight said so) with no width to show it in. Giving the wrapper the
    // note's real size, and taking the max-width cap off below, fixes it.
    <div style={{ position: 'absolute', top: y, left: x, width: noteHeight, height: noteHeight, zIndex: 100 }}>
      {/* Formatting bar. Sized in fixed pixels, not board units: it is chrome,
          so it stays usable when the note itself is zoomed far out. */}
      {onFormat && (
        <div
          {...keepFocus}
          style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 2, padding: '4px 6px',
            background: 'rgba(252,250,246,0.94)',
            backdropFilter: HW.blur, WebkitBackdropFilter: HW.blur,
            border: `1px solid ${HW.hairline}`, borderRadius: 12,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)', whiteSpace: 'nowrap',
          }}
        >
          {TEXT_COLORS.map((c) => {
            const on = (fmt.color || '#111827') === c.value;
            return (
              <button
                key={c.value} {...keepFocus} title={c.label}
                onClick={() => set({ textColor: c.value })}
                style={{
                  width: 17, height: 17, borderRadius: '50%', padding: 0, flexShrink: 0,
                  background: c.value, cursor: 'pointer',
                  border: on ? `2px solid ${HW.accent}` : '1px solid rgba(0,0,0,0.15)',
                  boxShadow: on ? `0 0 0 2px ${HW.accentSoft}` : 'none',
                }}
              />
            );
          })}
          {divider}
          <button {...keepFocus} title="เล็กลง" onClick={() => set({ textSize: stepTextSize(fmt.size || 16, -1) })} style={{ ...btn(false), width: 22 }}><Minus size={12} /></button>
          <span style={{ fontSize: 11.5, color: HW.text, minWidth: 16, textAlign: 'center', fontFamily: 'Kanit, sans-serif' }}>{Math.round(fmt.size || 16)}</span>
          <button {...keepFocus} title="ใหญ่ขึ้น" onClick={() => set({ textSize: stepTextSize(fmt.size || 16, 1) })} style={{ ...btn(false), width: 22 }}><Plus size={12} /></button>
          {divider}
          {aligns.map(({ id, Icon, label }) => (
            <button key={id} {...keepFocus} title={label} onClick={() => set({ textAlign: id })} style={btn(fmt.align === id)}>
              <Icon size={13} />
            </button>
          ))}
          {divider}
          {marks.map(({ id, Icon, label }) => (
            <button key={id} {...keepFocus} title={label} onClick={() => set({ [id]: !fmt[id] })} style={btn(!!fmt[id])}>
              <Icon size={13} />
            </button>
          ))}
          {divider}
          <button {...keepFocus} title="ลบโพสต์อิท" onClick={onDelete} style={{ ...btn(false), color: '#c0392b' }}>
            <Trash2 size={13} />
          </button>
        </div>
      )}

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
          // "->" becomes an arrow, and "- " or "* " at the start of a line
          // becomes a bullet.
          const next = autoformatPlainText(el.value, el.selectionStart)
            || applyPlainListTrigger(el.value, el.selectionStart);
          if (!next) { onChange(el.value); return; }
          onChange(next.value);
          putCaret(next.caret);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.shiftKey) return;
          const el = e.currentTarget;
          const next = continuePlainList(el.value, el.selectionStart);
          if (!next) return;
          e.preventDefault();
          onChange(next.value);
          putCaret(next.caret);
        }}
        onFocus={() => { hasFocused.current = true; }}
        onBlur={(e) => {
          // The formatting buttons live in this same wrapper. Focus landing on
          // one of them is not the user leaving the note.
          const wrap = e.currentTarget.parentElement;
          if (wrap && e.relatedTarget && wrap.contains(e.relatedTarget)) return;
          if (hasFocused.current) onCommit();
        }}
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
          color: fmt.color || '#111827',
          fontWeight: fmt.bold ? 700 : 400,
          fontStyle: fmt.italic ? 'italic' : 'normal',
          textDecoration: fmt.underline ? 'underline' : 'none',
          caretColor: HW.accent,
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
    </div>
  );
}
