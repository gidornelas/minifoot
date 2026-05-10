import type { League, Match } from "../domain";

export interface LeagueTableRow {
  clubId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function calculateLeagueTable(league: League, matches: readonly Match[]): LeagueTableRow[] {
  const rows: Record<string, LeagueTableRow> = Object.fromEntries(
    league.clubIds.map((clubId) => [
      clubId,
      {
        clubId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]),
  );

  for (const match of matches) {
    if (match.status !== "played" || !match.result) {
      continue;
    }

    const home = rows[match.homeId];
    const away = rows[match.awayId];

    if (!home || !away) {
      continue;
    }

    applyResult(home, match.result.homeGoals, match.result.awayGoals);
    applyResult(away, match.result.awayGoals, match.result.homeGoals);
  }

  return Object.values(rows).sort(compareTableRows);
}

function applyResult(row: LeagueTableRow, goalsFor: number, goalsAgainst: number): void {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
    return;
  }

  if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
    return;
  }

  row.losses += 1;
}

function compareTableRows(a: LeagueTableRow, b: LeagueTableRow): number {
  return (
    b.points - a.points ||
    b.wins - a.wins ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.clubId.localeCompare(b.clubId)
  );
}
