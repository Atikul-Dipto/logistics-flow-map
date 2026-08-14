// Plain linear scan, ranked by match position -- at a few thousand
// short strings this is instant, no fuzzy-search dependency needed.
function rank(haystack, needle) {
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase()
  const idx = h.indexOf(n)
  if (idx === -1) return -1
  if (idx === 0) return 3
  if (h[idx - 1] === ' ') return 2
  return 1
}

export function searchCorpus(entries, query, limit = 30) {
  if (!query.trim()) return []
  const scored = []
  for (const entry of entries) {
    const score = Math.max(rank(entry.label, query), entry.sub ? rank(entry.sub, query) * 0.6 : -1)
    if (score > 0) scored.push({ entry, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.entry)
}
