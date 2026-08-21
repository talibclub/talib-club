// Removing objects the notebook duplicated by accident.
//
// updatePage used to hand its updater the page's own arrays rather than copies,
// so the updater was not pure and React ran it twice — placing one thing left
// two, stacked exactly on top of each other. That is fixed, but notebooks saved
// while it was broken still hold the pairs, and a stacked pair is close to
// invisible: you delete one and the other is still there.
//
// Two things are removed, both unambiguous:
//   - a later object sharing an id with an earlier one, which nothing can tell
//     apart anyway — selecting, editing or deleting either hits both;
//   - a later object identical to an earlier one in every field but its id.
//     Duplicating on purpose always offsets the copy by 24px, so an exact
//     overlap is never something a person asked for.

const KINDS = ['lines', 'stickers', 'images', 'texts', 'shapes'];

const signature = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  const { id, ...rest } = obj;
  // An object carrying nothing but an id has no content to compare, and every
  // such object would look like every other. Those are matched by id alone.
  if (!Object.keys(rest).length) return null;
  try {
    const json = JSON.stringify(rest);
    return json === '{}' ? null : json;
  } catch { return null; }
};

// Returns the page with duplicates dropped, and how many went.
export function dedupePage(page) {
  if (!page) return { page, removed: 0 };
  let removed = 0;
  const next = { ...page };
  KINDS.forEach((kind) => {
    const list = page[kind];
    if (!Array.isArray(list)) return;
    const ids = new Set();
    const sigs = new Set();
    const kept = list.filter((obj) => {
      // A hole in the array is not an object anyone put there.
      if (!obj) { removed += 1; return false; }
      const sig = signature(obj);
      if ((obj.id && ids.has(obj.id)) || (sig !== null && sigs.has(sig))) {
        removed += 1;
        return false;
      }
      if (obj.id) ids.add(obj.id);
      if (sig !== null) sigs.add(sig);
      return true;
    });
    if (kept.length !== list.length) next[kind] = kept;
  });
  return { page: next, removed };
}

export function dedupePages(pages) {
  if (!Array.isArray(pages)) return { pages, removed: 0 };
  let removed = 0;
  const next = pages.map((p) => {
    const r = dedupePage(p);
    removed += r.removed;
    return r.removed ? r.page : p;
  });
  return { pages: removed ? next : pages, removed };
}
