const MAX_LEAD_LEN = 120;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "recently"
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function spinClass(spin) {
  return { Measured: "spin-measured", Warm: "spin-warm", Hot: "spin-hot", "On Fire": "spin-fire" }[spin] || "spin-measured";
}

function renderStory(story, isLead) {
  const article = el("article", "story");
  if (isLead) article.classList.add("lead");
  const title = el("h2", "story-title");
  const a = el("a");
  a.href = story.link;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = story.title;
  title.appendChild(a);
  article.appendChild(title);

  if (story.summary && isLead) {
    article.appendChild(el("p", "story-summary", story.summary));
  }

  const meta = el("div", "story-meta");
  meta.appendChild(el("span", spinClass(story.spin), story.spin));
  meta.appendChild(document.createTextNode(`${story.source} — ${fmtDate(story.publishedAt)}`));
  article.appendChild(meta);
  return article;
}

function render(stories) {
  const lead = document.getElementById("lead-story");
  const grid = document.getElementById("grid");
  lead.innerHTML = "";
  grid.innerHTML = "";

  if (!stories.length) {
    const empty = el("div", "empty");
    empty.appendChild(el("div", "kicker", "EXTRA! EXTRA!"));
    empty.appendChild(el("p", "", "The presses are cold. No stories to report. Our sources may be napping, or the feeds are down. Check back in twenty minutes."));
    lead.appendChild(empty);
    return;
  }

  lead.appendChild(renderStory(stories[0], true));
  stories.slice(1, 25).forEach((s) => grid.appendChild(renderStory(s, false)));
}

function renderStats(stats) {
  if (!stats) return;
  const fill = document.getElementById("meter-fill");
  const label = document.getElementById("meter-label");
  fill.style.width = `${stats.hypePercent}%`;
  label.textContent = `${stats.hypePercent}%`;
}

function renderSources(sources) {
  const list = document.getElementById("source-list");
  list.innerHTML = "";
  (sources || []).forEach((s) => {
    const li = el("li");
    li.appendChild(document.createTextNode(s.name));
    const status = el("span", s.ok ? "status ok" : "status err", s.ok ? "reporting" : `down (${s.error})`);
    li.appendChild(status);
    list.appendChild(li);
  });
}

async function main() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  const dateEl = document.getElementById("masthead-date");
  dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  try {
    const res = await fetch("/api/news", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    render(data.stories);
    renderStats(data.stats);
    renderSources(data.sources);
  } catch (err) {
    const lead = document.getElementById("lead-story");
    lead.innerHTML = "";
    const empty = el("div", "empty");
    empty.appendChild(el("div", "kicker", "OFFLINE"));
    empty.appendChild(el("p", "", "We appear to be between editions. The site is up; the news pipeline is being bashful. Refresh shortly."));
    lead.appendChild(empty);
  }
}

main();
