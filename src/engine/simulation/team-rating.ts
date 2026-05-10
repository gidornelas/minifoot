import type { Club, Player } from "../domain";
import { getTacticModifiers, type MatchTactic } from "./tactics";

export interface TeamRatingInput {
  club: Club;
  players: Record<string, Player>;
  tactic?: MatchTactic;
  home?: boolean;
}

export interface RatedLineup {
  starters: Player[];
  rating: number;
  averageOverall: number;
}

export function calculateTeamRating(input: TeamRatingInput): RatedLineup {
  const starters = getStarters(input.club, input.players);
  const averageOverall = average(starters.map((player) => player.overall));
  const averageMorale = average(starters.map((player) => player.morale));
  const averageFitness = average(starters.map((player) => player.fitness));
  const tacticBonus = getTacticModifiers(input.tactic).ratingBonus;
  const moraleBonus = ((averageMorale - 50) / 50) * 2;
  const fatiguePenalty = Math.max(0, (85 - averageFitness) / 15) * 3;
  const homeBonus = input.home ? 2 : 0;

  return {
    starters,
    rating: averageOverall + tacticBonus + moraleBonus + homeBonus - fatiguePenalty,
    averageOverall,
  };
}

export function getStarters(club: Club, players: Record<string, Player>): Player[] {
  return club.squad
    .map((playerId) => players[playerId])
    .filter((player): player is Player => player !== undefined && player.injuryWeeksLeft === 0)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 11);
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
