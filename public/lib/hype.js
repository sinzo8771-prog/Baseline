const HYPE_WORDS = [
  "revolutionary", "revolutionizes", "game-changing", "game changer",
  "breakthrough", "unprecedented", "superhuman", "singularity", "agi",
  "godlike", "sentient", "conscious", "human-level", "world-changing",
  "paradigm shift", "disrupt", "disruptive", "killer app", "quantum leap",
  "holy grail", "inflection point", "moonshot", "miracle", "magic",
  "mind-blowing", "breathtaking", "jaw-dropping", "astonishing",
  "billion", "trillion", "era of", "new era",
];

const EMOTION_WORDS = [
  "amazing", "incredible", "unbelievable", "stunning", "shocking",
  "terrifying", "scary", "exciting",
];

export function scoreHype({ title, summary }) {
  const text = `${title} ${summary || ""}`.toLowerCase();
  let score = 0;
  const flags = [];

  for (const word of HYPE_WORDS) {
    if (text.includes(word)) {
      score += 8;
      flags.push(`"${word}"`);
    }
  }
  for (const word of EMOTION_WORDS) {
    if (text.includes(word)) {
      score += 5;
      flags.push(`"${word}"`);
    }
  }
  if (/[A-Z]{4,}/.test(title)) {
    score += 6;
    flags.push("all-caps");
  }
  if (title.includes("!")) {
    score += 3;
    flags.push("exclamation");
  }
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(text)) {
    score += 4;
    flags.push("emoji");
  }
  if (/\b\d[\d,.]*\s*(billion|million|trillion|%)/i.test(text)) {
    score += 3;
    flags.push("number-brag");
  }

  return { score: Math.min(100, score), flags };
}

export function spinLabel(score) {
  if (score >= 40) return "On Fire";
  if (score >= 25) return "Hot";
  if (score >= 12) return "Warm";
  return "Measured";
}

export function spinFromStory(story) {
  const { score, flags } = scoreHype(story);
  return { spin: spinLabel(score), spinScore: score, flags };
}
