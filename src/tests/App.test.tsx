import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { useGameStore } from "../store/game.store";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    const store = useGameStore.getState();
    store.setActiveView("home");
    store.selectPlayer(null);
    store.pickBenchPlayer(null);
    store.resetTactic();
    store.acknowledgeAction();
  });

  it("renders the Sprint 4 dashboard shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("minifoot.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Classificacao" })).toBeInTheDocument();
  });

  it("navigates to squad by keyboard and opens a player detail with Enter", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("2");

    expect(screen.getByRole("heading", { name: /Rubro Rio/i })).toBeInTheDocument();

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const firstPlayerRow = rows[1];

    firstPlayerRow?.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens the generated shortcuts dialog", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("?");

    expect(screen.getByRole("heading", { name: "Atalhos" })).toBeInTheDocument();
    expect(screen.getByText("Salvar")).toBeInTheDocument();
  });

  it("persists tactical formation changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard("3");
    await user.click(screen.getByRole("button", { name: "4-3-3" }));

    expect(useGameStore.getState().tactic.formation).toBe("4-3-3");
    expect(localStorage.getItem("minifoot-career-ui")).toContain("4-3-3");
  });
});
