import type { Club, Player, Position } from "../domain";
import { integer, pick, type Rng } from "../rng";
import { calculateTransferValue } from "./valuation";

export type TransferDecisionStatus = "accepted" | "counter" | "rejected";

export interface TransferDecision {
  status: TransferDecisionStatus;
  askingPrice: number;
  wageDemand: number;
  reason: string;
}

export interface CpuTransferDeal {
  playerId: string;
  fromClubId: string;
  toClubId: string;
  fee: number;
}

export function isTransferWindowOpen(currentWeek: number): boolean {
  return (currentWeek >= 1 && currentWeek <= 3) || currentWeek === 19 || currentWeek === 20;
}

export function identifyWeakestPosition(club: Club, players: Record<string, Player>): Position {
  const ratings: Record<Position, number[]> = {
    DF: [],
    FW: [],
    GK: [],
    MF: [],
  };

  for (const playerId of club.squad) {
    const player = players[playerId];

    if (!player) {
      continue;
    }

    ratings[player.position].push(player.overall);
  }

  return (Object.keys(ratings) as Position[]).sort(
    (a, b) => averageBest(ratings[a]) - averageBest(ratings[b]),
  )[0] as Position;
}

export function evaluateTransferOffer(input: {
  player: Player;
  sellingClub: Club;
  buyingClub: Club;
  offerAmount: number;
  counterCount: number;
}): TransferDecision {
  const value = calculateTransferValue(input.player);
  const premium = input.sellingClub.reputation >= input.buyingClub.reputation ? 1.18 : 1.08;
  const askingPrice = Math.round(value * premium);
  const wageDemand = Math.round(
    input.player.salary * (1.12 + Math.max(0, input.player.overall - 70) * 0.008),
  );

  if (input.buyingClub.budget < input.offerAmount + wageDemand * 4) {
    return {
      askingPrice,
      reason: "orcamento insuficiente",
      status: "rejected",
      wageDemand,
    };
  }

  if (input.offerAmount >= askingPrice) {
    return {
      askingPrice,
      reason: "oferta aceita",
      status: "accepted",
      wageDemand,
    };
  }

  if (input.offerAmount >= value * 0.88 && input.counterCount < 2) {
    return {
      askingPrice,
      reason: "contraproposta enviada",
      status: "counter",
      wageDemand,
    };
  }

  return {
    askingPrice,
    reason: "oferta abaixo da avaliacao",
    status: "rejected",
    wageDemand,
  };
}

export function generateCpuTransferDeals(input: {
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  rng: Rng;
  maxDeals?: number;
}): CpuTransferDeal[] {
  const cpuClubs = Object.values(input.clubs).filter((club) => !club.isPlayerControlled);
  const dealTarget = Math.min(input.maxDeals ?? integer(input.rng, 5, 15), cpuClubs.length);
  const deals: CpuTransferDeal[] = [];
  const movedPlayers = new Set<string>();

  for (const buyer of shuffle(input.rng, cpuClubs)) {
    if (deals.length >= dealTarget) {
      break;
    }

    const position = identifyWeakestPosition(buyer, input.players);
    const candidates = Object.values(input.players)
      .filter((player) => {
        const seller = player.clubId ? input.clubs[player.clubId] : undefined;

        return (
          seller !== undefined &&
          seller.id !== buyer.id &&
          !seller.isPlayerControlled &&
          !movedPlayers.has(player.id) &&
          player.position === position &&
          player.overall <= buyer.reputation + 5
        );
      })
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 12);
    const player = candidates.length > 0 ? pick(input.rng, candidates) : undefined;

    if (!player?.clubId) {
      continue;
    }

    const fee = Math.round(calculateTransferValue(player) * 1.02);

    if (buyer.budget < fee) {
      continue;
    }

    movedPlayers.add(player.id);
    deals.push({
      fee,
      fromClubId: player.clubId,
      playerId: player.id,
      toClubId: buyer.id,
    });
  }

  return deals;
}

function averageBest(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const best = [...values].sort((a, b) => b - a).slice(0, 3);

  return best.reduce((sum, value) => sum + value, 0) / best.length;
}

function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = integer(rng, 0, index);
    const current = shuffled[index] as T;
    shuffled[index] = shuffled[swapIndex] as T;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}
