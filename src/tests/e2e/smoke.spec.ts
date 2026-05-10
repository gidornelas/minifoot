import { expect, test } from "@playwright/test";

test("plays a Sprint 9 keyboard-only path", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByRole("heading", { name: "minifoot." })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Ana");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
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

test("finishes a season and starts the next one with mouse", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Comecar carreira" }).click();

  const advanceButton = page.getByRole("button", { name: "Avancar rodada" }).first();

  for (let round = 1; round <= 38; round += 1) {
    await advanceButton.click();
  }

  await expect(page.getByRole("heading", { level: 2, name: "Fim da temporada 1" })).toBeVisible();
  await expect(page.getByText("Promovidos")).toBeVisible();
  await expect(page.getByText("Rebaixados")).toBeVisible();

  await page.getByRole("button", { name: "Iniciar proxima temporada" }).click();

  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByText("1/41")).toBeVisible();
});

test("keeps critical accessibility contracts", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Comecar carreira" }).click();

  await expect(page.locator("h1")).toHaveCount(1);

  const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
    buttons
      .filter((button) => (button.textContent ?? "").trim().length === 0)
      .filter((button) => !button.getAttribute("aria-label") && !button.getAttribute("title"))
      .map((button) => button.outerHTML),
  );

  expect(unnamedButtons).toEqual([]);
});
