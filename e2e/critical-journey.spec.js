import { expect } from "@playwright/test";
import { test, trackPageErrors } from "./support.js";

// The critical reader journey from the implementation plan (§15): land,
// understand the score, read, search, filter, open, save, return. Runs on the
// deterministic mocked fixtures from support.js.
test("critical journey: landing → edition → search → filter → story → save → saved", async ({ page }) => {
  const errors = trackPageErrors(page);

  // Landing: the Hype Index hero is the first thing on the page.
  await page.goto("/");
  await expect(page.getByText("Today's Hype Index")).toBeVisible();
  await expect(page.locator(".fp-hero-score .val")).toContainText("%");
  await expect(page.getByText(/headline intensity across today's tracked ai news/i)).toBeVisible();

  // Into the edition via the primary CTA. The hero and the closing band both
  // carry a "Read today's edition" link; the hero's is the first in the DOM.
  await page.getByRole("link", { name: /read today's edition/i }).first().click();
  await expect(page).toHaveURL(/\/edition$/);
  await expect(page.locator("main article").first()).toBeVisible();
  const totalCards = await page.locator("main article").count();

  // Search narrows to the one matching headline, then clears.
  const search = page.getByLabel("Search the edition");
  await search.fill("OpenAI ships");
  await expect(page.locator("main article")).toHaveCount(1);
  await search.fill("");
  await expect(page.locator("main article")).toHaveCount(totalCards);

  // Filter: open the disclosure, apply a spin chip from inside it.
  await page.getByRole("button", { name: /^Filter/ }).click();
  const panel = page.locator("#edition-filters");
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: /^Measured/ }).click();
  await expect(page.getByText(/searching \d+ stor/i)).toBeVisible();
  await page.getByRole("button", { name: /^Filter/ }).click(); // close again

  // Open the first story; the original source is one hop away.
  await page.locator("main article button[aria-label^='Open story']").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /read original/i })).toHaveAttribute("href", /^https:/);
  await expect(dialog.getByRole("link", { name: /how is this calculated\?/i })).toBeVisible();
  await dialog.getByRole("button", { name: /close story/i }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Save the lead, then find it again on the Saved page.
  await page.locator("main article").first().getByRole("button", { name: /^Save for later/ }).click();
  await page.getByRole("link", { name: "Saved", exact: true }).click();
  await expect(page).toHaveURL(/\/saved$/);
  await expect(page.getByText(/1 saved\./)).toBeVisible();
  await expect(page.getByText("OpenAI ships a faster model")).toBeVisible();

  expect(errors).toEqual([]);
});
