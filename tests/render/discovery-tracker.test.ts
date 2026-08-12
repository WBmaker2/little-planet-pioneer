import { describe, expect, it } from "vitest";
import { DiscoveryTracker } from "../../src/render/app/DiscoveryTracker";

describe("DiscoveryTracker", () => {
  it("counts each landmark only once", () => {
    const tracker = new DiscoveryTracker(["crystal", "seed"]);

    expect(tracker.discover("crystal")).toBe(true);
    expect(tracker.discover("crystal")).toBe(false);
    expect(tracker.discoveredCount).toBe(1);
    expect(tracker.progress).toBe(0.5);
  });

  it("ignores unknown landmarks and reports completion", () => {
    const tracker = new DiscoveryTracker(["crystal"]);

    expect(tracker.discover("unknown")).toBe(false);
    expect(tracker.discover("crystal")).toBe(true);
    expect(tracker.isComplete).toBe(true);
    expect(tracker.progress).toBe(1);
  });
});
