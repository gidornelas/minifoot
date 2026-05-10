import { describe, expect, it } from "vitest";
import { between, chance, createRng, integer, weighted } from "../../engine";

describe("rng", () => {
  it("produces the same sequence for the same seed", () => {
    const first = createRng(12_345);
    const second = createRng(12_345);

    expect(Array.from({ length: 8 }, () => first.next())).toEqual(
      Array.from({ length: 8 }, () => second.next()),
    );
  });

  it("keeps helper output deterministic", () => {
    const first = createRng(99);
    const second = createRng(99);

    const run = (rng: ReturnType<typeof createRng>) => [
      between(rng, 10, 20),
      integer(rng, 1, 6),
      chance(rng, 0.5),
      weighted(rng, [
        { item: "GK", weight: 1 },
        { item: "FW", weight: 3 },
      ]),
      rng.getState(),
    ];

    expect(run(first)).toEqual(run(second));
  });
});
