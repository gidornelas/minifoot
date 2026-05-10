import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { calculateTransferValue } from "../engine";
import { useGameStore } from "../store/game.store";
import { playerFullName } from "../store/selectors";
import { TransferMarketView } from "../ui/features/transfers/TransferMarketView";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetCareer();
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

  it("advances a round from the keyboard and opens match day", async () => {
    const user = userEvent.setup();
    render(<App />);

    fireEvent.keyDown(window, { code: "Space", key: " " });

    expect(screen.getByRole("heading", { name: "Match Day" })).toBeInTheDocument();
    expect(screen.getByText("Rodada 1")).toBeInTheDocument();
    expect(useGameStore.getState().lastRoundMatchIds).toHaveLength(10);
    expect(useGameStore.getState().game.currentSeason.currentWeek).toBe(2);

    await user.click(screen.getByRole("button", { name: "Ver tabela" }));

    expect(screen.getByRole("heading", { name: "Serie A Minimalista" })).toBeInTheDocument();
  });

  it("creates a market offer from the transfer screen", async () => {
    const user = userEvent.setup();
    const state = useGameStore.getState();
    const playerClub = state.game.clubs[state.game.playerClubId];

    if (!playerClub) {
      throw new Error("Expected player club.");
    }

    const candidate = Object.values(state.game.players).find(
      (player) =>
        player.clubId !== state.game.playerClubId &&
        calculateTransferValue(player) < playerClub.budget * 0.55,
    );

    if (!candidate) {
      throw new Error("Expected affordable transfer candidate.");
    }

    render(<TransferMarketView />);

    await user.type(
      screen.getByPlaceholderText("Buscar jogador ou clube"),
      playerFullName(candidate),
    );
    await user.click(screen.getAllByRole("button", { name: "Oferta" })[0] as HTMLElement);
    await user.click(screen.getByRole("button", { name: "Enviar oferta" }));

    expect(useGameStore.getState().transferOffers).toHaveLength(1);
    expect(screen.getByText(/Contraproposta|recusada|contratado/i)).toBeInTheDocument();
  });
});
