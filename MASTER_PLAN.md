# The Baseline — AI-Agent Master Plan for a Visual Redesign Experiment

**Project:** The Baseline — “AI news, hype removed.”  
**Repository:** https://github.com/sinzo8771-prog/Baseline  
**Experiment branch:** `redesign-experiment`  
**Primary goal:** Give The Baseline a recognisable, intentional editorial identity that does not look like a generic AI-generated website, while preserving the product's trustworthiness, reading speed, and existing functionality.

> **Instruction to the coding agent:** Execute this plan inside the existing repository. Do not stop after producing an audit or a design proposal. Inspect, prototype, implement, run the project, test it, inspect screenshots, and fix the highest-impact problems. Do not deploy or merge unless explicitly asked.

---

## 1. Product and Editorial Context

The Baseline is an independent AI-news publication and analysis tool. It aggregates source headlines verbatim, detects promotional or hype-oriented language, and presents a measurable view of the AI news cycle. The product is a **meter, not a voice**: it should help readers judge the news without rewriting the news or pretending to know more than the source material supports.

Treat the following as core product promises:

- Headlines remain verbatim from the publisher.
- Hype scores are explainable and are not a measure of whether a story is true.
- Empty, partial, delayed, cached, and failed feed states must be represented honestly.
- Numbers, historical trends, source status, and other data must come from the real application state. Never invent them to make a screen look complete.
- Reading the edition is the main job. Visual character should make the information easier to understand, not slower to consume.

The current repository README describes a React + Vite + Tailwind CSS application using React Router, with Cloudflare Worker feed routes and existing tests. Confirm the current code and installed packages before making assumptions; the source of truth is the repository, not this document.

## 2. Design Mission

Make the redesign feel like an **independent editorial institution with an internet-native edge**: strong typographic decisions, deliberate asymmetry, a memorable masthead, useful information density, a clear reading rhythm, and a signature treatment for the Hype Index.

Begin with this creative hypothesis, but validate it against the real site before committing:

> **Editorial brutalism × independent internet magazine.** A newspaper's hierarchy and restraint, with more daring scale, layouts, and details than a conventional news template.

The result should feel designed by someone with a point of view, not assembled from a set of fashionable components.

### Desired qualities

- Distinctive, typography-led, publication-first.
- Editorial hierarchy: a clear lead story, meaningful secondary stories, and quiet metadata.
- Strong, consistent alignment with selective asymmetry.
- A small palette with one deliberate accent; colour must communicate hierarchy or data, not merely decorate.
- Specific visual behaviours tied to The Baseline's identity: score explanation, source diversity, the edition, and changes in hype over time.
- Responsive by design, especially for narrow screens.
- Fast, legible, robust, keyboard-accessible, and usable with reduced motion.

### Anti-goals: do not ship these defaults

- Generic AI/SaaS landing-page composition.
- Gradient backgrounds, glowing blobs, glassmorphism, or neon accents without a strong product-specific reason.
- A page made entirely of equally sized rounded cards.
- An unbroken three-column card grid as the main design language.
- Oversized empty hero art, fake browser mockups, decorative dashboards, or fabricated product screenshots.
- Fake user counts, fake activity, invented testimonials, or fabricated “live” status.
- AI-generated news copy, rewritten headlines, invented source summaries, or made-up scores.
- Random ASCII/terminal decorations, meaningless issue codes, excessive eyebrow labels, or ornamental dots and lines with no information purpose.
- Motion added just because a skill can produce it.
- New dependencies for effects that can be achieved simply with the existing stack.
- A redesign that looks impressive in one screenshot but becomes hard to read or use on mobile.

Do not interpret “anti-slop” as “add brutalism everywhere.” Use contrast, density, and unusual composition with restraint. Every strong element needs a clear purpose.

---

## 3. Non-Negotiable Safety Rails

1. **Use a separate branch.** Create or switch to `redesign-experiment` only after checking the current branch and working tree. Never overwrite uncommitted user changes. If the tree is dirty, preserve the user's work and proceed safely or stop before modifying conflicting files.
2. **No deployment.** Do not deploy to Cloudflare, change production secrets, alter DNS, publish a release, or merge the branch.
3. **Preserve real features.** Do not remove functionality to make the visual implementation easier.
4. **Preserve product/data logic.** Do not modify feed parsing, hype scoring, deduplication, sorting, source diversity, historical data, or caching as part of a visual-only redesign unless a demonstrated bug blocks the UI. If a logic change is unavoidable, isolate it, explain it, and add tests.
5. **Preserve routes and semantics.** Do not silently rename or remove routes, URL parameters, keyboard shortcuts, query behaviour, metadata, or export formats.
6. **No mock data in production UI.** Use fixtures only inside isolated tests or an explicitly local-only design comparison. Ensure fixtures cannot accidentally ship.
7. **No unrelated dependency or architecture migration.** Use the existing stack. Add a dependency only when it is necessary, justify it, and document any bundle, maintenance, or deployment impact.
8. **No secret leakage.** Do not print, copy, commit, or expose environment secrets or API keys. Scroll-Craft does not need an asset-generation API key for a build using existing, licensed assets.
9. **Keep the project deployable on its existing platform.** Do not assume server-side rendering or a Node runtime in production; verify how the Cloudflare Worker serves the build.
10. **Do not auto-commit or merge.** Leave the changes reviewable in the experiment branch.

---

## 4. Agent Skills: How to Use Them

Skills guide the process; they are not permission to ignore the app's constraints.

### Taste-Skill

Repository: https://github.com/Leonxlnx/taste-skill

Recommended use:

1. Run the repository's existing-project redesign workflow first to audit the actual UI and identify high-impact problems.
2. Use the main Taste-Skill workflow to explore art direction and establish the design system.
3. Use the brutalist variant only as a source of ideas for type scale, contrast, and composition. Do not blindly apply every motif or rule.
4. Follow its browser-inspection and screenshot-review steps if compatible with the environment.

Documented install commands include:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Install only what the agent environment supports. If the skills are already available, use them rather than reinstalling. Verify the current repository README if the CLI reports a skill-name mismatch. The main Taste-Skill v2 is described by its upstream repository as experimental; do not let it override this project's explicit constraints.

### Scroll-Craft

Repository: https://github.com/nateherkai/scroll-craft

Use it **selectively**, only if the design audit identifies a specific story or interaction that becomes clearer through scroll-driven storytelling. Good candidates might be one self-contained explanation of how the Hype Index works, or a single special editorial landing experience. It is not the default implementation strategy for a frequently visited news feed.

Before adopting it:

- Read its `SKILL.md` and run its documented diagnostic workflow.
- Review its runtime, browser, video, and asset requirements before adding anything to the project.
- Do not generate or download assets until their source, licence, attribution requirements, file size, and product relevance are checked.
- Do not add an API key just to satisfy an optional asset workflow.
- Keep a normal, readable, scrollable fallback for reduced motion, unsupported devices, and failed assets.
- Check production bundle size and mobile performance.

**Default decision:** use Taste-Skill for the overall redesign; treat Scroll-Craft as an optional specialist for one clearly justified experience. Do not force both skills onto every page.

---

## 5. Phase 0 — Establish a Safe Baseline

Before editing code:

1. Read `README.md`, `QA.md`, `ROADMAP.md`, `CHANGELOG.md`, `package.json`, the route definitions, key page/component files, styles, and existing tests.
2. Inspect current Git status, active branch, recent relevant commits, and any in-progress changes.
3. Identify the installed versions and actual usage of React, Vite, Tailwind, routing, motion, icons, and testing libraries. Do not replace them with whatever a skill recommends by default.
4. Run the existing checks and record failures before the redesign. At minimum, discover and run the existing test, build, accessibility, and E2E commands that are feasible in this environment.
5. Start the site locally and inspect the real UI with live data where possible. Capture baseline screenshots at:
   - Desktop: approximately 1440 × 900
   - Tablet/small laptop: approximately 1024 × 768
   - Mobile: approximately 390 × 844
6. Inspect both the best-case state and edge states: loading, empty results, slow or failed feed, stale/offline edition, long headline, no history, unknown story, and source unavailable.
7. Write a short audit with the top five problems ranked by user impact. Distinguish visual issues from functional bugs.

### Deliverable

A concise baseline audit and a list of verified routes/features. Do not begin a sweeping refactor before completing this inventory.

---

## 6. Phase 1 — Explore Three Art Directions

Explore three genuinely different directions before selecting one. The goal is to compare distinct design languages, not three variations of the same card layout.

### Direction A: Editorial brutalism

- Confident typographic scale and hard contrast.
- Tight, deliberate grids and selected asymmetry.
- Rules, numbering, and alignment used for information hierarchy.
- A sharp accent used sparingly.
- Must remain readable and calm enough for a news product.

### Direction B: Internet-native magazine

- More expressive headlines, unusual but functional columns, and a less predictable rhythm.
- Selective colour and real editorial imagery only where it adds context.
- A distinctive visual signature that cannot be reduced to a generic template.
- Must not turn every element into a novelty.

### Direction C: Intelligence desk

- Data-dense but highly organised.
- Clear comparisons, source context, trend lines, and explicit scoring explanations.
- Strong typographic hierarchy with restrained decoration.
- Must not resemble a generic trading terminal or enterprise admin panel.

### Comparison method

- Use real Baseline content and real application data; do not invent scores or headlines.
- Prototype the same representative area for each direction, preferably the masthead plus the first part of `/edition` and a Hype Index element. This makes comparison fair.
- Record each direction's one-sentence concept, typography plan, palette, layout grammar, signature interaction (if any), strengths, and trade-offs.
- Select the direction that best supports the product's editorial trust and everyday readability, not merely the most dramatic screenshot.
- Combine directions only where the combination has a clear rationale.

The agent should make a reasoned decision and continue without requiring user confirmation. If creating temporary comparison routes or fixtures, keep them local-only or remove them from the production route table before completion.

---

## 7. Phase 2 — Define the Design System Before Scaling It

Create a small, coherent design system based on the selected direction. Put reusable values in the project's existing token/theme system instead of scattering new values across components.

Define and document:

- **Colour:** page/background, main text, secondary text, rules/borders, accent, link states, and semantic hype states. Maintain strong contrast. Colour and shape must reinforce score labels; colour cannot be the only signal.
- **Typography:** display face, reading face, metadata/utility face if needed; responsive type scale; line heights; readable measure; weights and fallbacks. Prefer two intentional font roles over a collection of trendy fonts.
- **Grid:** content max width, margins, columns, gutters, breakpoints, and rules for breaking the grid intentionally.
- **Spacing:** a consistent scale for macro layout, section spacing, metadata gaps, and compact controls.
- **Borders and corners:** establish a deliberate rule. Do not apply rounded corners to every item by default.
- **Controls:** focus, hover, active, selected, disabled, loading, and error states.
- **Motion:** define which transitions add feedback or meaning, their duration, and their reduced-motion equivalent.
- **Data visualisation:** axes, labels, unknown values, zero values, partial history, and semantic state colours.
- **Responsive behaviour:** specify what changes on mobile rather than shrinking desktop layouts.

Do not add a new design-system dependency just to implement these tokens.

---

## 8. Phase 3 — Redesign in Product-Priority Order

### 3.1 Masthead and global navigation

The masthead is the publication's identity, not a generic app header.

- Give **THE BASELINE** a recognisable wordmark treatment consistent across routes.
- Keep the editorial promise legible and concise: “AI news, hype removed.”
- Show date/edition context only when it is real and useful.
- Make the primary destinations obvious without overcrowding the header.
- Keep search, saved stories, command palette, theme, and other utilities discoverable.
- Maintain keyboard navigation and visible focus states.

### 3.2 `/edition` — primary reading experience

This is the most important page. Optimise it for finding and reading stories quickly.

- Establish a clear lead story and supporting hierarchy when real ranked data supports it.
- Make story headlines the main visual content; metadata should be quieter but easy to scan.
- Replace oversized empty placeholders or decorative media with meaningful layout and information hierarchy.
- Use separators, columns, indentation, type scale, and spacing to create editorial rhythm. Avoid turning every story into an identical floating card.
- Preserve all existing sort, search, source filtering, hype filtering, counts, view toggle, keyboard selection, story opening, and bookmark actions.
- Keep the “Cards” view viable if it remains part of the product; it should share the design language without being an unrelated skin.
- Distinguish a genuinely empty feed from a failed feed or a stale cached edition.
- Make long and unusual source headlines wrap naturally without overlap, clipping, or absurdly tall components.

### 3.3 `/hype-index` — signature visual feature

Make the Hype Index distinctive, but never sacrifice semantic clarity.

- Explain what the percentage measures near the number, not only behind a tooltip.
- Distinguish **0%**, **no data**, **not enough history**, **partial history**, and **loading/error** states.
- Display the timeframe and denominator wherever needed to interpret a percentage.
- Make the distribution and history understandable without animation.
- Ensure tooltips and chart labels are keyboard-accessible and remain readable on mobile.
- Keep the disclaimer visible: the hype score measures language intensity, not truth, quality, or factual accuracy.
- Do not animate a value from zero if that could imply a real measurement that does not exist.

### 3.4 Story detail `/story/:id`

- Make the original headline, source, publication time, original link, and hype score easy to find.
- Treat “Why this score” as important evidence, not as buried technical metadata.
- Preserve signal categories, contribution values, score explanations, share/copy actions, and previous/next navigation.
- Do not make the interface sound as if The Baseline is endorsing or fact-checking the underlying claim.
- Keep long headlines and explanatory panels comfortable to read.

### 3.5 Supporting routes

Apply the same design system to:

- `/sources`
- `/sources/:name`
- `/saved`
- `/week-in-review`
- `/methodology`
- `/about`
- Landing `/`
- 404, loading, error, and empty states

Use route-specific composition where helpful. Do not simply place every route inside the same centered container with the same title and a grid of cards. The source leaderboard and week trends should be functional data views, not fabricated dashboard widgets.

### 3.6 Landing page `/`

The landing page should explain the product quickly and demonstrate the real product rather than over-selling it.

- State what The Baseline does in plain language.
- Show a genuine current snapshot or clearly labelled live/last-updated state.
- Give visitors a direct path into `/edition`.
- Explain the hype measurement and its limitations accurately.
- Keep product proof tied to real features and data.
- Avoid generic slogans, fake testimonials, and long marketing sections that delay access to the news.

---

## 9. Phase 4 — Interactions and Motion

Use interactions as editorial tools, not decoration.

- Prefer subtle state transitions, useful reveal, and direct feedback over constant motion.
- Avoid scroll-jacking, forced horizontal scrolling, cursor-following gimmicks, parallax on all sections, and animations that delay access to headlines.
- Do not animate text in a way that impairs reading, text selection, screen readers, or perceived performance.
- Respect `prefers-reduced-motion` globally.
- Ensure all actions work with a keyboard and all interactive elements have visible focus.
- If Scroll-Craft is used, confine it to one justified experience, provide a normal-scroll fallback, and verify the real mobile behaviour and actual scroll frames.
- Do not add video, canvas, WebGL, generated media, or heavy animation dependencies unless the chosen concept requires them and performance remains acceptable.

Every interaction must have a clear purpose, predictable behaviour, and a fallback when enhancement fails.

---

## 10. Phase 5 — Accessibility, Performance, and Responsive Quality

### Accessibility

- Preserve semantic headings and landmarks; heading order must reflect the page hierarchy.
- All buttons, links, menus, toggles, dialogs, tooltips, and command palette actions must be keyboard usable.
- Keep focus visible and focus order logical. Do not create keyboard traps.
- Use sufficient text and data-visualisation contrast in light and dark themes.
- Do not rely only on colour to express hype levels, selected states, status, or errors.
- Give icons accessible names where necessary; hide decorative icons from assistive technology.
- Honour reduced-motion preferences and test zoom/reflow.
- Keep links descriptive and external destinations clear.

### Performance

- Do not add large libraries or media for cosmetic gains alone.
- Optimise images and fonts; use local assets or reliable, licensed sources and avoid unnecessary third-party runtime calls.
- Avoid expensive scroll listeners and layout-triggering animation.
- Prevent layout shift when fonts and images load.
- Verify that browser-side feed fetching, cached edition rendering, and retry behaviour still work.
- Compare built asset sizes against baseline and explain any notable increase.

### Responsive checks

Test at minimum 390px, 768px, 1024px, and 1440px widths, plus a narrower width around 320px where feasible. No horizontal overflow, clipped buttons, unreadable charts, overlapping story metadata, or mobile navigation dead ends are acceptable.

---

## 11. Phase 6 — Verification and Visual QA

Do not declare the redesign complete just because the build succeeds.

### Required functional regression checks

Use the project's existing test scripts and add targeted coverage where needed. Verify at minimum:

- Landing page loads and links into the edition.
- Edition loads and gracefully handles loading, success, partial failure, and failure.
- Search filters the intended fields.
- Source and hype filters compose correctly and can be cleared.
- Sort modes still work.
- Edition/Cards toggle still works.
- Story navigation, source profile links, and unknown-story handling still work.
- Hype explanations and score distributions reflect real calculation results.
- 0%, missing history, and partial history are not conflated.
- Save/unsave, `/saved`, and export still work.
- Keyboard shortcuts work and do not hijack typing in inputs or dialogs.
- Command palette, theme switching, print view, sharing, and copy-link still work.
- RSS/JSON Feed, OPML export, route metadata, and other public endpoints are not unintentionally changed.
- Offline/stale edition and retry states remain usable.

### Required visual QA loop

1. Run the site locally against the actual application.
2. Capture updated screenshots at desktop, tablet, and mobile widths.
3. Compare each screenshot with the baseline; check hierarchy, visual rhythm, line length, whitespace, alignment, contrast, and how much of the first useful content appears above the fold.
4. Fix the **three biggest visible issues** first. Repeat the screenshot review for up to three focused rounds or until remaining issues are minor.
5. Inspect the edition, a story page, the Hype Index, sources, saved stories, and methodology. Do not review only the homepage.
6. Inspect long headlines, empty/error states, theme variants, keyboard focus, and reduced motion.
7. If browser automation or screenshots are unavailable, state this clearly and do not claim browser QA passed.

### Completion commands

Discover the current scripts in `package.json` and use the repository's own commands. The README currently documents commands in this family:

```bash
npm test
npm run test:components
npm run test:e2e
npm run build
```

Use only commands that exist in the current checkout, and report every skipped check and reason. A pre-existing failing test must be distinguished from a regression.

---

## 12. Definition of Done

The experiment is complete only when all of the following are true:

- [ ] A separate `redesign-experiment` branch contains the work.
- [ ] The chosen direction is documented in one concise paragraph with clear rationale.
- [ ] Three distinct directions were explored and compared before final selection.
- [ ] The site has a coherent design system: type, palette, spacing, grid, borders, controls, and motion.
- [ ] The redesign is noticeably different from the baseline, not just a colour/font refresh.
- [ ] The first screen communicates The Baseline's identity and makes the edition easy to reach.
- [ ] Edition, story, Hype Index, sources, saved, methodology, and supporting routes use a coherent but context-sensitive visual language.
- [ ] Existing functional behaviour and URLs are preserved.
- [ ] No fake data, generated news copy, placeholder content, or decorative fake metrics have shipped.
- [ ] 320/390/768/1024/1440 responsive checks have been completed where feasible.
- [ ] Keyboard use, focus visibility, reduced motion, semantic structure, and contrast have been checked.
- [ ] Unit/component/E2E/build checks were run as available, and failures are reported truthfully.
- [ ] Screenshots were inspected and the largest visual problems were fixed.
- [ ] No secrets, unintended generated assets, temporary demo routes, or unneeded dependencies were added.
- [ ] No deployment, merge, or production change was made.

---

## 13. Final Report Required from the Agent

When implementation is finished, provide a concise report with:

1. **Design direction:** selected concept and why it suits The Baseline.
2. **What changed:** grouped by route or component, including the most visible differences.
3. **Functionality preserved:** any verified high-risk features.
4. **Skill usage:** which Taste-Skill workflow was used; whether Scroll-Craft was used and why/why not.
5. **Verification:** exact commands run and results; browser/device sizes inspected; screenshots produced and their paths.
6. **Known issues:** any incomplete work, existing failures, untested routes, or visual trade-offs.
7. **Change summary:** files changed, dependencies added/removed, and any notable bundle-size impact.
8. **Git status:** current branch and whether there are uncommitted changes. Do not commit or deploy without permission.

Never claim a test, screenshot review, or browser check passed unless it was actually run and inspected.

---

## 14. Useful References

- The Baseline repository: https://github.com/sinzo8771-prog/Baseline
- Taste-Skill: https://github.com/Leonxlnx/taste-skill
- Taste-Skill README and current installation guidance: https://github.com/Leonxlnx/taste-skill#readme
- Scroll-Craft: https://github.com/nateherkai/scroll-craft
- Scroll-Craft installation and requirements: https://github.com/nateherkai/scroll-craft#readme

**Final operating principle:** Experiment with the visual language; do not experiment with the truthfulness of the data or the reliability of the product.
