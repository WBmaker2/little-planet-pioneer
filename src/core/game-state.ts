import { createRng } from "./rng";
import type { MissionDefinition, PlanetState } from "./types";
import type { SupportRobot } from "./types";

export function applyRobotBonus(state: PlanetState, robotId: SupportRobot["id"] | null): PlanetState {
  if (state.robotId === robotId) return state;
  return {
    ...state,
    robotId,
    resources: {
      ...state.resources,
      water: state.resources.water + (robotId === "waterdrop" ? 2 : 0),
    },
  };
}

export function createMissionState(
  mission: MissionDefinition,
  seed: number,
  robotId: SupportRobot["id"] | null = null,
): PlanetState {
  const normalizedSeed = seed >>> 0;
  const rng = createRng(normalizedSeed);

  return applyRobotBonus({
    missionId: mission.id,
    seed: normalizedSeed,
    resources: { ...mission.initialResources },
    buildings: [],
    restoration: 0,
    eventIndex: 0,
    eventOrder: rng.shuffle(mission.events.map(({ id }) => id)),
    resolvedEventIds: [],
    robotId: null,
    discoveredLandmarkIds: [],
  }, robotId);
}
