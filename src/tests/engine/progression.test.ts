import { describe, expect, it } from "vitest";
import type { GameState } from "../../engine";
import {
  completeSeason,
  createLeagueSchedule,
  createRng,
  generateLeague,
  simulateRound,
  startNextSeason,
} from "../../engine";

describe("season progression", () => {
  it("rolls three seasons with relegation, promotion, retirements and regens", () => {
    let game = createGameState(2_026);
    const initialAverage = averageOverall(game);
    let retiredCount = 0;
    let regenCount = 0;

    for (let season = 1; season <= 3; season += 1) {
      game = playFullSeason(game);

      const record = game.history.at(-1);
      const league = Object.values(game.leagues)[0];

      expect(record?.season).toBe(season);
      expect(record?.relegatedClubIds).toHaveLength(4);
      expect(record?.promotedClubIds).toHaveLength(4);
      expect(league?.clubIds).toHaveLength(20);
      expect(league?.clubIds).toContain(game.playerClubId);
      expect(game.currentSeason.finished).toBe(true);
      expect(record?.championPoints).toBeGreaterThan(0);
      expect(record?.topScorerGoals).toBeGreaterThan(0);
      expect(record?.highestScoringMatchGoals).toBeGreaterThan(0);
      expect(game.records?.highestPoints?.value).toBeGreaterThan(0);
      expect(game.records?.titleCounts).not.toEqual({});

      retiredCount += record?.retiredPlayerIds?.length ?? 0;
      regenCount += record?.regenPlayerIds?.length ?? 0;

      game = startNextSeason({ game, leagueId: league?.id ?? "" });

      expect(game.currentSeason.number).toBe(season + 1);
      expect(Object.values(game.matches)).toHaveLength(380);
      expect(Object.values(game.matches).every((match) => match.status === "scheduled")).toBe(true);
    }

    expect(retiredCount).toBeGreaterThan(0);
    expect(regenCount).toBeGreaterThan(0);
    expect(averageOverall(game)).toBeLessThanOrEqual(initialAverage + 2);
  });
});

function createGameState(seed: number): GameState {
  const generated = generateLeague(seed);
  const playerClubId = generated.league.clubIds[0];

  if (!playerClubId) {
    throw new Error("Expected generated player club.");
  }

  const clubs = Object.fromEntries(
    Object.entries(generated.clubs).map(([clubId, club]) => [
      clubId,
      { ...club, isPlayerControlled: clubId === playerClubId },
    ]),
  );
  const schedule = createLeagueSchedule(generated.league);

  return {
    achievements: [],
    clubs,
    createdAt: 0,
    currentSeason: {
      competitions: [{ id: generated.league.id, type: "league" }],
      currentWeek: 1,
      finished: false,
      number: 1,
      totalWeeks: 41,
    },
    history: [],
    leagues: { [generated.league.id]: generated.league },
    matches: Object.fromEntries(schedule.map((match) => [match.id, match])),
    newsLog: [],
    playerClubId,
    playerName: "Teste",
    players: generated.players,
    records: { titleCounts: {} },
    rngState: generated.rngState,
    seed,
    version: 1,
  };
}

function playFullSeason(game: GameState): GameState {
  const league = Object.values(game.leagues)[0];

  if (!league) {
    throw new Error("Expected league.");
  }

  const rng = createRng(game.rngState);
  const matches = { ...game.matches };
  const maxRound = league.clubIds.length * 2 - 2;

  for (let round = 1; round <= maxRound; round += 1) {
    const played = simulateRound({
      clubs: game.clubs,
      league,
      matches: Object.values(matches),
      players: game.players,
      rng,
      round,
    });

    for (const match of played) {
      matches[match.id] = match;
    }
  }

  return completeSeason({
    game: {
      ...game,
      currentSeason: {
        ...game.currentSeason,
        currentWeek: maxRound + 1,
        finished: true,
      },
      matches,
      rngState: rng.getState(),
    },
    leagueId: league.id,
  });
}

function averageOverall(game: GameState): number {
  const league = Object.values(game.leagues)[0];

  if (!league) {
    return 0;
  }

  const playerIds = new Set(league.clubIds.flatMap((clubId) => game.clubs[clubId]?.squad ?? []));
  const players = Array.from(playerIds)
    .map((playerId) => game.players[playerId])
    .filter((player) => player !== undefined);

  return players.reduce((sum, player) => sum + player.overall, 0) / players.length;
}
