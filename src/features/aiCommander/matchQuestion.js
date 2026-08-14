// Keyword-scored intent matching -- simple on purpose, this is a
// simulated assistant (see answers.js), not a real NLU model.
const INTENTS = [
  { id: 'delay-today', keywords: ['delay', 'late', 'slow'] },
  { id: 'worst-hub', keywords: ['hub', 'causing', 'worst', 'bottleneck'] },
  { id: 'sla-risk', keywords: ['sla', 'risk', 'breach'] },
  { id: 'cod-outstanding', keywords: ['cod', 'outstanding', 'cash', 'payment'] },
  { id: 'carrier', keywords: ['carrier', 'courier', 'underperform'] },
  { id: 'summary', keywords: ['summary', 'summarize', 'overview', 'health'] },
]

export function matchQuestion(text) {
  const lower = text.toLowerCase()
  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((s, k) => s + (lower.includes(k) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = intent.id
    }
  }
  return best ?? 'summary'
}
