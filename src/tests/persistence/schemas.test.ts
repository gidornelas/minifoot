import { describe, expect, it } from "vitest";
import { type GameState, generateLeague } from "../../engine";
import { GameStateSchema } from "../../persistence/schemas";

describe("persistence schemas", () => {
  it("accepts a generated league inside a game state", () => {
    const generated = generateLeague(2_026);
    const playerClubId = generated.league.clubIds[0];

    if (playerClubId === undefined) {
      throw new Error("Generated league must contain at least one club.");
    }

    const state: GameState = {
      version: 1,
      seed: 2_026,
      rngState: generated.rngState,
      createdAt: 0,
      playerName: "Tecnico Teste",
      playerClubId,
      currentSeason: {
        number: 1,
        currentWeek: 0,
        totalWeeks: 41,
        competitions: [{ id: generated.league.id, type: "league" }],
        finished: false,
      },
      history: [],
      clubs: generated.clubs,
      players: generated.players,
      leagues: {
        [generated.league.id]: generated.league,
      },
      matches: {},
      newsLog: [],
      achievements: [],
    };

    expect(GameStateSchema.safeParse(state).success).toBe(true);
  });
});
