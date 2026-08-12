import { describe, expect, it } from "vitest";
import { createMissionState } from "../../src/core/game-state";
import {
  calculateBuildingEffects,
  calculatePlacementPreview,
  completeMission,
  placeBuilding,
  resolveEvent,
} from "../../src/core/game-engine";
import { missions } from "../../src/core/mission-data";
import type { MissionDefinition, PlanetState } from "../../src/core/types";

const plainMission = missions[0];

function richState(mission: MissionDefinition = plainMission): PlanetState {
  return {
    ...createMissionState(mission, 5),
    resources: { water: 20, energy: 20, parts: 20 },
  };
}

describe("building placement", () => {
  it("places an available building and pays its cost without mutating the input", () => {
    const state = richState();
    const snapshot = structuredClone(state);
    const result = placeBuilding(state, plainMission, "solar", { x: 1, y: 1 });

    expect(result.ok).toBe(true);
    expect(state).toEqual(snapshot);
    if (!result.ok) return;
    expect(result.state.buildings).toHaveLength(1);
    expect(result.state.resources.parts).toBeLessThan(state.resources.parts);
  });

  it("rejects a building when resources are insufficient", () => {
    const state = { ...richState(), resources: { water: 0, energy: 0, parts: 0 } };
    const snapshot = structuredClone(state);
    const result = placeBuilding(state, plainMission, "solar", { x: 1, y: 1 });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error.code).toBe("INSUFFICIENT_RESOURCE");
    expect(state).toEqual(snapshot);
  });

  it("rejects occupied, out-of-bounds, and unavailable placements", () => {
    const first = placeBuilding(richState(), plainMission, "solar", { x: 1, y: 1 });
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const occupied = placeBuilding(first.state, plainMission, "solar", { x: 1, y: 1 });
    const outside = placeBuilding(first.state, plainMission, "solar", { x: 5, y: 1 });
    const unavailable = placeBuilding(first.state, plainMission, "greenhouse", { x: 2, y: 2 });

    expect(occupied.ok === false && occupied.error.code).toBe("INVALID_POSITION");
    expect(outside.ok === false && outside.error.code).toBe("INVALID_POSITION");
    expect(unavailable.ok === false && unavailable.error.code).toBe("BUILDING_UNAVAILABLE");
  });

  it("calculates biome and adjacency resource effects", () => {
    const mission = missions.find(({ id }) => id === "glacier-05")!;
    const state: PlanetState = {
      ...richState(mission),
      buildings: [
        { id: "recycler-1", type: "recycler", position: { x: 1, y: 1 } },
        { id: "greenhouse-2", type: "greenhouse", position: { x: 2, y: 1 } },
      ],
    };

    expect(calculateBuildingEffects(state, mission)).toEqual({ water: 4, energy: 0, parts: 0 });
  });

  it("applies a production turn after a solar building is paid for", () => {
    const state = richState();
    const result = placeBuilding(state, plainMission, "solar", { x: 1, y: 1 }, "spark");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.resources).toEqual({ water: 20, energy: 24, parts: 18 });
  });

  it("previews net cost, production, and adjacency before placement", () => {
    const mission = missions.find(({ id }) => id === "glacier-05")!;
    const state: PlanetState = {
      ...richState(mission),
      buildings: [{ id: "recycler-1", type: "recycler", position: { x: 1, y: 1 } }],
    };
    const preview = calculatePlacementPreview(state, mission, "greenhouse", { x: 2, y: 1 }, null);

    expect(preview.allowed).toBe(true);
    expect(preview.resourceDelta).toEqual({ water: -1, energy: -1, parts: -2 });
    expect(preview.restorationDelta).toBe(6);
    expect(preview.notes).toContain("재활용기 인접");
  });
});

describe("exploration events", () => {
  it("applies a choice atomically and resolves its event exactly once", () => {
    const state = richState();
    const eventId = state.eventOrder[0];
    const event = plainMission.events.find(({ id }) => id === eventId)!;
    const choice = event.choices[0];
    const snapshot = structuredClone(state);
    const first = resolveEvent(state, plainMission, choice.id);

    expect(first.ok).toBe(true);
    expect(state).toEqual(snapshot);
    if (!first.ok) return;
    expect(first.state.resolvedEventIds).toContain(event.id);
    expect(first.state.restoration).toBe(choice.restorationDelta);

    const replay = resolveEvent(first.state, plainMission, choice.id);
    expect(replay.ok === false && replay.error.code).toBe("EVENT_ALREADY_RESOLVED");
  });

  it("gives tick a deterministic one-time bonus on the first event", () => {
    const state = { ...richState(), robotId: "tick" as const };
    const event = plainMission.events.find(({ id }) => id === state.eventOrder[0])!;
    const choice = event.choices[0];
    const result = resolveEvent(state, plainMission, choice.id);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.resources.parts).toBe(state.resources.parts - (choice.cost.parts ?? 0) + (choice.reward.parts ?? 0) + 1);
  });

  it("rejects an event choice that cannot be afforded without changing state", () => {
    const state = { ...richState(), resources: { water: 0, energy: 0, parts: 0 } };
    const event = plainMission.events.find(({ id }) => id === state.eventOrder[0])!;
    const costlyChoice = event.choices.find(({ cost }) => Object.values(cost).some((amount) => (amount ?? 0) > 0))!;
    const snapshot = structuredClone(state);
    const result = resolveEvent(state, plainMission, costlyChoice.id);

    expect(result.ok === false && result.error.code).toBe("INSUFFICIENT_RESOURCE");
    expect(state).toEqual(snapshot);
  });

  it("handles a mission with no events without mutating state", () => {
    const mission = { ...plainMission, id: "zero-event", events: [] };
    const state = createMissionState(mission, 1);
    const result = resolveEvent(state, mission, "missing-choice");

    expect(result.ok === false && result.error.code).toBe("INVALID_EVENT_CHOICE");
    expect(result.state).toBe(state);
  });
});

describe("mission completion", () => {
  it("returns partial progress and partial rewards when the target is not met", () => {
    const result = completeMission(richState(), plainMission);

    expect(result.completed).toBe(false);
    expect(result.developmentScore).toBe(0);
    expect(result.creditsEarned).toBeGreaterThan(0);
    expect(result.creditsEarned).toBeLessThan(plainMission.rewardCredits);
  });

  it("returns full development progress when the target is met", () => {
    const placed = placeBuilding(richState(), plainMission, "solar", { x: 0, y: 0 });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    const result = completeMission(placed.state, plainMission);
    expect(result.completed).toBe(true);
    expect(result.developmentScore).toBe(100);
    expect(result.creditsEarned).toBe(plainMission.rewardCredits);
    expect(result.badges.development).toBe(3);
  });
});
