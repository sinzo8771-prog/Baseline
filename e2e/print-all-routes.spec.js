import { expect } from "@playwright/test";
import { test, trackPageErrors } from "./support.js";

// The print contract, applied to every route rather than /edition alone.
// Page chrome is clipped, decorative canvases are dropped, and the masthead
// plus the page's own heading survive onto paper.
const STATIC_ROUTES = [
  "/",
  "/edition",
  "/hype-index",
  "/sources",
  "/about",
  "/methodology",
  "/saved",
  "/week-in-review",
  "/no-such-page",
];

async function expectPrintContract(page) {
  // Page chrome is clipped in print.
  await expect(page.locator(".site-nav")).toBeHidden();
  await expect(page.locator(".theme-toggle")).toBeHidden();
  // The canvas effects (Asciify / DecryptReveal / VHS) are display:none.
  const canvases = page.locator("canvas");
  if (await canvases.count()) {
    await expect(canvases.first()).toBeHidden();
  }
  // The masthead and the route's own heading survive.
  await expect(page.locator(".masthead-title")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Nothing spills past the printed page width.
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

for (const path of STATIC_ROUTES) {
  test(`print stylesheet keeps ${path} printable`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.emulateMedia({ media: "print" });
    await page.goto(path);
    await expect(page.locator(".masthead-title")).toBeVisible();
    await expectPrintContract(page);
    expect(errors).toEqual([]);
  });
}

test("print stylesheet keeps a source profile and a story permalink printable", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.emulateMedia({ media: "print" });

  // /sources/:name needs a real name, so borrow the first link off /sources.
  await page.goto("/sources");
  const name = (await page.locator("#source-list a").first().getAttribute("href")) ?? "";
  await page.goto(name);
  await expect(page.locator(".masthead-title")).toBeVisible();
  await expectPrintContract(page);

  // /story/:id needs a real id, so borrow the edition's lead article.
  await page.goto("/edition");
  const lead = page.locator('article[id^="story-"]').first();
  await expect(lead).toBeVisible();
  const id = (await lead.getAttribute("id")).replace("story-", "");
  await page.goto(`/story/${id}`);
  await expectPrintContract(page);

  expect(errors).toEqual([]);
});