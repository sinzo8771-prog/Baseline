// Minimal fuzzy matcher for the command palette. Every character of the query
// must appear in the haystack in order; scoring rewards three things:
//   - consecutive runs (adjacent query chars matching adjacent haystack chars),
//   - matches at word boundaries (start of string or after space / - / _),
//   - and shorter haystacks (the score is length-normalized, so a short exact
//     label like "Saved" beats a long headline that merely contains "saved").
// Returns a number ≥ 0 (higher = better), or null when the query does not
// match at all. An empty query returns a large constant so the palette shows
// everything when nothing is typed.
export function fuzzyScore(query, haystack) {
  if (typeof query !== "string" || typeof haystack !== "string") return null;
  const q = query.trim().toLowerCase();
  const h = haystack.toLowerCase();
  if (q.length === 0) return 1000;
  if (q.length > h.length) return null;

  let score = 0;
  let run = 0;
  let qi = 0;
  let prev = -2;

  for (let hi = 0; hi < h.length && qi < q.length; hi++) {
    if (h[hi] !== q[qi]) continue;
    qi++;
    run = hi === prev + 1 ? run + 1 : 1;
    let add = run * 2;
    if (hi === 0 || h[hi - 1] === " " || h[hi - 1] === "-" || h[hi - 1] === "_") add += 2;
    score += add;
    prev = hi;
  }

  return qi === q.length ? score / h.length : null;
}

// Rank a list of candidates against the query, best first. Each candidate is
// { id, label, sub } and may carry an optional `keywords` string searched
// alongside the label. Equal scores fall back to the shorter label winning.
export function rankMatches(query, candidates) {
  const scored = [];
  for (const c of candidates) {
    const labelScore = fuzzyScore(query, c.label);
    const kwScore = c.keywords ? fuzzyScore(query, c.keywords) : null;
    const best = Math.max(labelScore ?? 0, kwScore ?? 0);
    if (best > 0) scored.push({ candidate: c, best });
  }
  return scored
    .sort((a, b) => {
      if (b.best !== a.best) return b.best - a.best;
      return a.candidate.label.length - b.candidate.label.length;
    })
    .map((s) => s.candidate);
}