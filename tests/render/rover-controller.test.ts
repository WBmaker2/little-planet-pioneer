import { describe, expect, it } from "vitest";
import { RoverController } from "../../src/render/app/RoverController";

describe("RoverController", () => {
  it("moves forward at a deterministic speed", () => {
    const rover = new RoverController({ x: 0, z: 0 }, 2);
    rover.update({ forward: true, backward: false, left: false, right: false }, 0.5);

    expect(rover.position.z).toBeCloseTo(-1);
  });

  it("stays inside the planet chunk bounds", () => {
    const rover = new RoverController({ x: 1.9, z: 1.9 }, 2);
    rover.update({ forward: false, backward: true, left: false, right: true }, 4);

    expect(rover.position.x).toBeLessThanOrEqual(2);
    expect(rover.position.z).toBeLessThanOrEqual(2);
    expect(rover.position.x).toBeGreaterThanOrEqual(-2);
    expect(rover.position.z).toBeGreaterThanOrEqual(-2);
  });
});
