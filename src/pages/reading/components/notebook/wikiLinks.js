// "[[" links one page of the notebook to another.
//
// The link belongs to the line, not to a span inside it: a line already carries
// its own size, alignment and marks, and Konva draws text a line at a time, so a
// line is the smallest thing that can be styled and hit-tested without splitting
// every string into pieces. In practice that is also how these get written — a
// contents page is a list of links, one per line.

// Where a "[[" token starts and what has been typed after it.
//
// Closes on "]]" so a finished link stops re-opening the picker, and on a
// newline. Spaces are allowed: page names have them.
export function matchWikiLink(textBeforeCaret) {
  if (typeof textBeforeCaret !== 'string') return null;
  const at = textBeforeCaret.lastIndexOf('[[');
  if (at === -1) return null;
  const query = textBeforeCaret.slice(at + 2);
  if (query.includes(']]') || query.includes('\n')) return null;
  return { start: at, query };
}

// What a page is called in the picker: its bookmark name if it has one, else the
// first words written on it, else just its number. Someone looking for a page
// remembers what is on it, not its index.
export function pageLabel(page, index) {
  const named = (page?.name || '').trim();
  if (named) return named;
  const fromText = (page?.texts || [])
    .map((t) => (Array.isArray(t?.lines) ? t.lines.map((l) => l.text).join(' ') : (t?.text || '')))
    .join(' ')
    .trim();
  const fromNotes = (page?.stickers || []).map((s) => s?.text || '').join(' ').trim();
  const body = (fromText || fromNotes).replace(/\s+/g, ' ');
  if (body) return `${index + 1}. ${body.slice(0, 28)}${body.length > 28 ? '…' : ''}`;
  return `หน้า ${index + 1}`;
}

// Pages whose label matches, as picker rows. The current page is left out: a
// link to where you already are is never what was meant.
export function filterPages(pages, query, currentIndex) {
  const q = (query || '').trim().toLowerCase();
  return (pages || [])
    .map((page, index) => ({ id: `page-${index}`, index, label: pageLabel(page, index), icon: 'FileText' }))
    .filter((row) => row.index !== currentIndex)
    .filter((row) => !q || row.label.toLowerCase().includes(q));
}

// Which pages link to this one.
//
// A link that only goes one way is half a link: standing on a page, the useful
// question is usually "what points here?" — the thing that turns a pile of pages
// into something you can move around in. Deduplicated, because one page linking
// here three times is still one page worth showing.
export function backlinksTo(pages, target) {
  if (!Array.isArray(pages)) return [];
  const seen = new Set();
  const out = [];
  pages.forEach((page, index) => {
    if (index === target) return;
    const links = (page?.texts || []).some((t) =>
      (t?.lines || []).some((l) => l?.link && l.link.page === target)
    );
    if (links && !seen.has(index)) {
      seen.add(index);
      out.push({ index, label: pageLabel(page, index) });
    }
  });
  return out;
}
