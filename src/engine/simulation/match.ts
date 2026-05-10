import type { Club, MatchEvent, MatchResult, Player } from "../domain";
import { between, chance, integer, pick, type Rng, weighted } from "../rng";
import { DEFAULT_TACTIC, getTacticModifiers, type MatchTactic } from "./tactics";
import { calculateTeamRating } from "./team-rating";

export interface SimulateMatchInput {
  home: Club;
  away: Club;
  players: Record<string, Player>;
  rng: Rng;
  homeTactic?: MatchTactic;
  awayTactic?: MatchTactic;
}

interface PendingEvent {
  minute: number;
  type: MatchEvent["type"];
  playerId: string;
  description: string;
  scoringSide?: "home" | "away";
}

export function simulateMatch(input: SimulateMatchInput): MatchResult {
  const homeTactic = input.homeTactic ?? DEFAULT_TACTIC;
  const awayTactic = input.awayTactic ?? DEFAULT_TACTIC;
  const homeLineup = calculateTeamRating({
    club: input.home,
    players: input.players,
    tactic: homeTactic,
    home: true,
  });
  const awayLineup = calculateTeamRating({
    club: input.away,
    players: input.players,
    tactic: awayTactic,
    home: false,
  });
  const homeModifiers = getTacticModifiers(homeTactic);
  const awayModifiers = getTacticModifiers(awayTactic);
  const homeStrength = Math.max(1, homeLineup.rating + homeModifiers.defenseModifier);
  const awayStrength = Math.max(1, awayLineup.rating + awayModifiers.defenseModifier);
  const totalStrength = homeStrength + awayStrength;
  const baseGoals = 2.72;
  const xgHome = round2(
    baseGoals * (homeStrength / totalStrength) * homeModifiers.attackMultiplier,
  );
  const xgAway = round2(
    baseGoals * (awayStrength / totalStrength) * awayModifiers.attackMultiplier,
  );
  const pendingEvents: PendingEvent[] = [
    ...generateGoalEvents({
      rng: input.rng,
      attempts: 8,
      xg: xgHome,
      club: input.home,
      opponent: input.away,
      players: input.players,
      side: "home",
    }),
    ...generateGoalEvents({
      rng: input.rng,
      attempts: 8,
      xg: xgAway,
      club: input.away,
      opponent: input.home,
      players: input.players,
      side: "away",
    }),
    ...generateFlavorEvents(input),
  ].sort((a, b) => a.minute - b.minute || eventOrder(a.type) - eventOrder(b.type));
  let homeGoals = 0;
  let awayGoals = 0;
  const goalCounts = new Map<string, number>();
  const events: MatchEvent[] = pendingEvents.map((event) => {
    if (event.scoringSide === "home") {
      homeGoals += 1;
      goalCounts.set(event.playerId, (goalCounts.get(event.playerId) ?? 0) + 1);
    }

    if (event.scoringSide === "away") {
      awayGoals += 1;
      goalCounts.set(event.playerId, (goalCounts.get(event.playerId) ?? 0) + 1);
    }

    return {
      minute: event.minute,
      type: event.type,
      playerId: event.playerId,
      description: event.description,
      scoreAfter: [homeGoals, awayGoals],
    };
  });
  const manOfTheMatch = pickManOfTheMatch({
    players: input.players,
    homeLineup: homeLineup.starters,
    awayLineup: awayLineup.starters,
    goalCounts,
    homeGoals,
    awayGoals,
  });

  return {
    homeGoals,
    awayGoals,
    events,
    homeRating: clampRating(5 + (homeGoals - awayGoals) * 0.7 + (homeLineup.rating - 70) / 20),
    awayRating: clampRating(5 + (awayGoals - homeGoals) * 0.7 + (awayLineup.rating - 70) / 20),
    attendance: calculateAttendance(input.rng, input.home, input.away),
    manOfTheMatch,
    xgHome,
    xgAway,
  };
}

interface GenerateGoalEventsInput {
  rng: Rng;
  attempts: number;
  xg: number;
  club: Club;
  opponent: Club;
  players: Record<string, Player>;
  side: "home" | "away";
}

function generateGoalEvents(input: GenerateGoalEventsInput): PendingEvent[] {
  const events: PendingEvent[] = [];
  const probability = Math.min(0.92, input.xg / input.attempts);

  for (let attempt = 0; attempt < input.attempts; attempt += 1) {
    if (!chance(input.rng, probability)) {
      continue;
    }

    const scorer = pickScorer(input.rng, input.club, input.players);
    const goalType = weighted(input.rng, [
      { item: "chute cruzado", weight: 3 },
      { item: "cabeca", weight: 2 },
      { item: "rebote", weight: 2 },
      { item: "penalti", weight: 1 },
      { item: "falta", weight: 1 },
    ]);

    events.push({
      minute: pickGoalMinute(input.rng),
      type: "goal",
      playerId: scorer.id,
      scoringSide: input.side,
      description: `${scorer.firstName} ${scorer.lastName} marca de ${goalType} para o ${input.club.name}.`,
    });
  }

  if (events.length >= 3) {
    const scorerCounts = events.reduce<Record<string, number>>((counts, event) => {
      counts[event.playerId] = (counts[event.playerId] ?? 0) + 1;
      return counts;
    }, {});
    const hatTrickPlayerId = Object.entries(scorerCounts).find(([, goals]) => goals >= 3)?.[0];
    const player = hatTrickPlayerId ? input.players[hatTrickPlayerId] : undefined;

    if (player) {
      events.push({
        minute: Math.min(90, events[events.length - 1]?.minute ?? 90),
        type: "narrative",
        playerId: player.id,
        description: `${player.firstName} ${player.lastName} pede a bola. Hat-trick sem discurso.`,
      });
    }
  }

  if (events.length === 0 && chance(input.rng, 0.18)) {
    const player = pickScorer(input.rng, input.club, input.players);
    events.push({
      minute: integer(input.rng, 18, 88),
      type: "narrative",
      playerId: player.id,
      description: `${player.firstName} ${player.lastName} quase abre o placar. Quase nao soma.`,
    });
  }

  return events;
}

function generateFlavorEvents(input: SimulateMatchInput): PendingEvent[] {
  const homeEventPressure = getTacticModifiers(input.homeTactic ?? DEFAULT_TACTIC).eventMultiplier;
  const awayEventPressure = getTacticModifiers(input.awayTactic ?? DEFAULT_TACTIC).eventMultiplier;
  const amount = integer(input.rng, 2, 5);
  const events: PendingEvent[] = [];

  for (let index = 0; index < amount; index += 1) {
    const side = chance(input.rng, homeEventPressure / (homeEventPressure + awayEventPressure))
      ? input.home
      : input.away;
    const player = pickInvolvedPlayer(input.rng, side, input.players);
    const roll = input.rng.next();

    if (roll < 0.05) {
      events.push({
        minute: integer(input.rng, 20, 88),
        type: "red",
        playerId: player.id,
        description: `${player.firstName} ${player.lastName} recebe vermelho. A explicacao ficou para depois.`,
      });
      continue;
    }

    if (roll < 0.13) {
      events.push({
        minute: integer(input.rng, 12, 82),
        type: "injury",
        playerId: player.id,
        description: `${player.firstName} ${player.lastName} sente a perna e sai reclamando baixo.`,
      });
      continue;
    }

    if (roll < 0.48) {
      events.push({
        minute: integer(input.rng, 8, 86),
        type: "yellow",
        playerId: player.id,
        description: `Cartao amarelo para ${player.firstName} ${player.lastName}. Sem surpresa.`,
      });
      continue;
    }

    events.push({
      minute: integer(input.rng, 5, 90),
      type: "narrative",
      playerId: player.id,
      description: pick(input.rng, [
        `${player.firstName} ${player.lastName} acelera e perde o tempo do passe.`,
        `${side.name} troca passes. A torcida decide acreditar por alguns segundos.`,
        `${player.firstName} ${player.lastName} arrisca de longe. O goleiro agradece.`,
        `${side.name} pressiona. Pressionar tambem cansa.`,
      ]),
    });
  }

  return events;
}

function pickScorer(rng: Rng, club: Club, players: Record<string, Player>): Player {
  const candidates = getAvailablePlayers(club, players);

  return weighted(
    rng,
    candidates.map((player) => ({
      item: player,
      weight:
        player.attributes.attack +
        player.overall * 0.4 +
        (player.position === "FW" ? 35 : player.position === "MF" ? 14 : 2),
    })),
  );
}

function pickInvolvedPlayer(rng: Rng, club: Club, players: Record<string, Player>): Player {
  return pick(rng, getAvailablePlayers(club, players));
}

function getAvailablePlayers(club: Club, players: Record<string, Player>): Player[] {
  const candidates = club.squad
    .map((playerId) => players[playerId])
    .filter((player): player is Player => player !== undefined && player.injuryWeeksLeft === 0);

  if (candidates.length === 0) {
    throw new Error(`Club ${club.id} has no available players.`);
  }

  return candidates;
}

function pickGoalMinute(rng: Rng): number {
  return weighted(rng, [
    { item: integer(rng, 1, 15), weight: 10 },
    { item: integer(rng, 16, 45), weight: 28 },
    { item: integer(rng, 46, 75), weight: 34 },
    { item: integer(rng, 76, 90), weight: 28 },
  ]);
}

function pickManOfTheMatch(input: {
  players: Record<string, Player>;
  homeLineup: readonly Player[];
  awayLineup: readonly Player[];
  goalCounts: Map<string, number>;
  homeGoals: number;
  awayGoals: number;
}): string {
  const winnerLineup = input.homeGoals >= input.awayGoals ? input.homeLineup : input.awayLineup;
  const candidates = [...input.homeLineup, ...input.awayLineup];
  const goalLeader = [...input.goalCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  if (goalLeader && goalLeader[1] >= 2 && input.players[goalLeader[0]]) {
    return goalLeader[0];
  }

  const bestWinner = [...winnerLineup].sort((a, b) => b.overall - a.overall)[0];
  const bestOverall = [...candidates].sort((a, b) => b.overall - a.overall)[0];

  return bestWinner?.id ?? bestOverall?.id ?? "";
}

function calculateAttendance(rng: Rng, home: Club, away: Club): number {
  const base = home.fanbase * 620 + away.reputation * 110;
  return Math.round(between(rng, base * 0.78, base * 1.18));
}

function clampRating(value: number): number {
  return Math.round(Math.min(10, Math.max(1, value)) * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function eventOrder(type: MatchEvent["type"]): number {
  if (type === "goal") {
    return 0;
  }

  if (type === "red") {
    return 1;
  }

  return 2;
}
