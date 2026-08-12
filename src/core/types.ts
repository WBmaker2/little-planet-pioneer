export type ResourceKind = "water" | "energy" | "parts";
export type Resources = Record<ResourceKind, number>;
export type Biome = "plain" | "glacier" | "forest";
export type BuildingType = "solar" | "recycler" | "workshop" | "greenhouse" | "observatory" | "beacon";
export type DurationBucket = 3 | 5 | 10 | 15;

export interface Coordinate {
  x: number;
  y: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  position: Coordinate;
}

export interface MissionTarget {
  buildingType: BuildingType;
  count: number;
}

export interface SupportRobot {
  id: "waterdrop" | "spark" | "tick" | "sprout";
  title: string;
  description: string;
}

export interface EventChoice {
  id: string;
  label: string;
  cost: Partial<Resources>;
  reward: Partial<Resources>;
  restorationDelta: number;
}

export interface ExplorationEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface MissionDefinition {
  id: string;
  biome: Biome;
  duration: DurationBucket;
  title: string;
  initialResources: Resources;
  target: MissionTarget;
  events: ExplorationEvent[];
  availableBuildings: BuildingType[];
  rewardCredits: number;
}

export interface PlanetState {
  missionId: string;
  seed: number;
  resources: Resources;
  buildings: Building[];
  restoration: number;
  eventIndex: number;
  eventOrder: string[];
  resolvedEventIds: string[];
  robotId?: SupportRobot["id"] | null;
  discoveredLandmarkIds?: string[];
}

export interface MissionResult {
  developmentScore: number;
  efficiencyScore: number;
  restorationScore: number;
  totalScore: number;
  completed: boolean;
  creditsEarned: number;
  creditsAdded?: number;
  badges: {
    development: number;
    efficiency: number;
    restoration: number;
  };
}

export interface ProfileState {
  credits: number;
  earnedCreditsByMission: Record<string, number>;
  completedMissionIds: string[];
  bestScores: Record<string, number>;
  badges: Record<string, { development: number; efficiency: number; restoration: number }>;
  unlockedBuildingTypes: BuildingType[];
  unlockedBiomeIds: Biome[];
  headquartersLevel: number;
}
