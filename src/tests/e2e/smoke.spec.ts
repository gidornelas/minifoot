import { expect, test } from "@playwright/test";

test("shows the Sprint 0 shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "minifoot." })).toBeVisible();
});
