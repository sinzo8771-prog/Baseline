import { expect } from "@playwright/test";
import { test } from "./support.js";

test("the story modal traps Tab focus and Escape restores it to the card", async ({ page }) => {
  await page.goto("/edition");
  const cards = page.locator('article[id^="story-"]');
  await expect(cards).toHaveCount(5);

  const openButton = cards.first().getByRole("button", { name: /open story/i });
  await openButton.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close story" })).toBeFocused();

  // Tab well past the number of focusable elements inside the dialog; the trap
  // keeps focus cycling inside so the page behind never receives it.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
  }
  const inside = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-modal="true"]');
    return d ? d.contains(document.activeElement) : false;
  });
  expect(inside).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(openButton).toBeFocused();
});