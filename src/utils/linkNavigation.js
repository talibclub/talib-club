// Cards and list rows link with a real <a href> so crawlers have something to
// follow, but still navigate through the SPA router on a normal click. Anything
// the browser has its own meaning for — open in a new tab, new window, download
// — is left alone instead of being swallowed by preventDefault().
export function isPlainLeftClick(event) {
  if (!event) return true
  if (event.defaultPrevented) return false
  if (event.button !== undefined && event.button !== 0) return false
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
}
