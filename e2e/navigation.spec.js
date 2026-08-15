import { expect } from "@playwright/test";
import { test, trackPageErrors } from "./support.js";

const ROUTES = [
  { path: "/", heading: /A quiet interface for a very loud industry/i },
  { path: "/hype-index", heading: "The Hype Index" },
  { path: "/sources", heading: "Who's Shouting?" },
  { path: "/saved", heading: "Saved for later" },
  { path: "/week-in-review", heading: "The Week in Review" },
  { path: "/about", heading: "About" },
  { path: "/methodology", heading: "Methodology" },
];

for (const { path, heading } of ROUTES) {
  test(`renders ${path} with its heading and no errors`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("renders the edition with a full set of stories and no errors", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/edition");
  await expect(page.getByPlaceholder("Search the edition…")).toBeVisible();
  const cards = page.locator('article[id^="story-"]');
  await expect(cards).toHaveCount(5);
  expect(errors).toEqual([]);
});

test("renders a story permalink reachable from the edition", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/edition");
  const lead = page.locator('article[id^="story-"]').first();
  await expect(lead).toBeVisible();
  const id = (await lead.getAttribute("id")).replace("story-", "");
  await page.goto(`/story/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});