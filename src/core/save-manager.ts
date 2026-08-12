import { createDefaultProfile } from "./progression";
import type { PlanetState, ProfileState } from "./types";
import { DEFAULT_SETTINGS, validateSettings, type SchoolSettings } from "../policy/settings";
import { missions } from "./mission-data";

const SAVE_KEY = "little-planet-pioneer:save";

export interface SaveData {
  version: 1;
  profile: ProfileState;
  activeMission?: PlanetState;
  settings: SchoolSettings;
}

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export function createDefaultSaveData(): SaveData {
  return {
    version: 1,
    profile: createDefaultProfile(),
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function createLocalStorageAdapter(storage: Storage): StorageAdapter {
  return {
    get: (key) => storage.getItem(key),
    set: (key, value) => storage.setItem(key, value),
    remove: (key) => storage.removeItem(key),
  };
}

function isProfileState(value: unknown): value is ProfileState {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<ProfileState>;
  return (
    typeof profile.credits === "number" &&
    Array.isArray(profile.completedMissionIds) &&
    !!profile.bestScores &&
    !!profile.badges &&
    Array.isArray(profile.unlockedBuildingTypes) &&
    Array.isArray(profile.unlockedBiomeIds) &&
    typeof profile.headquartersLevel === "number"
  );
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPlanetState(value: unknown): value is PlanetState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PlanetState>;
  const resources = state.resources as Partial<PlanetState["resources"]> | undefined;
  return (
    typeof state.missionId === "string" &&
    missions.some(({ id }) => id === state.missionId) &&
    typeof state.seed === "number" && Number.isFinite(state.seed) &&
    !!resources && isNonNegativeNumber(resources.water) && isNonNegativeNumber(resources.energy) && isNonNegativeNumber(resources.parts) &&
    Array.isArray(state.buildings) &&
    state.buildings.every((building) =>
      !!building && typeof building.id === "string" && typeof building.type === "string" &&
      Number.isInteger(building.position?.x) && Number.isInteger(building.position?.y),
    ) &&
    isNonNegativeNumber(state.restoration) && state.restoration <= 100 &&
    Number.isInteger(state.eventIndex) && (state.eventIndex ?? -1) >= 0 &&
    Array.isArray(state.eventOrder) && state.eventOrder.every((id) => typeof id === "string") &&
    Array.isArray(state.resolvedEventIds) && state.resolvedEventIds.every((id) => typeof id === "string")
  );
}

export class SaveManager {
  constructor(private readonly storage: StorageAdapter) {}

  load(): SaveData | null {
    try {
      const raw = this.storage.get(SAVE_KEY);
      if (raw === null) return null;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (parsed.version !== 1 || !isProfileState(parsed.profile) || !parsed.settings) {
        return createDefaultSaveData();
      }

      return {
        version: 1,
        profile: {
          ...parsed.profile,
          earnedCreditsByMission: parsed.profile.earnedCreditsByMission ?? {},
        },
        ...(isPlanetState(parsed.activeMission)
          ? { activeMission: { ...parsed.activeMission, robotId: parsed.activeMission.robotId ?? null } }
          : {}),
        settings: validateSettings(parsed.settings),
      };
    } catch {
      return createDefaultSaveData();
    }
  }

  save(data: SaveData): void {
    try {
      this.storage.set(SAVE_KEY, JSON.stringify(data));
    } catch {
      // The current session remains playable in memory when storage is blocked or full.
    }
  }

  clear(): void {
    try {
      this.storage.remove(SAVE_KEY);
    } catch {
      // Clearing in-memory scene context still provides a safe reset for this session.
    }
  }
}
