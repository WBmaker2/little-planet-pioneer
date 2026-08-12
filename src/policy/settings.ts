import type { DurationBucket } from "../core/types";

export interface SchoolSettings {
  maxDuration: DurationBucket;
  leaderboardEnabled: false;
  anonymousName: string;
  dataSharingEnabled: false;
}

export const DEFAULT_SETTINGS: SchoolSettings = {
  maxDuration: 10,
  leaderboardEnabled: false,
  anonymousName: "초록 개척자",
  dataSharingEnabled: false,
};

const DURATIONS: DurationBucket[] = [3, 5, 10, 15];

function nearestDuration(value: unknown): DurationBucket {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.maxDuration;
  }

  return DURATIONS.reduce((nearest, candidate) =>
    Math.abs(candidate - value) < Math.abs(nearest - value) ? candidate : nearest,
  );
}

export function validateSettings(input: Partial<SchoolSettings>): SchoolSettings {
  const anonymousName = typeof input.anonymousName === "string" ? input.anonymousName.trim().slice(0, 20) : "";

  return {
    maxDuration: nearestDuration(input.maxDuration),
    leaderboardEnabled: false,
    anonymousName: anonymousName || DEFAULT_SETTINGS.anonymousName,
    dataSharingEnabled: false,
  };
}
