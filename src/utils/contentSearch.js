// Match every word across human-readable metadata, regardless of case or spacing.
export function matchesContentSearch(query, ...fields) {
  const normalize = value => String(value ?? "").normalize("NFC").toLocaleLowerCase().trim()
  const words = normalize(query).split(/\s+/).filter(Boolean)
  const text = fields.flat(Infinity).map(normalize).join(" ")
  return words.every(word => text.includes(word))
}
