import type { Club, League, Match, Player } from "../domain";
import type { Rng } from "../rng";
import { simulateMatch } from "./match";

export interface SimulateRoundInput {
  league: League;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  matches: readonly Match[];
  round: number;
  rng: Rng;
}

export interface SimulateSeasonInput {
  league: League;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  rng: Rng;
}

export function createLeagueSchedule(league: League): Match[] {
  if (league.clubIds.length % 2 !== 0) {
    throw new Error("Round-robin schedule requires an even number of clubs.");
  }

  const teams = [...league.clubIds];
  const roundsPerLeg = teams.length - 1;
  const gamesPerRound = teams.length / 2;
  const firstLeg: Match[] = [];

  for (let roundIndex = 0; roundIndex < roundsPerLeg; roundIndex += 1) {
    for (let gameIndex = 0; gameIndex < gamesPerRound; gameIndex += 1) {
      const first = teams[gameIndex];
      const second = teams[teams.length - 1 - gameIndex];

      if (!first || !second) {
        throw new Error("Invalid schedule state.");
      }

      const shouldFlipHome = (roundIndex + gameIndex) % 2 === 0;
      const homeId = shouldFlipHome ? second : first;
      const awayId = shouldFlipHome ? first : second;
      const round = roundIndex + 1;

      firstLeg.push(createScheduledMatch(league.id, round, homeId, awayId));
    }

    const fixed = teams[0];
    const rotated = teams.slice(1);
    const last = rotated.pop();

    if (!fixed || !last) {
      throw new Error("Invalid round-robin rotation.");
    }

    teams.splice(0, teams.length, fixed, last, ...rotated);
  }

  const secondLeg = firstLeg.map((match) =>
    createScheduledMatch(league.id, match.round + roundsPerLeg, match.awayId, match.homeId),
  );

  return [...firstLeg, ...secondLeg];
}

export function simulateRound(input: SimulateRoundInput): Match[] {
  const roundMatches = input.matches.filter((match) => match.round === input.round);

  return roundMatches.map((match) => {
    const home = input.clubs[match.homeId];
    const away = input.clubs[match.awayId];

    if (!home || !away) {
      throw new Error(`Missing club for match ${match.id}.`);
    }

    return {
      ...match,
      status: "played",
      result: simulateMatch({
        home,
        away,
        players: input.players,
        rng: input.rng,
      }),
    };
  });
}

export function simulateSeason(input: SimulateSeasonInput): Match[] {
  const schedule = createLeagueSchedule(input.league);

  return Array.from(
    { length: input.league.clubIds.length * 2 - 2 },
    (_, index) => index + 1,
  ).flatMap((round) =>
    simulateRound({
      league: input.league,
      clubs: input.clubs,
      players: input.players,
      matches: schedule,
      round,
      rng: input.rng,
    }),
  );
}

function createScheduledMatch(
  competitionId: string,
  round: number,
  homeId: string,
  awayId: string,
): Match {
  return {
    id: `${competitionId}-r${round}-${homeId}-${awayId}`,
    seasonId: "season-1",
    competitionId,
    round,
    homeId,
    awayId,
    status: "scheduled",
    scheduledWeek: round + 3,
  };
}
