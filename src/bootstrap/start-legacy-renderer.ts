import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { HomeScene } from "../scenes/HomeScene";
import { MapScene } from "../scenes/MapScene";
import { MissionScene } from "../scenes/MissionScene";
import { ResultScene } from "../scenes/ResultScene";
import { SettingsScene } from "../scenes/SettingsScene";

export interface RendererRoots {
  threeRoot: HTMLElement | null;
  threeUiRoot: HTMLElement | null;
  legacyRoot: HTMLElement | null;
  legacyUiRoot: HTMLElement | null;
}

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 1024,
    height: 768,
    backgroundColor: "#10253f",
    scene: [BootScene, HomeScene, MapScene, MissionScene, ResultScene, SettingsScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}

export function startLegacyRenderer(roots: RendererRoots): Phaser.Game {
  if (roots.threeRoot) roots.threeRoot.hidden = true;
  if (roots.threeUiRoot) roots.threeUiRoot.hidden = true;
  if (roots.legacyRoot) roots.legacyRoot.hidden = false;
  if (roots.legacyUiRoot) roots.legacyUiRoot.hidden = false;
  return new Phaser.Game(createGameConfig("game-root"));
}
