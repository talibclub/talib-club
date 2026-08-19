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
