import { describe, expect, it } from "vitest";
import {
  calculateTransferValue,
  createRng,
  evaluateTransferOffer,
  generateCpuTransferDeals,
  generateLeague,
  identifyWeakestPosition,
  isTransferWindowOpen,
} from "../../engine";

describe("transfer market", () => {
  it("opens only during configured windows", () => {
    expect(isTransferWindowOpen(1)).toBe(true);
    expect(isTransferWindowOpen(3)).toBe(true);
    expect(isTransferWindowOpen(4)).toBe(false);
    expect(isTransferWindowOpen(19)).toBe(true);
    expect(isTransferWindowOpen(20)).toBe(true);
    expect(isTransferWindowOpen(21)).toBe(false);
  });

  it("values wonderkids above older players with similar overall", () => {
    const generated = generateLeague(2_026);
    const players = Object.values(generated.players);
    const olderPlayer = players.find((player) => player.age >= 30);
    const youngPlayer = players.find(
      (player) => player.age <= 21 && player.potential > player.overall,
    );

    if (!olderPlayer || !youngPlayer) {
      throw new Error("Expected generated old and young players.");
    }

    expect(calculateTransferValue(youngPlayer)).toBeGreaterThan(0);
    expect(calculateTransferValue(olderPlayer)).toBeGreaterThan(0);
    expect(calculateTransferValue({ ...youngPlayer, overall: 80, potential: 92 })).toBeGreaterThan(
      calculateTransferValue({ ...olderPlayer, overall: 80, potential: 80, age: 32 }),
    );
  });

  it("returns counter proposals and accepts strong offers", () => {
    const generated = generateLeague(2_026);
    const [buyerId, sellerId] = generated.league.clubIds;

    if (!buyerId || !sellerId) {
      throw new Error("League needs two clubs.");
    }

    const buyer = { ...generated.clubs[buyerId], budget: 500_000_000 };
    const seller = generated.clubs[sellerId];
    const player = seller?.squad.map((playerId) => generated.players[playerId]).find(Boolean);

    if (!seller || !player) {
      throw new Error("Expected seller and player.");
    }

    const value = calculateTransferValue(player);
    const counter = evaluateTransferOffer({
      buyingClub: buyer,
      counterCount: 0,
      offerAmount: Math.round(value * 0.9),
      player,
      sellingClub: seller,
    });
    const accepted = evaluateTransferOffer({
      buyingClub: buyer,
      counterCount: 0,
      offerAmount: counter.askingPrice,
      player,
      sellingClub: seller,
    });

    expect(counter.status).toBe("counter");
    expect(accepted.status).toBe("accepted");
  });

  it("generates deterministic CPU transfers for club needs", () => {
    const generated = generateLeague(2_026);
    const first = generateCpuTransferDeals({
      clubs: generated.clubs,
      maxDeals: 8,
      players: generated.players,
      rng: createRng(99),
    });
    const second = generateCpuTransferDeals({
      clubs: generated.clubs,
      maxDeals: 8,
      players: generated.players,
      rng: createRng(99),
    });

    expect(first).toEqual(second);
    const firstClub = Object.values(generated.clubs)[0];

    if (!firstClub) {
      throw new Error("Expected generated club.");
    }

    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBeLessThanOrEqual(8);
    expect(identifyWeakestPosition(firstClub, generated.players)).toMatch(/GK|DF|MF|FW/);
  });
});
