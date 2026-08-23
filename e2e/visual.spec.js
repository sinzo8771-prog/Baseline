import { expect } from "@playwright/test";
import { test, trackPageErrors } from "./support.js";

// Visual regression on the two core surfaces, desktop + mobile. The
// decorative canvas layers (Asciify wordmark, DecryptReveal tagline) are
// masked: glyph rasterization varies across machines, which is exactly the
// noise these snapshots should not be about. Everything else — layout,
// typography, hierarchy, the hero — is the contract.
const SHOTS = [
  { name: "landing-desktop", path: "/", viewport: { width: 1440, height: 900 } },
  { name: "edition-desktop", path: "/edition", viewport: { width: 1440, height: 900 } },
  { name: "landing-mobile", path: "/", viewport: { width: 390, height: 844 } },
  { name: "edition-mobile", path: "/edition", viewport: { width: 390, height: 844 } },
];

for (const shot of SHOTS) {
  test(`visual regression: ${shot.name}`, async ({ page }) => {
    // Capture under reduced motion: MotionConfig(reducedMotion="user")
    // renders the whileInView reveals at full opacity immediately, so
    // below-the-fold sections can't be caught mid-reveal (or unrevealed)
    // in a fullPage capture. This doubles as the plan's reduced-motion
    // snapshot pass.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(shot.viewport);
    await page.goto(shot.path);
    await expect(page.locator("main article, main section").first()).toBeVisible();
    // Force every below-the-fold lazy mount (the footer's VHS overlay) by
    // scrolling through the page once. "instant" bypasses the app's CSS
    // smooth-scroll so the page is guaranteed to be back at the top before
    // the capture.
    await page.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 500));
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    // Let the idle decorative mount and the streaming edition settle.
    await page.waitForTimeout(3500);
    // Volatile overlays go away entirely rather than being masked: a mask
    // over an element that switches presence between runs is itself a diff.
    // The toast is fixed-position and the VHS canvas overlays the footer,
    // so hiding them shifts no layout.
    await page.addStyleTag({
      content: [
        "#toast-region, footer canvas { display: none !important; }",
        // framer's reducedMotion keeps opacity fades, so whileInView reveals
        // can still be caught un-fired in a fullPage capture. Force every
        // motion-wrapped element fully visible (!important beats inline).
        "[style*='opacity'] { opacity: 1 !important; }",
      ].join("\n"),
    });
    await expect(page).toHaveScreenshot(`${shot.name}.png`, {
      fullPage: true,
      animations: "disabled",
      // Sub-pixel rounding at mask boundaries (the masthead canvas has a
      // fractional height) shifts a ~1% strip of edge pixels between runs;
      // a real regression is an order of magnitude larger.
      maxDiffPixelRatio: 0.02,
      // The masthead's Asciify/DecryptReveal canvases always exist after the
      // idle mount (requestIdleCallback timeout guarantees it); their glyph
      // rasterization varies per machine, so they stay masked.
      mask: [page.locator(".masthead canvas")],
    });
  });
}

test("reduced motion: edition renders, decorative loops stay quiet, no errors", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/edition");
  await expect(page.locator("main article").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Filter/ })).toBeVisible();
  await page.waitForTimeout(3500);
  expect(errors).toEqual([]);
});
