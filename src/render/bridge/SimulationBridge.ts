import {
  calculateBuildingEffects,
  calculatePlacementPreview,
  placeBuilding,
  type ActionResult,
  type PlacementPreview,
} from "../../core/game-engine";
import { applyRobotBonus, createMissionState } from "../../core/game-state";
import { missions } from "../../core/mission-data";
import type { BuildingType, Coordinate, MissionDefinition, PlanetState, SupportRobot } from "../../core/types";

export type SimulationChangeReason = "robot-selected" | "building-placed" | "turn-produced";

export interface SimulationBridgeOptions {
  mission?: MissionDefinition;
  seed?: number;
  state?: PlanetState;
  onChange?: (state: PlanetState, reason: SimulationChangeReason) => void;
}

export class SimulationBridge {
  readonly mission: MissionDefinition;
  state: PlanetState;
  lastProduction = { water: 0, energy: 0, parts: 0 };
  private readonly onChange?: SimulationBridgeOptions["onChange"];

  constructor(options: SimulationBridgeOptions = {}) {
    this.mission = options.mission ?? missions.find(({ id }) => id === options.state?.missionId) ?? missions[0];
    this.state = options.state ?? createMissionState(this.mission, options.seed ?? 1);
    this.onChange = options.onChange;
  }

  selectRobot(robotId: SupportRobot["id"]): PlanetState {
    if (this.state.robotId === robotId) return this.state;
    this.state = applyRobotBonus(this.state, robotId);
    this.onChange?.(this.state, "robot-selected");
    return this.state;
  }

  previewBuilding(type: BuildingType, position: Coordinate): PlacementPreview {
    return calculatePlacementPreview(this.state, this.mission, type, position, this.state.robotId ?? null);
  }

  placeBuilding(type: BuildingType, position: Coordinate): ActionResult {
    const result = placeBuilding(this.state, this.mission, type, position, this.state.robotId ?? null);
    if (result.ok) {
      this.state = result.state;
      this.onChange?.(this.state, "building-placed");
    }
    return result;
  }

  previewProductionTurn(): PlanetState["resources"] {
    return calculateBuildingEffects(this.state, this.mission, this.state.robotId ?? null);
  }

  produceTurn(): PlanetState["resources"] {
    this.lastProduction = this.previewProductionTurn();
    this.state = {
      ...this.state,
      resources: {
        water: this.state.resources.water + this.lastProduction.water,
        energy: this.state.resources.energy + this.lastProduction.energy,
        parts: this.state.resources.parts + this.lastProduction.parts,
      },
    };
    this.onChange?.(this.state, "turn-produced");
    return this.state.resources;
  }
}
