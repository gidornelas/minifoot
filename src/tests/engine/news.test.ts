import { describe, expect, it } from "vitest";
import type { Club, Match } from "../../engine";
import {
  createLeagueSchedule,
  createRng,
  generateLeague,
  generateMatchNews,
  generateRoundNews,
  simulateRound,
  templateCount,
} from "../../engine";

describe("news engine", () => {
  it("ships at least 80 narrative templates", () => {
    expect(templateCount()).toBeGreaterThanOrEqual(80);
  });

  it("generates a coherent season-sized amount of news", () => {
    const generated = generateLeague(2_026);
    const schedule = createLeagueSchedule(generated.league);
    const rng = createRng(42);
    const newsCount = Array.from({ length: 38 }, (_, index) => index + 1).reduce((total, round) => {
      const matches = simulateRound({
        clubs: generated.clubs,
        league: generated.league,
        matches: schedule,
        players: generated.players,
        rng,
        round,
      });

      return (
        total +
        generateRoundNews({
          clubs: generated.clubs,
          matches,
          playerClubId: generated.league.clubIds[0] ?? "",
          players: generated.players,
          week: round,
        }).length
      );
    }, 0);

    expect(newsCount).toBeGreaterThanOrEqual(50);
    expect(newsCount).toBeLessThanOrEqual(100);
  });

  it("marks upset and comeback stories as special", () => {
    const clubs: Record<string, Club> = {
      favorite: createClub("favorite", "Favorito", "FAV", 90),
      underdog: createClub("underdog", "Azaroes", "AZA", 70),
    };
    const match: Match = {
      awayId: "favorite",
      competitionId: "serie-a",
      homeId: "underdog",
      id: "special-match",
      result: {
        attendance: 20_000,
        awayGoals: 1,
        awayRating: 6,
        events: [
          {
            description: "FAV abre o placar.",
            minute: 10,
            playerId: "p1",
            scoreAfter: [0, 1],
            type: "goal",
          },
          {
            description: "AZA vira no fim.",
            minute: 88,
            playerId: "p2",
            scoreAfter: [2, 1],
            type: "goal",
          },
        ],
        homeGoals: 2,
        homeRating: 8,
        manOfTheMatch: "p2",
        xgAway: 0.8,
        xgHome: 1.1,
      },
      round: 1,
      scheduledWeek: 1,
      seasonId: "season-1",
      status: "played",
    };
    const news = generateMatchNews({
      clubs,
      match,
      matches: [match],
      playerClubId: "underdog",
      players: {},
      week: 1,
    });

    expect(news.some((item) => item.tags?.includes("upset"))).toBe(true);
    expect(news.some((item) => item.tags?.includes("comeback"))).toBe(true);
    expect(news.filter((item) => item.importance === "special")).toHaveLength(2);
  });
});

function createClub(id: string, name: string, shortName: string, reputation: number): Club {
  return {
    budget: 0,
    city: "Teste",
    fanbase: 50,
    id,
    isPlayerControlled: false,
    leagueId: "serie-a",
    name,
    primaryColor: "#ffffff",
    reputation,
    secondaryColor: "#000000",
    shortName,
    squad: [],
    trophies: [],
    weeklySalaryBudget: 0,
  };
}
