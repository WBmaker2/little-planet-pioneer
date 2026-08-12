import Phaser from "phaser";
import { createDefaultProfile } from "../core/progression";
import { DEFAULT_SETTINGS, validateSettings, type SchoolSettings } from "../policy/settings";
import { createButton, renderScreen } from "../ui/ui-root";
import { getSceneContext } from "./context";

const DURATIONS: SchoolSettings["maxDuration"][] = [3, 5, 10, 15];

export class SettingsScene extends Phaser.Scene {
  private selectedDuration: SchoolSettings["maxDuration"] = 10;
  private statusMessage = "";
  private confirmingDelete = false;
  private showObserverSummary = false;

  constructor() {
    super("settings");
  }

  create(): void {
    this.selectedDuration = getSceneContext(this).settings.maxDuration;
    this.statusMessage = "";
    this.confirmingDelete = false;
    this.showObserverSummary = false;
    this.renderSettings();
  }

  private renderSettings(): void {
    const context = getSceneContext(this);
    const screen = renderScreen("settings-screen");
    const panel = document.createElement("article");
    panel.className = "settings-panel";
    panel.innerHTML = `<p class="eyebrow">안전한 쉬는 시간</p><h1>설정</h1>`;

    const durationGroup = document.createElement("fieldset");
    durationGroup.className = "setting-group";
    const legend = document.createElement("legend");
    legend.textContent = "최대 플레이 시간";
    durationGroup.append(legend);
    const durationButtons = document.createElement("div");
    durationButtons.className = "duration-buttons";
    for (const duration of DURATIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "duration-button";
      button.textContent = `${duration}분`;
      button.setAttribute("aria-pressed", String(this.selectedDuration === duration));
      button.addEventListener("click", () => {
        this.selectedDuration = duration;
        this.statusMessage = "";
        this.renderSettings();
      });
      durationButtons.append(button);
    }
    durationGroup.append(durationButtons);

    const nameLabel = document.createElement("label");
    nameLabel.className = "setting-label";
    const nameText = document.createElement("span");
    nameText.textContent = "기기 안에서만 사용하는 이름";
    const nameInput = document.createElement("input");
    nameInput.name = "anonymousName";
    nameInput.maxLength = 20;
    nameInput.value = context.settings.anonymousName;
    nameLabel.append(nameText, nameInput);

    const safety = document.createElement("div");
    safety.className = "safety-list";
    safety.innerHTML = `
      <div><span>온라인 순위표</span><strong>사용 안 함</strong><small>다른 학생과 점수를 자동 비교하지 않습니다.</small></div>
      <div><span>데이터 공유</span><strong>사용 안 함</strong><small>학생 이름과 플레이 기록을 외부로 보내지 않습니다.</small></div>
    `;

    const status = document.createElement("p");
    status.className = "settings-status";
    status.setAttribute("role", "status");
    status.textContent = this.statusMessage;

    const actions = document.createElement("div");
    actions.className = "settings-actions";
    actions.append(
      createButton("본부로 돌아가기", () => this.scene.start("home"), "ghost"),
      createButton(this.confirmingDelete ? "정말 삭제하기" : "저장 데이터 삭제", () => this.deleteData(), "secondary"),
      createButton("저장", () => this.saveSettings()),
      createButton(this.showObserverSummary ? "관찰 요약 닫기" : "교사용 관찰 요약", () => {
        this.showObserverSummary = !this.showObserverSummary;
        this.renderSettings();
      }, "secondary"),
    );

    panel.append(durationGroup, nameLabel, safety, status, actions);
    if (this.showObserverSummary) {
      const summary = context.observer.getSummary();
      const observerPanel = document.createElement("section");
      observerPanel.className = "observer-summary";
      observerPanel.innerHTML = `<h2>교사용 관찰 요약</h2>`;
      const detail = document.createElement("p");
      detail.textContent = summary
        ? `미션 ${summary.missionId} · ${Math.round(summary.durationMs / 1000)}초 · 도움 요청 ${summary.helpRequests}회 · ${summary.completed ? "완료" : "진행 중"}`
        : "아직 관찰 기록이 없습니다.";
      const clear = createButton("관찰 기록 초기화", () => {
        context.observer.reset();
        this.renderSettings();
      }, "ghost");
      observerPanel.append(detail, clear);
      panel.append(observerPanel);
    }
    screen.append(panel);
  }

  private saveSettings(): void {
    const context = getSceneContext(this);
    const input = document.querySelector<HTMLInputElement>('input[name="anonymousName"]');
    context.settings = validateSettings({
      maxDuration: this.selectedDuration,
      anonymousName: input?.value ?? context.settings.anonymousName,
    });
    context.saveManager.save({
      version: 1,
      profile: context.profile,
      settings: context.settings,
      ...(context.activeMission ? { activeMission: context.activeMission } : {}),
    });
    this.statusMessage = "설정이 저장되었습니다";
    this.renderSettings();
  }

  private deleteData(): void {
    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      this.statusMessage = "한 번 더 누르면 이 기기의 게임 기록이 삭제됩니다.";
      this.renderSettings();
      return;
    }

    const context = getSceneContext(this);
    context.saveManager.clear();
    context.profile = createDefaultProfile();
    context.settings = { ...DEFAULT_SETTINGS };
    delete context.activeMission;
    this.selectedDuration = context.settings.maxDuration;
    this.confirmingDelete = false;
    this.statusMessage = "저장 데이터를 삭제했습니다";
    this.renderSettings();
  }
}
