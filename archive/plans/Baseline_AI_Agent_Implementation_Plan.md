# Baseline — Full AI Agent Implementation Plan

## 0. Mission

Turn Baseline from a strong prototype into a polished, trustworthy, publication-grade news product.

The agent should optimize for:

1. **Clarity** — a first-time visitor understands Baseline within 5 seconds.
2. **Editorial credibility** — the product feels like an independent publication, not a dashboard.
3. **Signal over noise** — the Hype Index is useful without implying truth, quality, or importance.
4. **Speed** — story content and core navigation render before decorative effects.
5. **Accessibility** — all core workflows work with keyboard, touch, reduced motion, and screen readers.
6. **Maintainability** — changes should be incremental, testable, and consistent with the existing architecture.
7. **Production readiness** — domain, SEO, observability, QA, CI, and deployment should match the visual quality of the product.

---

# 1. Current Product Diagnosis

## Strengths

- Strong editorial visual identity.
- Distinctive print-inspired typography and hierarchy.
- Clear product concept: headline language intensity rather than “truth scoring.”
- Strong information architecture across:
  - Edition
  - Hype Index
  - Sources
  - Source profiles
  - Stories
  - Methodology
  - Saved stories
  - Weekly review
- Good accessibility intent and defensive engineering.
- Existing QA/audit documentation provides a strong base.
- Existing URL-state/filter architecture should make incremental UX improvements relatively low-risk.

## Main Problems

### P0 — Product hierarchy

The Hype Index is the most differentiated feature but is not dominant enough in the first viewport.

### P0 — Runtime consistency

The project currently has an engine/version mismatch:
- `package.json` declares Node `>=24`
- QA/CI documentation references Node 20

This must be resolved before further optimization.

### P1 — Landing-page density

The landing page communicates well but contains too many consecutive explanatory/product sections.

### P1 — Edition controls

The edition experience exposes too many controls before the user reaches the journalism.

### P1 — Performance

The main JavaScript payload is relatively large for a text-first publication, with decorative/canvas effects contributing to the cost.

### P1 — Brand credibility

The `workers.dev` deployment URL makes the product feel less like a finished publication.

### P2 — Hype terminology

“Hype Index” can be misunderstood as a score of truth, quality, or importance.

### P2 — QA freshness

The QA documentation should not depend on manually maintained verification dates.

---

# 2. Execution Rules for the AI Agent

The agent must follow these rules on every change.

## Rule A — Preserve the editorial identity

Do not replace the current visual language with:
- generic SaaS cards
- excessive gradients
- glassmorphism
- oversized rounded UI
- stock dashboard styling
- unnecessary animated decoration

Preserve:
- editorial typography
- restrained palette
- rules/dividers
- strong headline hierarchy
- newspaper/archive sensibility
- restrained accent color
- whitespace

## Rule B — Improve hierarchy before adding features

Do not add a new feature unless the change:
- improves discoverability,
- reduces friction,
- improves trust,
- or directly supports editorial consumption.

## Rule C — Never sacrifice initial content visibility for effects

The first readable headline, headline score, and primary navigation should not wait for decorative animations.

## Rule D — Treat accessibility as a functional requirement

Every interactive change must consider:
- keyboard access
- focus visibility
- semantic HTML
- accessible labels
- reduced motion
- touch targets
- screen-reader meaning
- contrast

## Rule E — Keep URLs stable where possible

Existing deep links and query/filter state should continue to work.

## Rule F — Small, reversible commits

Each phase should be independently testable and deployable.

---

# 3. Phase 0 — Baseline Snapshot and Guardrails

## Goal

Freeze the current state before making UX/performance changes.

## Tasks

### 3.1 Capture current environment

Record:

- Node version
- npm/pnpm version
- build command
- test command
- lint command
- deployment command
- production URL
- current main bundle size
- current Lighthouse/Web Vitals baseline if available

### 3.2 Resolve Node version mismatch

Choose one supported Node version.

Recommended approach:
- standardize on Node 24 if the application genuinely requires it;
- update CI and deployment to match;
- otherwise standardize everything on Node 20.

Update:
- `package.json`
- CI workflow
- deployment configuration
- documentation
- local development instructions

## Acceptance Criteria

- One Node version is documented and used by:
  - local development
  - CI
  - deployment
- Clean install/build succeeds on that version.
- No undocumented Node dependency remains.

---

# 4. Phase 1 — Landing Page: Make the Product Obvious

## Goal

Make a first-time visitor understand Baseline immediately.

## Target first-viewport hierarchy

Recommended structure:

**THE BASELINE**

*A quiet interface for a very loud industry.*

**Today's Hype Index: XX%**

*Headline intensity across today's tracked AI news.*

Primary actions:

- `Read today's edition`
- `Why this score?`

Secondary metadata:
- story count
- last updated time
- coverage/source count

## Tasks

### 4.1 Promote Hype Index

Move the Hype Index from a supporting feature into the primary hero information architecture.

The score should be visible without scrolling.

### 4.2 Add explicit descriptor

Where “Hype Index” appears prominently, add:

`Headline intensity`

or:

`Measures language intensity — not truth or quality.`

Do not rewrite this into marketing language that obscures the limitation.

### 4.3 Reduce landing-page duplication

Combine or reduce sections that communicate overlapping ideas.

Preferred landing page sequence:

1. Hero + current Hype Index
2. Today's stories
3. How the score works
4. Source / trend snapshot
5. Final CTA

Treat “signal loop” as optional supporting content rather than required main-page content.

### 4.4 Strengthen primary CTA

Primary CTA should always route to today's edition.

Secondary CTA should route to methodology.

## Acceptance Criteria

- A new visitor can identify:
  - what Baseline is,
  - what the Hype Index means,
  - and where to read today's stories
  within approximately one viewport.
- No important explanation depends on hover.
- Landing page remains editorial rather than SaaS-like.
- Existing navigation/deep links remain intact.

## Likely Files

Inspect and update:
- `src/app/pages/Landing.jsx`
- shared hero/section components
- typography/layout styles
- relevant tests

---

# 5. Phase 2 — Edition UX: Put Journalism First

## Goal

Reduce interface friction between landing on the edition and reading headlines.

## Current problem

The edition exposes a large control surface before content.

## New information hierarchy

### Primary row

- Search
- Sort
- View mode
- Filter button

### Secondary filter layer

Group advanced filters under:

`Filter`

Inside it:
- spin level
- source
- category
- other advanced dimensions

### Keep URL state

Do not remove:
- query-string filters
- sort state
- view state
- deep links

Refactor presentation without breaking state logic.

## Mobile behavior

On mobile:
- search stays prominent;
- filter controls collapse;
- avoid multi-row control clutter;
- preserve one-tap access to filter state;
- ensure touch targets are at least comfortable for thumb use.

## Story list

Make the hierarchy:

1. headline
2. source
3. timestamp / date
4. Hype signal
5. supporting metadata
6. optional summary

Avoid giving every metadata field equal visual weight.

## Acceptance Criteria

- First story card appears earlier vertically.
- Users can filter without navigating away.
- Existing filter URLs still work.
- Keyboard navigation remains complete.
- Mobile edition requires less scrolling before the first story.
- No loss of functionality.

## Likely Files

- `src/app/pages/Home.jsx`
- filter/search components
- story-card components
- shared controls
- route/query-state utilities

---

# 6. Phase 3 — Hype Index: Make It the Signature Experience

## Goal

Turn the Hype Index into a memorable, understandable core feature.

## Product definition

The UI must consistently communicate:

> Hype measures headline language intensity, not truth, importance, or reporting quality.

## Score presentation

Use the same conceptual hierarchy everywhere:

**HYPE INDEX**

**24%**

`Headline intensity`

Then explain the score.

Avoid adding too many competing labels.

## Visual treatment

The score should feel:
- editorial
- data-driven
- calm
- authoritative

Avoid:
- gamified “danger” colors
- warning-style alarm UI
- giant dashboard gauges
- excessive animation

## Comparative context

Where meaningful, show:

- today's value
- previous day
- 7-day baseline
- trend direction

But do not add comparisons that are statistically weak or misleading.

## Methodology entry point

Every high-visibility Hype Index component should provide a low-friction path to:

`How is this calculated?`

Prefer an inline explanation or methodology link over a tooltip-only solution.

## Acceptance Criteria

- User cannot reasonably mistake Hype Index for factual accuracy.
- Score is readable without animation.
- Trend changes are understandable without color alone.
- Data visualization has text equivalents.
- Methodology is reachable from score surfaces.

---

# 7. Phase 4 — Performance: Content Before Decoration

## Goal

Reduce initial JavaScript cost and improve perceived speed.

## Priority order

1. HTML/content
2. core CSS
3. primary navigation
4. story list
5. score/data
6. decorative effects

## Tasks

### 7.1 Audit the dependency graph

Identify:
- canvas libraries
- animation libraries
- large charting packages
- icon libraries
- duplicate utility packages
- components imported globally but only used on specific routes

Generate a route-level dependency map.

### 7.2 Defer decorative effects

Effects such as:
- Asciify
- DecryptReveal
- VHS
- large motion/canvas layers

should not block content paint.

Possible strategies:
- lazy load
- dynamic import
- `requestIdleCallback` where appropriate
- route-level loading
- disable on low-power/mobile conditions
- prefer CSS for simple effects

### 7.3 Reduce global animation

The main app shell should load without waiting for visual effects.

### 7.4 Audit images

For every image:
- use responsive sizing
- specify dimensions
- lazy-load below-the-fold content
- use modern formats where supported
- avoid oversized originals
- include meaningful alt text

### 7.5 Add performance budgets

Recommended initial budgets:

- main JS gzip: target < 120 kB
- critical CSS: target < 30 kB
- LCP: < 2.5 s on a reasonable mobile baseline
- CLS: < 0.1
- INP: < 200 ms

Treat these as targets, not excuses to damage usability.

## Acceptance Criteria

- Primary content appears before decorative effects.
- No contentful UI waits on a canvas effect.
- Bundle size decreases measurably.
- Performance checks are repeatable in CI/local tooling.

---

# 8. Phase 5 — Custom Domain and Publication Credibility

## Goal

Make Baseline feel like a real publication.

## Tasks

### 8.1 Add a custom domain

Use a short editorial domain if available.

Preferred characteristics:
- easy to spell
- easy to say aloud
- clearly connected to Baseline
- no infrastructure/provider branding

### 8.2 Canonical URLs

Ensure:
- canonical tags use the custom domain
- sitemap uses the custom domain
- Open Graph URLs use the custom domain
- JSON-LD URLs use the custom domain
- redirects from the old deployment URL are intentional

### 8.3 Social cards

Ensure story and edition pages produce consistent:
- title
- description
- image
- canonical URL

## Acceptance Criteria

- Search engines see one canonical site identity.
- Social previews point to the production domain.
- Old deployment URL redirects or is clearly non-canonical.

---

# 9. Phase 6 — Editorial Trust Layer

## Goal

Make Baseline trustworthy without becoming verbose.

## Trust signals

Add lightweight, persistent metadata:

- last updated
- sources monitored
- headline count
- methodology link
- score definition

## Story-level transparency

For each story, where appropriate:
- original source
- timestamp
- source domain
- score components or major signal categories
- link to original reporting

Avoid exposing internal implementation details that confuse normal readers.

## Corrections / data freshness

Create a small system for:
- feed failures
- stale data
- malformed source content
- missing scores

When data is stale, show a calm message such as:

`Last updated 42 minutes ago.`

Do not imply freshness when ingestion has failed.

---

# 10. Phase 7 — Sources Experience

## Goal

Make the source leaderboard useful rather than decorative.

## Source page

Each source profile should answer:

- What source is this?
- How many stories are represented?
- What is its average headline intensity?
- How does it compare over time?
- What topics does it cover?
- What is the data window?

## Avoid accidental ranking claims

Do not frame a source as “better” or “worse” simply because its hype score is lower.

Use neutral language:
- higher headline intensity
- lower headline intensity
- more variable language
- more stable language

## Acceptance Criteria

- Source metrics have a defined time window.
- Rankings are clearly labeled as language/intensity metrics.
- No visual treatment implies editorial quality without evidence.

---

# 11. Phase 8 — Weekly Review / Trend Product

## Goal

Give Baseline a reason to return beyond daily headlines.

## Weekly review should answer

- What changed this week?
- Which themes became louder?
- Which sources changed intensity?
- Which stories broke the baseline?
- Was the overall trend increasing, decreasing, or stable?

## Keep it editorial

Use concise editorial observations backed by data.

Avoid:
- generic AI summaries
- fabricated conclusions
- excessive chart density

## Acceptance Criteria

- Every written observation has a corresponding underlying metric.
- Users can understand the week without reading every chart.
- The weekly product is clearly distinct from the daily edition.

---

# 12. Phase 9 — Accessibility Hardening

## Goal

Move from “accessible by design” to systematically verified accessibility.

## Tasks

### Keyboard

Test all:
- nav
- filters
- search
- dialogs
- disclosures
- story actions
- save actions
- charts

### Focus

Check:
- visible focus
- focus order
- focus trap correctness
- focus restoration

### Screen readers

Verify:
- headings form a logical outline
- landmark regions are meaningful
- buttons have accessible names
- score charts have text equivalents
- visual-only metadata is not required for meaning

### Reduced motion

Ensure all animation-heavy components have reduced-motion behavior.

### Contrast

Check:
- body text
- muted text
- divider text
- chart annotations
- accent usage

### Touch

Verify comfortable targets on mobile.

## Acceptance Criteria

- No keyboard trap.
- No essential interaction requires pointer hover.
- Reduced-motion mode materially reduces motion.
- Core content is understandable without color.

---

# 13. Phase 10 — SEO and Indexing

## Goal

Make the publication discoverable without exposing unstable/private content.

## Tasks

### Metadata

Verify every route has:
- unique title
- unique description
- canonical URL
- Open Graph metadata
- Twitter/X metadata where appropriate

### Structured data

Use appropriate JSON-LD for:
- Website
- Article/NewsArticle where justified
- Breadcrumbs where useful

Do not add structured data that makes claims the page does not support.

### Sitemap

Ensure all indexable routes appear correctly.

### Robots

Verify:
- production indexing policy
- no accidental block of important pages
- no accidental indexing of utility/private pages

---

# 14. Phase 11 — Reliability and Data Ingestion

## Goal

Protect the user-facing product from upstream feed failures.

## Agent should inspect

- feed fetching
- parsing
- normalization
- deduplication
- scoring
- cache
- stale data handling
- rate limiting
- source allowlisting
- malformed response behavior

## Required states

Every feed-driven surface should handle:

1. loading
2. success
3. empty
4. partial failure
5. total failure
6. stale-but-usable data

## Acceptance Criteria

- A single source failure does not break the edition.
- Malformed feed items are isolated.
- Users know when data is stale.
- Cached valid data can continue to serve when appropriate.

---

# 15. Phase 12 — Automated QA

## Goal

Replace “manual confidence” with repeatable verification.

## Tests

### Unit

Test:
- hype calculation
- normalization
- classification
- utility functions
- URL state parsing

### Component

Test:
- filters
- story card
- score display
- methodology disclosure
- source metrics
- navigation

### End-to-end

Test the critical journey:

1. open landing page
2. see Hype Index
3. open edition
4. search
5. filter
6. open story
7. open original source
8. return to edition
9. save story
10. revisit saved story

### Accessibility

Run automated accessibility checks on:
- landing
- edition
- story
- methodology
- sources

### Visual regression

Snapshot important routes at:
- desktop
- mobile
- reduced motion

---

# 16. Phase 13 — Observability

## Goal

Know when production breaks before users report it.

Track at minimum:

- page load failure rate
- JS errors
- feed ingestion failures
- stale feed duration
- story count anomalies
- score calculation failures
- API latency
- client-side route failures

Avoid collecting unnecessary personal data.

## Alert conditions

Examples:
- no new stories for an abnormal period
- sudden drop in feed count
- ingestion endpoint repeated failures
- score pipeline returning invalid output
- production JS error spike

---

# 17. Phase 14 — Visual Polish Pass

Only do this after hierarchy and performance work.

## Typography

Check:
- line length
- headline wrapping
- numerals
- tabular numbers for data
- vertical rhythm

## Borders and rules

Make divider weight and spacing consistent.

## Spacing

Create a small spacing scale and use it systematically.

## Components

Standardize:
- buttons
- pills
- disclosures
- data labels
- score indicators
- story metadata
- source labels

## Motion

Every animation should answer one question:

> Does this improve understanding?

If not, remove or reduce it.

---

# 18. Suggested Component Architecture

The agent should prefer reusable primitives instead of page-specific copies.

Suggested conceptual layers:

## Foundation

- `Typography`
- `Divider`
- `SectionHeader`
- `Button`
- `IconButton`
- `Badge`
- `Disclosure`

## Editorial

- `StoryCard`
- `StoryMeta`
- `SourceLabel`
- `HypeScore`
- `HypeTrend`
- `Headline`
- `OriginalSourceLink`

## Data

- `Metric`
- `MiniChart`
- `TrendChart`
- `SourceMetric`
- `ScoreLegend`

## Interaction

- `SearchControl`
- `FilterControl`
- `FilterPanel`
- `ViewSwitcher`
- `SortControl`

## Trust

- `FreshnessIndicator`
- `MethodologyNote`
- `DataStatus`
- `SourceTransparency`

---

# 19. Suggested Product Copy Rules

The AI agent must maintain a consistent editorial voice.

## Voice

- calm
- concise
- observant
- slightly dry
- confident
- non-hyperbolic
- explanatory without sounding academic

## Avoid

- “revolutionary”
- “game-changing”
- “the future of”
- “AI-powered” unless technically relevant
- fear-based warning language for high scores

## Prefer

- “headline intensity”
- “language signal”
- “today’s baseline”
- “source distribution”
- “above the recent baseline”
- “measures wording, not truth”

---

# 20. Definition of Done for Every Feature

A feature is not done until all of the following are true:

## Product

- User value is obvious.
- It does not duplicate an existing feature.
- It fits the editorial identity.

## UX

- Desktop works.
- Mobile works.
- Empty/error states work.
- Navigation is discoverable.

## Accessibility

- Keyboard works.
- Focus is correct.
- ARIA/semantic structure is correct.
- Reduced motion is handled.

## Performance

- No unnecessary global dependency.
- No render-blocking decorative work.
- Bundle impact understood.

## Data

- Loading works.
- Empty works.
- Failure works.
- Stale data works where relevant.

## SEO

- Correct metadata.
- Correct canonical URL.
- No accidental indexing problems.

## QA

- Unit/component coverage where appropriate.
- E2E coverage for critical workflows.
- Production smoke check completed.

---

# 21. Recommended Implementation Order

Do not parallelize everything.

## Sprint 1 — Product hierarchy

1. Resolve Node version mismatch.
2. Redesign landing hero around Hype Index.
3. Add explicit “headline intensity” descriptor.
4. Reduce landing-page section count.
5. Simplify edition controls.

## Sprint 2 — Performance

6. Audit bundle/dependency graph.
7. Defer canvas/animation effects.
8. Improve image loading.
9. Add performance budgets.
10. Re-measure Core Web Vitals.

## Sprint 3 — Trust and publication identity

11. Add custom domain.
12. Correct canonical/social/JSON-LD URLs.
13. Add freshness/status indicators.
14. Strengthen methodology entry points.
15. Review story transparency.

## Sprint 4 — Data and source quality

16. Harden ingestion failure states.
17. Improve source profiles.
18. Improve Hype Index trend context.
19. Improve weekly review.

## Sprint 5 — QA and accessibility

20. Expand unit/component tests.
21. Add critical E2E journeys.
22. Add visual regression.
23. Add automated accessibility checks.
24. Verify mobile and reduced-motion states.

## Sprint 6 — Final polish

25. Typography pass.
26. Spacing pass.
27. Component consistency pass.
28. Animation reduction pass.
29. Production smoke test.
30. Release checklist.

---

# 22. Priority Matrix

| Priority | Work | Why |
|---|---|---|
| P0 | Hype Index first-viewport redesign | Core differentiator |
| P0 | Node version alignment | Release/CI correctness |
| P0 | Defer decorative effects | Performance and perceived speed |
| P1 | Simplify edition controls | Faster path to journalism |
| P1 | Custom domain | Credibility |
| P1 | Explicit Hype terminology | Prevent misunderstanding |
| P1 | Data freshness/error states | Trust |
| P1 | Automated performance budgets | Prevent regressions |
| P2 | Source experience upgrades | Retention and depth |
| P2 | Weekly trend product | Return frequency |
| P2 | Visual regression | Design stability |
| P2 | Observability | Operations |
| P3 | Additional visual effects/features | Only after core product is excellent |

---

# 23. AI Agent Working Prompt

Use the following as the operating instruction for the implementation agent:

> You are the lead product engineer for Baseline.
>
> Your job is to improve the existing product without destroying its editorial identity.
>
> Prioritize clarity, speed, trust, accessibility, and maintainability over novelty.
>
> Before editing:
> 1. Inspect the existing implementation.
> 2. Reuse existing patterns/components.
> 3. Identify the smallest safe change.
> 4. Check route/query-state compatibility.
>
> For every implementation:
> 1. Make the change.
> 2. Run lint/build/tests relevant to the change.
> 3. Check desktop and mobile behavior.
> 4. Check keyboard/focus/reduced-motion behavior.
> 5. Check performance impact.
> 6. Update documentation only when the behavior actually changes.
>
> Never:
> - replace the visual language with generic SaaS UI;
> - add unnecessary animations;
> - hide important meaning behind hover-only interactions;
> - describe Hype Index as truth, quality, or importance;
> - break existing deep links;
> - ignore empty/error/stale states;
> - increase bundle size without a clear product reason.
>
> When uncertain, prefer the simpler editorial solution.

---

# 24. Final Release Checklist

## Product

- [ ] Hype Index visible in first viewport
- [ ] Hype Index clearly labeled as headline intensity
- [ ] Today's edition reachable immediately
- [ ] Edition controls simplified
- [ ] Story hierarchy is clear

## Technical

- [ ] Node version standardized
- [ ] CI/deploy use same Node version
- [ ] Production build passes
- [ ] No critical console errors
- [ ] Bundle budget passes

## Performance

- [ ] Core content renders before effects
- [ ] LCP target met
- [ ] CLS target met
- [ ] INP target met
- [ ] Decorative effects deferred where possible

## Accessibility

- [ ] Keyboard navigation verified
- [ ] Focus behavior verified
- [ ] Reduced motion verified
- [ ] Contrast verified
- [ ] Screen-reader labels verified
- [ ] Charts/data have text equivalents

## Trust

- [ ] Freshness status visible
- [ ] Methodology reachable
- [ ] Original source links work
- [ ] Stale/error states are honest
- [ ] No misleading score language

## SEO

- [ ] Canonical domain correct
- [ ] Sitemap correct
- [ ] Robots policy correct
- [ ] Open Graph correct
- [ ] JSON-LD correct

## Operations

- [ ] Feed failure handling verified
- [ ] Logging/alerts working
- [ ] QA timestamp automated
- [ ] Production smoke test complete

---

# 25. Success Metrics

The redesign should be evaluated with measurable outcomes.

## User understanding

Target:
- higher click-through from landing to edition
- lower bounce rate
- faster time-to-first-story

## Engagement

Track:
- stories opened per session
- original-source clicks
- saved stories
- methodology opens
- Hype Index interaction

## Performance

Track:
- LCP
- INP
- CLS
- JS transfer size
- error rate

## Reliability

Track:
- feed freshness
- ingestion success rate
- story availability
- client error rate

## Product quality

A successful release should make the product feel:

> **quieter, clearer, faster, and more trustworthy — without becoming less distinctive.**

---

# 26. End State

The ideal Baseline product should feel like this:

A visitor lands on the homepage and immediately understands:

**Baseline monitors how loud AI news headlines are.**

They see today's Hype Index.

They can immediately enter today's edition.

They encounter fewer controls and less promotional explanation.

The headlines arrive quickly.

The score is explainable.

The methodology is accessible.

The source is transparent.

The interface remains editorial and distinctive.

The infrastructure is fast, observable, and reliable.

The result should feel less like a feature-rich prototype and more like a **finished independent publication with a genuinely differentiated measurement system**.
