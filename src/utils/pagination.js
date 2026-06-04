/** Compact page numbers with gaps for large lists */
export function buildPageRange(current, total) {
  if (total <= 0) return []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, current, current - 1, current + 1])
  return [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
}

export function clampPage(page, totalPages) {
  const max = Math.max(1, totalPages || 1)
  return Math.min(Math.max(1, page), max)
}
