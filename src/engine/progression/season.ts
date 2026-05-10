import type {
  Attributes,
  Club,
  GameState,
  League,
  NewsItem,
  Player,
  Position,
  SeasonRecord,
} from "../domain";
import { FIRST_NAMES, LAST_NAMES } from "../generation/name-pools";
import { between, chance, createRng, integer, pick, type Rng } from "../rng";
import { calculateLeagueTable, calculateOverall, createLeagueSchedule } from "../simulation";

interface CompleteSeasonInput {
  game: GameState;
  leagueId: string;
}

interface StartNextSeasonInput {
  game: GameState;
  leagueId: string;
}

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

const PROMOTED_NAMES = [
  ["Aurora Norte", "AUN", "Belem"],
  ["Carbono Vale", "CAV", "Ipatinga"],
  ["Ferro Leste", "FEL", "Mogi"],
  ["Mar Azul", "MAZ", "Maceio"],
  ["Ouro Campo", "OUC", "Cuiaba"],
  ["Porto Sol", "PTS", "Natal"],
  ["Real Cerrado", "RCE", "Goiania"],
  ["Uniao Serra", "USR", "Caxias"],
] as const;

export function completeSeason(input: CompleteSeasonInput): GameState {
  const league = input.game.leagues[input.leagueId];

  if (!league) {
    return input.game;
  }

  const rng = createRng(input.game.rngState);
  const table = calculateLeagueTable(league, Object.values(input.game.matches));
  const championClubId = table[0]?.clubId;
  const playerClubPosition =
    table.findIndex((row) => row.clubId === input.game.playerClubId) + 1 || undefined;
  const relegatedClubIds = pickRelegatedClubIds(league, input.game.playerClubId, table);
  const promotedClubs = generatePromotedClubs({
    count: relegatedClubIds.length,
    league,
    rng,
    season: input.game.currentSeason.number,
  });
  const promotedClubIds = promotedClubs.map((club) => club.id);
  const activeClubIds = league.clubIds.filter((clubId) => !relegatedClubIds.includes(clubId));
  const nextLeague: League = {
    ...league,
    clubIds: [...activeClubIds, ...promotedClubIds],
  };
  const { clubs: clubsWithPromoted, players: playersWithPromoted } = addPromotedClubs(
    input.game.clubs,
    input.game.players,
    promotedClubs,
    rng,
    input.game.currentSeason.number,
  );
  const { clubs: awardedClubs, achievementsUnlocked } = awardSeason({
    clubs: clubsWithPromoted,
    league,
    championClubId,
    playerClubId: input.game.playerClubId,
    playerClubPosition,
    relegatedClubIds,
    season: input.game.currentSeason.number,
    table,
  });
  const progressed = progressPlayers({
    clubIds: nextLeague.clubIds,
    clubs: awardedClubs,
    players: playersWithPromoted,
    rng,
    season: input.game.currentSeason.number,
  });
  const record: SeasonRecord = {
    achievementsUnlocked,
    championClubId,
    playerClubPosition,
    promotedClubIds,
    regenPlayerIds: progressed.regenPlayerIds,
    relegatedClubIds,
    retiredPlayerIds: progressed.retiredPlayerIds,
    season: input.game.currentSeason.number,
    trophies: championClubId
      ? [{ competition: league.name, season: input.game.currentSeason.number }]
      : [],
  };
  const news = createSeasonNews(record, input.game, league.name);

  return {
    ...input.game,
    achievements: unique([...input.game.achievements, ...achievementsUnlocked]),
    clubs: progressed.clubs,
    currentSeason: {
      ...input.game.currentSeason,
      finished: true,
    },
    history: [...input.game.history, record],
    leagues: {
      ...input.game.leagues,
      [league.id]: nextLeague,
    },
    newsLog: [news, ...input.game.newsLog].slice(0, 200),
    players: progressed.players,
    rngState: rng.getState(),
  };
}

export function startNextSeason(input: StartNextSeasonInput): GameState {
  const league = input.game.leagues[input.leagueId];

  if (!league) {
    return input.game;
  }

  const nextSeasonNumber = input.game.currentSeason.number + 1;
  const matches = createLeagueSchedule(league, nextSeasonNumber);
  const news: NewsItem = {
    body: "Calendario renovado, jovens integrados e metas recolocadas na parede.",
    createdAt: nextSeasonNumber,
    id: `news-season-${nextSeasonNumber}-start`,
    importance: "special",
    relatedClubId: input.game.playerClubId,
    tags: ["form"],
    title: `Temporada ${nextSeasonNumber} iniciada`,
    type: "system",
    week: 1,
  };

  return {
    ...input.game,
    currentSeason: {
      competitions: [{ id: league.id, type: "league" }],
      currentWeek: 1,
      finished: false,
      number: nextSeasonNumber,
      totalWeeks: 41,
    },
    matches: Object.fromEntries(matches.map((match) => [match.id, match])),
    newsLog: [news, ...input.game.newsLog].slice(0, 200),
  };
}

function pickRelegatedClubIds(
  league: League,
  playerClubId: string,
  table: ReturnType<typeof calculateLeagueTable>,
): string[] {
  const protectedBottom = [...table]
    .reverse()
    .filter((row) => row.clubId !== playerClubId)
    .slice(0, league.relegationSlots);

  return protectedBottom.map((row) => row.clubId);
}

function generatePromotedClubs(input: {
  count: number;
  league: League;
  rng: Rng;
  season: number;
}): Club[] {
  return Array.from({ length: input.count }, (_, index) => {
    const [name, shortName, city] = PROMOTED_NAMES[
      (input.season + index) % PROMOTED_NAMES.length
    ] ?? ["Novo Clube", "NOV", "Interior"];
    const id = `promoted-${input.season + 1}-${index + 1}-${integer(input.rng, 100, 999)}`;
    const reputation = integer(input.rng, 56, 66);

    return {
      budget: reputation * 520_000,
      city,
      fanbase: integer(input.rng, 34, 54),
      id,
      isPlayerControlled: false,
      leagueId: input.league.id,
      managerStyle: "balanced",
      name,
      primaryColor: pick(input.rng, ["#1f7a4d", "#c89d28", "#c74e36", "#2f6fb3"]),
      reputation,
      secondaryColor: "#f5f1e8",
      shortName,
      squad: [],
      trophies: [],
      weeklySalaryBudget: reputation * 39_000,
    };
  });
}

function addPromotedClubs(
  clubs: Record<string, Club>,
  players: Record<string, Player>,
  promotedClubs: readonly Club[],
  rng: Rng,
  season: number,
): { clubs: Record<string, Club>; players: Record<string, Player> } {
  const nextClubs = { ...clubs };
  const nextPlayers = { ...players };

  for (const club of promotedClubs) {
    const squad: string[] = [];

    for (const [index, position] of SQUAD_POSITIONS.entries()) {
      const player = generateYouthPlayer({
        clubId: club.id,
        index,
        position,
        rng,
        season,
        targetOverall: club.reputation - 8,
      });

      squad.push(player.id);
      nextPlayers[player.id] = player;
    }

    nextClubs[club.id] = { ...club, squad };
  }

  return { clubs: nextClubs, players: nextPlayers };
}

function awardSeason(input: {
  clubs: Record<string, Club>;
  league: League;
  championClubId?: string;
  playerClubId: string;
  playerClubPosition?: number;
  relegatedClubIds: readonly string[];
  season: number;
  table: ReturnType<typeof calculateLeagueTable>;
}): { clubs: Record<string, Club>; achievementsUnlocked: string[] } {
  const clubs = { ...input.clubs };
  const achievements = ["season.completed"];

  for (const [index, row] of input.table.entries()) {
    const club = clubs[row.clubId];

    if (!club) {
      continue;
    }

    const prize =
      input.league.prizeMoney.find((entry) => entry.position === index + 1)?.amount ?? 0;
    clubs[row.clubId] = {
      ...club,
      budget: club.budget + prize,
      leagueId: input.relegatedClubIds.includes(row.clubId) ? "serie-b" : input.league.id,
      reputation: clamp(club.reputation + reputationDelta(index + 1, input.table.length), 35, 95),
      trophies:
        row.clubId === input.championClubId
          ? [...club.trophies, { competition: input.league.name, season: input.season }]
          : club.trophies,
    };
  }

  if (input.championClubId === input.playerClubId) {
    achievements.push("league.champion");
  }

  if (input.playerClubPosition && input.playerClubPosition <= 6) {
    achievements.push("continental.qualified");
  }

  if (input.playerClubPosition && input.playerClubPosition > input.table.length - 4) {
    achievements.push("board.reprieve");
  }

  return { clubs, achievementsUnlocked: achievements };
}

function progressPlayers(input: {
  clubIds: readonly string[];
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  rng: Rng;
  season: number;
}): {
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  retiredPlayerIds: string[];
  regenPlayerIds: string[];
} {
  const clubs: Record<string, Club> = Object.fromEntries(
    Object.entries(input.clubs).map(([clubId, club]) => [
      clubId,
      { ...club, squad: [...club.squad] },
    ]),
  );
  const players: Record<string, Player> = {};
  const retiredPlayerIds: string[] = [];
  const regenPlayerIds: string[] = [];

  for (const player of Object.values(input.players)) {
    const nextAge = player.age + 1;

    if (shouldRetire(player, nextAge, input.rng)) {
      retiredPlayerIds.push(player.id);

      if (player.clubId && clubs[player.clubId]) {
        clubs[player.clubId] = {
          ...clubs[player.clubId],
          squad: clubs[player.clubId].squad.filter((playerId) => playerId !== player.id),
        };
      }

      continue;
    }

    const progressed = progressPlayer(player, nextAge, input.rng);
    players[player.id] = progressed;
  }

  for (const clubId of input.clubIds) {
    const club = clubs[clubId];

    if (!club) {
      continue;
    }

    while (club.squad.length < SQUAD_POSITIONS.length) {
      const index = club.squad.length;
      const player = generateYouthPlayer({
        clubId,
        index,
        position: SQUAD_POSITIONS[index % SQUAD_POSITIONS.length] ?? "MF",
        rng: input.rng,
        season: input.season,
        targetOverall: club.reputation - 10,
      });

      club.squad.push(player.id);
      players[player.id] = player;
      regenPlayerIds.push(player.id);
    }
  }

  return { clubs, players, regenPlayerIds, retiredPlayerIds };
}

function progressPlayer(player: Player, nextAge: number, rng: Rng): Player {
  const delta = playerGrowthDelta(player, nextAge, rng);
  const attributes = mapAttributes(player.attributes, (value) => clamp(value + delta, 1, 99));
  const overall = calculateOverall(attributes, player.position);
  const potential = clamp(
    nextAge <= 23
      ? Math.max(player.potential, overall + integer(rng, 0, 2))
      : player.potential - Math.max(0, -delta),
    overall,
    99,
  );

  return {
    ...player,
    age: nextAge,
    appearancesThisSeason: 0,
    assistsThisSeason: 0,
    attributes,
    contractUntil: Math.max(1, player.contractUntil - 1),
    fitness: clamp(player.fitness + integer(rng, -5, 8), 55, 100),
    goalsThisSeason: 0,
    injuryWeeksLeft: Math.max(0, player.injuryWeeksLeft - 4),
    marketValue: calculateMarketValue(overall, potential, nextAge),
    morale: clamp(player.morale + integer(rng, -8, 8), 20, 100),
    overall,
    potential,
    redCards: 0,
    salary: calculateSalary(overall, nextAge),
    yellowCards: 0,
  };
}

function generateYouthPlayer(input: {
  clubId: string;
  index: number;
  position: Position;
  rng: Rng;
  season: number;
  targetOverall: number;
}): Player {
  const age = integer(input.rng, 16, 20);
  const attributes = generateYouthAttributes(input.rng, input.position, input.targetOverall);
  const overall = calculateOverall(attributes, input.position);
  const potential = clamp(overall + integer(input.rng, 5, 16), overall, 90);
  const id = `regen-${input.season + 1}-${input.clubId}-${input.index + 1}-${integer(
    input.rng,
    10_000,
    99_999,
  )}`;

  return {
    age,
    appearancesThisSeason: 0,
    assistsThisSeason: 0,
    attributes,
    clubId: input.clubId,
    contractUntil: integer(input.rng, 3, 5),
    firstName: pick(input.rng, FIRST_NAMES),
    fitness: integer(input.rng, 78, 100),
    goalsThisSeason: 0,
    id,
    injuryWeeksLeft: 0,
    lastName: pick(input.rng, LAST_NAMES),
    marketValue: calculateMarketValue(overall, potential, age),
    morale: integer(input.rng, 45, 70),
    overall,
    position: input.position,
    potential,
    redCards: 0,
    salary: calculateSalary(overall, age),
    traits: potential - overall >= 10 && chance(input.rng, 0.45) ? ["wonderkid"] : [],
    yellowCards: 0,
  };
}

function generateYouthAttributes(rng: Rng, position: Position, targetOverall: number): Attributes {
  const base = clamp(Math.round(targetOverall + between(rng, -7, 6)), 45, 74);
  const attributes: Attributes = {
    attack: clamp(base + integer(rng, -8, 8), 1, 99),
    defense: clamp(base + integer(rng, -8, 8), 1, 99),
    mentality: clamp(base + integer(rng, -8, 8), 1, 99),
    pace: clamp(base + integer(rng, -8, 8), 1, 99),
    passing: clamp(base + integer(rng, -8, 8), 1, 99),
    physical: clamp(base + integer(rng, -8, 8), 1, 99),
  };

  if (position === "GK") {
    attributes.defense = clamp(attributes.defense + 14, 1, 99);
    attributes.attack = clamp(attributes.attack - 16, 1, 99);
  }

  if (position === "DF") {
    attributes.defense = clamp(attributes.defense + 9, 1, 99);
  }

  if (position === "MF") {
    attributes.passing = clamp(attributes.passing + 8, 1, 99);
  }

  if (position === "FW") {
    attributes.attack = clamp(attributes.attack + 10, 1, 99);
  }

  return attributes;
}

function createSeasonNews(record: SeasonRecord, game: GameState, leagueName: string): NewsItem {
  const champion = record.championClubId ? game.clubs[record.championClubId] : undefined;

  return {
    body: `${record.retiredPlayerIds?.length ?? 0} aposentadorias e ${
      record.regenPlayerIds?.length ?? 0
    } jovens registrados para o proximo ciclo.`,
    createdAt: record.season,
    id: `news-season-${record.season}-end`,
    importance: "special",
    relatedClubId: record.championClubId,
    tags: ["form"],
    title: `${champion?.shortName ?? "Campeao"} fecha a ${leagueName}`,
    type: "system",
    week: game.currentSeason.currentWeek,
  };
}

function shouldRetire(player: Player, nextAge: number, rng: Rng): boolean {
  if (nextAge >= 40) {
    return true;
  }

  if (nextAge >= 37) {
    return chance(rng, 0.65);
  }

  if (nextAge >= 35) {
    return chance(rng, player.overall < 65 ? 0.4 : 0.18);
  }

  return false;
}

function playerGrowthDelta(player: Player, nextAge: number, rng: Rng): number {
  if (nextAge <= 21 && player.overall < player.potential) {
    return integer(rng, 0, 2);
  }

  if (nextAge <= 24 && player.overall < player.potential) {
    return integer(rng, 0, 1);
  }

  if (nextAge >= 34) {
    return -integer(rng, 1, 3);
  }

  if (nextAge >= 31) {
    return -integer(rng, 0, 1);
  }

  return 0;
}

function reputationDelta(position: number, tableSize: number): number {
  if (position === 1) {
    return 2;
  }

  if (position <= 6) {
    return 1;
  }

  if (position > tableSize - 4) {
    return -2;
  }

  if (position > tableSize - 8) {
    return -1;
  }

  return 0;
}

function mapAttributes(
  attributes: Attributes,
  mapper: (value: number, key: keyof Attributes) => number,
): Attributes {
  return {
    attack: mapper(attributes.attack, "attack"),
    defense: mapper(attributes.defense, "defense"),
    mentality: mapper(attributes.mentality, "mentality"),
    pace: mapper(attributes.pace, "pace"),
    passing: mapper(attributes.passing, "passing"),
    physical: mapper(attributes.physical, "physical"),
  };
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

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
