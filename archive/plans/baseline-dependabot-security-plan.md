# The Baseline — Dependabot triage policy + SECURITY.md

**Repo:** https://github.com/sinzo8771-prog/Baseline
Two independent items. Item 1 has an immediate action (the 2 open major-version PRs) plus a lasting policy; item 2 is a single new file.

---

## 1. Triage the open Dependabot PRs, then set a lasting policy

### Immediate: handle the current batch (10 open PRs)

- **Merge on green CI, low risk (patch/minor):**
  `framer-motion-13.1.0`, `lucide-react-1.31.0`, `shadcn-4.17.0`, `wrangler-4.122.0`, `actions/checkout-7`, `actions/github-script-9`, `actions/setup-node-7`, `cloudflare/wrangler-action-4` — check each is actually patch/minor (not major) via the PR's own version diff before merging, but at a glance these are the routine ones. Standard flow: let CI run, merge if green.

- **Hold for manual testing (major version bumps):**
  - **`vite-8.2.1`** (from `6.4.3` — two major versions)
  - **`vitejs/plugin-react-6.0.5`** (from `4.7.0` — two major versions)

  For each of these two specifically, before merging:
  1. Check out the Dependabot branch locally.
  2. Read the Vite 7 and Vite 8 migration guides (and the `@vitejs/plugin-react` changelog for its major bumps) for breaking changes relevant to this repo's config — particularly around `manualChunks` (used for the bundle-splitting work from an earlier round), the Tailwind Vite plugin interaction, and anything about `build.rollupOptions`.
  3. Run `npm run build` and diff the output chunk list/sizes against the current build (`npm run build` on `master` first, save the `dist/assets/` listing, compare) — a major Vite bump silently changing chunk names/splitting behavior wouldn't necessarily fail a test, just produce a worse or broken bundle.
  4. Run `npm run test:all` and the Playwright E2E suite (`npx playwright test`) against the built output, not just unit tests — this is exactly the kind of change the E2E layer added a few rounds ago exists to catch.
  5. Only merge once both pass and the bundle output looks sane. If it's more effort than it's worth right now, it's fine to leave these two PRs open and unmerged for a while — Dependabot will keep them updated against `master`, they're not blocking anything by sitting open.

### Lasting policy (so this doesn't need re-deciding every week)

- **Document it** — add a short section to `CONTRIBUTING.md` if one exists, or a comment at the top of `.github/dependabot.yml`, stating the rule: *patch/minor → merge on green CI; major → manual build+E2E verification before merge, specifically checking bundle output.*
- **Optional: use Dependabot's `ignore` or grouping config** to reduce noise — e.g., group all patch/minor npm updates into a single weekly PR via `groups:`, while leaving major-version updates as individual PRs (so they stand out rather than getting buried in a group). Only add this refinement if the current one-PR-per-package volume actually becomes annoying; not required to get value from the policy above.

---

## 2. Add `SECURITY.md`

- **File:** new `SECURITY.md` at repo root
- **Do:** GitHub recognizes this file by convention and surfaces a "Report a vulnerability" option under the repo's Security tab. Minimal content for a project this size:
  ```markdown
  # Security Policy

  ## Reporting a Vulnerability

  If you find a security issue in The Baseline, please report it privately
  rather than opening a public issue — email [your contact] or use GitHub's
  private vulnerability reporting (Security tab → Report a vulnerability).

  Please include:
  - A description of the issue and its potential impact
  - Steps to reproduce
  - Any relevant logs or screenshots

  We'll acknowledge reports within a reasonable timeframe and keep you
  updated as we investigate and fix confirmed issues.

  ## Scope

  This covers the Worker (`src/index.js` and its routes), the client
  application, and the self-published feed endpoints. It does not cover
  third-party RSS sources aggregated by the site.
  ```
  Fill in the actual contact method (email or confirm GitHub's private reporting is enabled for the repo — check repo Settings → Security → "Private vulnerability reporting" toggle, since the feature needs to be explicitly turned on to actually work, not just having the file present).
- **Done when:** `SECURITY.md` exists, contact/reporting method is real (not a placeholder), and — if using GitHub's private reporting flow — that setting is confirmed enabled in repo settings, not just documented.

---

## Order

Handle the two major-version PRs first if there's any near-term reason to want the latest Vite (otherwise fine to leave open). `SECURITY.md` has no dependency on anything else — quick, standalone.
