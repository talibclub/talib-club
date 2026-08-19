// Inline substitutions applied as you type, the way Samong and most modern
// editors do it: you type the ASCII shorthand and it becomes the real character.
//
// Deliberately small and unsurprising. Every entry is something with no other
// meaning in running Thai or English prose, so nothing gets rewritten out from
// under you. `--` is left alone on purpose: it shows up in code and in ranges
// often enough that turning it into an em dash would be a nuisance.
export const AUTOFORMAT_RULES = [
  { from: '-->', to: '⟶' },
  { from: '->',  to: '→' },
  { from: '<--', to: '⟵' },
  { from: '<-',  to: '←' },
  { from: '<->', to: '↔' },
  { from: '=>',  to: '⇒' },
  { from: '<=>', to: '⇔' },
  { from: '...', to: '…' },
  { from: '(c)', to: '©' },
  { from: '(r)', to: '®' },
  { from: '+-',  to: '±' },
  { from: '!=',  to: '≠' },
  { from: '>=',  to: '≥' },
  { from: '<=',  to: '≤' },
  { from: '1/2', to: '½' },
  { from: '1/4', to: '¼' },
  { from: '3/4', to: '¾' },
  { from: 'x2',  to: '×2' },
];

// Longest first, so "-->" wins over "->" and "<=>" over "<=".
const RULES = [...AUTOFORMAT_RULES].sort((a, b) => b.from.length - a.from.length);
const MAX_TRIGGER = Math.max(...RULES.map((r) => r.from.length));

/**
 * Given the text immediately before the caret, return what to replace and with
 * what — or null if nothing matches.
 * @returns {{ take: number, insert: string } | null}
 */
export function matchAutoformat(textBeforeCaret) {
  if (!textBeforeCaret) return null;
  const tail = textBeforeCaret.slice(-MAX_TRIGGER);
  for (const rule of RULES) {
    if (tail.endsWith(rule.from)) {
      return { take: rule.from.length, insert: rule.to };
    }
  }
  return null;
}

/**
 * Apply the substitutions to a plain string with a caret position — used by the
 * sticky-note editor, which is a real <textarea>.
 * @returns {{ value: string, caret: number } | null}
 */
export function autoformatPlainText(value, caret) {
  const hit = matchAutoformat(value.slice(0, caret));
  if (!hit) return null;
  const start = caret - hit.take;
  return {
    value: value.slice(0, start) + hit.insert + value.slice(caret),
    caret: start + hit.insert.length,
  };
}

// ── Markdown shorthand ──────────────────────────────────────────────────────
//
// Two kinds. Line triggers fire when the shorthand is the only thing typed so
// far on a line and you press space; inline wraps fire when you close a pair.
// Both are what people already type out of habit, which is the whole point —
// nobody should have to reach for the toolbar to make a bullet.

export const LINE_TRIGGERS = [
  { from: '- ',  action: { type: 'list', value: 'bullet' } },
  { from: '* ',  action: { type: 'list', value: 'bullet' } },
  { from: '1. ', action: { type: 'list', value: 'number' } },
  { from: '# ',  action: { type: 'heading', value: 1 } },
  { from: '## ', action: { type: 'heading', value: 2 } },
];

/**
 * The whole line so far, before the caret. Returns the action to run and how
 * many characters of shorthand to delete, or null.
 * @returns {{ take: number, action: {type: string, value: any} } | null}
 */
export function matchLineTrigger(lineBeforeCaret) {
  if (!lineBeforeCaret) return null;
  // Longest first so "## " beats "# ".
  const sorted = [...LINE_TRIGGERS].sort((a, b) => b.from.length - a.from.length);
  for (const rule of sorted) {
    // Only when the shorthand IS the line so far — "a - b" must stay as typed.
    if (lineBeforeCaret === rule.from) {
      return { take: rule.from.length, action: rule.action };
    }
  }
  return null;
}

export const INLINE_WRAPS = [
  { marker: '**', flag: 'bold' },
  { marker: '__', flag: 'underline' },
  { marker: '~~', flag: 'strikethrough' },
  { marker: '*',  flag: 'italic' },
  { marker: '_',  flag: 'italic' },
];

/**
 * Detect a just-closed **bold** / *italic* / ~~strike~~ pair ending at the
 * caret. Returns the span to restyle and the markers to strip.
 * @returns {{ start: number, end: number, inner: string, flag: string } | null}
 */
export function matchInlineWrap(textBeforeCaret) {
  if (!textBeforeCaret) return null;
  const sorted = [...INLINE_WRAPS].sort((a, b) => b.marker.length - a.marker.length);
  for (const { marker, flag } of sorted) {
    if (!textBeforeCaret.endsWith(marker)) continue;
    const bodyEnd = textBeforeCaret.length - marker.length;
    const openIdx = textBeforeCaret.lastIndexOf(marker, bodyEnd - 1);
    if (openIdx < 0) continue;
    const inner = textBeforeCaret.slice(openIdx + marker.length, bodyEnd);
    // Needs actual content, and no stray marker inside it.
    if (!inner || inner.includes(marker)) continue;
    return { start: openIdx, end: textBeforeCaret.length, inner, flag };
  }
  return null;
}
