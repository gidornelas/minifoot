export type Position = "GK" | "DF" | "MF" | "FW";

export interface Attributes {
  attack: number;
  passing: number;
  defense: number;
  pace: number;
  physical: number;
  mentality: number;
}

export type PlayerTrait =
  | "clutch"
  | "fragile"
  | "leader"
  | "wonderkid"
  | "flat-track-bully"
  | "big-game"
  | "inconsistent"
  | "loyal";

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  attributes: Attributes;
  overall: number;
  potential: number;
  morale: number;
  fitness: number;
  contractUntil: number;
  salary: number;
  marketValue: number;
  clubId: string | null;
  injuryWeeksLeft: number;
  yellowCards: number;
  redCards: number;
  goalsThisSeason: number;
  assistsThisSeason: number;
  appearancesThisSeason: number;
  traits: PlayerTrait[];
}

export interface Trophy {
  competition: string;
  season: number;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  reputation: number;
  budget: number;
  weeklySalaryBudget: number;
  fanbase: number;
  leagueId: string;
  squad: string[];
  trophies: Trophy[];
  managerStyle?: "attacking" | "balanced" | "defensive";
  isPlayerControlled: boolean;
}

export interface League {
  id: string;
  name: string;
  country: string;
  tier: number;
  clubIds: string[];
  format: "round-robin-double" | "cup-knockout";
  promotionSlots: number;
  relegationSlots: number;
  prizeMoney: PrizeMoney[];
}

export interface PrizeMoney {
  position: number;
  amount: number;
}

export interface Match {
  id: string;
  seasonId: string;
  competitionId: string;
  round: number;
  homeId: string;
  awayId: string;
  status: "scheduled" | "played";
  result?: MatchResult;
  scheduledWeek: number;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  homeRating: number;
  awayRating: number;
  attendance: number;
  manOfTheMatch: string;
  xgHome: number;
  xgAway: number;
}

export interface MatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "injury" | "narrative" | "sub";
  playerId: string;
  description: string;
  scoreAfter: [number, number];
}

export interface Season {
  number: number;
  currentWeek: number;
  totalWeeks: number;
  competitions: SeasonCompetition[];
  finished: boolean;
}

export interface SeasonCompetition {
  id: string;
  type: "league" | "cup";
}

export interface NewsItem {
  id: string;
  week: number;
  type: "match" | "transfer" | "injury" | "performance" | "system";
  title: string;
  body?: string;
  tags?: NewsTag[];
  importance?: "normal" | "special";
  createdAt: number;
  relatedClubId?: string;
  relatedPlayerId?: string;
}

export type NewsTag =
  | "comeback"
  | "derby"
  | "form"
  | "injury"
  | "player-club"
  | "result"
  | "transfer"
  | "upset";

export interface SeasonRecord {
  season: number;
  championClubId?: string;
  playerClubPosition?: number;
  trophies: Trophy[];
}

export interface GameState {
  version: number;
  seed: number;
  rngState: number;
  createdAt: number;
  playerName: string;
  playerClubId: string;
  currentSeason: Season;
  history: SeasonRecord[];
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  leagues: Record<string, League>;
  matches: Record<string, Match>;
  newsLog: NewsItem[];
  achievements: string[];
}
