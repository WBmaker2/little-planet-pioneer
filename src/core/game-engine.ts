import type {
  BuildingType,
  Coordinate,
  MissionDefinition,
  MissionResult,
  PlanetState,
  ResourceKind,
  Resources,
  SupportRobot,
} from "./types";

export interface ActionError {
  code:
    | "INSUFFICIENT_RESOURCE"
    | "INVALID_POSITION"
    | "BUILDING_UNAVAILABLE"
    | "EVENT_ALREADY_RESOLVED"
    | "INVALID_EVENT_CHOICE";
  message: string;
}

export type ActionResult =
  | { ok: true; state: PlanetState }
  | { ok: false; error: ActionError; state: PlanetState };

export const BUILDING_COSTS: Record<BuildingType, Resources> = {
  solar: { water: 0, energy: 0, parts: 2 },
  recycler: { water: 0, energy: 1, parts: 2 },
  workshop: { water: 0, energy: 2, parts: 2 },
  greenhouse: { water: 2, energy: 1, parts: 2 },
  observatory: { water: 0, energy: 3, parts: 3 },
  beacon: { water: 0, energy: 1, parts: 1 },
};

const RESOURCE_KEYS: ResourceKind[] = ["water", "energy", "parts"];
const GRID_SIZE = 5;

export interface PlacementPreview {
  allowed: boolean;
  resourceDelta: Resources;
  restorationDelta: number;
  notes: string[];
  error?: ActionError;
}

function failure(state: PlanetState, code: ActionError["code"], message: string): ActionResult {
  return { ok: false, error: { code, message }, state };
}

function canAfford(resources: Resources, cost: Partial<Resources>): boolean {
  return RESOURCE_KEYS.every((key) => resources[key] >= (cost[key] ?? 0));
}

function applyResourceChange(
  resources: Resources,
  cost: Partial<Resources>,
  reward: Partial<Resources> = {},
): Resources {
  return Object.fromEntries(
    RESOURCE_KEYS.map((key) => [key, resources[key] - (cost[key] ?? 0) + (reward[key] ?? 0)]),
  ) as unknown as Resources;
}

function isValidPosition(position: Coordinate): boolean {
  return (
    Number.isInteger(position.x) &&
    Number.isInteger(position.y) &&
    position.x >= 0 &&
    position.x < GRID_SIZE &&
    position.y >= 0 &&
    position.y < GRID_SIZE
  );
}

function areAdjacent(first: Coordinate, second: Coordinate): boolean {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1;
}

export function canPlaceBuilding(
  state: PlanetState,
  mission: MissionDefinition,
  type: BuildingType,
  position: Coordinate,
): ActionResult {
  if (!mission.availableBuildings.includes(type)) {
    return failure(state, "BUILDING_UNAVAILABLE", "이 미션에서는 아직 사용할 수 없는 건물입니다.");
  }

  if (!isValidPosition(position) || state.buildings.some((building) => building.position.x === position.x && building.position.y === position.y)) {
    return failure(state, "INVALID_POSITION", "선택한 위치에는 건물을 배치할 수 없습니다.");
  }

  if (!canAfford(state.resources, BUILDING_COSTS[type])) {
    return failure(state, "INSUFFICIENT_RESOURCE", "건설에 필요한 자원이 부족합니다.");
  }

  return { ok: true, state };
}

export function placeBuilding(
  state: PlanetState,
  mission: MissionDefinition,
  type: BuildingType,
  position: Coordinate,
  robotId: SupportRobot["id"] | null = state.robotId ?? null,
): ActionResult {
  const validation = canPlaceBuilding(state, mission, type, position);

  if (!validation.ok) {
    return validation;
  }

  const placedState: PlanetState = {
      ...state,
      buildings: [
        ...state.buildings,
        { id: `${type}-${state.buildings.length + 1}`, type, position: { ...position } },
      ],
      robotId,
    };
  const previousProduction = calculateBuildingEffects(state, mission, robotId);
  const nextProduction = calculateBuildingEffects(placedState, mission, robotId);
  const previousRestoration = calculateBuildingRestoration(state, robotId);
  const nextRestoration = calculateBuildingRestoration(placedState, robotId);
  const productionDelta = subtractResources(nextProduction, previousProduction);

  return {
    ok: true,
    state: {
      ...placedState,
      resources: applyResourceChange(state.resources, BUILDING_COSTS[type], productionDelta),
      restoration: Math.max(0, Math.min(100, state.restoration + nextRestoration - previousRestoration)),
    },
  };
}

export function resolveEvent(
  state: PlanetState,
  mission: MissionDefinition,
  choiceId: string,
): ActionResult {
  const matchedEvent = mission.events.find((event) => event.choices.some((choice) => choice.id === choiceId));

  if (!matchedEvent) {
    return failure(state, "INVALID_EVENT_CHOICE", "현재 사건에서 선택할 수 없는 행동입니다.");
  }

  if (state.resolvedEventIds.includes(matchedEvent.id)) {
    return failure(state, "EVENT_ALREADY_RESOLVED", "이미 해결한 사건입니다.");
  }

  const currentEventId = state.eventOrder[state.eventIndex];
  if (currentEventId !== matchedEvent.id) {
    return failure(state, "INVALID_EVENT_CHOICE", "현재 사건의 선택지를 골라 주세요.");
  }

  const choice = matchedEvent.choices.find(({ id }) => id === choiceId)!;
  if (!canAfford(state.resources, choice.cost)) {
    return failure(state, "INSUFFICIENT_RESOURCE", "이 선택에 필요한 자원이 부족합니다.");
  }

  const robotReward: Partial<Resources> = state.robotId === "tick" && state.resolvedEventIds.length === 0
    ? { parts: 1 }
    : {};

  return {
    ok: true,
    state: {
      ...state,
      resources: applyResourceChange(state.resources, choice.cost, {
        water: (choice.reward.water ?? 0) + (robotReward.water ?? 0),
        energy: (choice.reward.energy ?? 0) + (robotReward.energy ?? 0),
        parts: (choice.reward.parts ?? 0) + (robotReward.parts ?? 0),
      }),
      restoration: Math.max(0, Math.min(100, state.restoration + choice.restorationDelta)),
      eventIndex: state.eventIndex + 1,
      resolvedEventIds: [...state.resolvedEventIds, matchedEvent.id],
    },
  };
}

function subtractResources(next: Resources, previous: Resources): Resources {
  return {
    water: next.water - previous.water,
    energy: next.energy - previous.energy,
    parts: next.parts - previous.parts,
  };
}

function calculateBuildingRestoration(state: PlanetState, robotId: SupportRobot["id"] | null): number {
  return state.buildings.reduce((total, building) => {
    let value = building.type === "greenhouse" ? 4 : building.type === "observatory" ? 2 : building.type === "beacon" ? 1 : 0;
    if (building.type === "greenhouse" && state.buildings.some(
      (candidate) => candidate.type === "recycler" && areAdjacent(building.position, candidate.position),
    )) value += 2;
    if (robotId === "sprout") value += building.type === "greenhouse" ? 2 : 0;
    return total + value;
  }, 0);
}

export function calculateBuildingEffects(
  state: PlanetState,
  mission: MissionDefinition,
  robotId: SupportRobot["id"] | null = state.robotId ?? null,
): Resources {
  const effects: Resources = { water: 0, energy: 0, parts: 0 };

  for (const building of state.buildings) {
    if (building.type === "solar") {
      effects.energy += 2 + (mission.biome === "plain" ? 1 : 0) + (robotId === "spark" ? 1 : 0);
    }
    if (building.type === "recycler") {
      effects.water += 2 + (mission.biome === "glacier" ? 1 : 0);
      const hasGreenhouseNeighbor = state.buildings.some(
        (candidate) => candidate.type === "greenhouse" && areAdjacent(building.position, candidate.position),
      );
      if (hasGreenhouseNeighbor) effects.water += 1;
    }
    if (building.type === "workshop") {
      effects.parts += 1;
    }
  }

  return effects;
}

export function calculatePlacementPreview(
  state: PlanetState,
  mission: MissionDefinition,
  type: BuildingType,
  position: Coordinate,
  robotId: SupportRobot["id"] | null = state.robotId ?? null,
): PlacementPreview {
  const validation = canPlaceBuilding(state, mission, type, position);
  if (!validation.ok) {
    return { allowed: false, resourceDelta: { water: 0, energy: 0, parts: 0 }, restorationDelta: 0, notes: [], error: validation.error };
  }

  const placedState = { ...state, robotId, buildings: [...state.buildings, { id: "preview", type, position: { ...position } }] };
  const productionDelta = subtractResources(
    calculateBuildingEffects(placedState, mission, robotId),
    calculateBuildingEffects(state, mission, robotId),
  );
  const restorationDelta = calculateBuildingRestoration(placedState, robotId) - calculateBuildingRestoration(state, robotId);
  const resourceDelta = {
    water: productionDelta.water - BUILDING_COSTS[type].water,
    energy: productionDelta.energy - BUILDING_COSTS[type].energy,
    parts: productionDelta.parts - BUILDING_COSTS[type].parts,
  };
  const notes: string[] = [];
  if (type === "solar" && mission.biome === "plain") notes.push("평원 보너스");
  if (type === "recycler" && mission.biome === "glacier") notes.push("빙하 보너스");
  if (type === "greenhouse" && state.buildings.some((building) => building.type === "recycler" && areAdjacent(building.position, position))) {
    notes.push("재활용기 인접");
  }
  return { allowed: true, resourceDelta, restorationDelta, notes };
}

function scoreToBadge(score: number): number {
  if (score >= 80) return 3;
  if (score >= 50) return 2;
  if (score > 0) return 1;
  return 0;
}

export function completeMission(state: PlanetState, mission: MissionDefinition): MissionResult {
  const targetCount = state.buildings.filter(({ type }) => type === mission.target.buildingType).length;
  const developmentScore = Math.min(100, Math.round((targetCount / mission.target.count) * 100));
  const initialTotal = RESOURCE_KEYS.reduce((sum, key) => sum + mission.initialResources[key], 0);
  const remainingTotal = RESOURCE_KEYS.reduce((sum, key) => sum + state.resources[key], 0);
  const efficiencyScore = initialTotal === 0 ? 100 : Math.min(100, Math.max(0, Math.round((remainingTotal / initialTotal) * 100)));
  const restorationScore = Math.min(100, Math.max(0, Math.round(state.restoration)));
  const totalScore = Math.round((developmentScore + efficiencyScore + restorationScore) / 3);
  const completed = targetCount >= mission.target.count;
  const creditsEarned = completed
    ? mission.rewardCredits
    : Math.max(1, Math.min(mission.rewardCredits - 1, Math.round((mission.rewardCredits * totalScore) / 200)));

  return {
    developmentScore,
    efficiencyScore,
    restorationScore,
    totalScore,
    completed,
    creditsEarned,
    badges: {
      development: scoreToBadge(developmentScore),
      efficiency: scoreToBadge(efficiencyScore),
      restoration: scoreToBadge(restorationScore),
    },
  };
}
