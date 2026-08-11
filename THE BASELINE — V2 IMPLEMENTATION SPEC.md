# THE BASELINE — V2 IMPLEMENTATION SPEC

## Repository

GitHub:
`https://github.com/sinzo8771-prog/Baseline`

Production:
`https://the-baseline.baseline-news.workers.dev/`

---

# 0. MISSION

Improve **The Baseline** into a polished, trustworthy, editorial AI-news measurement product.

The core product idea is:

> **AI news, hype removed.**
>
> **Verbatim in. Hype measured out.**

The Baseline is NOT an AI news generator.

It is NOT a generic news dashboard.

It is NOT a chatbot.

It is NOT an AI content farm.

It measures the **intensity of AI-news headlines** and gives users transparent context about why a headline receives its Hype score.

---

# 1. ABSOLUTE RULE: DO NOT REBUILD THE WEBSITE

Before changing anything:

1. Inspect the entire repository.
2. Run the existing application.
3. Run all existing tests.
4. Run the production build.
5. Inspect every route.
6. Inspect the Worker.
7. Inspect the RSS pipeline.
8. Inspect the hype algorithm.
9. Inspect the existing design system.

Preserve working architecture.

Do NOT rewrite the application from scratch.

Do NOT replace the current visual identity.

Do NOT introduce a new frontend framework.

Do NOT introduce a database unless explicitly required by a feature below.

---

# 2. DESIGN NORTH STAR

The website should feel like:

- an independent newspaper
- an editorial instrument
- a data publication
- slightly experimental
- intelligent
- restrained
- tactile
- human-designed

It should NOT feel like:

- AI SaaS
- generic startup landing page
- glassmorphism dashboard
- crypto website
- cyberpunk template
- generic "AI" website
- excessive 3D
- excessive gradients
- excessive rounded cards
- excessive animations

## Critical rule

Every visual effect must have a purpose.

If an animation does not communicate:

- hierarchy
- state
- transition
- arrival
- editorial character

remove it.

---

# 3. CURRENT DESIGN MUST BE PRESERVED

Preserve the existing:

- Baseline masthead
- newspaper/editorial aesthetic
- serif typography
- paper texture
- editorial rules
- Edition mode
- Cards mode
- Hype badges
- analog/VHS details
- glitch details
- dark/light theme
- responsive layout
- accessibility foundation
- reduced-motion support

Improve them rather than replacing them.

---

# 4. PHASE 1 — AUDIT FIRST

Before implementation create:

`V2-AUDIT.md`

Document:

- current routes
- current components
- current Worker behavior
- current feed architecture
- current cache behavior
- current hype scoring
- current test coverage
- current SEO
- current accessibility
- current known bugs

Mark each requirement in this document as:

- already implemented
- partially implemented
- missing
- broken

Do not duplicate existing functionality.

---

# 5. SECURITY HARDENING

## 5.1 CORS

Verify the current Worker does NOT expose:

```text
Access-Control-Allow-Origin: *
```

Keep same-origin behavior.

Do not weaken this.

---

## 5.2 Feed allowlist

The Worker must only accept feed identifiers from the known feed configuration.

Reject:

- arbitrary URLs
- arbitrary hosts
- arbitrary query targets
- unknown feed names

The Worker must never become a public SSRF/RSS proxy.

---

## 5.3 Timeouts

Maintain upstream timeout protection.

Recommended:

```text
8 seconds maximum
```

If a feed times out:

- fail gracefully
- do not block other feeds
- expose source status
- use cached data if available

---

## 5.4 Response limits

Protect the Worker against unusually large upstream responses where practical.

Do not allow a malformed or enormous feed to consume excessive resources.

---

## 5.5 Abuse protection

Investigate lightweight Cloudflare-compatible protection against repeated feed requests.

Do NOT build a complex authentication system.

The goal is simply:

> prevent unnecessary abuse of the public feed relay.

---

# 6. FEED RELIABILITY

Every source needs explicit state handling.

Possible states:

```text
LOADING
LIVE
STALE
FAILED
OFFLINE
RETRYING
```

A failed source must NEVER prevent the rest of the edition from appearing.

Example:

```text
OPENAI       LIVE
ANTHROPIC    LIVE
SOURCE X     STALE
SOURCE Y     DOWN
```

---

# 7. NEVER USE INFINITE LOADING STATES

Every asynchronous page must eventually resolve to one of:

- content
- cached content
- empty state
- error state

Never leave the user staring at:

```text
Loading...
```

indefinitely.

Apply this to:

- Home
- Hype Index
- Sources
- Story pages
- Search
- filters

---

# 8. OFFLINE EXPERIENCE

If cached edition data exists:

show it immediately.

Label it clearly:

```text
SAVED EDITION
LAST UPDATED 18:42
```

If offline:

```text
THE PRESSES ARE JAMMED

The latest wires could not be reached.

Showing the last saved edition.
```

Provide:

```text
TRY AGAIN
```

If there is no cached edition:

```text
NO EDITION AVAILABLE

We could not reach the news wires.
```

Do not fabricate content.

---

# 9. STALE-WHILE-REVALIDATE

Preserve and improve the current SWR implementation.

Desired behavior:

```text
OPEN SITE
   ↓
LOAD SAVED EDITION
   ↓
RENDER IMMEDIATELY
   ↓
FETCH CURRENT FEEDS
   ↓
UPDATE INDIVIDUAL SOURCES
   ↓
REBUILD EDITION
   ↓
SHOW NEW EDITION
```

When new data is ready:

```text
NEW EDITION PRESSED
```

Allow the user to switch to it.

---

# 10. HYPE INDEX = CORE PRODUCT

The Hype Index should become the signature feature.

Do not treat it as a decorative statistic.

The page should communicate:

### TODAY

```text
67.4
```

### YESTERDAY

```text
59.1
```

### CHANGE

```text
+8.3
```

### 7-DAY AVERAGE

```text
57.8
```

### STORY COUNT

```text
42
```

All values must come from real data.

Never use placeholder numbers in production.

---

# 11. HYPE DISTRIBUTION

Show:

```text
MEASURED
WARM
HOT
ON FIRE
```

with:

- count
- percentage
- score range if appropriate

Example:

```text
MEASURED    18
WARM        13
HOT          8
ON FIRE      3
```

Do not communicate tier through color alone.

Use:

- text
- icon/shape
- score

---

# 12. HYPE INDEX — "WHY TODAY?"

Add a section explaining the day's score.

Example:

```text
WHY TODAY?

Benchmark language      34%
Superlatives            27%
High-intensity words    22%
Formatting               9%
Other                    8%
```

This must be calculated from actual story data.

Do not invent statistics.

---

# 13. BIGGEST HYPE SHIFT

Calculate changes against the previous available edition.

Example:

```text
BIGGEST SHIFT

Benchmark language
↑ 18%

"Breakthrough" language
↑ 11%

Safety coverage
↓ 7%
```

Only show comparisons when historical data actually exists.

If insufficient data:

```text
NOT ENOUGH HISTORY
```

Do not fabricate comparisons.

---

# 14. HYPE HISTORY

Show:

- today
- yesterday
- 7-day average
- highest day
- lowest day

If browser-local history is used, label it accurately.

Example:

```text
YOUR BASELINE
```

Do NOT imply that browser-local history is a global historical archive.

---

# 15. HYPE SCORE TRANSPARENCY

This is a high-priority feature.

Every story with a Hype score should have an accessible explanation.

Example:

```text
HOT · 7/10

WHY?

+2  high-intensity language
+2  benchmark claim
+1  superlative
+1  punctuation
+1  numerical claim
```

The explanation must be accessible on:

- desktop
- mobile
- keyboard
- touch
- screen reader

Do NOT rely only on:

```html
title=""
```

Do NOT rely on hover.

---

# 16. HYPE METHODOLOGY PAGE

Create:

```text
/methodology
```

Explain clearly:

## WHAT THE BASELINE MEASURES

- headline intensity
- high-intensity words
- superlatives
- benchmark claims
- numerical claims
- formatting signals
- punctuation
- emotional language

## WHAT IT DOES NOT MEASURE

- factual accuracy
- truthfulness
- journalistic quality
- political bias
- whether the underlying claim is correct

Critical statement:

> **A high Hype score does not mean a story is false.**

The score measures headline intensity.

---

# 17. HYPE ALGORITHM AUDIT

Inspect:

```text
src/lib/hype.js
```

Improve scoring so that:

> **word presence ≠ automatic hype**

Context matters.

Example:

```text
"Researchers study whether AI could become superhuman"
```

should not receive the same score as:

```text
"Revolutionary AI destroys every benchmark"
```

The algorithm should prioritize:

1. headline construction
2. combinations of signals
3. intensity
4. repetition
5. formatting
6. superlatives

Avoid aggressive false positives.

---

# 18. HYPE SIGNAL CATEGORIES

Structure scoring into categories.

### LANGUAGE

Examples:

- revolutionary
- groundbreaking
- unprecedented
- game-changing

### SUPERLATIVES

Examples:

- best
- fastest
- largest
- #1

### BENCHMARK

Detect benchmark/performance claims.

### NUMERICAL

Detect unusually promotional numerical claims.

### FORMATTING

- ALL CAPS
- repeated punctuation
- excessive exclamation marks

### EMOTIONAL

Examples:

- shocking
- unbelievable
- stunning

The scoring engine should expose the signals that contributed to the final score.

---

# 19. HYPE SCORING TESTS

Add tests for:

### Measured

```text
OpenAI releases a new API update
```

### Warm

```text
New AI model delivers major performance improvements
```

### Hot

```text
Revolutionary new AI destroys every benchmark
```

Also test false positives.

Examples:

```text
Researchers examine whether AI could become superhuman
```

```text
Company reports $1 billion investment
```

The system should not automatically treat every large number or technical term as hype.

---

# 20. STORY PERMALINKS

Create stable story URLs.

Preferred structure:

```text
/story/:id
```

or a deterministic slug.

Every story must be directly shareable.

A story URL must work on a fresh browser visit.

---

# 21. STORY PAGE

A story page should contain:

```text
THE BASELINE

SOURCE
Publisher

PUBLISHED
Date/time

HYPE
HOT · 7/10

HEADLINE
Original headline exactly as published

WHY?
Hype explanation

[ READ ORIGINAL ]
```

Do not rewrite the original headline.

Do not claim ownership of the reporting.

---

# 22. ORIGINAL SOURCE ATTRIBUTION

Every story must clearly identify the original source.

Include:

```text
SOURCE
PUBLISHED
READ ORIGINAL →
```

The original link must be obvious.

The Baseline is the measurement layer.

The original publisher remains the source of reporting.

---

# 23. STORY SHARING

Add:

```text
COPY LINK
```

Optional:

```text
SHARE
```

Sharing should preserve the story permalink.

Do not create fake social preview data.

---

# 24. STORY STRUCTURED DATA

For story pages use appropriate JSON-LD such as:

```text
NewsArticle
```

Only include information that actually exists.

Never invent:

- authors
- publishers
- dates
- images

---

# 25. SOURCE LEADERBOARD

Upgrade `/sources`.

Add:

```text
WHO'S SHOUTING?
```

Show:

```text
SOURCE
STORIES
AVG. HEADLINE INTENSITY
TREND
```

Example:

```text
SOURCE A       24       7.2       ↑
SOURCE B       18       5.8       →
SOURCE C       31       4.1       ↓
```

Use neutral terminology.

Never label a source:

```text
dishonest
bad
misleading
clickbait
```

unless the product explicitly defines such a metric later.

Prefer:

> Average headline intensity.

---

# 26. SOURCE PROFILE

Allow users to inspect a source.

Possible route:

```text
/sources/:source
```

Display:

- source name
- source status
- story count
- average Hype
- Hype distribution
- recent trend
- latest stories

Use real data only.

---

# 27. SOURCE DIVERSITY

Prevent the homepage from being dominated by one publisher.

Ranking should consider:

- freshness
- relevance
- hype
- source diversity

Do not simply sort by Hype.

The highest-hype publisher should not automatically occupy the entire front page.

---

# 28. DEDUPLICATION

Audit current deduplication.

Support:

- exact duplicate titles
- punctuation variations
- capitalization differences
- source-specific prefixes
- near-identical headlines

Do not merge unrelated stories.

Maintain tests.

---

# 29. EDITION RANKING

Improve Edition ranking.

Consider:

```text
freshness
+
source diversity
+
relevance
+
hype
```

But:

> **Hype must not become a proxy for importance.**

A calm but important story should still be visible.

---

# 30. HOMEPAGE

The homepage should answer immediately:

1. What's happening?
2. How hyped is it?
3. Which stories are worth reading?
4. Who published them?
5. Why did they receive that score?

Avoid unnecessary hero content.

The news should remain the hero.

---

# 31. EDITION VIEW

Preserve the newspaper layout.

Add subtle edition metadata:

```text
EDITION 128
MONDAY · AUGUST 10
42 STORIES
```

Only use deterministic values.

Do not fabricate edition history.

---

# 32. CARDS VIEW

Each card should contain:

- source
- time
- original headline
- Hype tier
- Hype score
- concise extracted summary if available
- original link

Avoid unnecessary controls.

---

# 33. SEARCH

Search:

- headline
- source
- available summary

Show:

```text
14 STORIES
```

No results:

```text
NOTHING IN THE WIRES

Try another search.
```

Add:

```text
/
```

as search shortcut.

Do not trigger the shortcut while typing inside inputs.

---

# 34. FILTERS

Hype filters should display real counts:

```text
ALL 42
MEASURED 18
WARM 13
HOT 8
ON FIRE 3
```

Filters should work correctly with:

- search
- source
- sorting

---

# 35. KEYBOARD NAVIGATION

Add:

```text
j       next story
k       previous story
Enter   open story
Escape  close story
/       search
?       shortcuts
```

Do not interfere with text fields.

---

# 36. STORY MODAL

Preserve existing focus behavior.

Verify:

- focus trap
- Escape
- focus restoration
- keyboard navigation
- screen reader announcement

On mobile:

consider a full-screen story sheet rather than a small desktop modal.

---

# 37. MOBILE QA

Explicitly test:

```text
320px
375px
390px
430px
768px
```

Verify:

- no horizontal overflow
- no clipped text
- no broken filters
- no oversized masthead
- no broken modals
- no inaccessible controls
- charts remain readable
- Hype explanations work by touch

---

# 38. ACCESSIBILITY

Maintain:

- semantic HTML
- labels
- focus states
- keyboard navigation
- ARIA where appropriate
- contrast
- reduced motion

Audit:

- buttons
- filters
- modal
- Hype meter
- charts
- navigation
- errors

Never make color the only indicator of Hype.

---

# 39. REDUCED MOTION

Maintain:

```text
prefers-reduced-motion
```

When enabled:

- disable glitch movement
- reduce transitions
- remove unnecessary reveal animations
- preserve content and functionality

---

# 40. LOADING DESIGN

Avoid generic skeleton overload.

Use the editorial identity.

Examples:

```text
PRESSING THE WIRES...
```

or:

```text
SETTING TYPE...
```

But loading text must never become a substitute for actual error handling.

---

# 41. ERROR DESIGN

Create reusable editorial error states.

Example:

```text
THE PRESSES ARE JAMMED

The news wires could not be reached.

[ TRY AGAIN ]
```

If cached content exists:

```text
SHOWING SAVED EDITION
```

---

# 42. SEO

Audit all routes.

Ensure:

- unique title
- meta description
- canonical
- Open Graph
- Twitter metadata
- structured data
- sitemap
- robots.txt
- favicon
- manifest

---

# 43. CANONICALS

Every indexable page needs a canonical URL.

Examples:

```text
/
 /hype-index
 /sources
 /methodology
 /story/:id
```

Avoid duplicate URL variants.

---

# 44. SITEMAP

Ensure sitemap includes all important static routes.

At minimum:

```text
/
 /hype-index
 /sources
 /methodology
 /about
```

Story URLs should be included if the architecture can generate them reliably.

---

# 45. FAVICON

Add a proper:

```text
/favicon.ico
```

Also verify:

- browser tab
- bookmarks
- mobile install
- social preview where relevant

Keep it consistent with Baseline branding.

---

# 46. ABOUT PAGE

Create/improve:

```text
/about
```

Explain:

- what The Baseline is
- why headlines remain verbatim
- how Hype works
- why original sources matter
- what the score does not mean

Keep it concise.

Do not write marketing fluff.

---

# 47. RSS OUTPUT

After core features are stable, consider a Baseline RSS feed.

Include:

- original headline
- source
- publication time
- Hype tier
- Hype score
- original URL

Do NOT republish full article text.

---

# 48. OPML

Keep OPML support.

Expose it clearly from Sources:

```text
DOWNLOAD OPML
```

Verify it actually downloads valid OPML.

---

# 49. PERFORMANCE

Measure before changing.

Audit:

- JavaScript bundle
- fonts
- images
- feed parsing
- DOM size
- animations
- layout shifts

Use:

- caching
- lazy loading
- code splitting
- efficient rendering

Do not sacrifice the Baseline visual identity for arbitrary Lighthouse scores.

---

# 50. FEED CONCURRENCY

Preserve concurrent feed fetching.

Desired behavior:

```text
Feed A ────────┐
Feed B ────────┤
Feed C ────────┤──→ normalize → dedupe → score → rank
Feed D ────────┤
Feed E ────────┘
```

One slow feed must not block all others.

---

# 51. EDGE CACHE

Maintain current short-term Worker caching.

Target:

```text
5 minute cache
```

with stale-while-revalidate where appropriate.

Do not cache news indefinitely.

---

# 52. PRODUCTION OBSERVABILITY

Track lightweight technical metrics where practical:

- feed failures
- feed latency
- malformed feeds
- parsing failures
- number of stories
- dedupe count

Do not collect unnecessary personal information.

---

# 53. DATA INTEGRITY

Never fabricate:

- stories
- sources
- dates
- scores
- history
- rankings
- statistics

If data is unavailable:

```text
DATA UNAVAILABLE
```

Trust is more important than filling every empty space.

---

# 54. NO AI-GENERATED EDITORIAL CONTENT

Do not add:

- AI-written summaries
- AI-written headlines
- AI-written articles
- fake commentary
- fake quotes
- AI opinions

Prefer:

- original headlines
- RSS-provided descriptions
- deterministic extraction
- transparent algorithms

If an AI-generated feature is ever introduced, it must be clearly labeled and must never impersonate the original publisher.

---

# 55. TESTING

Expand tests where useful.

## Feed

- RSS
- Atom
- malformed XML
- missing title
- missing date
- missing description
- timeout
- failed source

## Hype

- low
- medium
- high
- false positives
- combinations
- formatting
- numerical claims

## Dedupe

- exact
- near duplicate
- source prefix
- unrelated similar headlines

## Ranking

- freshness
- source diversity
- Hype
- relevance

## History

- empty
- one day
- seven days
- corrupted storage

## UI

- error
- offline
- story modal
- keyboard
- reduced motion

---

# 56. BUILD CHECK

Before completion:

```bash
npm test
npm run build
```

If available:

```bash
npm run lint
```

All must pass.

---

# 57. PRODUCTION QA

Verify every route manually.

## Homepage

- [ ] stories load
- [ ] source labels work
- [ ] filters work
- [ ] search works
- [ ] sorting works
- [ ] Edition works
- [ ] Cards works
- [ ] story modal works

## Hype Index

- [ ] current score
- [ ] previous score
- [ ] trend
- [ ] distribution
- [ ] explanation
- [ ] methodology link

## Sources

- [ ] source list
- [ ] source status
- [ ] source statistics
- [ ] source filtering
- [ ] OPML

## Stories

- [ ] permalink
- [ ] original headline
- [ ] source
- [ ] date
- [ ] Hype
- [ ] explanation
- [ ] original article

## Errors

- [ ] offline
- [ ] retry
- [ ] feed failure
- [ ] saved edition

## SEO

- [ ] title
- [ ] description
- [ ] canonical
- [ ] sitemap
- [ ] robots
- [ ] JSON-LD
- [ ] OG
- [ ] favicon

---

# 58. VISUAL QA

After implementation, inspect the actual production build.

Do not rely solely on code.

Check:

- spacing
- typography
- hierarchy
- animation
- hover states
- focus states
- mobile
- dark mode
- light mode
- error states
- loading states

The result should still look like **The Baseline**.

---

# 59. ANTI-AI-SLOP RULES

The agent must reject design changes that introduce:

- generic gradient hero
- giant "AI" text
- floating glass cards
- random 3D objects
- glowing blobs
- excessive rounded containers
- unnecessary dashboards
- meaningless animated numbers
- fake testimonials
- fake social proof
- fake user counts
- excessive particle effects
- excessive cursor effects
- generic AI imagery

If a design idea could be copied directly into 500 other AI startups, reconsider it.

---

# 60. DO NOT OVER-ANIMATE

Use animation sparingly.

Good:

- newspaper reveal
- subtle type setting
- page transitions
- tiny analog imperfections
- state transitions

Bad:

- constant background movement
- excessive parallax
- cursor-following everything
- giant text transformations
- infinite glitch loops
- animation on every element

The product should feel like a publication first.

---

# 61. DO NOT OVER-ROUND

The Baseline is editorial.

Prefer:

- rules
- borders
- columns
- typography
- whitespace

over:

- rounded cards everywhere
- pill-shaped everything

Use rounded elements only when interaction semantics justify them.

---

# 62. DO NOT OVER-GAMIFY HYPE

The Hype Index should be interesting without becoming a game.

Avoid:

- XP
- streaks
- achievements
- badges everywhere
- points
- leaderboards for users

The data itself should be compelling.

---

# 63. DO NOT TURN HYPE INTO "TRUTH"

This is critical.

Never imply:

```text
High Hype = False
Low Hype = True
```

The correct relationship is:

```text
High Hype
=
High headline intensity
```

Not:

```text
High Hype
=
Bad journalism
```

---

# 64. PRODUCT LOOP

The final experience should create this loop:

```text
NEWS
   ↓
HYPE DETECTION
   ↓
WHY?
   ↓
TREND
   ↓
SOURCE COMPARISON
   ↓
SHAREABLE STORY
```

This is the heart of the product.

---

# 65. FUTURE FEATURES — DO NOT PRIORITIZE YET

Only consider these after the above work is stable:

- Daily editions
- Edition archive
- PWA
- advanced historical analytics
- global persistent archive
- Baseline RSS
- richer source profiles

Do NOT implement a database merely to support these prematurely.

---

# 66. THINGS NOT TO BUILD

Do NOT add:

- user authentication
- comments
- likes
- social feed
- AI chatbot
- AI writer
- fake community
- fake subscriber numbers
- fake testimonials
- unnecessary database
- unnecessary backend
- unnecessary third-party services

unless there is a concrete product requirement.

---

# 67. CODE QUALITY

Use:

- small components
- deterministic utilities
- reusable components
- descriptive naming
- testable logic
- minimal dependencies

Avoid:

- giant components
- duplicate scoring logic
- magic numbers
- hidden side effects
- unnecessary abstractions

---

# 68. DOCUMENTATION

After implementation update:

```text
README.md
```

Remove obsolete claims.

Update:

- architecture
- current features
- cache behavior
- security behavior
- routes
- tests
- development instructions

Also update/remove:

```text
baseline-review.md
```

if its findings are no longer accurate.

Do NOT leave old bugs documented as current bugs.

---

# 69. CHANGELOG

Create or update:

```text
CHANGELOG.md
```

Document the V2 changes.

Group them:

```text
Security
Performance
Hype Index
Stories
Sources
Accessibility
SEO
UX
Testing
```

Keep it factual.

---

# 70. GIT DISCIPLINE

Use logical commits.

Suggested:

```text
fix: harden feed relay
fix: improve feed failure states
feat: add transparent hype explanations
feat: add story permalinks
feat: improve hype analytics
feat: add source leaderboard
fix: improve SEO metadata
test: add UI smoke coverage
docs: update v2 architecture
```

Do not create one enormous commit containing unrelated changes.

---

# 71. DEFINITION OF DONE

V2 is complete only when:

- [ ] current architecture remains intact
- [ ] CORS remains secure
- [ ] feed allowlist remains enforced
- [ ] feed failures are graceful
- [ ] offline states work
- [ ] cached edition works
- [ ] Hype Index is transparent
- [ ] Hype score explanations are accessible
- [ ] methodology page exists
- [ ] scoring false positives are reduced
- [ ] story permalinks work
- [ ] original source attribution is obvious
- [ ] source leaderboard works
- [ ] source profiles work
- [ ] source diversity is respected
- [ ] search works
- [ ] filters work
- [ ] keyboard navigation works
- [ ] mobile works
- [ ] reduced motion works
- [ ] SEO is complete
- [ ] favicon exists
- [ ] tests pass
- [ ] production build passes
- [ ] documentation is updated
- [ ] no fake data exists
- [ ] no AI-generated editorial content has been introduced
- [ ] visual identity remains distinctive

---

# 72. IMPLEMENTATION ORDER

Follow this order.

## PHASE 1 — Audit

1. Inspect repository.
2. Run application.
3. Run tests.
4. Run build.
5. Inspect routes.
6. Inspect Worker.
7. Create V2-AUDIT.md.

## PHASE 2 — Reliability

1. Security audit.
2. Feed timeout.
3. Feed failure states.
4. Offline state.
5. Saved edition.
6. SWR.
7. Abuse protection.

## PHASE 3 — HYPE

1. Audit scoring.
2. Improve contextual scoring.
3. Expose score signals.
4. Accessible Hype explanation.
5. Hype methodology.
6. Hype distribution.
7. Hype trend.
8. Biggest shift.

## PHASE 4 — STORIES

1. Stable IDs.
2. Permalinks.
3. Story pages.
4. Source attribution.
5. Copy/share.
6. Story structured data.

## PHASE 5 — SOURCES

1. Source statistics.
2. Source leaderboard.
3. Source profiles.
4. Source trends.
5. Source diversity.

## PHASE 6 — UX

1. Search.
2. Filters.
3. Keyboard shortcuts.
4. Modal accessibility.
5. Mobile.
6. Loading/error states.

## PHASE 7 — SEO

1. Canonicals.
2. Sitemap.
3. JSON-LD.
4. Open Graph.
5. Twitter metadata.
6. Favicon.
7. About/methodology pages.

## PHASE 8 — QA

1. Unit tests.
2. UI smoke tests.
3. Production build.
4. Mobile QA.
5. Accessibility QA.
6. SEO QA.
7. Production verification.

## PHASE 9 — Documentation

1. README.
2. Review document.
3. Changelog.

---

# 73. FINAL AGENT RULE

Before implementing any feature ask:

### Does this make The Baseline more useful?

### Does this make The Baseline more trustworthy?

### Does this make The Baseline more recognizable?

If the answer is no to all three:

**Do not build it.**

---

# NORTH STAR

The user should leave The Baseline thinking:

> "I can get AI news anywhere."

> **"The Baseline tells me how loudly everyone is talking."**

That is the product.

Protect it.

---

# BRAND

## THE BASELINE

### AI NEWS, HYPE REMOVED.

**Verbatim in. Hype measured out.**