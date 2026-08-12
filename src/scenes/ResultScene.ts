import Phaser from "phaser";
import { completeMission } from "../core/game-engine";
import { createMissionState } from "../core/game-state";
import { missions } from "../core/mission-data";
import type { MissionResult } from "../core/types";
import { createResultPanel } from "../ui/components/ResultPanel";
import { renderScreen } from "../ui/ui-root";
import { getSceneContext } from "./context";

interface ResultSceneData {
  missionId?: string;
  result?: MissionResult;
  newUnlocks?: string[];
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("result");
  }

  create(data: ResultSceneData): void {
    const context = getSceneContext(this);
    const mission = missions.find(({ id }) => id === data.missionId) ?? missions[0];
    const result = data.result ?? completeMission(createMissionState(mission, 1), mission);
    const screen = renderScreen("result-screen");
    screen.append(
      createResultPanel(
        { result, profile: context.profile, newUnlocks: data.newUnlocks ?? [] },
        {
          onRetry: () => this.scene.start("mission", { mission }),
          onMap: () => this.scene.start("map"),
          onHome: () => this.scene.start("home"),
        },
      ),
    );
  }
}
