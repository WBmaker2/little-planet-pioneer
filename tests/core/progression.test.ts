import { describe, expect, it } from "vitest";
import { applyMissionResult, calculateCreditsAdded, createDefaultProfile, getUnlocks } from "../../src/core/progression";
import { missions } from "../../src/core/mission-data";
import type { MissionResult } from "../../src/core/types";

function resultWithScore(totalScore: number, completed = true, creditsEarned = 20): MissionResult {
  return {
    developmentScore: completed ? 100 : 30,
    efficiencyScore: totalScore,
    restorationScore: totalScore,
    totalScore,
    completed,
    creditsEarned,
    badges: { development: completed ? 3 : 1, efficiency: 2, restoration: 2 },
  };
}

describe("progression", () => {
  it("keeps the highest score and highest badges for a mission", () => {
    const mission = missions[0];
    const afterLow = applyMissionResult(createDefaultProfile(), mission, resultWithScore(50));
    const afterHigh = applyMissionResult(afterLow, mission, resultWithScore(80));
    const afterLower = applyMissionResult(afterHigh, mission, resultWithScore(60));

    expect(afterLower.bestScores[mission.id]).toBe(80);
    expect(afterLower.badges[mission.id]).toEqual({ development: 3, efficiency: 2, restoration: 2 });
  });

  it("awards only the increase in mission credits and records completion once", () => {
    const mission = missions[0];
    const partial = applyMissionResult(createDefaultProfile(), mission, resultWithScore(30, false, 5));
    const complete = applyMissionResult(partial, mission, resultWithScore(90, true, 20));
    const replay = applyMissionResult(complete, mission, resultWithScore(95, true, 20));

    expect(partial.credits).toBe(5);
    expect(complete.credits).toBe(20);
    expect(replay.credits).toBe(20);
    expect(replay.completedMissionIds).toEqual([mission.id]);
    expect(calculateCreditsAdded(complete, mission, resultWithScore(95, true, 20))).toBe(0);
  });

  it("calculates headquarters and explicit unlock thresholds", () => {
    let profile = createDefaultProfile();
    for (const mission of missions.slice(0, 6)) {
      profile = applyMissionResult(profile, mission, resultWithScore(80));
    }

    expect(profile.headquartersLevel).toBe(3);
    expect(profile.unlockedBiomeIds).toEqual(["plain", "glacier", "forest"]);
    expect(profile.unlockedBuildingTypes).toContain("greenhouse");
    expect(getUnlocks(profile)).toContain("biome:forest");
  });
});
