import Phaser from "phaser";
import { GAME_TITLE } from "../ui/theme";
import { createButton, renderScreen } from "../ui/ui-root";
import { missions } from "../core/mission-data";
import { getSceneContext } from "./context";
import { formatHeadquarters } from "../ui/components/ResultPanel";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("home");
  }

  create(): void {
    const context = getSceneContext(this);
    const screen = renderScreen("home-screen");
    const intro = document.createElement("div");
    intro.className = "hero-panel";
    intro.innerHTML = `
      <p class="eyebrow">쉬는 시간 행성 탐사</p>
      <h1>${GAME_TITLE}</h1>
      <p class="hero-copy">작은 선택으로 낯선 행성에 생명과 빛을 돌려주세요.</p>
      <div class="headquarters-summary"><span>${formatHeadquarters(context.profile)}</span><strong>${context.profile.credits} 크레딧</strong></div>
    `;

    const actions = document.createElement("nav");
    actions.className = "home-actions";
    actions.setAttribute("aria-label", "게임 메뉴");
    if (context.activeMission) {
      const mission = missions.find(({ id }) => id === context.activeMission?.missionId);
      if (mission) {
        actions.append(
          createButton("계속하기", () =>
            this.scene.start("mission", { mission, state: context.activeMission }),
          ),
        );
      }
    }
    actions.append(
      createButton("오늘의 짧은 미션", () => this.scene.start("map", { duration: 3 })),
      createButton("행성 지도", () => this.scene.start("map"), "secondary"),
      createButton("설정", () => this.scene.start("settings"), "ghost"),
    );

    intro.append(actions);
    screen.append(intro);
  }
}
