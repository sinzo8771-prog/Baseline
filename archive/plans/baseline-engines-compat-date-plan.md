# The Baseline — Node engine pin + compatibility_date bump

**Repo:** https://github.com/sinzo8771-prog/Baseline
Two small items, one file each.

---

## 1. Add an `engines` field (primary task)

- **File:** `package.json`
- **Why:** CI now hard-pins `node-version: "24"` in both workflows (fixing the jsdom/undici crash from the last round), but nothing communicates that requirement to a contributor running locally. Someone on Node 20 (still a common LTS default) would hit the identical crash with no clue it's a known, already-solved issue.
- **Do:** add near the top level of `package.json`, alongside `"name"`/`"scripts"`:
  ```json
  "engines": {
    "node": ">=24"
  }
  ```
  This alone doesn't block anything by default (npm only warns, doesn't fail, unless `engine-strict=true` is set) — that's fine, the goal here is a clear signal, not an enforcement mechanism. Don't add `engine-strict` to `.npmrc` as part of this task; that's a separate, more opinionated decision not asked for here.
- **Also add:** an `.nvmrc` file at repo root containing just:
  ```
  24
  ```
  so anyone using `nvm` gets the right version with a plain `nvm use`, matching the `engines` field.
- **Done when:** `package.json` has the `engines` field, `.nvmrc` exists with `24`, and both match the CI workflows' `node-version: "24"`.

---

## 2. Bump `wrangler.toml`'s `compatibility_date` (minor, low priority)

- **File:** `wrangler.toml`
- **Current:** `compatibility_date = "2026-01-01"` — about 7.5 months behind today (2026-08-15). This isn't broken; `compatibility_date` only gates *opt-in* Workers runtime behavior changes, so nothing is currently at risk. It's just worth periodic upkeep to pick up newer runtime fixes/features as they land.
- **Do:** check the current date against Cloudflare's Workers changelog/compatibility-date docs for any relevant flags introduced since 2026-01-01 that might benefit this project (unlikely to be anything urgent given how minimal this Worker's surface area is — no exotic APIs in use), then bump the date to something recent, e.g.:
  ```toml
  compatibility_date = "2026-08-01"
  ```
  Don't blindly set it to "today" — Cloudflare recommends picking a date you've actually tested against, not an arbitrary moving target. Run `npm run test:all` and a manual smoke check of `/`, `/edition`, `/feed.xml`, `/api/feed` after bumping, since compatibility_date changes can (rarely) alter runtime behavior in ways local tests might not catch if they don't exercise the Worker directly (most of this repo's tests are jsdom/component-level, not Worker-runtime-level — keep that gap in mind here).
- **Done when:** `compatibility_date` reflects a recent, tested date, and the app still behaves identically after deploy (spot-check the live site once deployed).
