import { describe, expect, it } from "vitest";
import { events, missions, supportRobots } from "../../src/core/mission-data";

describe("mission data", () => {
  it("ships the agreed MVP content counts", () => {
    expect(missions).toHaveLength(15);
    expect(events).toHaveLength(12);
    expect(supportRobots).toHaveLength(4);
    expect(new Set(missions.map((mission) => mission.biome))).toEqual(new Set(["plain", "glacier", "forest"]));
  });

  it("declares valid resources, durations, targets, and rewards", () => {
    const allowedDurations = new Set([3, 5, 10, 15]);

    for (const mission of missions) {
      expect(Object.keys(mission.initialResources).sort()).toEqual(["energy", "parts", "water"]);
      expect(allowedDurations.has(mission.duration)).toBe(true);
      expect(mission.target.count).toBeGreaterThan(0);
      expect(mission.availableBuildings).toContain(mission.target.buildingType);
      expect(mission.rewardCredits).toBeGreaterThan(0);
      expect(mission.events.length).toBeGreaterThan(0);
    }
  });

  it("uses unique ids and actionable event choices", () => {
    expect(new Set(missions.map(({ id }) => id)).size).toBe(missions.length);
    expect(new Set(events.map(({ id }) => id)).size).toBe(events.length);
    expect(new Set(supportRobots.map(({ id }) => id)).size).toBe(supportRobots.length);

    for (const event of events) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(event.choices.map(({ id }) => id)).size).toBe(event.choices.length);
    }
  });

  it("describes the implemented robot abilities exactly", () => {
    expect(supportRobots.find(({ id }) => id === "waterdrop")?.description).toContain("물 +2");
    expect(supportRobots.find(({ id }) => id === "spark")?.description).toContain("에너지 +1");
    expect(supportRobots.find(({ id }) => id === "tick")?.description).toContain("부품 +1");
    expect(supportRobots.find(({ id }) => id === "sprout")?.description).toContain("회복도 +2");
  });
});
