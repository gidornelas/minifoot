import { expect, test } from "@playwright/test";

test("navigates the Sprint 4 shell by keyboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await page.keyboard.press("2");
  await expect(page.getByRole("heading", { name: "Rubro Rio" })).toBeVisible();

  await page.keyboard.press("3");
  await expect(page.getByRole("heading", { name: "4-4-2" })).toBeVisible();
});
