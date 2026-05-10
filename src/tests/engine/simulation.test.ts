import { describe, expect, it } from "vitest";
import {
  calculateLeagueTable,
  createLeagueSchedule,
  createRng,
  generateLeague,
  simulateMatch,
  simulateRound,
  simulateSeason,
} from "../../engine";

describe("match simulation", () => {
  it("is deterministic for the same clubs and seed", () => {
    const generated = generateLeague(2_026);
    const [homeId, awayId] = generated.league.clubIds;

    if (!homeId || !awayId) {
      throw new Error("League needs at least two clubs.");
    }

    const first = simulateMatch({
      home: generated.clubs[homeId],
      away: generated.clubs[awayId],
      players: generated.players,
      rng: createRng(77),
    });
    const second = simulateMatch({
      home: generated.clubs[homeId],
      away: generated.clubs[awayId],
      players: generated.players,
      rng: createRng(77),
    });

    expect(second).toEqual(first);
    expect(first.events.map((event) => event.minute)).toEqual(
      [...first.events].map((event) => event.minute).sort((a, b) => a - b),
    );
    expect(first.events.every((event) => event.description.length > 0)).toBe(true);
  });

  it("keeps balanced match goal average inside the target band", () => {
    const generated = generateLeague(10);
    const [homeId, awayId] = generated.league.clubIds;

    if (!homeId || !awayId) {
      throw new Error("League needs at least two clubs.");
    }

    let goals = 0;
    const matches = 10_000;
    const rng = createRng(1_234);

    for (let index = 0; index < matches; index += 1) {
      const result = simulateMatch({
        home: generated.clubs[homeId],
        away: generated.clubs[awayId],
        players: generated.players,
        rng,
      });
      goals += result.homeGoals + result.awayGoals;
    }

    const averageGoals = goals / matches;
    expect(averageGoals).toBeGreaterThanOrEqual(2.4);
    expect(averageGoals).toBeLessThanOrEqual(3.0);
  });
});

describe("league simulation", () => {
  it("creates a 38-round double round-robin schedule for 20 clubs", () => {
    const generated = generateLeague(2_026);
    const schedule = createLeagueSchedule(generated.league);

    expect(schedule).toHaveLength(380);
    expect(new Set(schedule.map((match) => match.round)).size).toBe(38);
    expect(schedule.filter((match) => match.round === 1)).toHaveLength(10);
  });

  it("simulates a round and calculates a sorted table", () => {
    const generated = generateLeague(2_026);
    const schedule = createLeagueSchedule(generated.league);
    const roundMatches = simulateRound({
      league: generated.league,
      clubs: generated.clubs,
      players: generated.players,
      matches: schedule,
      round: 1,
      rng: createRng(55),
    });
    const table = calculateLeagueTable(generated.league, roundMatches);

    expect(roundMatches).toHaveLength(10);
    expect(roundMatches.every((match) => match.status === "played")).toBe(true);
    expect(table).toHaveLength(20);
    expect(table[0]?.points).toBeGreaterThanOrEqual(table[1]?.points ?? 0);
    expect(table.reduce((sum, row) => sum + row.played, 0)).toBe(20);
  });

  it("simulates a full season in under one second", () => {
    const generated = generateLeague(2_026);
    const startedAt = performance.now();
    const seasonMatches = simulateSeason({
      league: generated.league,
      clubs: generated.clubs,
      players: generated.players,
      rng: createRng(99),
    });
    const elapsed = performance.now() - startedAt;

    expect(seasonMatches).toHaveLength(380);
    expect(seasonMatches.every((match) => match.status === "played")).toBe(true);
    expect(elapsed).toBeLessThan(1_000);
  });
});
