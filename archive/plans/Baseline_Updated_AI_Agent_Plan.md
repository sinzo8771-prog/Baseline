# Baseline — Updated AI Coding Agent Plan
## Final Polish, Visual Refinement, Product Cohesion & Data Trust

---

# 0. Mission

Improve the **existing Baseline product** without redesigning it from scratch.

The repository already has a strong editorial identity, substantial product functionality, responsive layouts, live RSS aggregation, Hype Index, source analysis, story pages, saved stories, Week in Review, command palette, keyboard navigation, print mode, offline recovery, SEO, and testing.

The goal of this pass is:

> **Make the existing Baseline feel exceptionally cohesive, intentional, trustworthy, and memorable.**

Do **not** turn it into a generic startup landing page, SaaS dashboard, AI-news clone, or animation showcase.

The visual direction from the current screenshots is already strong and should be preserved.

---

# 1. Current Product Direction

Baseline is not merely an AI-news aggregator.

Baseline is:

> **A measurement interface for the AI news cycle.**

The product helps users understand:

- what is being reported
- how intensely it is being reported
- why a headline receives its intensity score
- how sources differ
- whether the overall coverage is getting louder or quieter

The central loop is:

**Edition → Story → Hype → Why → Sources**

Everything else should support this loop.

---

# 2. Critical Design Principle

## DO NOT REDESIGN THE VISUAL IDENTITY

The current screenshots establish a strong visual language:

- oversized Baseline masthead
- editorial serif typography
- restrained sans-serif metadata
- thin horizontal rules
- dark/paper-like visual environment
- compact metadata
- disciplined spacing
- editorial grids
- understated controls
- restrained motion
- serious publication tone

Preserve this.

The problem is **not** that the site looks too plain.

The problem is that the system is now polished enough that improvements should be **micro-refinements**, not wholesale stylistic changes.

---

# 3. Absolute Anti-AI-Slop Rules

Never introduce:

- purple/blue startup gradients
- glassmorphism
- excessive rounded cards
- floating blobs
- generic 3D objects
- fake AI imagery
- decorative particles
- giant gradient text
- generic "future of AI" copy
- oversized animated marketing sections
- excessive shadows
- meaningless charts
- random neon accents
- generic dashboard widgets
- visual trends copied from other AI products

Do not use visual effects merely because they are technically possible.

Every visual element must have a reason.

Prefer:

- typography
- hierarchy
- editorial rules
- whitespace
- asymmetry
- subtle texture
- small meaningful motion
- real data
- source attribution
- content-driven visual changes

---

# 4. Current Screenshots Are Visual Regression References

The repository contains current screenshots such as:

- `screenshots/home.jpg`
- `screenshots/hype-index.jpg`
- `screenshots/story.jpg`
- `screenshots/sources.jpg`
- `screenshots/methodology.jpg`

Treat these images as the **visual baseline**.

Before major visual changes:

1. Compare against the screenshots.
2. Determine whether the change improves the product rather than simply changing it.
3. Do not remove established visual details without a clear reason.

After changes:

- regenerate/update screenshots where appropriate
- compare old vs new visually
- verify no accidental loss of hierarchy or identity

---

# 5. Primary Goals

## P0 — Highest Priority

1. Preserve the current editorial identity.
2. Improve information hierarchy without redesigning the system.
3. Make **Headline → Hype → Why** more visually connected.
4. Make the Hype Index feel more proprietary.
5. Give different pages slightly more personality while keeping one unified design system.
6. Simplify navigation hierarchy without hiding functionality.
7. Validate data integrity and Hype scoring behavior.
8. Preserve excellent accessibility/performance/resilience.

## P1

1. Refine story-page hierarchy.
2. Refine Sources trend visibility.
3. Improve mobile navigation and spacing.
4. Improve subtle interaction/motion.
5. Strengthen SEO and structured metadata.
6. Improve loading/offline/error states.

## P2

Only after P0/P1 are complete:

- advanced historical visualizations
- additional sharing functionality
- small editorial utilities
- further performance optimization based on measurement

Do not add large new product areas during this pass.

---

# 6. Product Hierarchy

## Primary product navigation

Make these the most prominent destinations:

**Edition · Hype · Sources**

## Secondary destinations

Keep available but visually secondary:

**Saved · Week in Review · Methodology · About**

## Utility

Keep separate from editorial navigation:

**Search · Command Palette · Theme · Keyboard Help**

Do not remove existing functionality.

The objective is hierarchy, not feature deletion.

---

# 7. Homepage / Landing Page

## Goal

A first-time visitor should understand Baseline immediately.

Within a few seconds, the visitor should understand:

> This is AI news, but Baseline measures how loudly the news is being reported.

## Preferred structure

### 1. Masthead

Keep the existing identity.

Keep the statement:

> A quiet interface for a very loud industry.

Do not add generic marketing copy.

### 2. Today's Baseline / Hype Snapshot

Bring the actual product closer to the first viewport.

Prioritize:

- current edition
- current Hype reading
- concise interpretation
- real data

Do not make the visitor scroll through a marketing explanation before seeing the product.

### 3. Real Headlines

Show representative stories early.

Each should expose:

- headline
- source
- time
- Hype/intensity
- useful signal information

### 4. Why Baseline

Keep this concise.

Explain the problem rather than selling the company.

### 5. Entry

Lead directly into:

- Edition
- Hype Index

## Important

Do not radically restructure the entire landing page unless usability testing or real evidence justifies it.

The current editorial composition is already good.

---

# 8. Make “Headline → Hype → Why” More Connected

This is the single biggest visual refinement.

Currently the individual pieces are strong:

- headline
- intensity value
- WHY THIS SCORE
- source information

The goal is to make them feel like one conceptual unit.

## Desired interaction

User sees:

```text
HEADLINE

64/100
Elevated

WHY THIS SCORE
- certainty language
- repeated framing
- coverage concentration
```

The relationship should be obvious without explaining it in a tutorial.

## Design rules

- Keep the score visually close to the headline.
- Use consistent intensity language.
- Keep the score explanation visually connected.
- Do not make the score enormous unless the surrounding hierarchy supports it.
- Do not use a generic analytics card.

---

# 9. Story Page

The story page is one of the strongest current screens.

Do not redesign it.

Refine it.

## Priority hierarchy

1. Headline
2. Source/date
3. Intensity score
4. Why this score
5. Related/source context
6. Original article

## “WHY THIS SCORE”

Keep it highly visible.

It should explain actual scoring factors.

Do not generate fictional explanations.

Every explanation must map back to real detector signals.

---

# 10. Hype Index

## Goal

Turn the Hype Index into the unmistakable signature feature of Baseline.

The current Hype Index already has strong pieces such as:

- current reading
- distribution
- “WHY TODAY?”
- biggest shift
- 7-day trend

Do not add lots of additional charts.

## Main improvement

Make the visualization feel **owned by Baseline**.

Think:

> editorial measuring instrument

not:

> analytics dashboard

## Recommended visual direction

Explore a concept based on:

- pressure
- ink density
- headline intensity
- editorial signal accumulation
- restrained typographic measurement

The visualization should feel like it belongs to a publication.

Avoid:

- radial gauges
- 3D graphs
- giant circular dashboards
- floating chart cards
- excessive animation

## Important

The chart must remain understandable even without animation.

---

# 11. “WHY TODAY?” Section

This section should become one of the Hype Index’s most useful features.

Make it answer:

> Why is today's reading where it is?

Use real signals such as:

- unusually aggressive language
- concentration around major stories
- repeated framing
- source distribution
- change from baseline

Do not just repeat the score.

The user should learn something.

---

# 12. Hype Semantics / Trust

This is non-negotiable.

Baseline must never imply:

**high hype = false**

or

**low hype = true**

The product measures **headline intensity**, not factual accuracy.

Use a consistent statement such as:

> **Hype measures loudness, not truth.**

Use this language consistently in:

- Hype Index
- story page
- methodology
- score tooltips
- first-use explanations

Keep it subtle, not as a giant warning banner.

---

# 13. Data Integrity Audit

This is now one of the highest-value tasks.

Do a systematic audit of the scoring/data pipeline.

Inspect:

- feed normalization
- deduplication
- scoring
- source weighting
- daily aggregation
- historical calculations
- trend calculations
- unavailable states
- cache fallback
- source attribution

## Test specifically for

### Syndication

Multiple publications may publish essentially identical stories.

Do not count those as completely independent signals unless intended.

### Near-duplicates

Test:

- headline rewrites
- punctuation changes
- source-specific formatting
- quote changes

### Source domination

Test whether a single publisher can disproportionately determine the day's result.

### Small samples

Define behavior when too few usable stories exist.

Do not present a highly precise score when the data is insufficient.

### Extreme language

Test headlines with:

- certainty
- urgency
- superlatives
- fear
- exaggerated predictions
- marketing language

### Score stability

Small editorial changes should not cause unexplained dramatic score jumps.

### Missing data

Never interpret missing as zero.

Never create fake fallback measurements.

---

# 14. Source Page

The current source page has a strong identity, especially the “Who’s Shouting?” framing.

Keep the structure.

## Improve

The Trend column should be easier to notice.

Keep it:

- small
- restrained
- readable
- meaningful

Possible representation:

```text
↑ 12
↓ 8
— 0
```

Use real values only.

Do not turn the page into a stock-market dashboard.

---

# 15. Methodology

The current Methodology page is one of the strongest parts of the product.

Do not redesign it.

Preserve the honesty around limitations.

Especially preserve the principle:

> The detector is heuristic — it reads words, not meaning.

Possible refinement:

- improve scanning
- improve heading rhythm
- add small examples where useful
- maintain honest limitations
- avoid marketing language

This page should increase trust.

---

# 16. Page Personality

The design system is intentionally consistent, which is a strength.

However, the pages can become too template-like.

Do **not** create different visual themes.

Instead give each major page a small personality shift through information:

### Edition

Feel:

**newspaper / current issue**

### Hype Index

Feel:

**instrument / measurement**

### Sources

Feel:

**newsroom / attribution**

### Story

Feel:

**investigation / explanation**

### Methodology

Feel:

**lab notebook / transparency**

Keep:

- typography family
- colors
- rules
- spacing principles
- core controls

Only vary composition and content emphasis.

---

# 17. Navigation

## Desktop

Recommended primary hierarchy:

```text
EDITION   HYPE   SOURCES
```

Secondary:

```text
SAVED   REVIEW   METHODOLOGY   ABOUT
```

Utilities:

```text
SEARCH   CMD/CTRL+K   THEME
```

## Mobile

Prioritize the core loop.

Avoid trying to display every destination equally.

Ensure:

- no cramped labels
- no clipped navigation
- no horizontal overflow
- active state is obvious
- touch targets are comfortable

Test:

- 320px
- 360px
- 390px
- 430px

---

# 18. Command Palette

Keep the command palette.

It is useful for power users.

Use it for:

- navigation
- searching stories
- jumping to sections
- accessing secondary destinations
- keyboard-driven interaction

But never use it as an excuse to hide important functionality from normal users.

Core navigation must remain visible.

---

# 19. Keyboard Experience

This is a genuine Baseline differentiator.

Keep and polish:

- `j/k`
- `/`
- `Enter`
- `Escape`
- `?`
- `Cmd/Ctrl+K`

Document shortcuts clearly.

Make sure keyboard focus is visible.

Ensure shortcuts do not interfere with:

- text inputs
- browser behavior
- assistive technology
- mobile devices

---

# 20. Print Mode

Keep print mode.

It fits the Baseline brand unusually well.

The print layout should preserve:

- edition hierarchy
- headline typography
- source information
- Hype values
- editorial rules

Avoid bringing:

- animated effects
- canvas effects
- unnecessary controls
- web-only UI

into print output.

Test actual browser print preview.

---

# 21. Motion

The existing motion system is good but should remain restrained.

## Keep

- reveal transitions
- useful score transitions
- subtle hover states
- meaningful scroll behavior

## Reduce

- repeated decorative effects
- effects on every section
- animation that competes with headlines
- animation used solely to impress

## Core rule

The interface should be quieter than the subject matter.

The user should feel:

> “This feels different.”

not:

> “This website has lots of animation.”

---

# 22. Accessibility

Audit all major routes.

## Keyboard

- all controls reachable
- visible focus
- logical tab order

## Screen readers

- correct heading hierarchy
- meaningful link labels
- descriptive buttons
- semantic regions

## Contrast

Check:

- metadata
- muted text
- score labels
- trend indicators
- borders
- small labels

Do not make text visually subtle at the expense of readability.

## Reduced motion

Respect:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

- remove decorative animation
- keep content available
- do not depend on motion to communicate meaning

---

# 23. Responsive Design

Do not simply stack desktop layouts.

Treat mobile as an intentional composition.

Audit:

- homepage
- edition
- story
- Hype Index
- sources
- methodology
- saved
- review
- navigation
- command palette

Test at:

```text
320
360
390
430
768
1024
1280
1440
1728
```

Check:

- headline wrapping
- whitespace
- score positioning
- rule alignment
- source tables
- buttons
- text length
- charts
- navigation
- horizontal overflow

---

# 24. Loading / Error / Offline

Preserve the current resilient architecture.

Every data-driven area should support:

### Loading

Minimal and editorial.

### Empty

Explain why no data exists.

### Error

State what failed.

### Offline

If cached content exists:

```text
LIVE FEED UNAVAILABLE

Showing the most recent saved edition.
```

Only show that when cached content actually exists.

Never pretend live data is available when it is not.

---

# 25. SEO

Continue improving route-level SEO.

For story pages:

- unique title
- unique description
- canonical URL
- Open Graph data
- appropriate structured data where justified
- meaningful share metadata

Important article content should be discoverable as reliably as possible.

Do not add misleading structured data.

---

# 26. Performance

Preserve existing architecture unless profiling proves otherwise.

Protect:

- route-level code splitting
- caching
- feed relay
- lazy loading
- efficient rendering
- error recovery

Before adding dependencies, ask:

1. Can the existing code solve this?
2. What is the bundle cost?
3. Does it improve the user experience enough to justify it?

Do not add libraries for tiny utilities.

---

# 27. Component Architecture

Before creating components:

1. Search for an existing equivalent.
2. Reuse existing primitives.
3. Keep visual tokens centralized.
4. Avoid duplicate patterns.

Suggested conceptual grouping:

```text
layout/
navigation/
editorial/
hype/
story/
source/
feedback/
```

Do not over-abstract.

Create abstractions around real behavior, not around superficial similarity.

---

# 28. Content / Voice

Baseline copy must remain:

- factual
- concise
- editorial
- slightly dry/confident
- intelligent
- human

Avoid:

- startup jargon
- marketing exaggeration
- fake urgency
- generic AI vocabulary

Avoid phrases such as:

- “Unlock the future”
- “The future of news”
- “Revolutionary”
- “Next-generation”
- “Powered by cutting-edge AI”
- “Stay ahead of the curve”

The product should feel confident enough not to sell itself aggressively.

---

# 29. Visual QA Workflow

After every major visual change:

## Step 1

Run:

```bash
npm run build
npm test
```

## Step 2

Open the relevant routes.

## Step 3

Compare with repository screenshots.

## Step 4

Inspect at desktop and mobile sizes.

## Step 5

Check for:

- spacing regressions
- broken typography
- inconsistent borders
- score hierarchy changes
- navigation overflow
- animation problems
- contrast problems

## Step 6

Only keep the change if it improves the experience.

---

# 30. Testing

Run existing tests.

Add targeted tests where necessary.

## Hype tests

- valid signals
- missing signals
- score boundaries
- low sample sizes
- extreme inputs
- stable calculations

## Feed tests

- valid feed
- empty feed
- malformed feed
- duplicate feed
- unavailable feed
- cache fallback

## UI tests

- navigation
- story
- Hype explanations
- loading
- error
- offline
- reduced motion

## Regression

Verify every major route after changes.

---

# 31. Recommended Implementation Sequence

Do not execute this as a giant rewrite.

## Phase 1 — Audit

- inspect current repository
- inspect current screenshots
- run tests/build
- map product/data flow
- document current visual tokens

## Phase 2 — Hierarchy

- refine homepage
- refine navigation
- strengthen headline → Hype relationship
- refine story hierarchy

## Phase 3 — Hype Identity

- improve Hype Index visual language
- improve “WHY TODAY?”
- improve trend readability
- keep interpretation honest

## Phase 4 — Page Personality

- edition = issue
- Hype = instrument
- sources = newsroom
- story = investigation
- methodology = transparency

## Phase 5 — Data Trust

- audit scoring
- audit deduplication
- audit source weighting
- audit small sample behavior
- audit trend calculations

## Phase 6 — Responsive + Accessibility

- desktop
- tablet
- mobile
- keyboard
- reduced motion
- screen reader structure
- contrast

## Phase 7 — SEO + Performance

- metadata
- structured data
- route behavior
- performance profiling

## Phase 8 — Final Regression

- tests
- build
- visual comparison
- route verification
- no-console-error check

---

# 32. Definition of Done

## Product

- [ ] Baseline's core concept is understandable immediately.
- [ ] Edition is clearly the main reading experience.
- [ ] Hype is clearly a measurement layer.
- [ ] Story pages connect headline → Hype → Why → Sources.
- [ ] Secondary features do not overwhelm the core loop.

## Visual

- [ ] Existing editorial identity preserved.
- [ ] No AI-slop aesthetics introduced.
- [ ] Typography remains strong.
- [ ] Editorial rules remain coherent.
- [ ] Pages have subtle personality differences.
- [ ] Hype Index feels more proprietary.
- [ ] No decorative element exists without purpose.

## Hype

- [ ] Score is understandable.
- [ ] Signal explanations are grounded in actual inputs.
- [ ] “Hype measures loudness, not truth” remains clear.
- [ ] Historical data is honest.
- [ ] Small datasets are handled appropriately.
- [ ] Duplicate/syndicated stories are handled appropriately.

## Navigation

- [ ] Edition / Hype / Sources are primary.
- [ ] Secondary features remain discoverable.
- [ ] Mobile navigation is clean.
- [ ] Command palette remains useful.

## Story

- [ ] Headline is dominant.
- [ ] Score is easy to find.
- [ ] WHY THIS SCORE is meaningful.
- [ ] Original article is obvious.
- [ ] Source context is useful.

## Sources

- [ ] Trend information is readable.
- [ ] Source identity remains strong.
- [ ] No unnecessary dashboard styling.

## Methodology

- [ ] Current transparency preserved.
- [ ] Limitations remain honest.
- [ ] No marketing language added.

## Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus is visible.
- [ ] Reduced motion works.
- [ ] Contrast is acceptable.
- [ ] Semantic structure is correct.

## Responsive

- [ ] 320px checked.
- [ ] 360px checked.
- [ ] 390px checked.
- [ ] 430px checked.
- [ ] 768px checked.
- [ ] 1024px checked.
- [ ] 1280px checked.
- [ ] 1440px checked.
- [ ] 1728px checked.
- [ ] No horizontal overflow.

## Engineering

- [ ] Build passes.
- [ ] Tests pass.
- [ ] No new console errors.
- [ ] No unnecessary dependencies.
- [ ] No fabricated data.
- [ ] Existing reliability/caching behavior preserved.

---

# 33. Final Agent Instruction

Do not approach this as:

> “Build a new version of Baseline.”

Approach it as:

> **“Polish an already strong product until every part feels deliberate.”**

Do not chase novelty for its own sake.

Do not replace the editorial identity.

Do not add a giant new feature.

Do not make the interface louder.

Make it:

- sharper
- calmer
- more coherent
- more legible
- more trustworthy
- more product-specific

The final feeling should be:

> **A serious independent publication built around a very unusual measuring instrument.**

The user should remember two things after one visit:

**the headlines were unusually easy to read, and Baseline showed how loudly the industry was talking about them.**

That is the product.
