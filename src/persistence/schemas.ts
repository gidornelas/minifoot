import { z } from "zod";

export const PositionSchema = z.enum(["GK", "DF", "MF", "FW"]);

export const AttributesSchema = z.object({
  attack: z.number().int().min(1).max(99),
  passing: z.number().int().min(1).max(99),
  defense: z.number().int().min(1).max(99),
  pace: z.number().int().min(1).max(99),
  physical: z.number().int().min(1).max(99),
  mentality: z.number().int().min(1).max(99),
});

export const PlayerTraitSchema = z.enum([
  "clutch",
  "fragile",
  "leader",
  "wonderkid",
  "flat-track-bully",
  "big-game",
  "inconsistent",
  "loyal",
]);

export const PlayerSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().int().min(16).max(40),
  position: PositionSchema,
  attributes: AttributesSchema,
  overall: z.number().int().min(1).max(99),
  potential: z.number().int().min(1).max(99),
  morale: z.number().int().min(0).max(100),
  fitness: z.number().int().min(0).max(100),
  contractUntil: z.number().int().positive(),
  salary: z.number().int().nonnegative(),
  marketValue: z.number().int().nonnegative(),
  clubId: z.string().min(1).nullable(),
  injuryWeeksLeft: z.number().int().nonnegative(),
  yellowCards: z.number().int().nonnegative(),
  redCards: z.number().int().nonnegative(),
  goalsThisSeason: z.number().int().nonnegative(),
  assistsThisSeason: z.number().int().nonnegative(),
  appearancesThisSeason: z.number().int().nonnegative(),
  traits: z.array(PlayerTraitSchema).max(2),
});

export const TrophySchema = z.object({
  competition: z.string().min(1),
  season: z.number().int().positive(),
});

export const ClubSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(2).max(4),
  city: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  reputation: z.number().int().min(1).max(100),
  budget: z.number().int().nonnegative(),
  weeklySalaryBudget: z.number().int().nonnegative(),
  fanbase: z.number().int().min(1).max(100),
  leagueId: z.string().min(1),
  squad: z.array(z.string().min(1)),
  trophies: z.array(TrophySchema),
  managerStyle: z.enum(["attacking", "balanced", "defensive"]).optional(),
  isPlayerControlled: z.boolean(),
});

export const PrizeMoneySchema = z.object({
  position: z.number().int().positive(),
  amount: z.number().int().nonnegative(),
});

export const LeagueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  tier: z.number().int().positive(),
  clubIds: z.array(z.string().min(1)),
  format: z.enum(["round-robin-double", "cup-knockout"]),
  promotionSlots: z.number().int().nonnegative(),
  relegationSlots: z.number().int().nonnegative(),
  prizeMoney: z.array(PrizeMoneySchema),
});

export const MatchEventSchema = z.object({
  minute: z.number().int().min(1).max(90),
  type: z.enum(["goal", "yellow", "red", "injury", "narrative", "sub"]),
  playerId: z.string().min(1),
  description: z.string().min(1),
  scoreAfter: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
});

export const MatchResultSchema = z.object({
  homeGoals: z.number().int().nonnegative(),
  awayGoals: z.number().int().nonnegative(),
  events: z.array(MatchEventSchema),
  homeRating: z.number().min(1).max(10),
  awayRating: z.number().min(1).max(10),
  attendance: z.number().int().nonnegative(),
  manOfTheMatch: z.string().min(1),
  xgHome: z.number().nonnegative(),
  xgAway: z.number().nonnegative(),
});

export const MatchSchema = z.object({
  id: z.string().min(1),
  seasonId: z.string().min(1),
  competitionId: z.string().min(1),
  round: z.number().int().positive(),
  homeId: z.string().min(1),
  awayId: z.string().min(1),
  status: z.enum(["scheduled", "played"]),
  result: MatchResultSchema.optional(),
  scheduledWeek: z.number().int().positive(),
});

export const SeasonCompetitionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["league", "cup"]),
});

export const SeasonSchema = z.object({
  number: z.number().int().positive(),
  currentWeek: z.number().int().nonnegative(),
  totalWeeks: z.number().int().positive(),
  competitions: z.array(SeasonCompetitionSchema),
  finished: z.boolean(),
});

export const NewsItemSchema = z.object({
  id: z.string().min(1),
  week: z.number().int().nonnegative(),
  type: z.enum(["match", "transfer", "injury", "performance", "system"]),
  title: z.string().min(1),
  body: z.string().optional(),
  createdAt: z.number().int().nonnegative(),
  relatedClubId: z.string().min(1).optional(),
  relatedPlayerId: z.string().min(1).optional(),
});

export const SeasonRecordSchema = z.object({
  season: z.number().int().positive(),
  championClubId: z.string().min(1).optional(),
  playerClubPosition: z.number().int().positive().optional(),
  trophies: z.array(TrophySchema),
});

export const GameStateSchema = z.object({
  version: z.number().int().positive(),
  seed: z.number().int(),
  rngState: z.number().int(),
  createdAt: z.number().int().nonnegative(),
  playerName: z.string().min(1),
  playerClubId: z.string().min(1),
  currentSeason: SeasonSchema,
  history: z.array(SeasonRecordSchema),
  clubs: z.record(z.string(), ClubSchema),
  players: z.record(z.string(), PlayerSchema),
  leagues: z.record(z.string(), LeagueSchema),
  matches: z.record(z.string(), MatchSchema),
  newsLog: z.array(NewsItemSchema).max(200),
  achievements: z.array(z.string().min(1)),
});

export const SaveMetadataSchema = GameStateSchema.pick({
  version: true,
});
