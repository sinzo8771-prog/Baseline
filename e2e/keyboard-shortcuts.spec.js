import { expect } from "@playwright/test";
import { test } from "./support.js";

test("j/k move the selection and / focuses the search box", async ({ page }) => {
  await page.goto("/edition");
  const cards = page.locator('article[id^="story-"]');
  await expect(cards).toHaveCount(5);

  const active = () => page.locator("article.border-primary.ring-2");
  await page.keyboard.press("j");
  await expect(active()).toHaveCount(1);
  const firstId = await active().getAttribute("id");

  await page.keyboard.press("j");
  await expect(active()).toHaveCount(1);
  const secondId = await active().getAttribute("id");
  expect(secondId).not.toBe(firstId);

  await page.keyboard.press("k");
  await expect(active()).toHaveAttribute("id", firstId);

  await page.keyboard.press("/");
  await expect(page.getByPlaceholder("Search the edition…")).toBeFocused();
});

test("j/k never hijack the selection while typing in the search input", async ({ page }) => {
  await page.goto("/edition");
  const cards = page.locator('article[id^="story-"]');
  await expect(cards).toHaveCount(5);

  const search = page.getByPlaceholder("Search the edition…");
  await search.click();
  await search.fill("OpenAI");

  await page.keyboard.press("j");
  await page.keyboard.press("k");

  await expect(search).toBeFocused();
  expect(await page.locator("article.border-primary.ring-2").count()).toBe(0);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});