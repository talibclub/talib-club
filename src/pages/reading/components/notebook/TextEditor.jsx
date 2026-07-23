import React, { useState, useRef, useCallback } from 'react';
import { AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';
import { FONT_OPTIONS } from './theme.js';
import { migrateText, makeLine, listPrefixes } from './geometry.js';

// In-place editor for a text object with PER-LINE formatting (item 9, phase 2).
//
// We keep a plain <textarea> for text entry — it handles Thai/IME input far more
// reliably than a contentEditable would — and track a parallel per-line format
// array. Bold/italic/underline/strikethrough/list/align apply to the line(s) the
// caret or selection spans, so a single box can mix (e.g.) a bulleted heading
// with plain body lines. On every change we emit the rebuilt `lines[]` upward;
// the canvas already renders those per line.

const FLAGS = ['bold', 'italic', 'underline', 'strikethrough'];
const fmtOf = (l) => ({ bold: !!l.bold, italic: !!l.italic, underline: !!l.underline, strikethrough: !!l.strikethrough, list: l.list || 'none', align: l.align || 'left' });

// Which line indices does the char range [start,end] touch?
const lineRange = (text, start, end) => {
  const from = (text.slice(0, start).match(/\n/g) || []).length;
  const to = (text.slice(0, end).match(/\n/g) || []).length;
  return [from, to];
};

export default function TextEditor({ x, y, scale, t, textareaRef, onChange, onLinesChange, onFont, onCommit }) {
  const seed = migrateText(t).lines;
  const [value, setValue] = useState(() => seed.map((l) => l.text).join('\n'));
  const [fmts, setFmts] = useState(() => seed.map(fmtOf));
  const [caret, setCaret] = useState([0, 0]); // [fromLine, toLine] of the current selection
  const localRef = useRef(null);
  const areaRef = textareaRef || localRef;

  const buildLines = useCallback((val, fs) => val.split('\n').map((text, i) => makeLine(text, fs[i] || {})), []);

  const emit = useCallback((val, fs) => {
    onChange?.(val);
    onLinesChange?.(buildLines(val, fs));
  }, [onChange, onLinesChange, buildLines]);

  // Keep the format array the same length as the text lines. New lines inherit
  // the format of the previous last line (so pressing Enter continues a bullet);
  // removed lines drop off the end.
  const reconcile = (prevFs, val) => {
    const n = val.split('\n').length;
    const out = [];
    const fallback = prevFs[prevFs.length - 1] || fmtOf({});
    for (let i = 0; i < n; i++) out.push(prevFs[i] ? { ...prevFs[i] } : { ...fallback });
    return out;
  };

  const handleChange = (val) => {
    const nextFmts = reconcile(fmts, val);
    setValue(val);
    setFmts(nextFmts);
    emit(val, nextFmts);
  };

  const syncCaret = () => {
    const el = areaRef.current;
    if (!el) return;
    setCaret(lineRange(value, el.selectionStart, el.selectionEnd));
  };

  // Apply a change to every line the caret/selection currently spans.
  const applyToSelectedLines = (mutate) => {
    const el = areaRef.current;
    const [from, to] = el ? lineRange(value, el.selectionStart, el.selectionEnd) : caret;
    const next = fmts.map((f, i) => (i >= from && i <= to ? mutate(f, i) : f));
    setFmts(next);
    emit(value, next);
    // keep the textarea focused so the user can keep formatting/typing
    setTimeout(() => areaRef.current?.focus(), 0);
  };

  const toggleFlag = (flag) => applyToSelectedLines((f) => {
    // If any selected line lacks the flag, turn it on for all; else turn all off.
    const el = areaRef.current;
    const [from, to] = el ? lineRange(value, el.selectionStart, el.selectionEnd) : caret;
    const allOn = fmts.slice(from, to + 1).every((x) => x[flag]);
    return { ...f, [flag]: !allOn };
  });

  const setAlign = (val) => applyToSelectedLines((f) => ({ ...f, align: val }));

  const toggleList = (val) => applyToSelectedLines((f) => {
    const el = areaRef.current;
    const [from, to] = el ? lineRange(value, el.selectionStart, el.selectionEnd) : caret;
    const allSame = fmts.slice(from, to + 1).every((x) => (x.list || 'none') === val);
    return { ...f, list: allSame ? 'none' : val };
  });

  // Active state of a toolbar button = every line in the current selection has it.
  const [cf, ct] = caret;
  const sel = fmts.slice(cf, ct + 1);
  const flagActive = (flag) => sel.length > 0 && sel.every((f) => f[flag]);
  const alignActive = (val) => sel.length > 0 && sel.every((f) => (f.align || 'left') === val);
  const listActive = (val) => sel.length > 0 && sel.every((f) => (f.list || 'none') === val);

  const toolBtn = (active) => ({ width: 28, height: 28, borderRadius: 6, border: 'none', background: active ? 'var(--teal-light)' : 'transparent', color: active ? 'var(--teal)' : '#4B5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const sep = <div style={{ width: 1, height: 16, background: 'var(--br2)', margin: '0 4px' }} />;

  // The list gutter mirrors what the canvas will draw, per line.
  const prefixes = listPrefixes(buildLines(value, fmts));
  const hasList = fmts.some((f) => f.list && f.list !== 'none');

  return (
    <div data-text-editor style={{ position: 'absolute', top: y - 50, left: x, zIndex: 101, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'white', padding: '6px', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid var(--br2)', maxWidth: '92vw', overflowX: 'auto' }}>
        {/* Font selector — box-level (restyles the whole text's font) */}
        <select
          value={t.fontFamily || 'Kanit'}
          onMouseDown={e => e.stopPropagation()}
          onChange={(e) => { onFont(e.target.value); setTimeout(() => areaRef.current?.focus(), 0); }}
          title="เปลี่ยนฟอนต์"
          style={{ height: 28, borderRadius: 6, border: '1px solid var(--br2)', background: '#F9FAFB', color: '#111827', fontSize: 12.5, padding: '0 6px', cursor: 'pointer', fontFamily: t.fontFamily || 'Kanit', maxWidth: 118 }}
        >
          {FONT_OPTIONS.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>
        {sep}
        {[
          { id: 'bold', icon: <span style={{ fontWeight: 700, fontFamily: 'serif', fontSize: 16 }}>B</span> },
          { id: 'italic', icon: <span style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: 16 }}>I</span> },
          { id: 'underline', icon: <span style={{ textDecoration: 'underline', fontFamily: 'serif', fontSize: 16 }}>U</span> },
        ].map(btn => (
          <button key={btn.id} onMouseDown={e => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleFlag(btn.id); }} style={toolBtn(flagActive(btn.id))}>{btn.icon}</button>
        ))}
        {sep}
        {[
          { id: 'left', icon: <AlignLeft size={16} /> },
          { id: 'center', icon: <AlignCenter size={16} /> },
          { id: 'right', icon: <AlignRight size={16} /> },
        ].map(btn => (
          <button key={btn.id} onMouseDown={e => e.preventDefault()} onClick={(e) => { e.stopPropagation(); setAlign(btn.id); }} style={toolBtn(alignActive(btn.id))}>{btn.icon}</button>
        ))}
        {sep}
        {[
          { id: 'bullet', icon: <List size={16} /> },
          { id: 'number', icon: <ListOrdered size={16} /> },
        ].map(btn => (
          <button key={btn.id} onMouseDown={e => e.preventDefault()} onClick={(e) => { e.stopPropagation(); toggleList(btn.id); }} style={toolBtn(listActive(btn.id))}>{btn.icon}</button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        {hasList && (
          <div style={{ position: 'absolute', top: 8, left: 8, pointerEvents: 'none', color: t.color || 'black', fontSize: (t.size || 24) * scale, fontFamily: t.fontFamily || 'Kanit', lineHeight: 1.2, zIndex: 101 }}>
            {value.split('\n').map((_, i) => <div key={i} style={{ minHeight: '1.2em', lineHeight: 1.2 }}>{(prefixes[i] || '').trim()}</div>)}
          </div>
        )}
        <textarea
          ref={areaRef}
          placeholder="พิมพ์ข้อความที่นี่..."
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onSelect={syncCaret}
          onKeyUp={syncCaret}
          onClick={syncCaret}
          onBlur={(e) => {
            // Keep the editor open when focus moves to one of its own controls
            // (the font <select>, format buttons) so they can restyle the text.
            const editor = e.currentTarget.closest('[data-text-editor]');
            if (editor && e.relatedTarget && editor.contains(e.relatedTarget)) return;
            onCommit();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            margin: 0,
            padding: 8,
            paddingLeft: hasList ? ((t.size || 24) * scale) + 12 : 8,
            border: '2px solid var(--teal)',
            background: 'rgba(255,255,255,0.95)',
            color: t.color,
            fontSize: `${t.size * scale}px`,
            fontFamily: t.fontFamily || 'Kanit',
            lineHeight: 1.2,
            outline: 'none',
            resize: 'none',
            minWidth: 240,
            minHeight: 100,
            overflow: 'hidden',
            zIndex: 100,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') areaRef.current?.blur();
          }}
        />
      </div>
    </div>
  );
}
