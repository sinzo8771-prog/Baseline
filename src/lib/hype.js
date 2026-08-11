// Hype scoring: a heuristic detector of headline *intensity*, not truth.
//
// V2 design (spec §17–§18):
//   - Scoring is structured into signal categories (LANGUAGE, SUPERLATIVES,
//     BENCHMARK, NUMERICAL, FORMATTING, EMOTIONAL) so every score can explain
//     itself with per-signal points.
//   - Context matters. Word presence ≠ automatic hype:
//       "Researchers examine whether AI could become superhuman"  → Measured
//       "Revolutionary AI destroys every benchmark"               → Hot
//     Hedged research framing ("researchers examine whether…", "could become…")
//     halves the weight of word signals; quoted words are ignored; plain
//     numbers and money ("Company reports $1 billion investment") do not fire.
//   - Combinations of signals across categories stack louder than any one word.
//   - Stacking the *same* family still accumulates: "revolutionary AGI
//     breakthrough" is louder than "breakthrough" alone, so each matched word
//     in a word-list signal adds its weight (bounded per signal).

export const CATEGORY_LABEL = {
  language: "High-intensity language",
  superlatives: "Superlatives",
  benchmark: "Benchmark claims",
  numerical: "Numerical claims",
  formatting: "Formatting",
  emotional: "Emotional language",
};

export const CATEGORY_ORDER = ["language", "superlatives", "benchmark", "numerical", "formatting", "emotional"];

// The score ranges behind each tier, shown verbatim on the Hype Index page so
// a reader can see the scale, not just the color.
export const TIER_RANGES = {
  Measured: "0–11",
  Warm: "12–24",
  Hot: "25–39",
  "On Fire": "40–100",
};

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Short tokens (like the "AGI" acronym) must match on word boundaries, or
// "imaging" and "imagination" would falsely trip the flag via substring.
function includesWord(text, word) {
  return word.length < 5
    ? new RegExp(`(^|[^a-z0-9])${escapeRegExp(word)}(?=$|[^a-z0-9])`).test(text)
    : text.includes(word);
}

function countWords(text, words) {
  return words.reduce((n, w) => n + (includesWord(text, w) ? 1 : 0), 0);
}

function countPhrases(text, phrases) {
  return phrases.reduce((n, p) => n + (text.includes(p) ? 1 : 0), 0);
}

// "Best practices for AI safety" is not a boast; "best model ever" is. Strip
// the measured collocations before judging superlatives.
function superlativeCount(text) {
  const cleaned = text
    .replace(/\bbest\s+practices?\b/g, " ")
    .replace(/\bbest\s+of\b/g, " ")
    .replace(/\bbest\s+efforts?\b/g, " ")
    .replace(/\bworld's\s+best\b/g, " ");
  let n = 0;
  if (/\b(fastest|largest|biggest|unbeatable|first-ever|ultimate|number one|top-tier)\b/.test(cleaned)) n += 1;
  if (/\b(most powerful|most advanced|best-in-class|world[- ]first|top of the line|state-of-the-art)\b/.test(cleaned)) n += 1;
  if (/\b#\s*1\b/.test(cleaned)) n += 1;
  if (/\b(the |my |our )?best(-ever)?\b/.test(cleaned)) n += 1;
  return n;
}

// Benchmark / performance claims. "Benchmark" as a noun ("benchmark tables")
// is neutral; a claim that something beats, shatters, or tops a benchmark is
// the hype signal.
function benchmarkCount(text) {
  let n = 0;
  if (/\b(outperforms?|surpasses?|eclipses?)\b/.test(text)) n += 1;
  if (/\b(beats?|shatters?|destroys?|demolishes?|crushes?|tops?|dominates?|breaks?|sets?)\s+(the\s+)?(benchmark|record|leaderboard|chart)s?\b/.test(text)) n += 1;
  if (/\b(every|all)\s+(benchmark|record)s?\b/.test(text)) n += 1;
  if (/\bstate[- ]of[- ]the[- ]art\b/.test(text)) n += 1;
  if (/\b(highest|best)\s+(ever\s+)?(score|result|benchmark)\b/.test(text)) n += 1;
  return n;
}

// Promotional numbers only. A bare amount ("$1 billion investment", "3 million
// users") is a fact and must not fire (spec §19). Multipliers and boosted
// percentages are the boastful ones.
function numericalCount(text) {
  let n = 0;
  if (/\b\d+(\.\d+)?\s*[x×]\b/.test(text)) n += 1; // 10x, 2.5×
  if (/\b\d+(\.\d+)?\s*%\s*(faster|improvement|better|jump|surge|gain|boost|more)\b/i.test(text)) n += 1;
  if (/\b(over|more than|nearly|almost|up to)\s+\d+(\.\d+)?\s*(x|times|fold)\b/i.test(text)) n += 1;
  return n;
}

// Hedged / research framing: "Researchers examine whether AI could become
// superhuman" is a question under study, not a claim of superhumanity. When
// present, word-signal weight is halved so hedging never amplifies hype.
function hedged(text) {
  if (/\b(researchers?|scientists?|study|studies|report|paper|analysis)\b[\s\S]{0,120}\b(whether|could|might|may|if|examine|examining|explore|exploring|investigate|investigating|assess|assessing|consider|considering|question|questioning)\b/i.test(text)) return true;
  if (/\b(could|might|may)\b[\s\S]{0,60}\b(become|lead|reach|one day|eventually)\b/i.test(text)) return true;
  if (/\b(whether|if)\b[\s\S]{0,60}\b(could|might|may)\b/i.test(text)) return true;
  return false;
}

const HEAVY_WORDS = [
  "revolutionary", "revolutionizes", "revolutionised", "game-changing", "game changer",
  "breakthrough", "unprecedented", "superhuman", "singularity", "godlike", "sentient",
  "conscious", "human-level", "world-changing", "paradigm shift", "disruptive",
  "killer app", "quantum leap", "holy grail", "inflection point", "moonshot",
  "miracle", "magic", "mind-blowing", "breathtaking", "jaw-dropping", "astonishing", "agi",
];

const BOAST_WORDS = [
  "major", "significant", "dramatic", "massive", "huge", "powerful", "impressive", "remarkable", "notable",
];

const EMOTION_WORDS = [
  "amazing", "incredible", "unbelievable", "stunning", "shocking", "terrifying",
  "scary", "exciting", "destroys", "destroying", "obliterates", "crushes",
  "demolishes", "dominates", "wrecks",
];

// A signal is a { id, category, label, points, count } with a focused matcher
// returning how many signals fired (0 = none). `maxCount` bounds how much one
// family can contribute so a single overloaded headline can't saturate.
// `format` signals are mechanical (caps, punctuation, emoji) and are not
// dampened by hedging the way language claims are.
const SIGNAL_DEFS = [
  {
    id: "language",
    category: "language",
    label: "high-intensity language",
    points: 10,
    maxCount: 4,
    count: (text) => countWords(text, HEAVY_WORDS) + countPhrases(text, ["era of", "new era", "age of"]),
  },
  {
    id: "boast",
    category: "language",
    label: "boastful phrasing",
    points: 6,
    maxCount: 2,
    count: (text) => countWords(text, BOAST_WORDS),
  },
  {
    id: "superlative",
    category: "superlatives",
    label: "superlative",
    points: 6,
    maxCount: 2,
    count: superlativeCount,
  },
  {
    id: "benchmark",
    category: "benchmark",
    label: "benchmark claim",
    points: 6,
    maxCount: 2,
    count: benchmarkCount,
  },
  {
    id: "performance",
    category: "benchmark",
    label: "performance claim",
    points: 6,
    maxCount: 2,
    count: (text) =>
      countPhrases(text, [
        "performance improvements", "performance improvement", "performance boost",
        "performance gains", "faster than", "better than", "significant gains", "major gains",
      ]),
  },
  {
    id: "emotion",
    category: "emotional",
    label: "emotional language",
    points: 5,
    maxCount: 3,
    count: (text) => countWords(text, EMOTION_WORDS),
  },
  {
    id: "numerical",
    category: "numerical",
    label: "numerical claim",
    points: 4,
    maxCount: 2,
    count: numericalCount,
  },
  {
    id: "caps",
    category: "formatting",
    label: "all-caps",
    points: 6,
    format: true,
    count: (title) => (/[A-Z]{4,}/.test(title) ? 1 : 0),
  },
  {
    id: "exclamation",
    category: "formatting",
    label: "punctuation",
    points: 3,
    format: true,
    count: (title) => (/!+/.test(title) ? 1 : 0),
  },
  {
    id: "emoji",
    category: "formatting",
    label: "emoji",
    points: 4,
    format: true,
    count: (text) => (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(text) ? 1 : 0),
  },
];

// Points awarded when signals stack across N distinct categories: a headline
// leaning on several different hype families is louder than one leaning on a
// single word (spec §17 — combinations matter).
const COMBO_POINTS = { 3: 8, 4: 12, 5: 16, 6: 20 };

export function scoreHype({ title, summary }) {
  const titleStr = String(title ?? "");
  const text = `${titleStr} ${summary || ""}`.toLowerCase();
  // Words inside quotes ("the 'breakthrough' everyone's talking about") are
  // the subject of discussion, not the paper's own claim — ignore them.
  const dequoted = titleStr.replace(/"[^"]*"|'[^']*'/g, "").toLowerCase();
  const isHedged = hedged(text);

  const signals = [];
  for (const def of SIGNAL_DEFS) {
    const haystack = def.format ? titleStr : dequoted;
    let count = 0;
    try {
      count = def.count(haystack);
    } catch {
      count = 0;
    }
    if (!count) continue;
    let points = def.points * Math.min(count, def.maxCount ?? 4);
    if (isHedged && !def.format) {
      points = Math.max(1, Math.floor(points * 0.5));
    }
    signals.push({ id: def.id, category: def.category, label: def.label, points });
  }

  // Cross-category stacking bonus.
  const categories = new Set(signals.map((s) => s.category));
  const combo = COMBO_POINTS[categories.size];
  if (combo) {
    signals.push({ id: "stacked", category: "combo", label: "stacked claims", points: combo });
  }

  const score = Math.min(100, signals.reduce((sum, s) => sum + s.points, 0));
  const flags = signals.map((s) => s.label);
  return { score, flags, signals, hedged: isHedged };
}

export function spinLabel(score) {
  if (score >= 40) return "On Fire";
  if (score >= 25) return "Hot";
  if (score >= 12) return "Warm";
  return "Measured";
}

export function spinFromStory(story) {
  const { score, flags, signals, hedged } = scoreHype(story);
  return { spin: spinLabel(score), spinScore: score, flags, signals, hedged };
}

// Aggregate the day's edition into a per-category breakdown for the
// "WHY TODAY?" panel. Counts each story once per category it touches (a story
// with two language signals still counts once for language); the "combo"
// meta-signal is excluded so the six families stay clean.
export function signalStats(stories) {
  const byCategory = {};
  for (const story of stories) {
    const seen = new Set();
    for (const sig of story.signals ?? []) {
      if (sig.category === "combo") continue;
      if (!CATEGORY_LABEL[sig.category]) continue;
      if (seen.has(sig.category)) continue;
      seen.add(sig.category);
      byCategory[sig.category] = (byCategory[sig.category] ?? 0) + 1;
    }
  }
  return byCategory;
}

// Convert a per-category count map into percentage shares (0–100), for the
// WHY TODAY panel. Percentages are computed from real signal counts only.
export function signalShares(breakdown) {
  const total = Object.values(breakdown ?? {}).reduce((a, b) => a + b, 0);
  if (!total) return {};
  const out = {};
  for (const key of CATEGORY_ORDER) {
    const n = breakdown?.[key] ?? 0;
    if (n > 0) out[key] = Math.round((n / total) * 100);
  }
  return out;
}

// The three biggest category-share changes between two editions, loudest
// first. Returns null when there isn't enough real history to compare (the
// UI must show "NOT ENOUGH HISTORY" instead of inventing numbers).
export function biggestSignalShift(todayBreakdown, prevBreakdown) {
  if (!todayBreakdown || !prevBreakdown) return null;
  const todayShares = signalShares(todayBreakdown);
  const prevShares = signalShares(prevBreakdown);
  if (Object.keys(todayShares).length === 0 || Object.keys(prevShares).length === 0) return null;
  const shifts = [];
  for (const key of CATEGORY_ORDER) {
    const delta = (todayShares[key] ?? 0) - (prevShares[key] ?? 0);
    if (delta !== 0) shifts.push({ category: key, label: CATEGORY_LABEL[key], delta });
  }
  if (shifts.length === 0) return null;
  return shifts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3);
}
