import Phaser from "phaser";
import { createLocalStorageAdapter, createDefaultSaveData, SaveManager } from "../core/save-manager";
import type { SceneContext } from "./context";
import { PlaytestObserver } from "../core/playtest-observer";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create(): void {
    const saveManager = new SaveManager(createLocalStorageAdapter(window.localStorage));
    const save = saveManager.load() ?? createDefaultSaveData();
    const context: SceneContext = {
      saveManager,
      profile: save.profile,
      settings: save.settings,
      ...(save.activeMission ? { activeMission: save.activeMission } : {}),
      observer: new PlaytestObserver(),
    };
    this.registry.set("context", context);
    this.scene.start("home");
  }
}
