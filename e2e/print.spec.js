import { expect } from "@playwright/test";
import { test } from "./support.js";

test("print stylesheet hides chrome but keeps the masthead and headlines", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await page.goto("/edition");

  const cards = page.locator('article[id^="story-"]');
  await expect(cards).toHaveCount(5);

  // Page chrome is clipped in print.
  await expect(page.locator(".site-nav")).toBeHidden();
  await expect(page.locator(".theme-toggle")).toBeHidden();
  // The canvas effects (Asciify / DecryptReveal / VHS) are display:none.
  await expect(page.locator("canvas").first()).toBeHidden();

  // The masthead and the edition's headlines survive.
  await expect(page.locator(".masthead-title")).toBeVisible();
  await expect(cards.first().locator("h2")).toBeVisible();
});