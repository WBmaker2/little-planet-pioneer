import { describe, expect, it } from "vitest";
import { calculatePlacementPreview } from "../../src/core/game-engine";
import { missions } from "../../src/core/mission-data";
import { SimulationBridge } from "../../src/render/bridge/SimulationBridge";

describe("SimulationBridge", () => {
  it("keeps the 3D placement preview equal to the core simulation", () => {
    const mission = missions[0];
    const bridge = new SimulationBridge({ mission, seed: 42 });
    bridge.selectRobot("spark");

    expect(bridge.previewBuilding("solar", { x: 0, y: 0 })).toEqual(
      calculatePlacementPreview(bridge.state, mission, "solar", { x: 0, y: 0 }, "spark"),
    );
  });

  it("emits a checkpoint after a successful robot or building action", () => {
    const changes: string[] = [];
    const bridge = new SimulationBridge({
      mission: missions[0],
      seed: 42,
      onChange: (_state, reason) => changes.push(reason),
    });

    bridge.selectRobot("waterdrop");
    const result = bridge.placeBuilding("solar", { x: 0, y: 0 });

    expect(result.ok).toBe(true);
    expect(bridge.state.robotId).toBe("waterdrop");
    expect(changes).toEqual(["robot-selected", "building-placed"]);
  });

  it("previews and commits one production turn from placed facilities", () => {
    const bridge = new SimulationBridge({ mission: missions[0], seed: 42 });
    const placed = bridge.placeBuilding("solar", { x: 0, y: 0 });
    if (!placed.ok) throw new Error("expected solar placement to succeed");

    expect(bridge.previewProductionTurn()).toEqual({ water: 0, energy: 3, parts: 0 });
    expect(bridge.produceTurn()).toEqual({ water: 6, energy: 11, parts: 3 });
    expect(bridge.state.resources).toEqual({ water: 6, energy: 11, parts: 3 });
  });

  it("leaves resources unchanged when there is no facility output", () => {
    const bridge = new SimulationBridge({ mission: missions[0], seed: 42 });

    expect(bridge.produceTurn()).toEqual({ water: 6, energy: 5, parts: 5 });
    expect(bridge.lastProduction).toEqual({ water: 0, energy: 0, parts: 0 });
  });
});
