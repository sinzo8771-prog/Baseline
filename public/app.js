// The Baseline frontend. Fetches raw feeds through the Worker's same-origin relay,
// parses and scores them in the browser, then lays out the front page.
import { fetchAllFeeds } from "./lib/feeds.js";
import { composeStories, dailyStats } from "./lib/pipeline.js";

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

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

// Theme handling
const THEME_KEY = "baseline-theme";
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved ? saved === "dark" : prefersDark;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  updateThemeToggle(isDark);
  return isDark;
}

function updateThemeToggle(isDark) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.textContent = isDark ? "☀" : "🌙";
  btn.setAttribute("aria-pressed", isDark ? "true" : "false");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeToggle(next === "dark");
}

// Hype filter chips
let currentFilter = "all";
let allStories = [];
const FILTERS = ["all", "Measured", "Warm", "Hot", "On Fire"];

function renderFilterChips() {
  const container = document.getElementById("filter-chips");
  if (!container) return;
  container.innerHTML = "";
  FILTERS.forEach((f, i) => {
    const active = f === currentFilter;
    const btn = el("button", "filter-chip" + (active ? " active" : ""), f === "all" ? "All" : f);
    btn.dataset.filter = f;
    btn.type = "button";
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.tabIndex = active ? 0 : -1;
    btn.addEventListener("click", () => applyFilter(f));
    btn.addEventListener("keydown", (e) => onChipKeydown(e, i));
    container.appendChild(btn);
  });
}

function onChipKeydown(e, index) {
  let next = index;
  if (e.key === "ArrowRight") next = (index + 1) % FILTERS.length;
  else if (e.key === "ArrowLeft") next = (index - 1 + FILTERS.length) % FILTERS.length;
  else return;
  e.preventDefault();
  applyFilter(FILTERS[next]);
}

function applyFilter(filter) {
  currentFilter = filter;
  renderFilterChips();
  const filtered = filter === "all" ? allStories : allStories.filter((s) => s.spin === filter);
  render(filtered);
  const chip = document.querySelector(`#filter-chips [data-filter="${filter}"]`);
  if (chip) chip.focus();
}

function renderStory(story, isLead) {
  const article = el("article", "story");
  if (isLead) article.classList.add("lead");
  const title = el("h2", "story-title");
  const a = el("a");
  a.href = safeHref(story.link);
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
  allStories = stories;
  const lead = document.getElementById("lead-story");
  const grid = document.getElementById("grid");
  lead.innerHTML = "";
  grid.innerHTML = "";

  if (!stories.length) {
    const empty = el("div", "empty");
    empty.appendChild(el("div", "kicker", "EXTRA! EXTRA!"));
    empty.appendChild(el("p", "", "The presses are cold. No stories to report. Our sources may be napping, or the feeds are down. In this line of work, silence is usually a feature, not a bug. Reload to try again."));
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
  const track = document.getElementById("meter-track");
  if (track) track.setAttribute("aria-valuenow", String(stats.hypePercent));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fill.style.width = `${stats.hypePercent}%`;
    });
  });
  label.textContent = `${stats.hypePercent}%`;
}

// Toast (sonner-style)
const toastRegion = document.getElementById("toast-region");
let toastTimer = null;

function showToast(message) {
  if (!toastRegion) return;
  const prev = toastRegion.firstChild;
  if (prev) {
    prev.classList.add("out");
    setTimeout(() => prev.remove(), 200);
  }
  const toast = el("div", "toast", message);
  toastRegion.appendChild(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("out");
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function renderSources(sources) {
  const list = document.getElementById("source-list");
  list.innerHTML = "";
  const sorted = [...(sources || [])].sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
  sorted.forEach((s) => {
    const li = el("li");
    li.appendChild(document.createTextNode(s.name));
    const label = s.ok ? "reporting" : `down (${s.error ?? "no signal"})`;
    const status = el("span", s.ok ? "status ok" : "status err", label);
    li.appendChild(status);
    list.appendChild(li);
  });
}

function renderOffline() {
  const lead = document.getElementById("lead-story");
  lead.innerHTML = "";
  const empty = el("div", "empty");
  empty.appendChild(el("div", "kicker", "OUT TO LUNCH"));
  empty.appendChild(el("p", "", "The site is up, but the network is playing dead. Your browser can do everything except fetch. Try again in a moment."));
  lead.appendChild(empty);
}

function renderUpdated(iso) {
  const el_ = document.getElementById("masthead-updated");
  if (!el_) return;
  const d = new Date(iso);
  el_.textContent = Number.isNaN(d.getTime())
    ? ""
    : "Sourced " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) + " · refresh for the latest";
}

// OPML export
function exportOPML() {
  const sources = [
    { title: "OpenAI", xmlUrl: "https://openai.com/news/rss.xml", htmlUrl: "https://openai.com/news/" },
    { title: "Anthropic", xmlUrl: "https://www.anthropic.com/rss.xml", htmlUrl: "https://www.anthropic.com/" },
    { title: "Google DeepMind", xmlUrl: "https://deepmind.google/blog/rss.xml", htmlUrl: "https://deepmind.google/blog/" },
    { title: "Hugging Face", xmlUrl: "https://huggingface.co/blog/feed.xml", htmlUrl: "https://huggingface.co/blog/" },
    { title: "The Verge AI", xmlUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", htmlUrl: "https://www.theverge.com/ai-artificial-intelligence/" },
    { title: "MIT Tech Review AI", xmlUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed", htmlUrl: "https://www.technologyreview.com/topic/artificial-intelligence/" },
    { title: "Ars Technica AI", xmlUrl: "https://arstechnica.com/ai/feed/", htmlUrl: "https://arstechnica.com/ai/" },
    { title: "VentureBeat AI", xmlUrl: "https://venturebeat.com/category/ai/feed/", htmlUrl: "https://venturebeat.com/category/ai/" },
    { title: "TechCrunch AI", xmlUrl: "https://techcrunch.com/category/artificial-intelligence/feed/", htmlUrl: "https://techcrunch.com/category/artificial-intelligence/" },
    { title: "Wired AI", xmlUrl: "https://www.wired.com/feed/tag/ai/latest/rss", htmlUrl: "https://www.wired.com/tag/ai/" },
  ];

  let opml = '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>The Baseline — AI News Sources</title>\n    <dateCreated>' + new Date().toUTCString() + '</dateCreated>\n  </head>\n  <body>\n';

  sources.forEach((s) => {
    opml += `    <outline text="${s.title}" title="${s.title}" type="rss" xmlUrl="${s.xmlUrl}" htmlUrl="${s.htmlUrl}" />\n`;
  });

  opml += "  </body>\n</opml>";

  const blob = new Blob([opml], { type: "text/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "the-baseline-sources.opml";
  a.click();
  URL.revokeObjectURL(url);
  showToast(`OPML exported — ${sources.length} sources, filed and sorted.`);
}

async function main() {
  initTheme();
  renderFilterChips();

  document.getElementById("footer-year").textContent = new Date().getFullYear();
  const dateEl = document.getElementById("masthead-date");
  dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("opml-export").addEventListener("click", exportOPML);

  let results;
  try {
    results = await fetchAllFeeds();
  } catch (err) {
    renderOffline();
    renderSources(results || []);
    return;
  }

  const stories = composeStories(results);
  const stats = dailyStats(stories);
  render(stories);
  renderStats(stats);
  renderSources(results.map((r) => ({ name: r.source, ok: !r.error, error: r.error })));
  renderUpdated(stats.generatedAt);
  showToast(`The presses are rolling — ${stats.total} stories, ${stats.hypePercent}% hype.`);
}

main();