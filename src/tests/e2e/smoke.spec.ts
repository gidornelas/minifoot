import { expect, test } from "@playwright/test";

test("plays a Sprint 5 keyboard path", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await page.keyboard.press("2");
  await expect(page.getByRole("heading", { name: "Rubro Rio" })).toBeVisible();

  await page.keyboard.press("3");
  await expect(page.getByRole("heading", { name: "4-4-2" })).toBeVisible();

  await page.keyboard.press("Escape");
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Match Day" })).toBeVisible();

  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Ver tabela" }).click();
  await expect(page.getByRole("heading", { name: "Serie A Minimalista" })).toBeVisible();
});
