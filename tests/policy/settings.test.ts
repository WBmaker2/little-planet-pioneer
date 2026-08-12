import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, validateSettings } from "../../src/policy/settings";

describe("school settings", () => {
  it("uses safe defaults with network competition disabled", () => {
    const settings = validateSettings({});

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.leaderboardEnabled).toBe(false);
    expect(settings.dataSharingEnabled).toBe(false);
  });

  it("clamps an arbitrary duration and forces unsafe flags off", () => {
    const settings = validateSettings({
      maxDuration: 7,
      leaderboardEnabled: true,
      dataSharingEnabled: true,
      anonymousName: "  별빛 탐험가  ",
    } as unknown as Parameters<typeof validateSettings>[0]);

    expect(settings.maxDuration).toBe(5);
    expect(settings.anonymousName).toBe("별빛 탐험가");
    expect(settings.leaderboardEnabled).toBe(false);
    expect(settings.dataSharingEnabled).toBe(false);
  });
});
