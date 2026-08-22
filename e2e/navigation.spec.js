import { expect } from "@playwright/test";
import { test, trackPageErrors } from "./support.js";

const ROUTES = [
  // The landing h1 is the lead story's headline (data-driven), so anchor on
  // whatever h1 the front page prints rather than a fixed string.
  { path: "/", heading: null },
  { path: "/hype-index", heading: "The Hype Index" },
  { path: "/sources", heading: "Who's Shouting?" },
  { path: "/saved", heading: /Saved for Later/i },
  { path: "/week-in-review", heading: "Week in Review" },
  { path: "/about", heading: /About The Baseline/i },
  { path: "/methodology", heading: /How the Hype Index works/i },
];

for (const { path, heading } of ROUTES) {
  test(`renders ${path} with its heading and no errors`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto(path);
    if (heading) {
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
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