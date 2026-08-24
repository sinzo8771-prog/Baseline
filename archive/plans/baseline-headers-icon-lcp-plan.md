# The Baseline — Security headers, iOS home-screen icon, lead-image priority

**Repo:** https://github.com/sinzo8771-prog/Baseline
Three small, independent items. Do in any order.

---

## 1. Add missing security headers alongside the CSP

- **File:** `src/index.js`
- **Current:** `withSecurityHeaders()` (around line 294) only sets `content-security-policy` on `text/html` responses.
- **Do:** add three headers in the same function, same place the CSP is set:
  ```js
  headers.set("content-security-policy", CSP);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  ```
  For clickjacking protection, prefer folding `frame-ancestors 'none'` into the existing `CSP` array (around line 280) over a separate `X-Frame-Options` header — `frame-ancestors` is the modern replacement and takes precedence in browsers that support both, so setting both is redundant, not additive:
  ```js
  const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
  ```
- **Verify:** these headers apply to `text/html` responses only (same as the existing CSP scoping in `withSecurityHeaders` — don't widen that condition as part of this task, it's intentionally scoped to document responses, not static assets).
- **Done when:** a fetch of `/` shows `content-security-policy` (with `frame-ancestors 'none'` included), `x-content-type-options: nosniff`, and `referrer-policy: strict-origin-when-cross-origin` in the response headers; existing tests for `withSecurityHeaders`/CSP (check `test/` for a `security-headers` or `csp` test file) still pass, and are extended to assert the two new headers.

---

## 2. Add `apple-touch-icon`

- **File:** `index.html`
- **Problem:** iOS Safari's "Add to Home Screen" doesn't read `site.webmanifest` — it looks for `<link rel="apple-touch-icon">` specifically. That tag doesn't exist, so an iPhone user adding the site currently gets an auto-generated screenshot thumbnail instead of the real brand icon, even though a usable icon (`public/icon-192.png`, or the existing `icon-512.png` scaled) already exists from the earlier PWA-icons work.
- **Do:** add one line near the existing `<link rel="manifest">` (around line 14 of `index.html`):
  ```html
  <link rel="apple-touch-icon" href="/icon-192.png" />
  ```
  192×192 is an acceptable size (iOS scales it down); if there's appetite for pixel-perfect correctness, generate a dedicated 180×180 PNG instead (`public/apple-touch-icon.png`) and point to that — but reusing the existing 192px asset is a reasonable one-line fix if a fresh export isn't worth the extra step.
- **Done when:** the tag is present and resolves to a real icon file (check in a browser dev tools network tab, or just confirm the referenced file exists in `public/`).

---

## 3. Prioritize the lead story's image load

- **Files:** `src/app/components/StoryFeed.jsx`
- **Problem:** `CardImage` doesn't currently receive `isLead` at all — `<CardImage story={story} />` is called with no lead flag (see the `CardShell` component), so every card, including the above-the-fold lead story, gets `loading="lazy"` uniformly. This is a minor/likely-inert issue in practice (browsers already avoid deferring images already in the initial viewport), but it's the kind of thing Lighthouse will flag on the LCP audit, and the fix is small.
- **Do:**
  1. Thread `isLead` through: change `<CardImage story={story} />` to `<CardImage story={story} isLead={isLead} />` inside `CardShell`.
  2. In `CardImage`, accept the new prop and branch the `loading`/`fetchPriority` attributes:
     ```jsx
     function CardImage({ story, isLead = false }) {
       const [failed, setFailed] = useState(false);
       const show = Boolean(story.image) && !failed;
       return (
         <div className={...}>
           {show ? (
             <img
               src={story.image}
               alt=""
               loading={isLead ? "eager" : "lazy"}
               fetchPriority={isLead ? "high" : undefined}
               className="..."
               onError={() => setFailed(true)}
             />
           ) : null}
         </div>
       );
     }
     ```
  3. Confirm this doesn't apply to the Cards view (`CardsView.jsx`) unless it has its own equivalent "first/lead card" concept — check that file before assuming the same pattern applies there; if Cards view has no lead-card distinction, leave it as-is rather than inventing one.
- **Done when:** the lead story's `<img>` renders with `loading="eager"` and `fetchPriority="high"` while every other card keeps `loading="lazy"`; existing `story-feed` component tests still pass (add one asserting the lead card's image has `loading="eager"` if no such assertion exists yet).

---

## Order

No dependencies between the three — ship as one PR or three, whichever fits your workflow. All are small enough to verify by hand in a few minutes each.
