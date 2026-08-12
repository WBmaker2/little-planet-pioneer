import type { BuildingType, MissionDefinition, MissionResult, ProfileState } from "./types";

const BUILDING_UNLOCKS: Array<{ completed: number; building: BuildingType }> = [
  { completed: 0, building: "solar" },
  { completed: 0, building: "beacon" },
  { completed: 1, building: "recycler" },
  { completed: 3, building: "workshop" },
  { completed: 5, building: "greenhouse" },
  { completed: 8, building: "observatory" },
];

export function createDefaultProfile(): ProfileState {
  return {
    credits: 0,
    earnedCreditsByMission: {},
    completedMissionIds: [],
    bestScores: {},
    badges: {},
    unlockedBuildingTypes: ["solar", "beacon"],
    unlockedBiomeIds: ["plain"],
    headquartersLevel: 1,
  };
}

export function getUnlocks(profile: ProfileState): string[] {
  return [
    ...profile.unlockedBuildingTypes.map((building) => `building:${building}`),
    ...profile.unlockedBiomeIds.map((biome) => `biome:${biome}`),
  ];
}

export function calculateCreditsAdded(
  profile: ProfileState,
  mission: MissionDefinition,
  result: MissionResult,
): number {
  const previousCredits = profile.earnedCreditsByMission[mission.id] ?? 0;
  return Math.max(0, Math.max(previousCredits, result.creditsEarned) - previousCredits);
}

export function applyMissionResult(
  profile: ProfileState,
  mission: MissionDefinition,
  result: MissionResult,
): ProfileState {
  const previousCredits = profile.earnedCreditsByMission[mission.id] ?? 0;
  const missionCredits = Math.max(previousCredits, result.creditsEarned);
  const creditIncrease = calculateCreditsAdded(profile, mission, result);
  const completedMissionIds = result.completed
    ? [...new Set([...profile.completedMissionIds, mission.id])]
    : [...profile.completedMissionIds];
  const completedCount = completedMissionIds.length;
  const previousBadges = profile.badges[mission.id] ?? { development: 0, efficiency: 0, restoration: 0 };
  const unlockedBuildingTypes = BUILDING_UNLOCKS.filter(({ completed }) => completedCount >= completed).map(
    ({ building }) => building,
  );
  const unlockedBiomeIds: ProfileState["unlockedBiomeIds"] = ["plain"];
  if (completedCount >= 3) unlockedBiomeIds.push("glacier");
  if (completedCount >= 6) unlockedBiomeIds.push("forest");

  return {
    ...profile,
    credits: profile.credits + creditIncrease,
    earnedCreditsByMission: { ...profile.earnedCreditsByMission, [mission.id]: missionCredits },
    completedMissionIds,
    bestScores: {
      ...profile.bestScores,
      [mission.id]: Math.max(profile.bestScores[mission.id] ?? 0, result.totalScore),
    },
    badges: {
      ...profile.badges,
      [mission.id]: {
        development: Math.max(previousBadges.development, result.badges.development),
        efficiency: Math.max(previousBadges.efficiency, result.badges.efficiency),
        restoration: Math.max(previousBadges.restoration, result.badges.restoration),
      },
    },
    unlockedBuildingTypes,
    unlockedBiomeIds,
    headquartersLevel: Math.min(5, 1 + Math.floor(completedCount / 3)),
  };
}
