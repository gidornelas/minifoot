import type { Attributes, Club, League, Player, PlayerTrait, Position } from "../domain";
import { between, chance, createRng, integer, pick as pickRng, type Rng, weighted } from "../rng";
import { calculateOverall } from "../simulation";
import { CLUB_BLUEPRINTS, type ClubBlueprint } from "./club-blueprints";
import { FIRST_NAMES, LAST_NAMES } from "./name-pools";

export interface GeneratedLeague {
  league: League;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  rngState: number;
}

const LEAGUE_ID = "serie-a";
const SQUAD_POSITIONS: readonly Position[] = [
  "GK",
  "GK",
  "GK",
  "DF",
  "DF",
  "DF",
  "DF",
  "DF",
  "DF",
  "DF",
  "MF",
  "MF",
  "MF",
  "MF",
  "MF",
  "MF",
  "MF",
  "FW",
  "FW",
  "FW",
  "FW",
  "FW",
];

const TRAITS: readonly PlayerTrait[] = [
  "clutch",
  "fragile",
  "leader",
  "wonderkid",
  "flat-track-bully",
  "big-game",
  "inconsistent",
  "loyal",
];

export function generateLeague(seed: number): GeneratedLeague {
  const rng = createRng(seed);
  const clubs: Record<string, Club> = {};
  const players: Record<string, Player> = {};

  const league: League = {
    id: LEAGUE_ID,
    name: "Serie A Minimalista",
    country: "Brasil",
    tier: 1,
    clubIds: CLUB_BLUEPRINTS.map((club) => club.id),
    format: "round-robin-double",
    promotionSlots: 0,
    relegationSlots: 4,
    prizeMoney: Array.from({ length: 20 }, (_, index) => ({
      position: index + 1,
      amount: Math.max(1_000_000, 24_000_000 - index * 900_000),
    })),
  };

  for (const blueprint of CLUB_BLUEPRINTS) {
    const club = generateClub(blueprint);

    for (const [index, position] of SQUAD_POSITIONS.entries()) {
      const player = generatePlayer({
        rng,
        clubId: club.id,
        clubReputation: club.reputation,
        squadIndex: index,
        position,
      });

      club.squad.push(player.id);
      players[player.id] = player;
    }

    clubs[club.id] = club;
  }

  return {
    league,
    clubs,
    players,
    rngState: rng.getState(),
  };
}

export function generateClub(blueprint: ClubBlueprint): Club {
  return {
    id: blueprint.id,
    name: blueprint.name,
    shortName: blueprint.shortName,
    city: blueprint.city,
    primaryColor: blueprint.primaryColor,
    secondaryColor: blueprint.secondaryColor,
    reputation: blueprint.reputation,
    budget: Math.round(blueprint.reputation * 750_000),
    weeklySalaryBudget: Math.round(blueprint.reputation * 58_000),
    fanbase: blueprint.fanbase,
    leagueId: LEAGUE_ID,
    squad: [],
    trophies: [],
    managerStyle: blueprint.reputation >= 82 ? "attacking" : "balanced",
    isPlayerControlled: false,
  };
}

interface GeneratePlayerInput {
  rng: Rng;
  clubId: string;
  clubReputation: number;
  squadIndex: number;
  position: Position;
}

export function generatePlayer(input: GeneratePlayerInput): Player {
  const age = generateAge(input.rng);
  const targetOverall = Math.round(input.clubReputation * 0.72 + between(input.rng, 12, 24));
  const attributes = generateAttributes(input.rng, input.position, targetOverall);
  const overall = calculateOverall(attributes, input.position);
  const potential = generatePotential(input.rng, overall, age);
  const traits = generateTraits(input.rng, age, potential, overall);
  const id = createPlayerId(input.rng, input.clubId, input.squadIndex);

  return {
    id,
    firstName: pickRng(input.rng, FIRST_NAMES),
    lastName: pickRng(input.rng, LAST_NAMES),
    age,
    position: input.position,
    attributes,
    overall,
    potential,
    morale: integer(input.rng, 48, 72),
    fitness: integer(input.rng, 82, 100),
    contractUntil: integer(input.rng, 2, 5),
    salary: calculateSalary(overall, age),
    marketValue: calculateMarketValue(overall, potential, age),
    clubId: input.clubId,
    injuryWeeksLeft: 0,
    yellowCards: 0,
    redCards: 0,
    goalsThisSeason: 0,
    assistsThisSeason: 0,
    appearancesThisSeason: 0,
    traits,
  };
}

function generateAge(rng: Rng): number {
  return weighted(rng, [
    { item: integer(rng, 17, 21), weight: 20 },
    { item: integer(rng, 22, 28), weight: 50 },
    { item: integer(rng, 29, 34), weight: 25 },
    { item: integer(rng, 35, 39), weight: 5 },
  ]);
}

function generateAttributes(rng: Rng, position: Position, targetOverall: number): Attributes {
  const base = clamp(targetOverall, 45, 88);
  const attrs: Attributes = {
    attack: rollAttribute(rng, base),
    passing: rollAttribute(rng, base),
    defense: rollAttribute(rng, base),
    pace: rollAttribute(rng, base),
    physical: rollAttribute(rng, base),
    mentality: rollAttribute(rng, base),
  };

  if (position === "GK") {
    attrs.defense = clamp(attrs.defense + integer(rng, 10, 18), 1, 99);
    attrs.attack = clamp(attrs.attack - integer(rng, 12, 22), 1, 99);
  }

  if (position === "DF") {
    attrs.defense = clamp(attrs.defense + integer(rng, 6, 14), 1, 99);
    attrs.attack = clamp(attrs.attack - integer(rng, 4, 12), 1, 99);
  }

  if (position === "MF") {
    attrs.passing = clamp(attrs.passing + integer(rng, 5, 12), 1, 99);
  }

  if (position === "FW") {
    attrs.attack = clamp(attrs.attack + integer(rng, 7, 16), 1, 99);
    attrs.defense = clamp(attrs.defense - integer(rng, 5, 14), 1, 99);
  }

  return attrs;
}

function rollAttribute(rng: Rng, base: number): number {
  return clamp(Math.round(base + between(rng, -9, 9)), 1, 99);
}

function generatePotential(rng: Rng, overall: number, age: number): number {
  const growthRoom = age < 23 ? integer(rng, 6, 18) : age < 29 ? integer(rng, 1, 8) : 0;

  return clamp(overall + growthRoom, overall, 99);
}

function generateTraits(rng: Rng, age: number, potential: number, overall: number): PlayerTrait[] {
  const traits: PlayerTrait[] = [];

  if (age <= 21 && potential - overall >= 10 && chance(rng, 0.45)) {
    traits.push("wonderkid");
  }

  if (overall >= 76 && chance(rng, 0.22)) {
    traits.push(
      weighted(rng, [
        { item: "leader", weight: 3 },
        { item: "big-game", weight: 2 },
        { item: "clutch", weight: 2 },
      ]),
    );
  }

  if (traits.length < 2 && chance(rng, 0.12)) {
    const nextTrait = pickTrait(rng, inputTraitsWithout(traits), TRAITS);
    traits.push(nextTrait);
  }

  return traits.slice(0, 2);
}

function inputTraitsWithout(existing: readonly PlayerTrait[]): readonly PlayerTrait[] {
  return TRAITS.filter((trait) => !existing.includes(trait));
}

function pickTrait<T>(rng: Rng, items: readonly T[], fallback: readonly T[]): T {
  return items.length > 0 ? fallbackPick(rng, items) : fallbackPick(rng, fallback);
}

function fallbackPick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[integer(rng, 0, items.length - 1)];

  if (item === undefined) {
    throw new Error("Cannot pick from an empty list.");
  }

  return item;
}

function calculateSalary(overall: number, age: number): number {
  const ageMultiplier = age >= 31 ? 0.9 : age <= 22 ? 0.82 : 1;

  return Math.round(overall * overall * 42 * ageMultiplier);
}

function calculateMarketValue(overall: number, potential: number, age: number): number {
  const ageMultiplier = age > 34 ? 0.5 : age >= 21 && age <= 26 ? 1.5 : age < 21 ? 1.35 : 1;
  const potentialMultiplier = 1 + Math.max(0, potential - overall) * 0.05;

  return Math.round(overall ** 2.2 * 1_000 * ageMultiplier * potentialMultiplier);
}

function createPlayerId(rng: Rng, clubId: string, squadIndex: number): string {
  return `player-${clubId}-${String(squadIndex + 1).padStart(2, "0")}-${integer(
    rng,
    100_000,
    999_999,
  ).toString(36)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
