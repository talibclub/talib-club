import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Minus, Plus, MoreHorizontal, Bold, Italic, Underline, Strikethrough } from 'lucide-react';
import { FONT_OPTIONS, LINE_HEIGHT, TEXT_COLORS, HW } from './theme.js';
import { migrateText, makeLine, listPrefixes } from './geometry.js';
import { matchAutoformat, matchLineTrigger, matchInlineWrap } from './textAutoformat.js';

// WYSIWYG in-place editor for a text object with PER-LINE formatting.
//
// Every line is a real block element inside one contentEditable box, carrying its
// own format in `data-fmt` plus the matching inline styles — so bold, italic,
// underline, strike-through, alignment and bullets are visible WHILE typing,
// exactly as the canvas will draw them. (The old textarea could only show the
// result after committing, which is the thing that felt broken.)
//
// Two rules keep Thai/IME input safe:
//   1. The DOM is the source of truth. React never re-renders the text content —
//      it is built once on mount and the browser owns it from then on.
//   2. Nothing touches the DOM while a composition (IME) is in flight; the
//      restyle/renumber pass waits for compositionend.
// Because the format lives on the line element itself, pressing Enter mid-list
// carries the format with the line the browser clones — no index bookkeeping to
// drift out of sync.

const DEF = { bold: false, italic: false, underline: false, strikethrough: false, list: 'none', align: 'left', size: null };
const FLAGS = ['bold', 'italic', 'underline', 'strikethrough'];

const readFmt = (el) => {
  try { return { ...DEF, ...JSON.parse(el.dataset.fmt || '{}') }; } catch { return { ...DEF }; }
};

const styleLine = (el, f) => {
  el.style.fontWeight = f.bold ? '700' : '400';
  el.style.fontStyle = f.italic ? 'italic' : 'normal';
  el.style.textDecoration = [f.underline ? 'underline' : '', f.strikethrough ? 'line-through' : ''].filter(Boolean).join(' ') || 'none';
  el.style.textAlign = f.align || 'left';
  el.style.paddingLeft = f.list && f.list !== 'none' ? '1.6em' : '0';
};

const writeFmt = (el, f) => {
  // Store only the format keys — a line object also carries its text, which has
  // no business being duplicated into an attribute.
  const clean = { ...DEF };
  Object.keys(DEF).forEach((k) => { clean[k] = f[k] ?? DEF[k]; });
  el.dataset.fmt = JSON.stringify(clean);
  styleLine(el, clean);
};

const lineEls = (root) => (root ? Array.from(root.children).filter((n) => n.nodeType === 1) : []);
const textOfEl = (el) => el.textContent.replace(/\n/g, '');

const makeLineEl = (text, fmt) => {
  const d = document.createElement('div');
  d.className = 'pn-ln';
  writeFmt(d, { ...DEF, ...fmt });
  if (text) d.textContent = text;
  else d.appendChild(document.createElement('br'));
  return d;
};

// True when the caret sits at the very end of this line's text.
const caretAtEndOf = (el) => {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || !sel.rangeCount) return false;
  const r = sel.getRangeAt(0);
  if (!el.contains(r.startContainer)) return false;
  const after = document.createRange();
  after.selectNodeContents(el);
  after.setStart(r.endContainer, r.endOffset);
  return after.toString().length === 0;
};

const caretToEnd = (el) => {
  const r = document.createRange();
  r.selectNodeContents(el);
  r.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
};

// Declared at module scope. As a function defined inside the component body it
// was a brand new component type on every render, so React unmounted and
// remounted every format button on each keystroke — which is what made the
// toolbar drop focus mid-typing.
const FORMAT_BTN_STYLE = { width: 28, height: 28, borderRadius: 10, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'background 0.15s, color 0.15s' };
const FormatBtn = ({ icon, active, onClick }) => (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    style={{ ...FORMAT_BTN_STYLE, background: active ? HW.accentSoft : 'transparent', color: active ? HW.accent : HW.textDim }}
  >
    {icon}
  </button>
);

export default function TextEditor({ x, y, scale, t, textareaRef, onChange, onLinesChange, onFont, onSize, onColor, onCommit }) {
  // The format bar is anchored to the text box's left edge with
  // `width: max-content` and `maxWidth: calc(100vw - 32px)`. Two problems: a box
  // near the right of the notebook pushed the bar off the edge, and the clamp
  // was against the VIEWPORT while the notebook is normally half of it — so the
  // bold/italic/underline buttons were simply cut off. max-content also defeats
  // the flexWrap that was already there, since a max-content box never wraps.
  //
  // Measure the pane and the bar, then pull the bar back inside and let it wrap.
  // Everything past the essentials lives behind a single ⋯ button. The bar was
  // four stacked rows floating over the note, which is most of what made it feel
  // heavy — it is one slim row now unless you ask for the rest.
  const [moreOpen, setMoreOpen] = useState(false);
  const barRef = useRef(null);
  const [barShift, setBarShift] = useState(0);
  const [barMax, setBarMax] = useState(null);
  useLayoutEffect(() => {
    const bar = barRef.current;
    const host = bar?.closest('[data-text-editor]')?.parentElement;
    if (!bar || !host) return;
    const hostBox = host.getBoundingClientRect();
    const room = Math.max(180, hostBox.width - 24);
    const width = Math.min(bar.scrollWidth, room);
    // x is the box's offset inside the pane; keep [x + shift, x + shift + width]
    // within [8, paneWidth - 8].
    const overflowRight = (x + width) - (hostBox.width - 8);
    const shift = overflowRight > 0 ? -Math.min(overflowRight, Math.max(0, x - 8)) : 0;
    setBarMax((prev) => (prev !== room ? room : prev));
    setBarShift((prev) => (prev !== shift ? shift : prev));
  });
  const localRef = useRef(null);
  const edRef = textareaRef || localRef;
  const composing = useRef(false);
  const savedRange = useRef(null);
  const [active, setActive] = useState(DEF);

  const size = t.size || 24;
  const fontFamily = t.fontFamily || 'Kanit';

  // --- reading / emitting -------------------------------------------------
  const emit = useCallback(() => {
    const el = edRef.current;
    if (!el) return;
    const lines = lineEls(el).map((d) => makeLine(textOfEl(d), readFmt(d)));
    onChange?.(lines.map((l) => l.text).join('\n'));
    onLinesChange?.(lines);
  }, [edRef, onChange, onLinesChange]);

  // Re-apply styles to any line the browser created for us (Enter, paste) and
  // refresh the bullet/number gutter, which is drawn with a CSS ::before so it
  // never becomes part of the text.
  const reflow = useCallback(() => {
    const el = edRef.current;
    if (!el) return;

    // Stray top-level text nodes appear if the whole box gets emptied; wrap them
    // so every line stays a styled block.
    Array.from(el.childNodes).forEach((n) => {
      if (n.nodeType === 3 && n.textContent) {
        const wrap = makeLineEl(n.textContent, readFmt(n.previousElementSibling || el));
        el.replaceChild(wrap, n);
        caretToEnd(wrap);
      } else if (n.nodeType === 3) {
        el.removeChild(n);
      }
    });
    if (!el.firstElementChild) {
      const first = makeLineEl('', active);
      el.appendChild(first);
      caretToEnd(first);
    }

    const els = lineEls(el);
    els.forEach((d, i) => {
      d.classList.add('pn-ln');
      // A line the browser cloned keeps data-fmt; one it built from scratch
      // inherits the line above (so Enter continues a bullet).
      if (!d.dataset.fmt) writeFmt(d, i > 0 ? readFmt(els[i - 1]) : { ...DEF });
      else styleLine(d, readFmt(d));
      // A heading line carries its own size. Set here rather than in styleLine,
      // which is module scope and has no idea what the board zoom is.
      const lf = readFmt(d);
      d.style.fontSize = lf.size ? `${lf.size * scale}px` : '';
    });

    const prefixes = listPrefixes(els.map((d) => makeLine(textOfEl(d), readFmt(d))));
    els.forEach((d, i) => {
      const p = (prefixes[i] || '').trim();
      if (p) d.dataset.prefix = p;
      else delete d.dataset.prefix;
    });

    // A line holding only a <br> isn't :empty, so the placeholder is driven by a
    // flag instead of a CSS pseudo-class.
    if (els.length === 1 && !textOfEl(els[0])) el.dataset.empty = '1';
    else delete el.dataset.empty;
  }, [edRef, active, scale]);

  // --- selection ----------------------------------------------------------
  const rememberSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && edRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, [edRef]);

  const selectedLines = useCallback(() => {
    const el = edRef.current;
    const all = lineEls(el);
    const r = savedRange.current;
    if (!r) return all.slice(0, 1);
    const hit = all.filter((d) => {
      try { return r.intersectsNode(d); } catch { return false; }
    });
    return hit.length ? hit : all.slice(0, 1);
  }, [edRef]);

  const syncActive = useCallback(() => {
    const sel = selectedLines().map(readFmt);
    if (!sel.length) return;
    const common = { ...DEF };
    FLAGS.forEach((f) => { common[f] = sel.every((s) => s[f]); });
    common.list = sel.every((s) => s.list === sel[0].list) ? sel[0].list : 'none';
    common.align = sel.every((s) => s.align === sel[0].align) ? sel[0].align : 'left';
    setActive(common);
  }, [selectedLines]);

  // --- mount --------------------------------------------------------------
  useEffect(() => {
    const el = edRef.current;
    if (!el) return;
    try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch { /* older browsers */ }
    const seed = migrateText(t).lines;
    el.innerHTML = '';
    (seed.length ? seed : [makeLine('')]).forEach((l) => el.appendChild(makeLineEl(l.text, l)));
    reflow();
    el.focus();
    caretToEnd(el.lastElementChild || el);
    rememberSelection();
    syncActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onSelChange = () => {
      if (!edRef.current) return;
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode || !edRef.current.contains(sel.anchorNode)) return;
      rememberSelection();
      syncActive();
    };
    document.addEventListener('selectionchange', onSelChange);
    return () => document.removeEventListener('selectionchange', onSelChange);
  }, [edRef, rememberSelection, syncActive]);

  // --- editing events -----------------------------------------------------
  // Rewrite "->" into an arrow and friends as you type, the way Samong does.
  // Runs on the text node under the caret and puts the caret back where it
  // belongs, so it is invisible unless you were looking for it. Skipped while an
  // IME is composing — rewriting mid-composition would eat Thai input.
  const applyAutoformat = () => {
    if (composing.current) return false;
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return false;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== 3) return false;
    if (!edRef.current?.contains(node)) return false;

    const caret = sel.anchorOffset;
    const hit = matchAutoformat(node.textContent.slice(0, caret));
    if (!hit) return false;

    const start = caret - hit.take;
    node.textContent = node.textContent.slice(0, start) + hit.insert + node.textContent.slice(caret);
    const range = document.createRange();
    const pos = Math.min(start + hit.insert.length, node.textContent.length);
    range.setStart(node, pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  };

  // Markdown shorthand while typing. "- " at the start of a line becomes a
  // bullet, "**คำ**" becomes bold — the things people already type by habit,
  // so a list does not require a trip to the toolbar.
  const applyMarkdown = () => {
    if (composing.current) return false;
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return false;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== 3 || !edRef.current?.contains(node)) return false;

    const caret = sel.anchorOffset;
    const before = node.textContent.slice(0, caret);

    const line = matchLineTrigger(before);
    if (line) {
      node.textContent = node.textContent.slice(caret);
      const range = document.createRange();
      range.setStart(node, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      if (line.action.type === 'list') toggleList(line.action.value);
      // "# " used to resize the entire box, which is not what a heading is: it
      // marks one line. It sets that line's own size and weight now, so a title
      // can sit above ordinary lines — the thing per-line formatting is for.
      else if (line.action.type === 'heading') setHeading(line.action.value);
      return true;
    }

    const wrap = matchInlineWrap(before);
    if (wrap) {
      // Drop the markers, leave the words, and turn the style on for what is
      // typed next — restyling just the span needs range surgery the flat line
      // model here cannot express.
      node.textContent = node.textContent.slice(0, wrap.start) + wrap.inner + node.textContent.slice(caret);
      const range = document.createRange();
      range.setStart(node, Math.min(wrap.start + wrap.inner.length, node.textContent.length));
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      toggleFlag(wrap.flag);
      return true;
    }
    return false;
  };

  const handleInput = () => {
    if (!applyMarkdown()) applyAutoformat();
    if (!composing.current) reflow();
    emit();
  };

  const applyToLines = (mutate) => {
    const els = selectedLines();
    if (!els.length) return;
    const cur = els.map(readFmt);
    els.forEach((d, i) => writeFmt(d, mutate(cur[i], cur)));
    reflow();
    emit();
    syncActive();
    // The buttons never take focus (mousedown is prevented), so the caret and
    // any selection are still exactly where the user left them.
    edRef.current?.focus();
  };

  const toggleFlag = (flag) => applyToLines((f, all) => ({ ...f, [flag]: !all.every((s) => s[flag]) }));
  // Heading level 1 or 2, relative to the box's own size so a note set to small
  // text gets proportionally small headings rather than fixed 32px ones.
  const headingSize = (level) => Math.round(size * (level === 1 ? 1.45 : 1.2));
  const setHeading = (level) => applyToLines((f, all) => {
    const target = headingSize(level);
    const alreadyThis = all.every((s) => s.size === target);
    return { ...f, size: alreadyThis ? null : target, bold: !alreadyThis };
  });
  const setAlign = (val) => applyToLines((f) => ({ ...f, align: val }));
  const toggleList = (val) => applyToLines((f, all) => ({ ...f, list: all.every((s) => s.list === val) ? 'none' : val }));

  // Paste as plain text, one block per line, inheriting the current line's format.
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)?.getData('text/plain') || '';
    if (!text) return;
    const parts = text.replace(/\r\n?/g, '\n').split('\n');
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    sel.deleteFromDocument();
    document.execCommand('insertText', false, parts[0]);
    if (parts.length > 1) {
      let anchor = lineEls(edRef.current).find((d) => d.contains(sel.anchorNode)) || edRef.current.lastElementChild;
      const fmt = anchor ? readFmt(anchor) : DEF;
      parts.slice(1).forEach((p) => {
        const d = makeLineEl(p, fmt);
        anchor.after(d);
        anchor = d;
      });
      caretToEnd(anchor);
    }
    reflow();
    emit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); edRef.current?.blur(); return; }

    // Enter at the end of a heading starts an ordinary line. The browser clones
    // the current line to make the next one, data-fmt and all, so a title used
    // to breed more titles — every line after it came out big and bold until you
    // turned it off by hand. A bullet is worth carrying on; a heading is not.
    // Alignment and list carry over either way.
    if (e.key === 'Enter' && !e.shiftKey && !composing.current) {
      const el = edRef.current;
      const here = lineEls(el).find((d) => d.contains(window.getSelection()?.anchorNode));
      const f = here ? readFmt(here) : null;
      if (f?.size && caretAtEndOf(here)) {
        e.preventDefault();
        const next = makeLineEl('', { ...f, size: null, bold: false });
        here.after(next);
        caretToEnd(next);
        reflow();
        emit();
        return;
      }
    }
    // Shift+Enter would insert a <br> inside the line; make it a real new line
    // so the canvas and the editor always agree on where lines break.
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertParagraph');
    }
  };

  // --- toolbar ------------------------------------------------------------
  const toolBtn = (on) => ({ width: 30, height: 30, borderRadius: 10, border: 'none', background: on ? HW.accentSoft : 'transparent', color: on ? HW.accent : HW.textDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s, color 0.15s' });
  const sep = <div style={{ width: 1, height: 18, background: 'var(--br2)', margin: '0 3px', flexShrink: 0 }} />;
  const noFocusSteal = { onMouseDown: (e) => e.preventDefault() };


  return (
    <div data-text-editor style={{ position: 'absolute', top: y, left: x, zIndex: 3000, isolation: 'isolate' }}>
      <style>{`
        [data-text-editor], [data-text-editor] * {
          -webkit-user-select: text !important;
          user-select: text !important;
        }
        .pn-ed .pn-ln { min-height: 1.2em; }
        .pn-ed .pn-ln[data-prefix]::before {
          content: attr(data-prefix);
          display: inline-block;
          width: 1.6em;
          margin-left: -1.6em;
          opacity: 0.85;
          font-weight: 400;
          font-style: normal;
          text-decoration: none;
        }
        .pn-ed[data-empty="1"] .pn-ln::after {
          content: "พิมพ์ข้อความที่นี่...";
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>

      <div style={{ 
        position: 'absolute', 
        top: y < 60 ? '100%' : 'auto', 
        bottom: y >= 60 ? '100%' : 'auto', 
        marginTop: y < 60 ? 6 : 0, 
        marginBottom: y >= 60 ? 6 : 0, 
        left: barShift,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5,
        // Frosted like the rest of the notebook chrome. A solid white slab over
        // the page is what made this look bolted on.
        background: HW.surfaceStrong,
        backdropFilter: HW.blur, WebkitBackdropFilter: HW.blur,
        padding: '7px 9px', borderRadius: 16,
        boxShadow: HW.shadow, border: `1px solid ${HW.hairline}`,
        maxWidth: barMax ? `${barMax}px` : 'calc(100vw - 32px)'
      }} ref={barRef}>
        <select
          value={fontFamily}
          onChange={(e) => { onFont(e.target.value); setTimeout(() => edRef.current?.focus(), 0); }}
          title="เปลี่ยนฟอนต์"
          style={{ height: 28, borderRadius: 9, border: 'none', background: 'rgba(35,31,27,0.05)', color: HW.text, fontSize: 12, padding: '0 22px 0 9px', cursor: 'pointer', fontFamily, maxWidth: 104, flexShrink: 0, appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%235d5850' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
        </select>

        {onSize && (
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(35,31,27,0.05)', borderRadius: 9, height: 28 }}>
            <button {...noFocusSteal} onClick={() => onSize(Math.max(10, size - 2))} style={{ ...toolBtn(false), width: 24, height: 24 }} title="เล็กลง"><Minus size={13} /></button>
            <span style={{ fontSize: 12, color: '#4B5563', minWidth: 20, textAlign: 'center' }}>{size}</span>
            <button {...noFocusSteal} onClick={() => onSize(Math.min(96, size + 2))} style={{ ...toolBtn(false), width: 24, height: 24 }} title="ใหญ่ขึ้น"><Plus size={13} /></button>
          </div>
        )}

        {onColor && (
          <>
            <div style={{ width: 1, height: 16, background: HW.hairline, margin: '0 3px' }} />
            {/* Swatches, not a colour well. The well opened the native
                <input type="color">, which does nothing at all on several
                tablet browsers — the same reason ColorPickerPanel exists — and
                even where it worked it took two taps and a system dialog to
                pick black. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              {TEXT_COLORS.map((c) => {
                const on = (t.color || '#1a1916').toLowerCase() === c.value.toLowerCase();
                return (
                  <button
                    key={c.value}
                    {...noFocusSteal}
                    onClick={(e) => { e.stopPropagation(); onColor(c.value); }}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={on}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', padding: 0, cursor: 'pointer',
                      background: c.value, flexShrink: 0,
                      border: on ? '2px solid #fff' : 'none',
                      boxShadow: on
                        ? `0 0 0 2px ${c.value}, inset 0 0 0 1px rgba(0,0,0,0.12)`
                        : 'inset 0 0 0 1px rgba(0,0,0,0.14)',
                      transition: 'box-shadow 0.15s',
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
        
        <div style={{ width: 1, height: 16, background: HW.hairline, margin: '0 3px' }} />

        <div style={{ display: 'flex', gap: 2 }}>
          {[
            // Icons, not serif letters. Latin B/I/U next to a row of lucide
            // glyphs was the most obviously mismatched thing in the bar, and
            // "B" for หนา means nothing to a Thai reader who is not already
            // used to Word.
            { id: 'bold', label: <Bold size={15} /> },
            { id: 'italic', label: <Italic size={15} /> },
            { id: 'underline', label: <Underline size={15} /> },
            { id: 'strikethrough', label: <Strikethrough size={15} /> },
          ].map((b) => (
            <button key={b.id} {...noFocusSteal} onClick={(e) => { e.stopPropagation(); toggleFlag(b.id); }} style={{...toolBtn(active[b.id]), width: 26, height: 26}}>{b.label}</button>
          ))}
        </div>
        
        <button
          {...noFocusSteal}
          onClick={(e) => { e.stopPropagation(); setMoreOpen((v) => !v); }}
          title="รายการและการจัดวาง"
          aria-expanded={moreOpen}
          style={{ ...FORMAT_BTN_STYLE, background: moreOpen ? HW.accentSoft : 'transparent', color: moreOpen ? HW.accent : HW.textDim, marginLeft: 2 }}
        >
          <MoreHorizontal size={16} />
        </button>

        {moreOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', paddingTop: 5, marginTop: 1, borderTop: `1px solid ${HW.hairline}` }}>
            <FormatBtn icon={<List size={15} />} active={active.list === 'bullet'} onClick={() => toggleList('bullet')} />
            <FormatBtn icon={<ListOrdered size={15} />} active={active.list === 'number'} onClick={() => toggleList('number')} />
            <div style={{ width: 1, height: 16, background: HW.hairline, margin: '0 4px' }} />
            <FormatBtn icon={<AlignLeft size={15} />} active={!active.align || active.align === 'left'} onClick={() => setAlign('left')} />
            <FormatBtn icon={<AlignCenter size={15} />} active={active.align === 'center'} onClick={() => setAlign('center')} />
            <FormatBtn icon={<AlignRight size={15} />} active={active.align === 'right'} onClick={() => setAlign('right')} />
          </div>
        )}
      </div>

      <div
        ref={edRef}
        className="pn-ed"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder="พิมพ์ข้อความที่นี่..."
        spellCheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; reflow(); emit(); }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onBlur={(e) => {
          // Stay open when focus moves to one of our own controls.
          const editor = e.currentTarget.closest('[data-text-editor]');
          if (editor && e.relatedTarget && editor.contains(e.relatedTarget)) return;
          onCommit();
        }}
        style={{
          margin: 0,
          padding: 8,
          border: `1.5px solid ${HW.accentRing}`,
          borderRadius: 14,
          // Near-transparent rather than a white card. The editor sits over the
          // page — and over a sticky note's own colour — so painting a panel
          // behind the words hid exactly the thing being written on. The ring
          // is what says "you are editing"; the fill only has to lift the text
          // enough to stay legible over a dark PDF.
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'saturate(120%) blur(1.5px)',
          WebkitBackdropFilter: 'saturate(120%) blur(1.5px)',
          boxShadow: `0 0 0 4px ${HW.accentSoft}`,
          color: t.color,
          fontSize: `${size * scale}px`,
          fontFamily,
          lineHeight: LINE_HEIGHT,
          outline: 'none',
          minWidth: 240,
          minHeight: 44,
          maxWidth: '90vw',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          // `borderRadius: 10` and a plain drop shadow used to be repeated here,
          // silently replacing the rounder corner and the accent focus ring set
          // above — so the editor never actually looked focused. Duplicate keys
          // in one object literal; the last one simply wins.
          cursor: 'text',
          // The reading room disables text selection / uses touch-action:none on
          // the drawing surface; force them back on for the editor so a mouse
          // drag (and touch) can actually select text, not just Ctrl+A.
          userSelect: 'text',
          WebkitUserSelect: 'text',
          WebkitTouchCallout: 'default',
          touchAction: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}
