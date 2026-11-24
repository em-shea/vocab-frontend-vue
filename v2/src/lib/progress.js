// "Your lists" on the profile: how far through each list the reader is, from
// GET /progress. The backend decides seen and proficient (progress_service.py
// in the vocab repo); this only turns its counts into rows to draw.

const pct = (part, total) => (total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0)

/** Rows for the lists the reader is subscribed to, in their subscription order. */
export function progressRows (body, subscriptions = []) {
  const rows = Array.isArray(body?.lists) ? body.lists : []
  const order = [...new Set(subscriptions.map((s) => s.list_id))]
  const rank = (id) => (order.includes(id) ? order.indexOf(id) : order.length)
  return rows
    .filter((r) => r && r.list_id && Number(r.total) > 0)
    .map((r) => ({
      list_id: r.list_id,
      total: Number(r.total),
      seen: Number(r.seen) || 0,
      proficient: Number(r.proficient) || 0,
      seenPct: pct(Number(r.seen) || 0, Number(r.total)),
      proficientPct: pct(Number(r.proficient) || 0, Number(r.total))
    }))
    .sort((a, b) => rank(a.list_id) - rank(b.list_id))
}

/** The rule the backend used, with the same defaults if it sent none. */
export function proficientRule (body) {
  const r = body?.proficient_rule ?? {}
  return {
    minQuizAnswers: Number(r.min_quiz_answers ?? 2),
    accuracyPct: Math.round(Number(r.min_quiz_accuracy ?? 0.8) * 100),
    quizzesOnlyBefore: typeof r.quizzes_only_before === 'string' ? r.quizzes_only_before : ''
  }
}
