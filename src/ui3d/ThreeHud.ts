import type { BuildingType } from "../core/types";

export interface ThreeHudOptions {
  onStart: () => void;
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
  private drawerToggle: HTMLButtonElement | null = null;
  private drawer: HTMLElement | null = null;
  private robotButtons: HTMLButtonElement[] = [];
  private buildingButtons: HTMLButtonElement[] = [];
  private placeButton: HTMLButtonElement | null = null;
  private productionButton: HTMLButtonElement | null = null;
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
          <strong>첫 번째 착륙 지점을 찾아보세요</strong>
          <div class="three-hud__progress" aria-label="목표 진행도 1단계 중 3단계">
            <span></span><span></span><span></span>
          </div>
        </section>

        <section class="three-hud__resources" aria-label="개척 자원">
          <div><span>💧</span><strong data-resource="water">12</strong><small>물</small></div>
          <div><span>⚡</span><strong data-resource="energy">8</strong><small>에너지</small></div>
          <div><span>🔩</span><strong data-resource="parts">5</strong><small>부품</small></div>
        </section>

        <button class="three-hud__drawer-toggle" type="button" aria-expanded="false">작전 패널</button>
        <aside class="three-hud__drawer" aria-label="작전 패널" hidden>
          <div class="three-hud__drawer-heading">
            <p class="three-hud__label">개척 장비</p>
            <h2>지원 로봇</h2>
            <button class="three-hud__drawer-close" type="button" aria-label="작전 패널 닫기">×</button>
          </div>
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
          <p>로버를 가까이 보내거나 반짝이는 지점을 눌러 발견하세요.</p>
          <button class="three-hud__start" type="button">탐험 시작</button>
        </div>

        <div class="three-hud__active" hidden>
          <span class="three-hud__live-dot"></span>
          <strong>탐험 중</strong>
          <span>WASD·방향키 또는 아래 버튼으로 이동</span>
        </div>

        <div class="three-hud__toast" aria-live="polite" hidden></div>

        <div class="three-hud__controls" aria-label="조작 방법">
          <kbd>W A S D</kbd><span>이동</span><i></i><span>가까이 가거나 지점을 눌러 발견</span>
        </div>

        <div class="three-hud__rover-controls" aria-label="로버 이동 버튼">
          <button type="button" data-rover-direction="forward" aria-label="앞으로 이동">▲</button>
          <div>
            <button type="button" data-rover-direction="left" aria-label="왼쪽 이동">◀</button>
            <button type="button" data-rover-direction="backward" aria-label="뒤로 이동">▼</button>
            <button type="button" data-rover-direction="right" aria-label="오른쪽 이동">▶</button>
          </div>
        </div>
      </div>
    `;

    this.startButton = this.host.querySelector<HTMLButtonElement>(".three-hud__start");
    this.introPanel = this.host.querySelector<HTMLElement>(".three-hud__intro");
    this.activePanel = this.host.querySelector<HTMLElement>(".three-hud__active");
    this.drawerToggle = this.host.querySelector<HTMLButtonElement>(".three-hud__drawer-toggle");
    this.drawer = this.host.querySelector<HTMLElement>(".three-hud__drawer");
    this.robotButtons = [...this.host.querySelectorAll<HTMLButtonElement>(".three-hud__robot")];
    this.buildingButtons = [...this.host.querySelectorAll<HTMLButtonElement>(".three-hud__building")];
    this.placeButton = this.host.querySelector<HTMLButtonElement>(".three-hud__place");
    this.productionButton = this.host.querySelector<HTMLButtonElement>(".three-hud__produce");
    this.roverControlButtons = [...this.host.querySelectorAll<HTMLButtonElement>("[data-rover-direction]")];
    this.startButton?.addEventListener("click", this.handleStart);
    this.drawerToggle?.addEventListener("click", this.handleDrawerToggle);
    this.host.querySelector<HTMLButtonElement>(".three-hud__drawer-close")?.addEventListener("click", this.handleDrawerClose);
    this.robotButtons.forEach((button) => button.addEventListener("click", this.handleRobotSelect));
    this.buildingButtons.forEach((button) => button.addEventListener("click", this.handleBuildingSelect));
    this.placeButton?.addEventListener("click", this.handleBuildingPlace);
    this.productionButton?.addEventListener("click", this.handleProductionTurn);
    this.roverControlButtons.forEach((button) => {
      button.addEventListener("pointerdown", this.handleRoverPointerDown);
      button.addEventListener("pointerup", this.handleRoverPointerUp);
      button.addEventListener("pointercancel", this.handleRoverPointerUp);
      button.addEventListener("pointerleave", this.handleRoverPointerUp);
    });
  }

  dispose(): void {
    this.startButton?.removeEventListener("click", this.handleStart);
    this.drawerToggle?.removeEventListener("click", this.handleDrawerToggle);
    this.host.querySelector<HTMLButtonElement>(".three-hud__drawer-close")?.removeEventListener("click", this.handleDrawerClose);
    this.robotButtons.forEach((button) => button.removeEventListener("click", this.handleRobotSelect));
    this.buildingButtons.forEach((button) => button.removeEventListener("click", this.handleBuildingSelect));
    this.placeButton?.removeEventListener("click", this.handleBuildingPlace);
    this.productionButton?.removeEventListener("click", this.handleProductionTurn);
    this.roverControlButtons.forEach((button) => {
      button.removeEventListener("pointerdown", this.handleRoverPointerDown);
      button.removeEventListener("pointerup", this.handleRoverPointerUp);
      button.removeEventListener("pointercancel", this.handleRoverPointerUp);
      button.removeEventListener("pointerleave", this.handleRoverPointerUp);
    });
    this.startButton = null;
    this.introPanel = null;
    this.activePanel = null;
    this.drawerToggle = null;
    this.drawer = null;
    this.robotButtons = [];
    this.buildingButtons = [];
    this.placeButton = null;
    this.productionButton = null;
    this.roverControlButtons = [];
    this.selectedBuilding = null;
    this.host.replaceChildren();
  }

  updateDiscovery(state: ThreeHudDiscoveryState, announce = true): void {
    const objective = this.host.querySelector<HTMLElement>(".three-hud__objective strong");
    const progress = this.host.querySelectorAll<HTMLElement>(".three-hud__progress span");
    const toast = this.host.querySelector<HTMLElement>(".three-hud__toast");
    if (objective) {
      objective.textContent = state.isComplete
        ? "행성의 첫 비밀을 모두 발견했어요!"
        : `반짝이는 발견 지점을 찾아보세요 · ${state.discoveredCount}/${state.total}`;
    }
    progress.forEach((bar, index) => bar.classList.toggle("is-active", index < state.discoveredCount));
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

  showToast(message: string): void {
    const toast = this.host.querySelector<HTMLElement>(".three-hud__toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.setTimeout(() => { toast.hidden = true; }, 2200);
  }

  private readonly handleStart = (): void => {
    this.introPanel?.setAttribute("hidden", "true");
    this.activePanel?.removeAttribute("hidden");
    this.options.onStart();
  };

  private readonly handleDrawerToggle = (): void => {
    if (!this.drawer || !this.drawerToggle) return;
    const willOpen = this.drawer.hidden;
    this.drawer.hidden = !willOpen;
    this.drawerToggle.setAttribute("aria-expanded", String(willOpen));
  };

  private readonly handleDrawerClose = (): void => {
    if (!this.drawer || !this.drawerToggle) return;
    this.drawer.hidden = true;
    this.drawerToggle.setAttribute("aria-expanded", "false");
  };

  private readonly handleRobotSelect = (event: Event): void => {
    const selected = event.currentTarget as HTMLButtonElement;
    this.robotButtons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
    const preview = this.host.querySelector<HTMLElement>(".three-hud__turn-preview strong");
    if (preview) preview.textContent = selected.dataset.preview ?? "다음 생산 턴 보너스가 준비됐어요";
    const robotId = selected.dataset.robot;
    if (robotId) this.options.onRobotSelect?.(robotId);
  };

  private readonly handleBuildingSelect = (event: Event): void => {
    const selected = event.currentTarget as HTMLButtonElement;
    const buildingType = selected.dataset.building as BuildingType | undefined;
    if (!buildingType) return;
    this.selectedBuilding = buildingType;
    this.buildingButtons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
    if (this.placeButton) this.placeButton.disabled = false;
    this.updateBuildingPreview(selected.dataset.preview ?? "건설 효과를 확인하세요");
    this.options.onBuildingSelect?.(buildingType);
  };

  private readonly handleBuildingPlace = (): void => {
    if (this.selectedBuilding) this.options.onBuildingPlace?.(this.selectedBuilding);
  };

  private readonly handleProductionTurn = (): void => {
    this.options.onProductionTurn?.();
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
