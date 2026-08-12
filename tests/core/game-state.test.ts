import { describe, expect, it } from "vitest";
import { createMissionState } from "../../src/core/game-state";
import { missions } from "../../src/core/mission-data";

describe("createMissionState", () => {
  it("creates a fresh mission with declared resources and no buildings", () => {
    const mission = missions[0];
    const state = createMissionState(mission, 1);

    expect(state.resources).toEqual(mission.initialResources);
    expect(state.resources).not.toBe(mission.initialResources);
    expect(state.buildings).toEqual([]);
    expect(state.restoration).toBe(0);
    expect(state.resolvedEventIds).toEqual([]);
  });

  it("creates the same event order for the same seed", () => {
    const mission = missions[0];

    expect(createMissionState(mission, 42).eventOrder).toEqual(createMissionState(mission, 42).eventOrder);
  });

  it("applies the selected water robot bonus without mutating mission data", () => {
    const mission = missions[0];
    const state = createMissionState(mission, 42, "waterdrop");

    expect(state.robotId).toBe("waterdrop");
    expect(state.resources.water).toBe(mission.initialResources.water + 2);
    expect(mission.initialResources.water).toBe(6);
  });
});
