import { expect } from "@playwright/test";
import { test } from "./support.js";

test("Control+k opens the palette and Enter navigates to a page", async ({ page }) => {
  await page.goto("/");
  // Wait for the app to mount before sending the hotkey: the palette listener
  // attaches on mount, and pressing too early would silently miss it. The
  // masthead wordmark is stable chrome; landing headlines are data-driven.
  await expect(page.getByRole("link", { name: /the baseline/i }).first()).toBeVisible();
  await page.keyboard.press("Control+k");

  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  const input = page.getByRole("searchbox", { name: "Search stories and pages" });
  await expect(input).toBeFocused();

  await input.fill("hype index");
  const option = dialog.getByRole("option", { name: /The Hype Index/i });
  await expect(option).toBeVisible();
  await expect(option).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/hype-index$/);
  await expect(page.getByRole("heading", { level: 1, name: "The Hype Index" })).toBeVisible();
});

test("arrows move the palette selection; Enter opens the selected story", async ({ page }) => {
  await page.goto("/edition");
  const cards = page.locator('article[id^="story-"]');
  await expect(cards).toHaveCount(5);

  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  const input = page.getByRole("searchbox", { name: "Search stories and pages" });
  await input.fill("openai");

  const options = dialog.getByRole("option");
  await expect(options).toHaveCount(2);
  const first = options.nth(0);
  await expect(first).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowDown");
  await expect(first).toHaveAttribute("aria-selected", "false");
  await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowUp");
  await expect(first).toHaveAttribute("aria-selected", "true");

  const title = (await first.locator("span.text-sm").textContent()).trim();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/story\//);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
});

test("Escape closes the palette without navigating", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /the baseline/i }).first()).toBeVisible();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/http:\/\/localhost:4173\/?$/);
});