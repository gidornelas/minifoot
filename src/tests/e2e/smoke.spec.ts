import { expect, test } from "@playwright/test";

test("plays a Sprint 7 keyboard path", async ({ page }) => {
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

  await page.keyboard.press("5");
  await expect(page.getByRole("heading", { name: "Janela aberta" })).toBeVisible();
  await page.getByRole("button", { name: "Oferta" }).first().click();
  await page.getByRole("button", { name: "Enviar oferta" }).click();
  await expect(page.getByText(/Contraproposta recebida|Oferta recusada|contratado/i)).toBeVisible();

  await page.keyboard.press("6");
  await expect(page.getByRole("heading", { level: 2, name: "Noticias" })).toBeVisible();
  await page.getByRole("button", { name: "Especiais" }).click();
  await expect(page.getByRole("button", { name: "Especiais" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
