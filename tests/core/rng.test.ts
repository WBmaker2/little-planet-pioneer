import { describe, expect, it } from "vitest";
import { createRng } from "../../src/core/rng";

describe("createRng", () => {
  it("creates the same sequence for the same seed", () => {
    const first = createRng(42);
    const second = createRng(42);

    expect([first.nextInt(0, 100), first.nextInt(0, 100), first.nextInt(0, 100)]).toEqual([
      second.nextInt(0, 100),
      second.nextInt(0, 100),
      second.nextInt(0, 100),
    ]);
  });

  it("keeps integers inside the inclusive range", () => {
    const rng = createRng(7);
    const values = Array.from({ length: 50 }, () => rng.nextInt(3, 5));

    expect(values.every((value) => Number.isInteger(value) && value >= 3 && value <= 5)).toBe(true);
  });
});
