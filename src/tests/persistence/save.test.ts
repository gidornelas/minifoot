import { describe, expect, it, vi } from "vitest";
import {
  calculateLeagueTable,
  createLeagueSchedule,
  createRng,
  type GameState,
  generateLeague,
  type Match,
  simulateRound,
} from "../../engine";
import {
  CURRENT_SAVE_VERSION,
  createAutosave,
  createMemorySaveAdapter,
  deleteSaveSlot,
  loadGameState,
  loadSaveSlot,
  saveGameState,
  saveSlot,
} from "../../persistence/save";

describe("save persistence", () => {
  it("saves and loads a game state after five simulated rounds", async () => {
    const adapter = createMemorySaveAdapter();
    const generated = generateLeague(2_026);
    const schedule = createLeagueSchedule(generated.league);
    const playedMatches: Match[] = [];
    const rng = createRng(generated.rngState);

    for (let round = 1; round <= 5; round += 1) {
      playedMatches.push(
        ...simulateRound({
          league: generated.league,
          clubs: generated.clubs,
          players: generated.players,
          matches: schedule,
          round,
          rng,
        }),
      );
    }

    const state = createTestState({
      generated,
      matches: Object.fromEntries(playedMatches.map((match) => [match.id, match])),
      currentWeek: 8,
      rngState: rng.getState(),
    });
    await saveSlot(adapter, 1, state);
    const loaded = await loadSaveSlot(adapter, 1);

    expect(loaded).toEqual(state);
    expect(calculateLeagueTable(generated.league, Object.values(loaded.matches))[0]?.played).toBe(
      5,
    );
  });

  it("validates save payloads when loading", () => {
    expect(() => loadGameState({ version: CURRENT_SAVE_VERSION })).toThrow();
  });

  it("deletes save slots", async () => {
    const adapter = createMemorySaveAdapter();
    const generated = generateLeague(1);
    const state = createTestState({ generated });

    await saveSlot(adapter, 2, state);
    await deleteSaveSlot(adapter, 2);

    await expect(loadSaveSlot(adapter, 2)).rejects.toThrow("Save slot 2 not found.");
  });

  it("debounces autosave writes", async () => {
    vi.useFakeTimers();
    const adapter = createMemorySaveAdapter();
    const generated = generateLeague(5);
    const autosave = createAutosave(adapter, 50);
    const first = createTestState({ generated, currentWeek: 1 });
    const second = createTestState({ generated, currentWeek: 2 });

    autosave.schedule(first);
    autosave.schedule(second);

    await vi.advanceTimersByTimeAsync(49);
    await expect(loadSaveSlot(adapter, "autosave")).rejects.toThrow();

    await vi.advanceTimersByTimeAsync(1);
    await autosave.flush();

    expect((await loadSaveSlot(adapter, "autosave")).currentSeason.currentWeek).toBe(2);
    vi.useRealTimers();
  });

  it("round-trips through serialization helpers", () => {
    const generated = generateLeague(9);
    const state = createTestState({ generated });
    const raw = saveGameState(state);

    expect(loadGameState(raw)).toEqual(state);
  });
});

type Generated = ReturnType<typeof generateLeague>;

function createTestState(input: {
  generated: Generated;
  matches?: Record<string, Match>;
  currentWeek?: number;
  rngState?: number;
}): GameState {
  const playerClubId = input.generated.league.clubIds[0];

  if (!playerClubId) {
    throw new Error("Generated league has no player club.");
  }

  return {
    version: CURRENT_SAVE_VERSION,
    seed: 2_026,
    rngState: input.rngState ?? input.generated.rngState,
    createdAt: 0,
    playerName: "Tecnico Teste",
    playerClubId,
    currentSeason: {
      number: 1,
      currentWeek: input.currentWeek ?? 0,
      totalWeeks: 41,
      competitions: [{ id: input.generated.league.id, type: "league" }],
      finished: false,
    },
    history: [],
    clubs: input.generated.clubs,
    players: input.generated.players,
    leagues: {
      [input.generated.league.id]: input.generated.league,
    },
    matches: input.matches ?? {},
    newsLog: [],
    achievements: [],
  };
}
