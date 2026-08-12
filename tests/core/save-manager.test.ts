import { describe, expect, it } from "vitest";
import { createDefaultProfile } from "../../src/core/progression";
import { SaveManager, createDefaultSaveData, type StorageAdapter } from "../../src/core/save-manager";
import { DEFAULT_SETTINGS } from "../../src/policy/settings";

class MemoryStorage implements StorageAdapter {
  private values = new Map<string, string>();

  get(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.values.set(key, value);
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}

describe("SaveManager", () => {
  it("round-trips versioned save data", () => {
    const manager = new SaveManager(new MemoryStorage());
    const data = { version: 1 as const, profile: createDefaultProfile(), settings: DEFAULT_SETTINGS };

    manager.save(data);
    expect(manager.load()).toEqual(data);
  });

  it("returns a clean default after malformed JSON or an unknown version", () => {
    const malformed = new MemoryStorage();
    malformed.set("little-planet-pioneer:save", "not-json");
    expect(new SaveManager(malformed).load()).toEqual(createDefaultSaveData());

    const unknown = new MemoryStorage();
    unknown.set("little-planet-pioneer:save", JSON.stringify({ version: 2 }));
    expect(new SaveManager(unknown).load()).toEqual(createDefaultSaveData());
  });

  it("clears saved data", () => {
    const manager = new SaveManager(new MemoryStorage());
    manager.save(createDefaultSaveData());
    manager.clear();

    expect(manager.load()).toBeNull();
  });

  it("ignores a malformed active mission while preserving valid progress", () => {
    const storage = new MemoryStorage();
    const profile = createDefaultProfile();
    storage.set("little-planet-pioneer:save", JSON.stringify({
      version: 1,
      profile,
      settings: DEFAULT_SETTINGS,
      activeMission: { missionId: "plain-01", resources: { water: -5 } },
    }));

    expect(new SaveManager(storage).load()).toEqual({ version: 1, profile, settings: DEFAULT_SETTINGS });
  });

  it("loads an older active mission without a robot as a null robot selection", () => {
    const storage = new MemoryStorage();
    storage.set("little-planet-pioneer:save", JSON.stringify({
      version: 1,
      profile: createDefaultProfile(),
      settings: DEFAULT_SETTINGS,
      activeMission: {
        missionId: "plain-01", seed: 1, resources: { water: 6, energy: 5, parts: 5 },
        buildings: [], restoration: 0, eventIndex: 0, eventOrder: ["cracked-cable"], resolvedEventIds: [],
      },
    }));

    expect(new SaveManager(storage).load()?.activeMission?.robotId).toBeNull();
  });

  it("round-trips discovered 3D landmarks in an active mission", () => {
    const manager = new SaveManager(new MemoryStorage());
    const data = {
      ...createDefaultSaveData(),
      activeMission: {
        missionId: "plain-01",
        seed: 1,
        resources: { water: 6, energy: 5, parts: 5 },
        buildings: [],
        restoration: 0,
        eventIndex: 0,
        eventOrder: ["cracked-cable"],
        resolvedEventIds: [],
        robotId: null,
        discoveredLandmarkIds: ["crystal"],
      },
    };

    manager.save(data);

    expect(manager.load()?.activeMission?.discoveredLandmarkIds).toEqual(["crystal"]);
  });

  it("does not crash when browser storage is unavailable", () => {
    const unavailable: StorageAdapter = {
      get: () => { throw new Error("blocked"); },
      set: () => { throw new Error("quota"); },
      remove: () => { throw new Error("blocked"); },
    };
    const manager = new SaveManager(unavailable);

    expect(manager.load()).toEqual(createDefaultSaveData());
    expect(() => manager.save(createDefaultSaveData())).not.toThrow();
    expect(() => manager.clear()).not.toThrow();
  });
});
