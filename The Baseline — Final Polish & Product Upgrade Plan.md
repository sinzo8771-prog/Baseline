# THE BASELINE — FINAL POLISH & PRODUCT UPGRADE PLAN

## Project

Repository:
`https://github.com/sinzo8771-prog/Baseline`

Production:
`https://the-baseline.baseline-news.workers.dev/`

---

# 1. PRIMARY OBJECTIVE

Take the current version of **The Baseline** from a strong product to a polished, distinctive, production-quality editorial experience.

Do NOT rebuild the application.

Do NOT replace the current design.

Do NOT blindly implement features that already exist.

The current product already has many important systems implemented, including:

- RSS aggregation
- feed relay
- caching
- SWR/saved edition
- offline handling
- Hype scoring
- contextual hype detection
- Hype explanations
- Hype Index
- story permalinks
- methodology
- source profiles
- source leaderboard
- SEO
- accessibility
- reduced motion
- security protections
- rate limiting
- deduplication

First inspect the repository and verify the current implementation.

---

# 2. GOLDEN RULE

The Baseline should feel like:

> **A newspaper that measures the volume of AI hype.**

Not:

> another AI dashboard.

Not:

> another AI SaaS website.

Not:

> an AI-generated news website.

---

# 3. BEFORE CHANGING ANYTHING

Run:

```bash
npm install
npm test
npm run build
```

If lint exists:

```bash
npm run lint
```

Then inspect:

- `/`
- `/hype-index`
- `/sources`
- `/methodology`
- `/about`
- `/story/:id`
- all relevant components
- Worker
- feed pipeline
- hype scoring
- caching
- tests

Create:

`V2-FINAL-AUDIT.md`

Classify each planned improvement as:

- ALREADY DONE
- NEEDS POLISH
- MISSING
- BROKEN

Do not duplicate existing functionality.

---

# 4. PRIORITY ORDER

Work in this order:

## P0

- correctness
- security
- broken interactions
- accessibility
- feed reliability

## P1

- Hype Index
- Hype explanations
- source analytics
- story experience
- mobile UX

## P2

- component tests
- SEO polish
- documentation
- visual refinement

## P3

- future archive/history infrastructure
- PWA
- additional advanced features

Do not work on P3 while P0/P1 issues remain.

---

# 5. HYPE INDEX — MAKE IT THE HERO PRODUCT

This is the most important improvement.

The Hype Index should feel like the reason someone comes back to The Baseline.

The page should communicate:

```text
TODAY'S BASELINE

63.4

+8.2 FROM YESTERDAY

7-DAY AVG
57.8

42 STORIES
```

All values must be real.

Never use fabricated numbers.

---

# 6. ADD A STRONG "WHY TODAY?" SECTION

Explain what is driving the current Hype Index.

Example:

```text
WHY TODAY?

Benchmark claims       34%
Superlatives           27%
High-intensity words   22%
Formatting              9%
Other                   8%
```

These values must be calculated from the actual stories.

Do not create fake analytics.

If there isn't enough data:

```text
NOT ENOUGH DATA
```

---

# 7. IMPROVE "BIGGEST SHIFT"

Show meaningful changes against the previous available edition.

Example:

```text
BIGGEST SHIFT

Benchmark language
↑ 18%

Superlative language
↑ 11%

Safety-related coverage
↓ 7%
```

Only display comparisons when historical data exists.

Never fabricate history.

---

# 8. HYPE EXPLANATION UI

The current Hype explanation system should be polished.

Do NOT rely on:

```html
title=""
```

Do NOT make explanations hover-only.

They must work with:

- mouse
- keyboard
- touch
- screen reader

Preferred presentation:

```text
HOT · 7/10

WHY 7?

+2  High-intensity language
+2  Benchmark claim
+1  Superlative
+1  Numerical performance claim
+1  Repeated punctuation
```

Then:

> This measures headline intensity, not factual accuracy.

That disclaimer should be clearly visible.

---

# 9. HYPE EXPLANATION DESIGN

Make the explanation feel editorial rather than technical.

Avoid:

```text
keyword_score: 2
format_score: 1
numeric_score: 1
```

Prefer human-readable labels:

```text
High-intensity language
Benchmark claim
Superlative
Numerical performance claim
```

Use the existing Baseline visual language.

No generic SaaS tooltip.

---

# 10. HYPE METHODOLOGY

Verify `/methodology`.

It must clearly explain:

## MEASURED

- headline intensity
- high-intensity language
- superlatives
- benchmark claims
- numerical claims
- formatting
- punctuation

## NOT MEASURED

- factual accuracy
- truthfulness
- journalistic quality
- political bias

Make this statement prominent:

> **A high Hype score does not mean a story is false.**

---

# 11. HYPE ALGORITHM — FINAL AUDIT

Inspect the current scoring engine.

The algorithm must avoid:

> one word = automatic hype.

For example:

```text
Researchers examine whether AI could become superhuman
```

should not receive the same score as:

```text
Revolutionary AI destroys every benchmark
```

The algorithm should prioritize:

1. wording intensity
2. combinations of signals
3. superlatives
4. promotional framing
5. formatting
6. punctuation

Maintain the existing contextual scoring improvements.

Do not completely rewrite a working scoring system unless tests demonstrate a real problem.

---

# 12. HYPE TESTS

Ensure tests cover:

### Low

```text
OpenAI releases a new API update
```

### Medium

```text
New AI model delivers major performance improvements
```

### High

```text
Revolutionary AI destroys every benchmark
```

### False-positive cases

```text
Researchers examine whether AI could become superhuman
```

```text
Company reports $1 billion investment
```

The last two should not automatically become highly hyped merely because of individual words or numbers.

---

# 13. CARDS VIEW — IMPORTANT DESIGN AUDIT

Inspect the current Cards view carefully.

The Cards view must NOT drift toward generic AI SaaS UI.

Avoid:

- huge rounded cards
- gradient-heavy backgrounds
- glassmorphism
- generic hero imagery
- excessive shadows
- excessive badges

Instead make cards feel like:

> newspaper clippings / editorial wire cards.

Suggested visual structure:

```text
SOURCE · TIME

Original headline

────────────────────

HOT · 7/10

READ ORIGINAL →
```

Use typography and rules more than decorative containers.

Preserve the current Edition view if it is already strong.

---

# 14. DO NOT ADD MORE VISUAL EFFECTS

The project already has enough visual personality.

Do NOT add:

- 3D AI brains
- WebGL backgrounds
- particle systems
- giant animated gradients
- excessive cursor tracking
- floating glass objects
- endless glitch loops
- unnecessary parallax

The existing:

- paper
- print
- VHS
- glitch
- typography
- editorial layout

is enough.

The next improvement is polish, not more effects.

---

# 15. SOURCE ANALYTICS

The current source leaderboard should be made genuinely useful.

Display:

```text
WHO'S SHOUTING?

SOURCE
STORIES
AVG. HEADLINE INTENSITY
TREND
```

Example:

```text
SOURCE A       24       7.2       ↑12%
SOURCE B       18       5.8       →
SOURCE C       31       4.1       ↓8%
```

Use real data.

---

# 16. SOURCE LANGUAGE

Use neutral terminology.

Good:

- Average headline intensity
- Hype score
- Trend
- Story volume

Avoid:

- dishonest
- bad
- fake
- unreliable
- worst publisher

The Baseline measures headline intensity.

It does not judge journalistic integrity.

---

# 17. SOURCE PROFILES

Verify `/sources/:source`.

Each profile should show:

- source name
- source status
- story count
- average Hype
- Hype distribution
- recent trend
- latest stories

Keep the page editorial rather than dashboard-like.

---

# 18. MIRRORED FEEDS

Any source that uses a mirror rather than a first-party RSS feed must be clearly labeled.

For example:

```text
ANTHROPIC

MIRRORED FEED
UPDATED HOURLY
```

Do not imply that a mirrored feed is directly published by the source.

Transparency is part of the product.

---

# 19. SOURCE DIVERSITY

Verify homepage ranking.

Do not allow a single publisher to dominate the homepage.

Ranking should consider:

- freshness
- relevance
- Hype
- source diversity

Important:

> Hype must NOT equal importance.

A calm but important story must still have visibility.

---

# 20. STORY EXPERIENCE

Verify:

```text
/story/:id
```

A direct story URL must work on a fresh browser visit.

The story page should show:

```text
THE BASELINE

SOURCE
Publisher

PUBLISHED
Date

HOT · 7/10

Original headline

WHY?
Hype explanation

[ READ ORIGINAL ]
```

Do not rewrite or alter the original headline.

---

# 21. STORY SHARING

Verify:

```text
COPY LINK
```

It must copy the actual canonical story URL.

If share functionality exists, verify it uses the correct story URL.

No fake social metadata.

---

# 22. STORY ATTRIBUTION

The original publisher must always remain obvious.

Every story should make these relationships clear:

```text
SOURCE
PUBLISHED
READ ORIGINAL
```

The Baseline is the measurement layer.

It is not pretending to be the original reporting source.

---

# 23. MOBILE EXPERIENCE

Manually test:

```text
320px
375px
390px
430px
768px
```

Check:

- masthead
- navigation
- filters
- search
- Cards
- Edition
- Hype Index
- source pages
- story pages
- story explanations
- modals
- charts

No:

- horizontal scrolling
- clipped text
- overflowing buttons
- microscopic typography
- inaccessible popovers

---

# 24. MOBILE HYPE EXPLANATION

This is particularly important.

The Hype explanation cannot depend on hover.

On mobile:

- tap to open
- tap outside to close where appropriate
- Escape where available
- preserve accessibility
- do not block the entire page unnecessarily

---

# 25. KEYBOARD UX

Verify:

```text
j       next story
k       previous story
Enter   open story
Escape  close
/       search
?       shortcuts
```

Do not interfere with typing inside inputs.

If a shortcut is not currently implemented, add it only if it fits the current architecture.

---

# 26. STORY MODAL ACCESSIBILITY

Verify:

- focus trap
- Escape
- focus restoration
- correct ARIA
- screen-reader announcement
- keyboard navigation

Do not regress existing accessibility.

---

# 27. COMPONENT TESTS

The next engineering improvement should be a small React smoke-test suite.

Test only important paths.

### App

- renders
- routing works

### Story modal

- opens
- closes
- Escape works
- focus returns

### Error state

- appears correctly

### Saved edition

- renders when feeds fail

### Hype explanation

- opens
- displays score signals

Do not create hundreds of brittle snapshot tests.

---

# 28. FEED RELIABILITY

Verify:

- timeout
- retry
- partial feed failure
- stale source
- offline mode
- cached edition

One broken feed must never break the entire edition.

---

# 29. SECURITY REGRESSION CHECK

Verify that the Worker still has:

- same-origin CORS
- feed allowlist
- upstream timeout
- response size cap
- rate limiting
- safe upstream fetching

Do not weaken these while modifying other features.

---

# 30. SEO POLISH

Verify:

- unique title
- meta description
- canonical
- Open Graph
- Twitter metadata
- JSON-LD
- sitemap
- robots
- favicon
- manifest

For story pages:

use appropriate `NewsArticle` structured data only with real data.

---

# 31. FAVICON

Verify:

```text
/favicon.ico
```

exists and works.

Use the actual Baseline brand.

No generic icon.

---

# 32. README

The README should be reorganized so the product comes before the technical implementation.

Preferred order:

```text
THE BASELINE

AI NEWS, HYPE REMOVED.

What it is

Why it exists

Hype Index

Story analysis

Source comparison

Screenshots

How it works

Architecture

Development

Deployment
```

The first section should make a visitor understand the product immediately.

Technical Cloudflare details should come later.

---

# 33. DOCUMENTATION CLEANUP

Inspect:

`baseline-review.md`

Remove outdated findings.

If an issue is already fixed, do not continue listing it as an active problem.

Documentation must describe the current implementation.

---

# 34. PERFORMANCE

Do not optimize blindly.

Measure:

- bundle size
- font loading
- feed parsing
- rendering
- DOM size
- animation cost
- layout shifts

Preserve visual quality.

Do not remove the Baseline's identity simply to improve an arbitrary score.

---

# 35. DO NOT ADD THESE FEATURES NOW

Do NOT add:

- authentication
- comments
- likes
- social feeds
- AI chatbot
- AI article writer
- fake community
- fake subscribers
- fake testimonials
- unnecessary database
- unnecessary backend
- excessive notifications

These do not improve the core product right now.

---

# 36. DO NOT ADD A DATABASE YET

The current lightweight architecture is an advantage.

Do not introduce persistent backend storage merely for the sake of architecture.

Global historical editions can come later.

For now:

- local history is acceptable
- cached edition is acceptable
- SWR is acceptable

Only introduce persistent history when the product actually needs global historical data.

---

# 37. FUTURE FEATURES — LOW PRIORITY

Do not implement until the core experience is excellent:

1. global historical Hype Index
2. daily editions
3. edition archive
4. persistent analytics
5. PWA
6. richer source history

These are future phases.

---

# 38. VISUAL POLISH RULES

Prefer:

- typography
- rules
- whitespace
- editorial hierarchy
- subtle texture
- restrained motion

Avoid:

- gradients everywhere
- excessive cards
- excessive pills
- excessive rounded corners
- decorative noise
- generic AI imagery

The website should feel authored.

---

# 39. ANTI-AI-SLOP TEST

Before accepting a UI change ask:

> Could this exact component appear on 500 other AI websites?

If yes, redesign it.

The Baseline should have recognizable design decisions.

---

# 40. DATA TRUST RULE

Never fabricate:

- story counts
- Hype scores
- historical values
- source rankings
- trend percentages
- publication dates
- source metadata

If unavailable:

```text
DATA UNAVAILABLE
```

Trust > completeness.

---

# 41. EDITORIAL TRUST RULE

Never imply:

```text
HIGH HYPE = FALSE
```

Correct interpretation:

```text
HIGH HYPE = HIGH HEADLINE INTENSITY
```

Make this clear throughout the product.

---

# 42. FINAL USER JOURNEY

The final experience should naturally follow:

```text
NEWS
  ↓
HYPE
  ↓
WHY?
  ↓
SOURCE
  ↓
TREND
  ↓
ORIGINAL STORY
```

A user should understand this loop without reading documentation.

---

# 43. FINAL QA CHECKLIST

## Product

- [ ] Homepage works
- [ ] Edition works
- [ ] Cards work
- [ ] Search works
- [ ] Filters work
- [ ] Hype Index works
- [ ] Hype explanation works
- [ ] Methodology works
- [ ] Sources work
- [ ] Source profiles work
- [ ] Story URLs work
- [ ] Original links work

## Reliability

- [ ] Feed timeout
- [ ] Feed failure
- [ ] Retry
- [ ] Offline
- [ ] Saved edition
- [ ] SWR

## Security

- [ ] CORS
- [ ] allowlist
- [ ] timeout
- [ ] body limit
- [ ] rate limit

## Accessibility

- [ ] keyboard
- [ ] focus
- [ ] modal
- [ ] screen reader
- [ ] reduced motion
- [ ] color-independent Hype indicators

## Mobile

- [ ] 320px
- [ ] 375px
- [ ] 390px
- [ ] 430px
- [ ] 768px

## SEO

- [ ] title
- [ ] description
- [ ] canonical
- [ ] OG
- [ ] Twitter
- [ ] JSON-LD
- [ ] sitemap
- [ ] robots
- [ ] favicon

## Engineering

- [ ] tests pass
- [ ] build passes
- [ ] lint passes
- [ ] no console errors
- [ ] no broken routes
- [ ] no fake data

---

# 44. FINAL COMMANDS

Run:

```bash
npm test
npm run build
```

And if available:

```bash
npm run lint
```

Then inspect the actual production build.

Do not declare success based solely on passing tests.

---

# 45. DEFINITION OF DONE

The work is complete when:

- The current architecture remains stable.
- Existing functionality has not been unnecessarily rewritten.
- Hype Index feels like a real product rather than a decorative chart.
- Every Hype score can be explained.
- The distinction between Hype and truth is obvious.
- Source comparison is useful.
- Cards remain editorial rather than generic SaaS.
- Story pages are excellent.
- Mobile interaction is polished.
- Accessibility is preserved.
- Security remains hardened.
- Feed failures are graceful.
- SEO is complete.
- Tests and builds pass.
- Documentation reflects reality.
- No fake data exists.
- No AI-generated editorial content has been introduced.
- No unnecessary features have been added.

---

# FINAL PRODUCT PRINCIPLE

Do not ask:

> "What else can we add?"

Ask:

> "How can we make the existing Baseline experience 10× clearer, faster, more trustworthy, and more distinctive?"

The five things that matter most are:

## NEWS

What happened?

## HYPE

How loudly is it being reported?

## WHY

Why did it receive that score?

## SOURCE

Who published it?

## TREND

How is the conversation changing?

Everything else is secondary.

---

# NORTH STAR

The user should leave thinking:

> **"I can get AI news anywhere."**

> **"But The Baseline tells me how loudly everyone is talking."**

Protect that idea.

## THE BASELINE

### AI NEWS, HYPE REMOVED.

**Verbatim in. Hype measured out.**