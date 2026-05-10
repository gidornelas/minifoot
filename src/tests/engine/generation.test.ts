import { describe, expect, it } from "vitest";
import { generateLeague } from "../../engine";

describe("generation", () => {
  it("generates a deterministic 20-club league with 22 players per club", () => {
    const first = generateLeague(2_026);
    const second = generateLeague(2_026);

    expect(second).toEqual(first);
    expect(first.league.clubIds).toHaveLength(20);
    expect(Object.keys(first.clubs)).toHaveLength(20);
    expect(Object.keys(first.players)).toHaveLength(440);

    for (const clubId of first.league.clubIds) {
      expect(first.clubs[clubId]?.squad).toHaveLength(22);
      expect(first.clubs[clubId]?.squad.every((playerId) => first.players[playerId])).toBe(true);
    }
  });

  it("changes generated players when the seed changes", () => {
    const first = generateLeague(1);
    const second = generateLeague(2);
    const firstPlayerIds = Object.keys(first.players);
    const secondPlayerIds = Object.keys(second.players);

    expect(secondPlayerIds).not.toEqual(firstPlayerIds);
  });
});
