import type { BuildingType } from "../core/types";

export interface ThreeHudOptions {
  onStart: () => void;
  onNextStage?: () => void;
  onNextExploration?: () => void;
  onRoverInput?: (direction: "forward" | "backward" | "left" | "right", pressed: boolean) => void;
  onRobotSelect?: (robotId: string) => void;
  onBuildingSelect?: (buildingType: BuildingType) => void;
  onBuildingPlace?: (buildingType: BuildingType) => void;
  onProductionTurn?: () => void;
}

export interface ThreeHudDiscoveryState {
  discoveredIds?: string[];
  discoveredCount: number;
  total: number;
  isComplete: boolean;
}

export interface ThreeHudResources {
  water: number;
  energy: number;
  parts: number;
}

export class ThreeHud {
  private startButton: HTMLButtonElement | null = null;
  private introPanel: HTMLElement | null = null;
  private activePanel: HTMLElement | null = null;
  private drawer: HTMLElement | null = null;
  private robotButtons: HTMLButtonElement[] = [];
  private buildingButtons: HTMLButtonElement[] = [];
  private placeButton: HTMLButtonElement | null = null;
  private productionButton: HTMLButtonElement | null = null;
  private guideAction: HTMLButtonElement | null = null;
  private roverControlButtons: HTMLButtonElement[] = [];
  private selectedBuilding: BuildingType | null = null;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: ThreeHudOptions,
  ) {}

  mount(): void {
    this.host.replaceChildren();
    this.host.innerHTML = `
      <div class="three-hud" aria-label="별빛 개척대 게임 HUD">
        <header class="three-hud__brand">
          <p class="three-hud__eyebrow">STARLIGHT CREW · SECTOR 01</p>
          <h1>별빛 개척대</h1>
          <p>작은 행성, 큰 발견</p>
        </header>

        <section class="three-hud__objective" aria-label="현재 목표">
          <div class="three-hud__label"><span class="three-hud__signal"></span>현재 목표</div>
          <strong>반짝이는 보석 3개 찾기</strong>
          <div class="three-hud__progress" aria-label="반짝이는 보석 0개 찾음 · 3개 중 0개">
            <span></span><span></span><span></span>
          </div>
        </section>

        <aside class="three-hud__guide" aria-label="루미 AI 가이드">
          <div class="three-hud__guide-heading"><span class="three-hud__guide-avatar">루</span><strong>루미 가이드</strong><span class="three-hud__guide-status">AI</span></div>
          <p class="three-hud__guide-message">안녕! 나는 루미야. 먼저 ‘탐험 시작’을 누르자.</p>
          <button class="three-hud__guide-action" type="button" hidden>다음 단계: 작전 패널 열기</button>
        </aside>

        <button class="three-hud__updates-toggle" type="button" aria-controls="three-updates-dialog">업데이트 내역</button>
        <section class="three-hud__updates-dialog" id="three-updates-dialog" role="dialog" aria-label="업데이트 내역" hidden>
          <div class="three-hud__updates-heading"><strong>업데이트 내역</strong><button type="button" class="three-hud__updates-close" aria-label="업데이트 내역 닫기">×</button></div>
          <ul>
            <li><time datetime="2026-08-13">2026-08-13</time><span>작전 패널을 항상 펼쳐 두고 2단계 선택 순서를 바로 보이게 했어요.</span></li>
            <li><time datetime="2026-08-13">2026-08-13</time><span>생산 턴 뒤 다음 탐험 안내와 단계별 버튼 강조를 추가했어요.</span></li>
            <li><time datetime="2026-08-13">2026-08-13</time><span>작전 패널 클릭 영역과 보석 찾기 안내를 개선했어요.</span></li>
          </ul>
        </section>

        <section class="three-hud__resources" aria-label="개척 자원">
          <div><span>💧</span><strong data-resource="water">12</strong><small>물</small></div>
          <div><span>⚡</span><strong data-resource="energy">8</strong><small>에너지</small></div>
          <div><span>🔩</span><strong data-resource="parts">5</strong><small>부품</small></div>
        </section>

        <aside class="three-hud__drawer" aria-label="작전 패널">
          <div class="three-hud__drawer-heading">
            <p class="three-hud__label">작전 패널</p>
            <h2>지원 로봇</h2>
          </div>
          <p class="three-hud__drawer-step">1/5 · 보석 3개 찾기</p>
          <p class="three-hud__drawer-help">진행 순서: ① 로봇 고르기 → ② 시설 고르기 → ③ 배치하기 → ④ 생산 턴</p>
          <div class="three-hud__robot-list">
            <button class="three-hud__robot" type="button" data-robot="waterdrop" data-preview="다음 생산 턴 물 +2" aria-pressed="false">
              <strong>워터드롭</strong><span>다음 생산 턴 물 +2</span>
            </button>
            <button class="three-hud__robot" type="button" data-robot="spark" data-preview="다음 생산 턴 에너지 +1" aria-pressed="false">
              <strong>스파크</strong><span>다음 생산 턴 에너지 +1</span>
            </button>
            <button class="three-hud__robot" type="button" data-robot="tick" data-preview="첫 사건 부품 +1" aria-pressed="false">
              <strong>틱</strong><span>첫 사건 부품 +1</span>
            </button>
            <button class="three-hud__robot" type="button" data-robot="sprout" data-preview="온실 복구도 +2" aria-pressed="false">
              <strong>스프라우트</strong><span>온실 복구도 +2</span>
            </button>
          </div>
          <div class="three-hud__drawer-section-label">시설 배치</div>
          <div class="three-hud__building-list">
            <button class="three-hud__building" type="button" data-building="solar" data-preview="예상 생산 에너지 +3 · 건설 부품 -2" aria-pressed="false">
              <strong>태양광 발전기</strong><span>에너지 생산 · 평원 보너스</span>
            </button>
            <button class="three-hud__building" type="button" data-building="beacon" data-preview="예상 회복도 +1 · 건설 에너지 -1 · 부품 -1" aria-pressed="false">
              <strong>통신 비콘</strong><span>탐험 목표를 밝혀요</span>
            </button>
          </div>
          <div class="three-hud__turn-preview"><span>배치 보너스 미리보기</span><strong>로봇 또는 시설을 선택하세요</strong></div>
          <div class="three-hud__action-row">
            <button class="three-hud__place" type="button" disabled>배치하기</button>
            <button class="three-hud__produce" type="button">생산 턴 실행</button>
          </div>
        </aside>

        <div class="three-hud__intro">
          <p><strong>1단계 · 보석 3개 찾기</strong><br>탐험 시작 후 화살표/WASD로 움직여 보세요.<br>보석에 가까이 가면 자동으로 발견돼요.</p>
          <button class="three-hud__start gi-pulse" type="button">탐험 시작</button>
        </div>

        <div class="three-hud__active" hidden>
          <span class="three-hud__live-dot"></span>
          <strong>탐험 중</strong>
          <span>화살표/WASD로 이동 · 보석에 가까이 가면 자동 발견</span>
        </div>

        <div class="three-hud__toast" aria-live="polite" hidden></div>

        <div class="three-hud__controls" aria-label="조작 방법">
          <kbd>W A S D</kbd><span>이동</span><i></i><span>보석 3개 찾기</span>
        </div>

        <div class="three-hud__rover-controls" aria-label="로버 이동 버튼">
          <div class="three-hud__rover-controls-row">
            <button type="button" data-rover-direction="forward" aria-label="위로 이동">▲</button>
          </div>
          <div class="three-hud__rover-controls-row">
            <button type="button" data-rover-direction="left" aria-label="왼쪽 이동">◀</button>
            <button type="button" data-rover-direction="right" aria-label="오른쪽 이동">▶</button>
          </div>
          <div class="three-hud__rover-controls-row">
            <button type="button" data-rover-direction="backward" aria-label="아래로 이동">▼</button>
          </div>
        </div>
      </div>
    `;

    this.startButton = this.host.querySelector<HTMLButtonElement>(".three-hud__start");
    this.introPanel = this.host.querySelector<HTMLElement>(".three-hud__intro");
    this.activePanel = this.host.querySelector<HTMLElement>(".three-hud__active");
    this.drawer = this.host.querySelector<HTMLElement>(".three-hud__drawer");
    this.robotButtons = [...this.host.querySelectorAll<HTMLButtonElement>(".three-hud__robot")];
    this.buildingButtons = [...this.host.querySelectorAll<HTMLButtonElement>(".three-hud__building")];
    this.placeButton = this.host.querySelector<HTMLButtonElement>(".three-hud__place");
    this.productionButton = this.host.querySelector<HTMLButtonElement>(".three-hud__produce");
    this.guideAction = this.host.querySelector<HTMLButtonElement>(".three-hud__guide-action");
    this.roverControlButtons = [...this.host.querySelectorAll<HTMLButtonElement>("[data-rover-direction]")];
    this.startButton?.addEventListener("click", this.handleStart);
    this.robotButtons.forEach((button) => button.addEventListener("click", this.handleRobotSelect));
    this.buildingButtons.forEach((button) => button.addEventListener("click", this.handleBuildingSelect));
    this.placeButton?.addEventListener("click", this.handleBuildingPlace);
    this.productionButton?.addEventListener("click", this.handleProductionTurn);
    this.guideAction?.addEventListener("click", this.handleGuideAction);
    this.host.querySelector<HTMLButtonElement>(".three-hud__updates-toggle")?.addEventListener("click", this.handleUpdatesToggle);
    this.host.querySelector<HTMLButtonElement>(".three-hud__updates-close")?.addEventListener("click", this.handleUpdatesClose);
    this.roverControlButtons.forEach((button) => {
      button.addEventListener("pointerdown", this.handleRoverPointerDown);
      button.addEventListener("pointerup", this.handleRoverPointerUp);
      button.addEventListener("pointercancel", this.handleRoverPointerUp);
      button.addEventListener("pointerleave", this.handleRoverPointerUp);
    });
  }

  dispose(): void {
    this.startButton?.removeEventListener("click", this.handleStart);
    this.robotButtons.forEach((button) => button.removeEventListener("click", this.handleRobotSelect));
    this.buildingButtons.forEach((button) => button.removeEventListener("click", this.handleBuildingSelect));
    this.placeButton?.removeEventListener("click", this.handleBuildingPlace);
    this.productionButton?.removeEventListener("click", this.handleProductionTurn);
    this.guideAction?.removeEventListener("click", this.handleGuideAction);
    this.host.querySelector<HTMLButtonElement>(".three-hud__updates-toggle")?.removeEventListener("click", this.handleUpdatesToggle);
    this.host.querySelector<HTMLButtonElement>(".three-hud__updates-close")?.removeEventListener("click", this.handleUpdatesClose);
    this.roverControlButtons.forEach((button) => {
      button.removeEventListener("pointerdown", this.handleRoverPointerDown);
      button.removeEventListener("pointerup", this.handleRoverPointerUp);
      button.removeEventListener("pointercancel", this.handleRoverPointerUp);
      button.removeEventListener("pointerleave", this.handleRoverPointerUp);
    });
    this.startButton = null;
    this.introPanel = null;
    this.activePanel = null;
    this.drawer = null;
    this.robotButtons = [];
    this.buildingButtons = [];
    this.placeButton = null;
    this.productionButton = null;
    this.guideAction = null;
    this.roverControlButtons = [];
    this.selectedBuilding = null;
    this.host.replaceChildren();
  }

  updateDiscovery(state: ThreeHudDiscoveryState, announce = true): void {
    const objective = this.host.querySelector<HTMLElement>(".three-hud__objective strong");
    const progressContainer = this.host.querySelector<HTMLElement>(".three-hud__progress");
    const progress = this.host.querySelectorAll<HTMLElement>(".three-hud__progress span");
    const toast = this.host.querySelector<HTMLElement>(".three-hud__toast");
    if (objective) {
      objective.textContent = state.isComplete
        ? "보석 3개를 모두 찾았어요!"
        : `반짝이는 보석 찾기 · ${state.discoveredCount}/${state.total}`;
    }
    if (state.isComplete) {
      this.setOperationStep("2/5 · 지원 로봇 고르기");
      this.robotButtons[0]?.classList.add("gi-pulse");
    }
    progress.forEach((bar, index) => bar.classList.toggle("is-active", index < state.discoveredCount));
    progressContainer?.setAttribute("aria-label", `반짝이는 보석 ${state.discoveredCount}개 찾음 · 3개 중 ${state.discoveredCount}`);
    this.setGuideMessage(
      state.isComplete
        ? "1단계 끝! 2단계: 오른쪽 작전 패널에서 지원 로봇 1개를 골라 보자."
        : state.discoveredCount > 0
          ? `좋아! ${state.discoveredCount}개 찾았어. 이제 ${state.total - state.discoveredCount}개 남았어. 계속 움직여 보자.`
          : "1단계: 로버를 움직여 반짝이는 보석 3개를 찾아보자. 가까이 가면 자동 발견돼.",
      false,
    );
    if (toast && announce) {
      toast.textContent = state.isComplete ? "탐험 완료! 새로운 행성 기록을 얻었어요." : "발견 성공! 다음 신호를 찾아보세요.";
      toast.hidden = false;
      window.setTimeout(() => { toast.hidden = true; }, 2200);
    }
  }

  updateResources(resources: ThreeHudResources): void {
    for (const [resource, value] of Object.entries(resources)) {
      const target = this.host.querySelector<HTMLElement>(`[data-resource="${resource}"]`);
      if (target) target.textContent = String(value);
    }
  }

  updateBuildingPreview(message: string): void {
    const preview = this.host.querySelector<HTMLElement>(".three-hud__turn-preview strong");
    if (preview) preview.textContent = message;
  }

  private setOperationStep(message: string): void {
    const step = this.host.querySelector<HTMLElement>(".three-hud__drawer-step");
    if (step) step.textContent = message;
  }

  showToast(message: string): void {
    const toast = this.host.querySelector<HTMLElement>(".three-hud__toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.setTimeout(() => { toast.hidden = true; }, 2200);
  }

  setGuideMessage(message: string, showAction = false): void {
    const guideMessage = this.host.querySelector<HTMLElement>(".three-hud__guide-message");
    if (guideMessage) guideMessage.textContent = message;
    if (this.guideAction) {
      this.guideAction.hidden = !showAction;
      this.guideAction.classList.toggle("gi-pulse", showAction || this.guideAction.dataset.action === "next-exploration");
    }
  }

  showProductionComplete(): void {
    this.setGuideMessage("첫 생산 완료! 이제 탐험 화면으로 돌아가 행성을 자유롭게 살펴보자.", false);
    this.setOperationStep("완료 · 생산 턴을 실행했어요");
    if (!this.guideAction) return;
    this.guideAction.textContent = "탐험 계속하기";
    this.guideAction.classList.add("gi-pulse");
    this.guideAction.hidden = false;
    this.guideAction.dataset.action = "next-exploration";
  }

  showPlacementComplete(): void {
    this.placeButton?.classList.remove("gi-pulse");
    this.productionButton?.classList.add("gi-pulse");
    this.setOperationStep("5/5 · 생산 턴 실행");
  }

  openOperationsPanel(): void {
    this.drawer?.scrollIntoView({ block: "nearest" });
    this.setOperationStep("2/5 · 지원 로봇 고르기");
    this.robotButtons[0]?.classList.add("gi-pulse");
    this.setGuideMessage("2단계: 오른쪽 작전 패널에서 지원 로봇 1개를 골라 보자.");
  }

  private readonly handleStart = (): void => {
    this.introPanel?.setAttribute("hidden", "true");
    this.activePanel?.removeAttribute("hidden");
    this.startButton?.classList.remove("gi-pulse");
    this.setGuideMessage("1단계: 화살표/WASD로 움직여 반짝이는 보석 3개를 찾아보자.");
    this.options.onStart();
  };

  private readonly handleGuideAction = (): void => {
    if (this.guideAction?.dataset.action === "next-exploration") {
      this.guideAction.hidden = true;
      this.guideAction.classList.remove("gi-pulse");
      delete this.guideAction.dataset.action;
      this.options.onNextExploration?.();
      return;
    }
    this.options.onNextStage?.();
  };

  private readonly handleUpdatesToggle = (): void => {
    const dialog = this.host.querySelector<HTMLElement>(".three-hud__updates-dialog");
    if (dialog) dialog.hidden = false;
  };

  private readonly handleUpdatesClose = (): void => {
    const dialog = this.host.querySelector<HTMLElement>(".three-hud__updates-dialog");
    if (dialog) dialog.hidden = true;
  };

  private readonly handleRobotSelect = (event: Event): void => {
    const selected = event.currentTarget as HTMLButtonElement;
    this.robotButtons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
    const preview = this.host.querySelector<HTMLElement>(".three-hud__turn-preview strong");
    if (preview) preview.textContent = selected.dataset.preview ?? "다음 생산 턴 보너스가 준비됐어요";
    const robotId = selected.dataset.robot;
    if (robotId) this.options.onRobotSelect?.(robotId);
    this.robotButtons.forEach((button) => button.classList.remove("gi-pulse"));
    this.buildingButtons[0]?.classList.add("gi-pulse");
    this.setOperationStep("3/5 · 시설 고르기");
    this.setGuideMessage("2단계 완료! 이제 시설 1개를 골라 보자.");
  };

  private readonly handleBuildingSelect = (event: Event): void => {
    const selected = event.currentTarget as HTMLButtonElement;
    const buildingType = selected.dataset.building as BuildingType | undefined;
    if (!buildingType) return;
    this.selectedBuilding = buildingType;
    this.buildingButtons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
    if (this.placeButton) this.placeButton.disabled = false;
    this.buildingButtons.forEach((button) => button.classList.remove("gi-pulse"));
    this.placeButton?.classList.add("gi-pulse");
    this.setOperationStep("4/5 · 배치하기");
    this.updateBuildingPreview(selected.dataset.preview ?? "건설 효과를 확인하세요");
    this.options.onBuildingSelect?.(buildingType);
    this.setGuideMessage("3단계: 시설을 골랐어. 이제 ‘배치하기’를 눌러 보자.");
  };

  private readonly handleBuildingPlace = (): void => {
    if (this.selectedBuilding) this.options.onBuildingPlace?.(this.selectedBuilding);
  };

  private readonly handleProductionTurn = (): void => {
    this.productionButton?.classList.remove("gi-pulse");
    this.options.onProductionTurn?.();
    this.showProductionComplete();
  };

  private readonly handleRoverPointerDown = (event: PointerEvent): void => {
    const direction = (event.currentTarget as HTMLButtonElement).dataset.roverDirection as "forward" | "backward" | "left" | "right" | undefined;
    if (!direction) return;
    event.preventDefault();
    this.options.onRoverInput?.(direction, true);
  };

  private readonly handleRoverPointerUp = (event: PointerEvent): void => {
    const direction = (event.currentTarget as HTMLButtonElement).dataset.roverDirection as "forward" | "backward" | "left" | "right" | undefined;
    if (!direction) return;
    this.options.onRoverInput?.(direction, false);
  };
}
