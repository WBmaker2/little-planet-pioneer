import Phaser from "phaser";
import { completeMission, placeBuilding, resolveEvent } from "../core/game-engine";
import { calculatePlacementPreview } from "../core/game-engine";
import { createMissionState } from "../core/game-state";
import { missions } from "../core/mission-data";
import { applyMissionResult, calculateCreditsAdded, getUnlocks } from "../core/progression";
import type { BuildingType, MissionDefinition, PlanetState } from "../core/types";
import { createBuildingPalette } from "../ui/components/BuildingPalette";
import { createEventModal } from "../ui/components/EventModal";
import { createResourceBar } from "../ui/components/ResourceBar";
import { createRobotPicker } from "../ui/components/RobotPicker";
import { createButton, renderScreen } from "../ui/ui-root";
import { getSceneContext } from "./context";

const RESOURCE_NAMES = { water: "물", energy: "에너지", parts: "부품" } as const;

export interface MissionSceneData {
  mission?: MissionDefinition;
  state?: PlanetState;
  missionId?: string;
}

export class MissionScene extends Phaser.Scene {
  private mission!: MissionDefinition;
  private state!: PlanetState;
  private selectedBuilding: BuildingType | null = null;
  private message = "건물을 선택한 뒤 빈 타일을 눌러 주세요.";

  constructor() {
    super("mission");
  }

  create(data: MissionSceneData): void {
    const context = getSceneContext(this);
    this.mission = data.mission ?? missions.find(({ id }) => id === data.missionId) ?? missions[0];
    this.state = data.state ?? createMissionState(this.mission, Date.now());
    if (!data.state) context.observer.startMission(this.mission.id);
    this.selectedBuilding = null;
    this.saveCheckpoint();
    this.renderMission();
  }

  private saveCheckpoint(): void {
    const context = getSceneContext(this);
    context.activeMission = this.state;
    context.saveManager.save({
      version: 1,
      profile: context.profile,
      settings: context.settings,
      activeMission: this.state,
    });
  }

  private renderMission(): void {
    const screen = renderScreen("mission-screen");
    const top = document.createElement("header");
    top.className = "mission-topbar";

    const objective = document.createElement("div");
    objective.className = "objective-chip";
    objective.innerHTML = `<span>현재 미션 · 약 ${this.mission.duration}분</span><h1>${this.mission.title}</h1>`;
    top.append(objective, createResourceBar(this.state.resources));

    const robotPicker = createRobotPicker(
      this.state.robotId,
      this.state.buildings.length > 0 || this.state.resolvedEventIds.length > 0,
      (robotId) => this.selectRobot(robotId),
    );

    const playArea = document.createElement("div");
    playArea.className = "mission-layout";
    const palette = createBuildingPalette(this.mission, this.selectedBuilding, (type) => {
      this.selectedBuilding = type;
      getSceneContext(this).observer.record("preview-shown", { buildingType: type });
      this.message = `${type === "solar" ? "태양광 발전기" : "선택한 시설"}를 배치할 타일을 골라 주세요.`;
      this.renderMission();
    });

    const center = document.createElement("main");
    center.className = "planet-board-wrap";
    const grid = document.createElement("div");
    grid.className = "planet-grid";
    grid.setAttribute("aria-label", "기지 건설 구역");

    const preview = document.createElement("p");
    preview.className = "placement-preview";
    preview.setAttribute("role", "status");
    preview.textContent = this.selectedBuilding
      ? this.formatPreview(this.selectedBuilding, { x: 0, y: 0 })
      : "시설을 선택하면 타일별 예상 생산량을 확인할 수 있어요.";

    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const building = this.state.buildings.find(({ position }) => position.x === x && position.y === y);
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = `planet-tile${building ? " planet-tile--occupied" : ""}`;
        tile.dataset.tile = `${x}-${y}`;
        tile.setAttribute("aria-label", building ? `${x + 1}열 ${y + 1}행, ${building.type} 건설됨` : `${x + 1}열 ${y + 1}행, 빈 타일`);
        tile.textContent = building ? building.type.slice(0, 1).toUpperCase() : "";
        tile.addEventListener("click", () => this.placeSelectedBuilding(x, y));
        if (!building && this.selectedBuilding) {
          const updatePreview = () => { preview.textContent = this.formatPreview(this.selectedBuilding!, { x, y }); };
          tile.addEventListener("mouseenter", updatePreview);
          tile.addEventListener("focus", updatePreview);
          tile.title = this.formatPreview(this.selectedBuilding, { x, y });
        }
        grid.append(tile);
      }
    }

    const status = document.createElement("p");
    status.className = "mission-status";
    status.setAttribute("role", "status");
    status.textContent = this.message;
    center.append(grid, preview, status);

    const currentEventId = this.state.eventOrder[this.state.eventIndex];
    const currentEvent = this.mission.events.find(({ id }) => id === currentEventId);
    const side = currentEvent
      ? createEventModal(currentEvent, this.state.resources, (choiceId) => this.chooseEvent(choiceId))
      : document.createElement("aside");
    if (!currentEvent) {
      side.className = "event-panel event-panel--complete";
      side.innerHTML = `<p class="eyebrow">탐험 완료</p><h2>모든 사건을 확인했어요</h2><p>건설 목표를 마치거나 지금 결과를 확인할 수 있습니다.</p>`;
    }

    playArea.append(palette, center, side);

    const actions = document.createElement("footer");
    actions.className = "mission-actions";
    actions.append(
      createButton("저장하고 나가기", () => {
        this.saveCheckpoint();
        this.scene.start("home");
      }, "ghost"),
      createButton("미션 완료", () => this.finishMission()),
    );
    screen.append(top, robotPicker, playArea, actions);
  }

  private selectRobot(robotId: NonNullable<PlanetState["robotId"]>): void {
    if (this.state.buildings.length > 0 || this.state.resolvedEventIds.length > 0) return;
    this.state = createMissionState(this.mission, this.state.seed, robotId);
    getSceneContext(this).observer.record("robot-selected", { robotId });
    this.message = `${robotId === "spark" ? "반짝이" : robotId === "waterdrop" ? "물방울" : robotId === "tick" ? "똑딱이" : "새싹이"}가 선택되었습니다`;
    this.saveCheckpoint();
    this.renderMission();
  }

  private formatPreview(type: BuildingType, position: { x: number; y: number }): string {
    const preview = calculatePlacementPreview(this.state, this.mission, type, position);
    if (!preview.allowed) return `배치할 수 없음 · ${preview.error?.message ?? "위치를 선택하세요"}`;
    const resourceDelta = Object.entries(preview.resourceDelta)
      .filter(([, amount]) => amount !== 0)
      .map(([resource, amount]) => `${RESOURCE_NAMES[resource as keyof typeof RESOURCE_NAMES]} ${amount > 0 ? "+" : ""}${amount}`)
      .join(" · ");
    const notes = preview.notes.length ? ` · ${preview.notes.join(", ")}` : "";
    return `배치 미리보기 · 예상 변화: ${resourceDelta || "자원 변화 없음"} · 회복도 ${preview.restorationDelta > 0 ? "+" : ""}${preview.restorationDelta}${notes}`;
  }

  private placeSelectedBuilding(x: number, y: number): void {
    if (!this.selectedBuilding) {
      getSceneContext(this).observer.record("help-requested");
      this.message = "먼저 건설할 시설을 선택해 주세요.";
      this.renderMission();
      return;
    }

    const result = placeBuilding(this.state, this.mission, this.selectedBuilding, { x, y });
    if (!result.ok) {
      this.message = result.error.message;
      this.renderMission();
      return;
    }

    const previousState = this.state;
    getSceneContext(this).observer.record("first-action", { buildingType: this.selectedBuilding });
    this.state = result.state;
    const delta = Object.entries(result.state.resources)
      .map(([resource, amount]) => `${RESOURCE_NAMES[resource as keyof typeof RESOURCE_NAMES]} ${(amount - previousState.resources[resource as keyof typeof previousState.resources]) > 0 ? "+" : ""}${amount - previousState.resources[resource as keyof typeof previousState.resources]}`)
      .filter((entry) => !entry.endsWith(" 0"))
      .join(" · ");
    this.message = `시설을 건설했습니다. 생산 턴: ${delta || "변화 없음"}`;
    this.selectedBuilding = null;
    this.saveCheckpoint();
    this.renderMission();
  }

  private chooseEvent(choiceId: string): void {
    const result = resolveEvent(this.state, this.mission, choiceId);
    if (!result.ok) {
      this.message = result.error.message;
      this.renderMission();
      return;
    }

    this.state = result.state;
    this.message = "탐험 선택이 반영되었습니다.";
    this.saveCheckpoint();
    this.renderMission();
  }

  private finishMission(): void {
    const context = getSceneContext(this);
    const result = completeMission(this.state, this.mission);
    context.observer.finish(result.completed);
    const creditsAdded = calculateCreditsAdded(context.profile, this.mission, result);
    const previousUnlocks = new Set(getUnlocks(context.profile));
    context.profile = applyMissionResult(context.profile, this.mission, result);
    const newUnlocks = getUnlocks(context.profile).filter((unlock) => !previousUnlocks.has(unlock));
    delete context.activeMission;
    context.saveManager.save({ version: 1, profile: context.profile, settings: context.settings });
    this.scene.start("result", { missionId: this.mission.id, result: { ...result, creditsAdded }, newUnlocks });
  }
}
