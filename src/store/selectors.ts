import type { Player } from "../engine";
import type { SortDirection, SquadSortKey } from "./game.store";

export function playerFullName(player: Player): string {
  return `${player.firstName} ${player.lastName}`;
}

export function sortPlayers(
  players: readonly Player[],
  key: SquadSortKey,
  direction: SortDirection,
): Player[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...players].sort((a, b) => {
    const value = compareByKey(a, b, key);

    if (value !== 0) {
      return value * multiplier;
    }

    return playerFullName(a).localeCompare(playerFullName(b));
  });
}

function compareByKey(a: Player, b: Player, key: SquadSortKey): number {
  if (key === "name") {
    return playerFullName(a).localeCompare(playerFullName(b));
  }

  if (key === "position") {
    return positionWeight(a.position) - positionWeight(b.position);
  }

  if (key === "potential") {
    return a.potential - b.potential;
  }

  if (key === "fitness") {
    return a.fitness - b.fitness;
  }

  if (key === "value") {
    return a.marketValue - b.marketValue;
  }

  return a.overall - b.overall;
}

function positionWeight(position: Player["position"]): number {
  const weights: Record<Player["position"], number> = {
    GK: 0,
    DF: 1,
    MF: 2,
    FW: 3,
  };

  return weights[position];
}
