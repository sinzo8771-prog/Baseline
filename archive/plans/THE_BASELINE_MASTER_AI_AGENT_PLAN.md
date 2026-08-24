# THE BASELINE — MASTER AI AGENT EXECUTION PLAN

**Repository:** https://github.com/sinzo8771-prog/Baseline  
**Production:** https://the-baseline.baseline-news.workers.dev/

> **AI NEWS, HYPE REMOVED.**  
> Verbatim in. Hype measured out.

---

## 0. MISSION

Take the existing The Baseline application and transform it into a polished,
secure, distinctive, production-quality editorial AI-news measurement product.

The objective is NOT to create more features for the sake of feature count.

The objective is to make the existing product:

- clearer
- faster
- more trustworthy
- more useful
- more editorial
- more distinctive
- more accessible
- more secure
- more polished

The current application already contains substantial functionality.

**DO NOT blindly rebuild anything.**

Audit first.

Preserve good work.

Improve only where there is a demonstrated benefit.

---

# 1. PRODUCT NORTH STAR

The Baseline is NOT:

- an AI chatbot
- an AI writer
- an AI news generator
- a generic AI dashboard
- a SaaS analytics template
- a social network
- a generic news aggregator

The Baseline IS:

> A publication-like interface that collects AI news and measures
> how intensely that news is presented.

The core product loop is:

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

Everything built should strengthen this loop.

---

# 2. DESIGN NORTH STAR

The site should feel like:

- an independent publication
- a newspaper front page
- an editorial instrument
- information design
- precise
- restrained
- slightly experimental
- human-authored

The site should NOT feel like:

- generic AI SaaS
- Web3
- crypto
- startup template
- cyberpunk dashboard
- generic AI landing page
- "AI future" marketing site

Core design principle:

> **The website about measuring hype should not itself be hyped.**

---

# 3. ABSOLUTE RULES

NEVER:

- fabricate stories
- fabricate statistics
- fabricate source rankings
- fabricate Hype values
- fabricate historical data
- fabricate publication dates
- fabricate testimonials
- fabricate users
- fabricate subscribers
- fabricate social proof
- rewrite original headlines
- misrepresent original reporting
- invent source metadata
- generate fake editorial commentary

Do NOT introduce unnecessary AI-generated content.

Avoid:

- AI chat
- AI-generated articles
- AI-generated headlines
- AI summaries everywhere
- fake editorial opinions

The original source remains the source.

The Baseline is the measurement layer.

---

# 4. ANTI-AI-SLOP DESIGN RULE

Do NOT add generic visual patterns such as:

- giant gradient blobs
- excessive glassmorphism
- floating glass cards
- giant 3D AI brains
- particle backgrounds
- excessive shadows
- excessive rounded cards
- random neon glow
- cursor-following effects
- giant WebGL backgrounds
- generic stock AI imagery
- meaningless animated counters
- huge hero text with no information
- fake social proof sections

Before adding any new component ask:

> Could this exact component appear on 500 other AI websites?

If YES, redesign it.

---

# 5. BEFORE IMPLEMENTING ANYTHING

Run:

```bash
npm install
npm test
npm run build
```

If available:

```bash
npm run lint
```

Then inspect:

- `package.json`
- source tree
- all routes
- components
- styles
- Worker
- feed pipeline
- Hype scoring
- cache
- offline behavior
- SEO
- accessibility
- tests
- deployment configuration
- README
- current documentation

Open the application and visually inspect it.

Do NOT change code before understanding the current implementation.

---

# 6. CREATE AUDIT DOCUMENT

Create:

`V2-MASTER-AUDIT.md`

Document:

- Current architecture
- Routes
- Components
- Worker
- Feed pipeline
- Hype system
- Source system
- Caching
- Offline behavior
- Landing page
- SEO
- Accessibility
- Performance
- Security
- Testing
- Documentation

Classify every planned feature:

- `DONE`
- `NEEDS POLISH`
- `BROKEN`
- `MISSING`

Do not rebuild something marked DONE.

---

# 7. EXECUTION ORDER

Follow this order.

## PHASE 1 — AUDIT

Understand current project.

## PHASE 2 — SECURITY

Audit and harden feed/Worker.

## PHASE 3 — RELIABILITY

Fix feed failures, caching, offline, retries.

## PHASE 4 — LANDING PAGE

Create the front door without breaking the current product.

## PHASE 5 — CORE PRODUCT

Improve Hype Index and Hype explanations.

## PHASE 6 — EDITORIAL UX

Improve Edition, Cards, Stories and Sources.

## PHASE 7 — MOBILE + ACCESSIBILITY

Full responsive and accessibility pass.

## PHASE 8 — TESTING + SEO + PERFORMANCE

Regression, component tests, SEO, performance.

## PHASE 9 — PRODUCTION QA

Test production.

## PHASE 10 — STOP

Do not keep adding features after the core product is excellent.

---

# 8. LANDING PAGE — PRIMARY OBJECTIVE

Add a landing experience that acts as the front door to The Baseline.

It must explain the product in seconds and lead users into the actual news.

It must NOT become a generic SaaS landing page.

Preferred architecture if compatible with existing routes:

```text
/              → Landing / front door
/edition       → Full news experience
/hype-index    → Hype analytics
/sources       → Source analytics
/methodology   → Methodology
/story/:id     → Story
/about         → About
```

Before moving the current homepage, inspect existing routes and SEO.

Do not break existing URLs.

Use redirects when required.

---

# 9. LANDING PAGE STRUCTURE

Recommended sequence:

```text
01 — HERO
02 — TODAY'S LIVE SNAPSHOT
03 — REAL STORY PREVIEW
04 — WHY THE BASELINE?
05 — HOW HYPE WORKS
06 — NEWS → HYPE → WHY → SOURCE → TREND
07 — HYPE INDEX PREVIEW
08 — SOURCE PREVIEW
09 — FINAL CTA
10 — FOOTER
```

Keep the page concise.

Do not turn it into a 20-section marketing site.

---

# 10. LANDING HERO

Use:

```text
THE BASELINE

AI NEWS,
HYPE REMOVED.

A quiet interface for a very loud industry.

[ ENTER THE EDITION ]

[ EXPLORE HYPE INDEX ]
```

Use typography rather than giant decorative effects.

Avoid:

- "The future of AI news"
- "Revolutionizing journalism"
- fake market-leading claims
- fake user counts
- generic AI marketing language

---

# 11. LIVE EDITION SNAPSHOT

Immediately after the hero show real live data.

Example:

```text
TODAY'S AI NEWS

42 STORIES

CURRENT HYPE

63

+8 FROM YESTERDAY
```

All values must come from the existing data pipeline.

Never hard-code production numbers.

If data is unavailable:

```text
TODAY'S EDITION

DATA TEMPORARILY UNAVAILABLE
```

Do not fabricate.

---

# 12. LANDING PAGE STORY PREVIEW

Show a small number of actual current stories.

Example:

```text
LATEST FROM THE WIRES

SOURCE · 14:32

Original headline

HOT · 7/10

READ ORIGINAL →

────────────────────

SOURCE · 13:58

Original headline

MEASURED · 3/10
```

Use the same normalized story data as the main product.

Do NOT create a second fake feed system.

---

# 13. PRIMARY LANDING CTA

Primary CTA:

> **ENTER THE EDITION**

This must lead to the full news experience.

Secondary CTA:

> **EXPLORE HYPE INDEX**

This leads to:

`/hype-index`

---

# 14. WHY THE BASELINE

Create an editorial explanation.

Example:

```text
WHY THE BASELINE?

AI news doesn't just report.

It performs.

The Baseline measures the language around
the story — not whether the story is true.
```

Keep the copy concise.

No marketing fluff.

---

# 15. HOW HYPE WORKS

Introduce the idea using illustrative examples.

Example:

```text
HOW LOUD IS THE STORY?

LOW

Company releases a new model.

↓

MEDIUM

New model delivers major performance gains.

↓

HIGH

Revolutionary AI destroys every benchmark.
```

Clearly indicate that these examples are illustrative.

Do not present them as real news.

---

# 16. LANDING HYPE EXPLANATION

Show a score explanation format:

```text
HOT · 7/10

WHY 7?

+2 High-intensity language
+2 Benchmark claim
+1 Superlative
+1 Numerical claim
+1 Punctuation
```

Then:

> Hype measures presentation intensity, not factual accuracy.

This is a major trust signal.

---

# 17. SIGNAL LOOP

Create a concise visual explanation:

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
```

Do not turn it into a flashy infographic.

Use typography and subtle motion.

---

# 18. HYPE INDEX PREVIEW

Show real current data:

```text
HOW LOUD IS TODAY?

63

7-DAY AVERAGE
57.8

+8 FROM YESTERDAY

[ EXPLORE HYPE INDEX ]
```

If historical data isn't available:

```text
HISTORICAL COMPARISON
NOT ENOUGH HISTORY
```

Never fake history.

---

# 19. SOURCE PREVIEW

Show real source data:

```text
WHO'S SHOUTING?

SOURCE       AVG HYPE

Source A       7.2
Source B       6.1
Source C       4.8

[ EXPLORE SOURCES ]
```

Use:

> Average headline intensity

Do not imply credibility ranking.

---

# 20. FINAL LANDING CTA

End with:

```text
THE NEWS IS LOUD ENOUGH.

READ IT DIFFERENTLY.

[ ENTER TODAY'S EDITION ]
```

Avoid:

- Start free trial
- Join thousands
- Unlock the future
- Subscribe now
- marketing buzzwords

---

# 21. LANDING FOOTER

Minimal navigation:

- Edition
- Hype Index
- Sources
- Methodology
- About

Brand:

> THE BASELINE  
> AI NEWS, HYPE REMOVED.

---

# 22. LANDING PAGE MOTION

Use subtle editorial motion.

Good:

- headline reveal
- rule expansion
- subtle story arrival
- small number transition
- page transition
- restrained ticker movement

Avoid:

- constant movement
- infinite floating elements
- excessive parallax
- giant scroll effects
- particle systems
- unnecessary animation on every section

Honor:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

- Disable decorative movement
- Preserve information
- Preserve hierarchy
- Preserve navigation

---

# 23. LANDING PAGE PERFORMANCE

Do not add heavy dependencies only for the landing page.

Avoid:

- large video hero
- large 3D libraries
- WebGL backgrounds
- heavy image galleries

Prefer:

- CSS
- existing assets
- existing components
- lightweight transitions

Measure before optimizing.

---

# 24. HYPE INDEX — CORE PRODUCT

Make `/hype-index` the strongest analytical page.

It should communicate:

- Current Hype
- Previous Hype
- Change
- 7-day average
- Story count
- Distribution

Example:

```text
TODAY

63

+8 FROM YESTERDAY

7-DAY AVG
57.8

42 STORIES
```

All values must be real.

---

# 25. WHY TODAY?

Calculate actual Hype drivers.

Example:

```text
WHY TODAY?

Benchmark claims       34%
Superlatives           27%
High-intensity words   22%
Formatting              9%
Other                   8%
```

These percentages must be derived from actual story data.

No placeholders in production.

---

# 26. BIGGEST SHIFT

Compare real available history.

Example:

```text
BIGGEST SHIFT

Benchmark language
↑ 18%

Superlatives
↑ 11%
```

If insufficient history:

`NOT ENOUGH HISTORY`

---

# 27. HYPE DISTRIBUTION

Show:

- MEASURED
- WARM
- HOT
- ON FIRE

with:

- count
- percentage
- score

Do not rely on color alone.

---

# 28. HYPE SCORE EXPLANATIONS

Every story must explain its score.

Example:

```text
HOT · 7/10

WHY 7?

+2 High-intensity language
+2 Benchmark claim
+1 Superlative
+1 Numerical claim
+1 Punctuation
```

Must work with:

- mouse
- keyboard
- touch
- screen reader

Never rely exclusively on hover.

Never rely exclusively on `title=""`.

---

# 29. HYPE METHODOLOGY

Verify `/methodology`.

Explain:

## MEASURED

- headline intensity
- high-intensity words
- superlatives
- benchmark claims
- numerical claims
- emotional language
- formatting
- punctuation
- contextual combinations

## NOT MEASURED

- truth
- factual accuracy
- journalistic quality
- political bias
- source credibility

Prominent disclaimer:

> **A high Hype score does not mean a story is false.**

---

# 30. HYPE ALGORITHM

Audit rather than blindly rewrite.

Core principle:

> **WORD PRESENCE ≠ AUTOMATIC HYPE**

Example:

> Researchers examine whether AI could become superhuman

must not automatically score highly.

Compare with:

> Revolutionary AI destroys every benchmark

which should score significantly higher.

Prioritize:

1. Context
2. Signal combinations
3. Intensity
4. Superlatives
5. Benchmark claims
6. Formatting
7. Punctuation

Preserve contextual weighting, bounded stacking and false-positive protection.

---

# 31. HYPE TESTS

Test:

### LOW

> OpenAI releases a new API update

### MEDIUM

> New AI model delivers major performance improvements

### HIGH

> Revolutionary AI destroys every benchmark

### FALSE POSITIVE

> Researchers examine whether AI could become superhuman

### FALSE POSITIVE

> Company reports $1 billion investment

Also test:

- quoted language
- negation
- historical language
- academic language
- numbers
- benchmarks
- punctuation
- capitalization
- Unicode
- long headlines

---

# 32. SOURCE ANALYTICS

Improve `/sources`.

Display:

```text
SOURCE
STORIES
AVG HYPE
TREND
```

Example:

```text
Source A       18       7.2       ↑12%
Source B       31       6.1       ↑4%
Source C       12       4.8       ↓8%
```

Optional:

- MOST INTENSE
- MOST MEASURED
- BIGGEST CHANGE

Use real data only.

---

# 33. SOURCE PROFILES

Verify:

`/sources/:source`

Show:

- source name
- feed status
- story count
- average Hype
- distribution
- recent trend
- latest stories

Keep the UI editorial.

---

# 34. SOURCE PROVENANCE

Clearly identify:

> FIRST-PARTY FEED

vs.

> MIRRORED FEED

For mirrored feeds:

```text
MIRRORED SOURCE
UPDATED HOURLY
```

Never imply a mirrored feed is directly published by the original source.

---

# 35. SOURCE DIVERSITY

Homepage ranking must balance:

- freshness
- relevance
- source diversity
- Hype

Do not let one publisher dominate because it publishes more high-Hype stories.

Important:

> **Hype ≠ importance.**

---

# 36. STORY PAGES

Verify:

`/story/:id`

A direct URL must work on a fresh visit.

Show:

- source
- published date/time
- original headline
- Hype score
- Hype explanation
- original article link

Do not rewrite the headline.

---

# 37. STORY ATTRIBUTION

Every story must clearly show:

- SOURCE
- PUBLISHED
- READ ORIGINAL

The original publisher remains the reporting source.

---

# 38. STORY SHARING

Verify:

`COPY LINK`

It must copy the canonical story URL.

Native sharing must use the canonical URL.

---

# 39. SEARCH

Audit:

- headline search
- source search
- summary search where available
- empty state
- long input
- Unicode
- malicious input
- keyboard
- mobile

Search must never crash the application.

---

# 40. FILTERS

Verify:

- Hype filters
- source filters
- sorting
- search + filters together
- clear filters

Do not create confusing filter states.

---

# 41. EDITION

Preserve Edition mode.

Improve only:

- hierarchy
- scanning
- source clarity
- Hype clarity
- spacing
- responsive behavior

Do not convert Edition into a SaaS dashboard.

---

# 42. CARDS

Keep Cards editorial.

Prefer:

- typography
- rules
- source/time metadata
- Hype
- original link

Avoid:

- generic image cards
- giant rounded rectangles
- gradient backgrounds
- glass
- floating shadows

---

# 43. SECURITY — CLOUDFLARE WORKER

Audit:

- SSRF
- URL validation
- hostname validation
- protocol validation
- feed allowlist
- redirects
- CORS
- response-size cap
- timeout
- rate limiting
- cache behavior
- malformed requests
- headers

Attempt bypasses safely.

Do not weaken current controls.

---

# 44. RSS/ATOM SECURITY

Treat external XML as hostile.

Test payloads in:

- titles
- descriptions
- author
- links
- categories

Examples:

```html
<script>alert(1)</script>
```

```html
<img src=x onerror=alert(1)>
```

```text
javascript:alert(1)
```

Check the complete data flow:

```text
RSS
 ↓
Parser
 ↓
Normalizer
 ↓
State
 ↓
React
 ↓
DOM
```

No arbitrary JavaScript execution must be possible.

---

# 45. STRIX

If Strix is available:

### Stage 1
Local repository

### Stage 2
Staging/local deployment

### Stage 3
Production

Scope:

- SSRF
- XSS
- DOM XSS
- feed injection
- URL manipulation
- Worker security
- CORS
- rate-limit bypass
- cache poisoning
- information disclosure
- access control

Do not allow:

- destructive production actions
- attacks on third parties
- persistent backdoors

Create:

`SECURITY-AUDIT.md`

Each finding must include:

- severity
- affected component
- reproduction
- proof
- impact
- root cause
- fix

---

# 46. FEED RELIABILITY

Every feed must fail independently.

States:

- LOADING
- LIVE
- STALE
- FAILED
- OFFLINE
- RETRYING

One failed feed must not destroy the edition.

No infinite loading.

---

# 47. OFFLINE MODE

Verify:

- saved edition
- background refresh
- retry
- offline indication
- stale content handling

Example:

> THE PRESSES ARE JAMMED  
> Showing the last saved edition.

---

# 48. KEYBOARD

Where consistent with the current UX:

```text
j       next story
k       previous story
Enter   open
Escape  close
/       search
?       shortcuts
```

Never interfere with text entry.

---

# 49. ACCESSIBILITY

Verify:

- semantic HTML
- labels
- visible focus
- keyboard
- focus trap
- focus restoration
- Escape
- screen readers
- reduced motion
- contrast
- color-independent Hype states

Do not regress existing accessibility.

---

# 50. MOBILE

Test:

- 320px
- 375px
- 390px
- 430px
- 768px
- desktop

Check:

- navigation
- hero
- stories
- Hype Index
- source analytics
- Cards
- Edition
- modal
- search
- filters
- score explanation

No horizontal overflow.

---

# 51. ERROR STATES

Every async action must eventually show:

- content
- cached content
- empty state
- error state

Never leave:

`Loading...`

indefinitely.

Prefer editorial error language.

Example:

> THE PRESSES ARE JAMMED

---

# 52. COMPONENT TESTS

Add focused tests for:

- routing
- homepage
- Hype Index
- Hype explanation
- story modal
- Escape
- focus restoration
- search
- filters
- error states
- saved edition
- offline behavior

Do not create a giant brittle snapshot suite.

---

# 53. SEO

Verify:

- unique title
- meta description
- canonical
- Open Graph
- Twitter metadata
- JSON-LD
- sitemap
- robots.txt
- favicon
- manifest

For stories, use accurate `NewsArticle` data only from real metadata.

---

# 54. PERFORMANCE

Measure before optimizing.

Audit:

- bundle size
- font loading
- feed parsing
- DOM size
- render performance
- layout shifts
- unnecessary rerenders
- animation cost

Use lightweight solutions.

Do not destroy the design for arbitrary Lighthouse numbers.

---

# 55. README

Rework `README.md` to lead with the product.

Preferred structure:

```text
THE BASELINE

AI NEWS, HYPE REMOVED.

What it is
Why it exists
Core features
Hype Index
Story analysis
Source comparison
Screenshots
Methodology
Architecture
Development
Deployment
```

Technical details should come later.

---

# 56. DOCUMENTATION

Create/update:

- `V2-MASTER-AUDIT.md`
- `SECURITY-AUDIT.md`
- `QA-CHECKLIST.md`
- `FUTURE-ROADMAP.md`

Documentation must match actual implementation.

Remove outdated issue lists.

---

# 57. FUTURE FEATURES — DO NOT PRIORITIZE NOW

Document only:

- global Hype history
- daily editions
- edition archive
- persistent analytics
- richer source history
- PWA

Do not implement these unless the current architecture genuinely requires them.

---

# 58. DO NOT ADD A DATABASE YET

Do not introduce a database simply because the product has grown.

Keep the current lightweight architecture unless a concrete limitation is demonstrated.

---

# 59. ANALYTICS / TRACKING

Do not introduce invasive tracking.

If analytics already exist, reuse them.

Potential events:

- `enter_edition`
- `view_hype_index`
- `view_sources`
- `read_methodology`
- `open_story`

Only add tracking when justified.

---

# 60. GIT DISCIPLINE

Use logical commits.

Suggested sequence:

```text
audit
security
feed reliability
landing page
hype improvements
source analytics
story UX
mobile/accessibility
tests
SEO
documentation
```

Do not create one giant unreviewable commit.

Keep the application buildable after each major phase.

---

# 61. QA AFTER EVERY PHASE

Run:

```bash
npm test
npm run build
```

If available:

```bash
npm run lint
```

Then manually test the affected feature.

Do not accumulate dozens of untested changes.

---

# 62. PRODUCTION QA

Test the actual production deployment.

## Landing

- [ ] Hero
- [ ] Live snapshot
- [ ] Story preview
- [ ] Why section
- [ ] Hype explanation
- [ ] Hype preview
- [ ] Source preview
- [ ] CTA
- [ ] Footer

## Product

- [ ] Edition
- [ ] Cards
- [ ] Hype Index
- [ ] Sources
- [ ] Methodology
- [ ] Story pages
- [ ] Search
- [ ] Filters

## Reliability

- [ ] Feed failure
- [ ] Retry
- [ ] Offline
- [ ] Saved edition
- [ ] SWR

## Accessibility

- [ ] Keyboard
- [ ] Focus
- [ ] Screen reader
- [ ] Reduced motion

## Responsive

- [ ] 320px
- [ ] 375px
- [ ] 390px
- [ ] 430px
- [ ] 768px
- [ ] Desktop

---

# 63. FINAL SECURITY CHECK

Before completion verify:

- no obvious XSS
- no SSRF bypass
- no unsafe RSS rendering
- no open redirect
- no secret exposure
- CORS is correct
- rate limiting works
- response limits work
- Worker rejects invalid upstreams

Retest all previously fixed findings.

---

# 64. FINAL DATA INTEGRITY CHECK

Verify:

- every story is real
- every source is real
- every publication date is real
- every Hype score is calculated
- every trend is calculated
- every chart uses real values
- every ranking uses real data

If unavailable:

> DATA UNAVAILABLE

Never fill gaps with invented content.

---

# 65. FIRST-TIME USER TEST

Pretend you know nothing about The Baseline.

Within 5 seconds:

> What is this?

Expected:

> AI news with measured headline Hype.

Within 15 seconds:

> What is Hype?

Expected:

> A measure of headline intensity.

Within 30 seconds:

> Why did this story get this score?

Expected:

> WHY THIS SCORE?

Within 60 seconds:

> Who is shouting?

Expected:

> Sources.

Within 90 seconds:

> How is AI news changing?

Expected:

> Hype Index / Trend.

Fix anything that makes these answers unclear.

---

# 66. VISUAL QUALITY TEST

Before accepting the final UI ask:

- Does this look like The Baseline?
- Does typography lead?
- Does the page feel editorial?
- Does the design feel intentional?
- Is motion restrained?
- Is information more important than decoration?
- Does mobile preserve the identity?
- Could this be mistaken for generic AI SaaS?

If the answer to the last question is YES:

**REDESIGN.**

---

# 67. FINAL DEFINITION OF DONE

## PRODUCT

- [ ] Landing page is clear
- [ ] Edition is polished
- [ ] Cards are editorial
- [ ] Hype Index is useful
- [ ] Hype explanation is excellent
- [ ] Methodology is clear
- [ ] Source analytics are useful
- [ ] Story pages are polished

## SECURITY

- [ ] Worker audited
- [ ] SSRF tested
- [ ] XSS tested
- [ ] RSS injection tested
- [ ] CORS verified
- [ ] Rate limiting verified
- [ ] Response limits verified

## RELIABILITY

- [ ] Feed errors graceful
- [ ] Retry works
- [ ] Offline works
- [ ] Saved edition works
- [ ] SWR works

## ACCESSIBILITY

- [ ] Keyboard works
- [ ] Focus works
- [ ] Modal works
- [ ] Screen reader works
- [ ] Reduced motion works
- [ ] Color is not the only Hype indicator

## RESPONSIVE

- [ ] 320px
- [ ] 375px
- [ ] 390px
- [ ] 430px
- [ ] 768px
- [ ] Desktop

## SEO

- [ ] Title
- [ ] Description
- [ ] Canonical
- [ ] Open Graph
- [ ] Twitter
- [ ] JSON-LD
- [ ] Sitemap
- [ ] Robots
- [ ] Favicon

## ENGINEERING

- [ ] Tests pass
- [ ] Build passes
- [ ] Lint passes
- [ ] No unexplained console errors
- [ ] No broken routes
- [ ] No fabricated data

## DESIGN

- [ ] Distinctive
- [ ] Editorial
- [ ] Restrained
- [ ] Human-authored
- [ ] No AI-slop

---

# 68. STOP CONDITION

When all P0 and P1 requirements are complete:

**STOP.**

Do not keep adding features.

Perform:

- Regression test
- Security retest
- Accessibility audit
- Performance audit
- Mobile audit
- Visual polish
- Documentation cleanup

The goal is not maximum feature count.

The goal is maximum quality.

---

# 69. FINAL PRODUCT PRINCIPLE

Do not ask:

> What else can we add?

Ask:

> How can we make what already exists substantially better?

The Baseline has five core ideas:

## NEWS

What happened?

## HYPE

How loudly is it being presented?

## WHY

Why did it receive that score?

## SOURCE

Who published it?

## TREND

How is the conversation changing?

Everything else is secondary.

---

# 70. FINAL NORTH STAR

The user should leave thinking:

> "I can get AI news anywhere."

> "But The Baseline tells me how loudly everyone is talking."

Protect that idea.

---

# THE BASELINE

## AI NEWS, HYPE REMOVED.

### Verbatim in. Hype measured out.
