import React, { useEffect, useRef } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Italic,
  List, ListOrdered, RemoveFormatting, Strikethrough, Underline,
} from 'lucide-react';
import { HW } from './theme.js';

const ICONS = {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Italic,
  List, ListOrdered, RemoveFormatting, Strikethrough, Underline,
};

// The "/" menu. Presentational: the editor owns the query, the highlighted row
// and what happens on pick.
//
// Deliberately plain — one icon and one label per row, no grouping and no
// descriptions. Someone typing wants to recognise a word and press Enter, and
// every extra thing on the row is something to read first.
export default function SlashMenu({ items, active, onPick, onHover, x, y, above }) {
  const listRef = useRef(null);

  // Keep the highlighted row in view when arrowing past the visible few.
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="1"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!items.length) return null;

  return (
    <div
      // The editor keeps focus: a click here must not blur it, or the menu
      // unmounts before the pick lands.
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
      style={{
        position: 'fixed', left: x, top: above ? undefined : y, bottom: above ? y : undefined,
        zIndex: 4000, width: 226, maxHeight: 268, overflowY: 'auto',
        padding: 5, borderRadius: 14,
        background: 'rgba(252,250,246,0.86)',
        backdropFilter: HW.blur, WebkitBackdropFilter: HW.blur,
        border: `1px solid ${HW.hairline}`,
        boxShadow: '0 10px 34px rgba(35,31,27,0.16)',
        fontFamily: 'Kanit, sans-serif',
      }}
      ref={listRef}
      className="hide-scroll"
    >
      {items.map((c, i) => {
        const Icon = ICONS[c.icon] || List;
        const on = i === active;
        return (
          <button
            key={c.id}
            data-active={on ? '1' : '0'}
            onMouseEnter={() => onHover(i)}
            onClick={() => onPick(c)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 9px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: on ? HW.accentSoft : 'transparent',
              color: on ? HW.accent : HW.text,
              fontSize: 13.5, fontFamily: 'Kanit, sans-serif', textAlign: 'left',
              transition: 'background 0.12s',
            }}
          >
            <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0, opacity: on ? 1 : 0.65 }} />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
            {c.hint && (
              <span style={{ fontSize: 11, opacity: 0.45, fontFamily: 'monospace', flexShrink: 0 }}>{c.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
