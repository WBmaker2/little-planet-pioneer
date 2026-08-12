import type { PlanetState, ProfileState } from "../core/types";
import type { SaveManager } from "../core/save-manager";
import type { SchoolSettings } from "../policy/settings";
import type { PlaytestObserver } from "../core/playtest-observer";

export interface SceneContext {
  saveManager: SaveManager;
  profile: ProfileState;
  settings: SchoolSettings;
  activeMission?: PlanetState;
  observer: PlaytestObserver;
}

export function getSceneContext(scene: Phaser.Scene): SceneContext {
  return scene.registry.get("context") as SceneContext;
}
