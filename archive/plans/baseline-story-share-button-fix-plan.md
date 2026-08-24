# The Baseline — Fix duplicate "Copy link" button on story pages

**Repo:** https://github.com/sinzo8771-prog/Baseline
One file, one bug.

---

## Fix: two buttons both read "Copy link" on desktop

- **File:** `src/app/pages/StoryPage.jsx`
- **Bug:** when `navigator.share` isn't available (true on most desktop browsers — Web Share API is mainly mobile/PWA-context), `onShare()` already falls straight through to calling `onCopy()` (see the existing comment: *"the copy button stays for everyone else"*). But the **first** button's label also falls back to `"Copy link"` whenever `canShare` is false:
  ```jsx
  {canShare ? "Share" : "Copy link"}
  ```
  So on desktop, a reader sees two adjacent buttons — one with a `Share2` icon, one with a `Copy` icon — both labeled "Copy link," both doing the exact same thing. Confusing, and redundant UI for the majority of readers (desktop).
- **Fix — hide the first button entirely when there's nothing distinct for it to do**, rather than relabeling it to duplicate the second button:
  ```jsx
  {canShare ? (
    <button
      type="button"
      onClick={onShare}
      className="btn-outline inline-flex items-center gap-2"
    >
      <Share2 className="size-3.5" aria-hidden="true" />
      Share
    </button>
  ) : null}
  <button
    type="button"
    onClick={onCopy}
    className={cn("btn-outline inline-flex items-center gap-2", copied && "border-primary text-primary")}
  >
    <Copy className="size-3.5" aria-hidden="true" />
    {copied ? "Link copied" : "Copy link"}
  </button>
  ```
  This keeps the exact same behavior on mobile/PWA contexts (Share button appears, opens the native share sheet, falls back to copy if the user dismisses it — that fallback logic in `onShare` itself is fine and doesn't need to change) while removing the redundant button entirely on desktop, where only one clear "Copy link" action remains.
- **Don't change `onShare`'s internal fallback-to-copy logic** — that's correct and unrelated to this bug; it's specifically about what happens if a user opens the native share sheet and then cancels/it fails, which is a different case from "the button never had anything distinct to offer in the first place."
- **Verify:** check `test/components/story-page.test.jsx` for any existing test asserting button text/count — if one exists that currently expects both buttons present regardless of `canShare`, update it to reflect the new conditional rendering (mock `navigator.share` as both present and absent, assert only one "Copy link"-labeled button renders when absent, and a distinct "Share" + "Copy link" pair when present).
- **Done when:** with `navigator.share` mocked as unavailable, only one button (unambiguously "Copy link") renders in that button row; with it mocked as available, both "Share" and "Copy link" render as distinct, differently-labeled buttons. `npm run test:all` green.
