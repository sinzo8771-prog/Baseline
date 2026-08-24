# The Baseline — LICENSE, Dependabot, Saved-list export

**Repo:** https://github.com/sinzo8771-prog/Baseline
Three independent items. No shared code between them.

---

## 1. Add a LICENSE file

- **File:** new `LICENSE` at repo root
- **Do:** pick a license and add the standard file. If unsure which: MIT is the simplest, most permissive, and most common choice for a project like this (no patent grant needed, no strong-copyleft requirement) — use GitHub's "Add file → Create new file → LICENSE" flow in the repo UI, which offers a template picker, or copy the standard MIT text and fill in the year/name.
- **Also:** add an `spdx-license-identifier` or just confirm `package.json` doesn't already claim a conflicting `"license"` field — check first:
  ```
  grep -n '"license"' package.json
  ```
  If one exists and doesn't match what you add, reconcile them (same license in both places).
- **Done when:** `LICENSE` exists at repo root, GitHub's UI shows the license badge on the repo homepage instead of "View license" being absent, and `package.json`'s `license` field (if present) matches.

---

## 2. Add Dependabot config

- **File:** new `.github/dependabot.yml`
- **Do:** minimal config covering the two ecosystems actually in use — npm (the app's dependencies) and github-actions (the workflow files themselves, since those pin action versions like `actions/checkout@v4`):
  ```yaml
  version: 2
  updates:
    - package-ecosystem: "npm"
      directory: "/"
      schedule:
        interval: "weekly"
      open-pull-requests-limit: 10

    - package-ecosystem: "github-actions"
      directory: "/"
      schedule:
        interval: "weekly"
  ```
- **Consider:** grouping minor/patch updates into a single PR (via `groups:`) rather than one PR per package, since this is a small team/solo project and a flood of individual dependency PRs is more noise than signal. Optional refinement, not required for the base config to be useful.
- **Verify:** after merging, check the repo's "Insights → Dependency graph → Dependabot" tab in a week or so to confirm it's actually opened PRs (Dependabot runs on GitHub's schedule, not immediately on merge).
- **Done when:** `.github/dependabot.yml` exists with both ecosystems configured, and it's confirmed to have run at least once (first scheduled run or a manual trigger via the Dependabot UI).

---

## 3. Add export to the `/saved` reading list

- **Files:** `src/app/pages/Saved.jsx`, reuse `src/lib/feedBuilders.js` (`buildJsonFeed`) rather than writing a new serializer
- **Why:** `/saved` is the one piece of user data with no portability story — OPML export exists for sources, `/feed.xml`/`/feed.json` exist for the edition, but a reader's own curated saved list lives only in `localStorage` with no way to back it up or move it to another device/browser.
- **Do:**
  1. Add a "Download saved stories" button to `Saved.jsx`, near the existing page header (same visual treatment as the "Download OPML" button on `/sources` — consistent pattern, not a new UI idiom).
  2. Reuse `buildJsonFeed(stories, opts)` from `feedBuilders.js` to serialize the current `savedList` into JSON Feed format — this is a browser-side call (no Worker round-trip needed, `buildJsonFeed` is a pure function operating on data already in memory), triggered via a client-side `Blob` + `URL.createObjectURL()` download, same technique `exportOPML.js` already uses for the sources export (check that file for the exact download-trigger pattern and mirror it rather than inventing a new one).
  3. Confirm `buildJsonFeed`'s expected story shape matches what `reconcileSaved()` returns — if there's a mismatch (e.g., `feedBuilders.js` expects fields the saved-story snapshots don't carry, like a `spin` score that might not always be present), decide whether to pass through what's available and let the serializer handle missing fields gracefully, or map the saved-story shape to the expected shape first. Check `test/feed-route.test.js` for what shape `buildJsonFeed` already assumes before writing new code.
- **Done when:** clicking "Download saved stories" on `/saved` downloads a valid JSON Feed file containing exactly the reader's currently-saved stories; a component test added confirming the button triggers a download with the right story count (mirror however `exportOPML` is tested, if it has a test — if not, this is a reasonable place to add the first one for this pattern).

---

## Order

No dependencies between the three. LICENSE and Dependabot are each a few minutes; the Saved export is the only one with real code, but it's a small reuse of an existing serializer, not new logic.
