# The Baseline — Master Implementation Plan for AI Coding Agent

> **Project:** The Baseline
> **Repository:** `https://github.com/sinzo8771-prog/Baseline.git`
> **Production:** `https://the-baseline.baseline-news.workers.dev/`
> **Goal:** Take the current project from a strong, differentiated prototype/product to a polished, production-grade editorial experience without changing its core identity or rewriting the architecture unnecessarily.

---

## 0. Agent Mission

You are the lead product engineer, UX designer, visual designer, performance engineer, accessibility reviewer, and QA owner for **The Baseline**.

Your job is **not** to add lots of new features.

Your job is to:

1. Preserve the existing product concept and architecture.
2. Make the experience feel like a real editorial product rather than a startup demo.
3. Make the Hype Index the signature interaction of the product.
4. Improve visual hierarchy, copy clarity, responsiveness, performance, accessibility, and trust.
5. Remove anything generic, redundant, decorative, or obviously AI-generated.
6. Verify the result with real build, test, browser, mobile, accessibility, and performance checks.

### Core product promise

> **AI news, hype removed.**

The Baseline should help users answer:

- What is happening in AI?
- Which headlines are unusually intense?
- What language is driving that intensity?
- How does the current news cycle compare with previous readings?
- Where did the story come from?

### Critical product principle

The Hype score is a **headline-intensity signal**, not a truth score, credibility score, quality score, or factuality detector.

Never imply:

- high hype = false
- low hype = true
- high hype = bad journalism
- low hype = good journalism

Always preserve that distinction in UI, copy, methodology, and metadata.

---

# 1. Non-Negotiable Design Direction

## Brand personality

The Baseline should feel:

- editorial
- intelligent
- calm
- skeptical without being cynical
- observant
- precise
- slightly provocative
- human
- restrained

It should **not** feel:

- like an AI SaaS dashboard
- like a generic startup landing page
- like a crypto website
- like a glassmorphism template
- like an auto-generated Tailwind demo
- like a social media app
- like a futuristic sci-fi interface

## Existing visual language to preserve

Keep the established direction unless there is a strong evidence-based reason to change it:

- paper/ink/vermillion editorial palette
- Fraunces + Inter typography pairing
- print-inspired rules and dividers
- strong typography
- generous whitespace
- restrained motion
- editorial rhythm
- minimal ornament
- no gradient-heavy decoration
- no floating blobs
- no gratuitous glow effects
- no “AI sparkle” visuals

## Anti-AI-slop rule

Before adding any visual or component, ask:

> “Could this exact component appear on 500 other AI websites?”

If the answer is yes, redesign it.

Do not add:

- generic hero mockups
- fake dashboard screenshots
- meaningless animated counters
- fake testimonials
- fake logos
- excessive glass cards
- gradient text for decoration
- floating 3D objects with no product meaning
- excessive rounded cards
- giant meaningless CTAs
- decorative AI particles
- unnecessary badges
- fake social proof
- invented statistics
- fake user quotes
- fake awards

---

# 2. Current Product Architecture — Preserve It

Do **not** rewrite the application architecture from scratch.

The current project already has a strong foundation:

- React + Vite
- Tailwind CSS
- Cloudflare Worker feed relay
- RSS feed aggregation
- browser-side parsing/scoring
- caching/local persistence
- route-based pages
- tests
- error boundaries
- accessibility work
- PWA/offline support
- SEO metadata
- security controls

Improve the current system incrementally.

Avoid introducing a database or backend complexity unless there is a proven product requirement.

---

# 3. Target Information Architecture

Preserve the existing route model and make each route clearly purposeful.

```text
/                   Landing / editorial introduction
/edition            Live reading experience
/hype-index         Hype analytics and historical signal
/sources            Source comparison
/story/:id          Individual story
/methodology        How scoring works
/about              Editorial philosophy
```

## Route responsibilities

### `/`
The homepage answers:

> “What is The Baseline, and why should I care?”

It should feel like an editorial front page that explains the product through the product itself.

### `/edition`
The real news-reading environment.

It should prioritize:

- headlines
- source
- time
- hype intensity
- filtering/sorting
- reading

No unnecessary marketing content.

### `/hype-index`
The signature analytics experience.

Make it feel like a publication indicator or market index, not a generic analytics dashboard.

### `/sources`
Help users compare publishing patterns without turning the page into a simplistic “best source” ranking.

### `/story/:id`
Provide:

- original headline
- source
- date/time
- Hype signal
- explanation
- original link
- related stories when available
- relevant source/trend context

### `/methodology`
Build trust.

Explain exactly what is measured, what is not measured, and how limitations work.

### `/about`
State the product philosophy clearly and simply.

---

# 4. Phase 1 — Discovery and Baseline Audit

Before modifying code, inspect the current repository.

## Required actions

1. Read the README and all active architecture/config files.
2. Identify all routes.
3. Identify all shared components.
4. Identify the feed pipeline.
5. Identify the scoring implementation.
6. Identify caching/persistence behavior.
7. Identify Cloudflare Worker behavior.
8. Identify test suites.
9. Identify dead or duplicated components.
10. Identify screenshot/demo assets.
11. Inspect package dependencies.
12. Measure the current production build.
13. Record baseline bundle sizes.
14. Run all existing tests.
15. Verify the current deployment.

## Produce a private baseline report

Capture:

```text
build status
unit test status
component test status
bundle size
largest JS chunks
largest dependencies
route list
console errors
network errors
known accessibility issues
known responsive issues
known dead code
```

Do not begin large UI changes before this baseline exists.

---

# 5. Phase 2 — Landing Page Redesign

## Primary objective

Transform the homepage from a page that **explains a product** into a page that **demonstrates the product**.

The user should understand the product within approximately five seconds.

## Recommended visual narrative

### Section 1 — Masthead

Use a confident editorial opening.

Example direction:

```text
THE BASELINE
AI NEWS, HYPE REMOVED.

A quieter way to read a very loud industry.
```

Do not over-write the hero copy.

### Section 2 — Live signal

Immediately reveal live data.

Example:

```text
TODAY'S SIGNAL
43 stories · 31% high intensity
```

Then show real current headlines.

### Section 3 — Editorial story preview

Show 3–5 real stories.

Each should communicate:

- source
- headline
- timestamp
- Hype signal
- optional compact explanation

Avoid cards that look like generic SaaS feature tiles.

### Section 4 — Why this exists

Explain the problem in editorial language:

- AI news is noisy.
- Headlines compete for attention.
- Intensity is not the same thing as importance.
- The Baseline measures the language around the story.

### Section 5 — How Hype works

Show one or two real headline examples and explain the scoring concept visually.

Avoid huge walls of text.

### Section 6 — The signal loop

Show the relationship:

```text
HEADLINE
   ↓
LANGUAGE
   ↓
INTENSITY
   ↓
CONTEXT
   ↓
ORIGINAL STORY
```

This should feel like an editorial diagram, not a generic process graphic.

### Section 7 — Hype Index preview

Show the live index itself.

This is the key conversion moment.

### Section 8 — Sources

Show the range of tracked sources without making credibility claims.

### Section 9 — Final CTA

The CTA should be direct:

> Read today's edition.

Do not use generic copy such as “Join the future of AI news.”

---

# 6. Phase 3 — Make the Hype Index the Signature Feature

## Goal

The Hype Index should be recognizable as **The Baseline's defining product mechanic**.

## Primary visual structure

```text
THE HYPE INDEX

67
TODAY'S HEADLINE INTENSITY

LOW ───────────── HIGH
              ▲

+12 vs yesterday

TOP SIGNAL
“revolutionary” · 14 occurrences
```

This is a visual direction, not fixed copy.

Use actual data.

Never hard-code fake numbers.

## Include

- current index
- distribution
- trend vs previous period when enough data exists
- clear sample size
- high/medium/low ranges
- top contributing signal(s)
- methodology explanation
- unavailable/insufficient-data states

## Historical mode

When historical data exists, provide a restrained trend visualization.

Do not over-style the graph.

The chart should prioritize:

- readable labels
- useful comparison
- contextual explanation

## Critical language

The UI should visibly reinforce:

> Hype measures headline intensity, not truth.

---

# 7. Phase 4 — Improve the Edition Reader

## `/edition` should feel like a publication

Prioritize reading over UI furniture.

### Each story should expose

```text
source
headline
published time
hype level
why / explanation
original story
```

## Suggested hierarchy

```text
SOURCE · TIME
HEADLINE
HYPE SIGNAL
SHORT EXPLANATION
ORIGINAL SOURCE →
```

## Interaction rules

- filters should be obvious
- sorting should be predictable
- saved/read states should be clear
- loading should not block initial visible content
- partial feed results should appear progressively
- errors should be recoverable
- empty states should be informative

## Avoid

- excessive card nesting
- huge icon buttons
- decorative separators everywhere
- filters hidden behind unnecessary controls
- dense dashboard-like layouts

---

# 8. Phase 5 — Source Comparison Upgrade

Improve `/sources` from a source list into a useful editorial analysis tool.

## Target model

```text
SOURCE        STORIES     AVG INTENSITY     HOT STORIES     TREND
Source A      42          34                12             ↑
Source B      38          29                8              ↓
Source C      51          41                19             →
```

Use real data only.

## Source detail view

When a source is selected, show:

- current story count
- average intensity
- distribution
- trend if enough history exists
- recent stories

Never phrase this as:

> “Source A is more trustworthy.”

Phrase it as:

> “Source A's headlines have been more intense during this period.”

---

# 9. Phase 6 — Story Page Upgrade

## `/story/:id`

Make the story page feel like a concise editorial analysis page.

## Structure

```text
SOURCE
HEADLINE
DATE / TIME

HYPE SIGNAL
[LEVEL]

WHY THIS SCORES THIS WAY
[short explanation]

CONTEXT
[related / comparative information where available]

READ ORIGINAL STORY →
```

## Trust requirements

Never fabricate:

- article details
- quotes
- summaries
- historical comparisons
- source information

If content is unavailable, state that clearly.

---

# 10. Phase 7 — Methodology and Trust UX

The methodology page should be unusually transparent.

## Explain

1. What inputs are used.
2. How headline intensity is estimated.
3. Which language patterns influence scoring.
4. What the score means.
5. What the score does not mean.
6. What happens when data is incomplete.
7. How source identity is preserved.
8. Why the original headline remains unchanged.

## Add examples

Use real or explicitly synthetic examples and label synthetic examples clearly.

Example explanation structure:

```text
HEADLINE
↓
TRIGGER TERMS / PATTERNS
↓
INTENSITY CONTRIBUTION
↓
FINAL SIGNAL
```

Keep methodology understandable to a normal reader.

---

# 11. Phase 8 — Motion and Interaction Design

Motion should reinforce hierarchy, not prove that the site can animate.

## Good motion

- headline reveal
- subtle section entry
- smooth score transition
- restrained chart movement
- progressive content loading
- modal open/close
- hover/focus transitions

## Bad motion

- continuous floating objects
- parallax everywhere
- large camera movement
- exaggerated spring animations
- decorative number spinning
- animations that delay reading

## Rules

- respect `prefers-reduced-motion`
- avoid layout shifts caused by animation
- never animate important content faster than it can be read
- no animation should be required to understand meaning

---

# 12. Phase 9 — Responsive Design

Test at minimum:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px+
```

## Mobile priorities

At narrow widths:

- headline readability comes first
- nav must remain usable
- controls must not collide
- Hype information must remain understandable
- source names must wrap safely
- tables may switch to stacked rows if needed
- charts must remain legible
- no horizontal scrolling unless intentionally designed

## Check every page

- `/`
- `/edition`
- `/hype-index`
- `/sources`
- `/story/:id`
- `/methodology`
- `/about`

---

# 13. Phase 10 — Performance Optimization

## Baseline

Measure before optimizing.

Track:

- initial JS
- gzip/brotli size
- largest chunk
- route chunk sizes
- CSS size
- image size
- DOM size
- scripting time
- rendering time
- feed parsing time

## Current priority

The existing project has a relatively large main frontend bundle for a mostly text-driven product.

Investigate:

- Framer Motion imports
- icon package imports
- unused libraries
- duplicate dependencies
- oversized shared utilities
- unnecessary eager imports
- route-level code splitting
- expensive parsing logic
- unnecessary rerenders

## Do not optimize blindly

Do not sacrifice usability just to reduce bundle size.

Every performance change must be measured.

---

# 14. Phase 11 — Feed Pipeline and Runtime Efficiency

Preserve the current architecture unless measurement proves it needs to change.

## Current model

```text
Browser
  ↓
Cloudflare Worker relay
  ↓
RSS sources
  ↓
XML parsing
  ↓
Normalization
  ↓
Deduplication
  ↓
Hype scoring
  ↓
Ranking/filtering
  ↓
UI
```

## Requirements

- preserve allowlisted feeds
- preserve same-origin CORS behavior
- preserve upstream timeout
- preserve response size cap
- preserve rate limiting
- preserve validation
- avoid unnecessary network requests
- progressively render partial results
- cache safely
- handle malformed feeds gracefully

## Mobile consideration

Browser-side processing must be monitored on low-powered devices.

Measure:

- parse time
- score calculation time
- number of stories processed
- rerender count

Do not move logic server-side without evidence that the current architecture is the bottleneck.

---

# 15. Phase 12 — Accessibility

## Requirements

Support:

- keyboard-only navigation
- visible focus
- semantic headings
- landmark structure
- accessible controls
- usable dialogs
- screen-reader labels
- reduced motion
- sufficient contrast
- non-color indicators

## Critical Hype UI rule

Never communicate Hype only through color.

Use combinations such as:

```text
HIGH
MEDIUM
LOW
```

or a textual label plus visual indicator.

## Required validation

Run automated accessibility checks where possible.

Then manually test:

- keyboard navigation
- focus order
- modal focus trap
- escape handling
- screen reader output
- form/control labels
- heading structure

Target:

> WCAG AA-level practical accessibility.

---

# 16. Phase 13 — Security Hardening

Preserve and verify existing security controls.

## Required controls

- allowlisted feed origins
- same-origin CORS policy
- rate limiting
- upstream timeout
- feed body size cap
- safe response headers
- input validation
- local storage shape validation
- safe URL handling

## Finish remaining hardening

Prioritize:

1. CSP hardening.
2. Feed-image URL sanitization.
3. Remove dead or obsolete code.
4. Review third-party script exposure.
5. Review external navigation handling.

## Never

- render untrusted HTML directly
- trust RSS content blindly
- construct unsanitized DOM HTML
- allow arbitrary upstream feed URLs if an allowlist is intended

---

# 17. Phase 14 — SEO and Social Sharing

Review every route for:

- unique title
- unique description
- canonical URL where appropriate
- Open Graph metadata
- Twitter/X metadata where relevant
- sensible heading structure
- crawlable content
- robots behavior
- sitemap behavior if configured

## Social preview

Create a coherent editorial preview image strategy.

Do not use generic AI-generated social graphics.

Prefer typography-led, brand-consistent previews.

---

# 18. Phase 15 — PWA and Offline Experience

Preserve current PWA support and ensure it behaves intentionally.

## Requirements

- app shell should load reliably
- offline state must be obvious
- stale cached edition should be identified as cached/stale
- saved stories should remain readable where supported
- revalidation should be graceful

Do not pretend live data is available offline.

Use explicit language such as:

> Showing cached edition from 9:14 PM.

---

# 19. Phase 16 — Error and Empty States

Every failure state should be useful.

## Feed failure

Instead of:

> Something went wrong.

Use:

> Some sources are temporarily unavailable. The edition is showing the feeds that responded.

Then provide retry/reload behavior.

## No stories

Explain why.

Possible reasons:

- source feeds unavailable
- filters too restrictive
- current edition has no matching stories

## Missing history

Say:

> Not enough readings yet to calculate a trend.

Do not fabricate a trend.

---

# 20. Phase 17 — Copy and Editorial Voice

## Voice

Use:

- short sentences
- concrete nouns
- editorial confidence
- restrained wit
- direct explanations

Avoid:

- “revolutionary”
- “next-generation”
- “unlock”
- “supercharge”
- “transform your workflow”
- “the future of”
- “AI-powered platform”
- empty product jargon

## Copy test

Every section should answer at least one of:

- What is this?
- Why does it exist?
- What am I seeing?
- How does it work?
- Why should I trust it?
- What should I do next?

If a sentence answers none of these, remove it.

---

# 21. Phase 18 — Repository Cleanup

Consolidate outdated planning and audit documents.

Aim for a clean top-level documentation set such as:

```text
README.md
ARCHITECTURE.md
SECURITY.md
QA.md
ROADMAP.md
```

Move historical audit documents into an archive directory if they still need to be preserved.

Remove:

- dead components
- unused imports
- duplicate utilities
- unused assets
- obsolete screenshots
- abandoned experiments

Do not delete anything until references/imports are verified.

---

# 22. Testing Strategy

## Unit tests

Test:

- hype scoring
- normalization
- deduplication
- feed parsing
- history calculations
- ranking
- safe data parsing
- utility functions

## Component tests

Test:

- story cards/rows
- Hype indicators
- charts
- filters
- dialogs
- source sections
- empty states
- error states

## Route tests

Check:

- `/`
- `/edition`
- `/hype-index`
- `/sources`
- `/story/:id`
- `/methodology`
- `/about`

## Regression tests

After UI changes, verify:

- feed loading
- scoring
- sorting
- filters
- saved state
- offline state
- source links
- external article links

---

# 23. Browser QA Matrix

Before declaring completion, verify in a real browser on:

### Desktop

- Chrome
- current Edge where practical

### Mobile

- Chromium mobile viewport
- iPhone-sized viewport
- Android-sized viewport

## Browser checks

For every route:

- no console errors
- no broken assets
- no layout overflow
- no text clipping
- no unexpected horizontal scroll
- no broken links
- no stuck loading state
- no animation glitches
- no modal focus bugs

Take screenshots for:

```text
landing desktop
landing mobile
edition desktop
edition mobile
hype index desktop
hype index mobile
sources desktop
story desktop
methodology desktop
```

Compare against intended design and previous baselines.

---

# 24. Lighthouse / Web Vitals Goals

Treat these as goals, not as reasons to damage the experience.

Target approximately:

```text
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 95+
```

Also monitor:

- LCP
- CLS
- INP
- TTFB

Prioritize real causes rather than blindly optimizing the score.

---

# 25. Definition of Done

The task is **not finished** when the code compiles.

It is finished only when all of the following are true:

### Product

- [ ] Core concept remains clear within seconds.
- [ ] Homepage demonstrates the product immediately.
- [ ] Hype Index feels like the signature feature.
- [ ] Edition feels like a real publication.
- [ ] Methodology is understandable.
- [ ] Trust language is explicit.

### Design

- [ ] No generic AI visual patterns.
- [ ] Typography hierarchy is strong.
- [ ] Spacing is consistent.
- [ ] Editorial identity is consistent.
- [ ] Mobile layout is intentional.
- [ ] Motion is restrained.

### Technical

- [ ] Existing tests pass.
- [ ] Production build passes.
- [ ] No console errors in primary routes.
- [ ] No obvious dead code remains.
- [ ] Bundle has been measured and unnecessary weight reduced where practical.
- [ ] Feed pipeline remains reliable.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus states work.
- [ ] Dialogs are accessible.
- [ ] Hype indicators are not color-only.
- [ ] Reduced motion works.
- [ ] Screen-reader labels are meaningful.

### Security

- [ ] Feed allowlist is intact.
- [ ] CORS rules are intentional.
- [ ] Rate limiting remains intact.
- [ ] Input validation remains intact.
- [ ] CSP is reviewed.
- [ ] External URLs are handled safely.

### QA

- [ ] Desktop screenshots reviewed.
- [ ] Mobile screenshots reviewed.
- [ ] Route-by-route smoke test completed.
- [ ] Error states tested.
- [ ] Offline behavior tested.
- [ ] Lighthouse/Web Vitals reviewed.

---

# 26. Implementation Order

Use this exact order unless a dependency forces a change.

## Sprint 1 — Baseline and cleanup

1. Inspect repo.
2. Run tests.
3. Build production bundle.
4. Audit dependencies.
5. Remove dead code.
6. Consolidate obvious duplication.
7. Record baseline screenshots and metrics.

## Sprint 2 — Landing page

1. Rework hero.
2. Move live product data higher.
3. Strengthen editorial story preview.
4. Improve “Why” section.
5. Improve “How Hype works” explanation.
6. Add stronger Hype Index preview.
7. Refine final CTA.
8. Test mobile.

## Sprint 3 — Hype Index

1. Strengthen visual hierarchy.
2. Improve score explanation.
3. Add sample-size context.
4. Improve trend presentation.
5. Improve insufficient-data states.
6. Make methodology accessible from the feature.

## Sprint 4 — Reader and sources

1. Refine edition hierarchy.
2. Improve filters.
3. Improve story rows/cards.
4. Improve source comparison.
5. Improve story page.

## Sprint 5 — Performance + accessibility

1. Measure bundle.
2. Reduce unnecessary JS.
3. Review render costs.
4. Run accessibility scan.
5. Keyboard test.
6. Screen-reader test.
7. Reduced-motion test.

## Sprint 6 — Security + SEO + PWA

1. Finish CSP work.
2. Sanitize external media URLs.
3. Review external navigation.
4. Review metadata.
5. Validate offline mode.
6. Validate cached state messaging.

## Sprint 7 — Final QA

1. Desktop browser pass.
2. Mobile browser pass.
3. Route-by-route regression test.
4. Screenshot review.
5. Performance review.
6. Accessibility review.
7. Fix remaining polish issues.
8. Final production build.
9. Final deployment verification.

---

# 27. Agent Working Rules

## Rule 1 — Do not rewrite for aesthetics alone

Preserve working architecture.

## Rule 2 — Measure before optimizing

Never claim a performance improvement without measuring it.

## Rule 3 — Real data only

Do not invent metrics, sources, headlines, trends, or testimonials.

## Rule 4 — Do not fake completeness

If history is unavailable, say so.

If a feed fails, say so.

If a feature cannot calculate a result, provide a meaningful empty state.

## Rule 5 — Product over decoration

Every visual element needs a reason.

## Rule 6 — Editorial, not dashboard

When choosing between:

> “dashboard UI”

and

> “publication UI”

choose publication UI unless the task genuinely requires analytics controls.

## Rule 7 — Accessibility is part of design

Do not bolt it on at the end.

## Rule 8 — Preserve source truth

Keep original headlines unchanged unless the product explicitly displays a separate analysis label.

## Rule 9 — Avoid overengineering

Do not add:

- databases
- auth
- user accounts
- AI chat
- comments
- likes
- social feeds
- recommendation engines

unless a separate product requirement explicitly requires them.

## Rule 10 — No placeholder junk in production

Never leave:

- lorem ipsum
- placeholder names
- placeholder statistics
- TODO UI text
- empty fake buttons
- fake links

---

# 28. Final Visual Quality Bar

Before shipping, compare the product against this mental model:

> It should feel like a small, independent publication with unusually good product engineering.

Not:

> It should feel like an AI startup landing page with a news feed.

The target experience is:

```text
quiet
sharp
editorial
credible
uncluttered
fast
slightly opinionated
memorable
```

---

# 29. What NOT to Change

Do not remove the core idea of headline-intensity measurement.

Do not replace the editorial aesthetic with a generic modern SaaS aesthetic.

Do not replace the current architecture with an unnecessary full-stack rewrite.

Do not add fake data to make the UI look richer.

Do not turn Hype into a truth/credibility rating.

Do not add features simply to increase feature count.

Do not optimize the site until it becomes visually sterile.

---

# 30. Final Success Criteria

The final build should make a first-time user think:

> “This is not another AI news aggregator.”

Then immediately understand:

> “It tracks what AI headlines are saying and how intensely they're saying it.”

Then trust it because:

> “The original source is visible, the methodology is transparent, and the site doesn't pretend the Hype score is truth.”

And finally want to use it because:

> “This is a genuinely calmer way to understand the AI news cycle.”

That is the product to ship.
