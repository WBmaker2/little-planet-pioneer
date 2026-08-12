import Phaser from "phaser";
import { missions } from "../core/mission-data";
import { BIOME_NAMES } from "../ui/theme";
import { createMissionCard } from "../ui/components/MissionCard";
import { createButton, renderScreen } from "../ui/ui-root";
import { getSceneContext } from "./context";

interface MapSceneData {
  duration?: 3 | 5 | 10 | 15;
}

export class MapScene extends Phaser.Scene {
  constructor() {
    super("map");
  }

  create(data: MapSceneData): void {
    const context = getSceneContext(this);
    const screen = renderScreen("map-screen");
    const header = document.createElement("header");
    header.className = "screen-header";
    header.innerHTML = `<p class="eyebrow">개척할 지역을 선택하세요</p><h1>행성 지도</h1>`;
    header.append(createButton("본부로", () => this.scene.start("home"), "ghost"));

    const regions = document.createElement("div");
    regions.className = "map-regions";

    for (const biome of context.profile.unlockedBiomeIds) {
      const section = document.createElement("section");
      section.className = "map-region";
      const title = document.createElement("h2");
      title.textContent = BIOME_NAMES[biome];
      const grid = document.createElement("div");
      grid.className = "mission-grid";
      const selectedMissions = missions
        .filter((mission) => mission.biome === biome && mission.duration <= context.settings.maxDuration)
        .filter(({ duration }) => !data.duration || duration === data.duration)
        .slice(0, data.duration ? 1 : 5);

      for (const mission of selectedMissions) {
        grid.append(createMissionCard(mission, () => this.scene.start("mission", { mission })));
      }
      if (selectedMissions.length > 0) {
        section.append(title, grid);
        regions.append(section);
      }
    }
    if (regions.childElementCount === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "현재 시간 설정에서 시작할 수 있는 임무가 없어요. 설정에서 플레이 시간을 늘려 보세요.";
      regions.append(empty);
    }
    screen.append(header, regions);
  }
}
