import { describe, expect, it } from "vitest";
import { DiscoveryTracker } from "../../src/render/app/DiscoveryTracker";
import { findNearbyLandmarks } from "../../src/render/app/landmark-discovery";

describe("DiscoveryTracker", () => {
  it("counts each landmark only once", () => {
    const tracker = new DiscoveryTracker(["crystal", "seed"]);

    expect(tracker.discover("crystal")).toBe(true);
    expect(tracker.discover("crystal")).toBe(false);
    expect(tracker.discoveredCount).toBe(1);
    expect(tracker.progress).toBe(0.5);
  });

  it("restores only known discoveries from a saved checkpoint", () => {
    const tracker = new DiscoveryTracker(["crystal", "seed"], ["seed", "unknown"]);

    expect(tracker.ids).toEqual(["seed"]);
    expect(tracker.discoveredCount).toBe(1);
  });

  it("ignores unknown landmarks and reports completion", () => {
    const tracker = new DiscoveryTracker(["crystal"]);

    expect(tracker.discover("unknown")).toBe(false);
    expect(tracker.discover("crystal")).toBe(true);
    expect(tracker.isComplete).toBe(true);
    expect(tracker.progress).toBe(1);
  });

  it("finds landmarks when the rover enters the friendly discovery radius", () => {
    expect(findNearbyLandmarks(
      { x: 0, z: 0 },
      [{ id: "near", x: 0.5, z: 0 }, { id: "far", x: 0.8, z: 0 }],
    )).toEqual(["near"]);
  });
});
