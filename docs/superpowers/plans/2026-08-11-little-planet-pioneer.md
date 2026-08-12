# 《꼬마 행성 개척자》 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 초등학교 5~6학년이 학교 쉬는 시간에 3~15분 동안 혼자 플레이할 수 있는 오프라인 우선 전략 게임 MVP를 만든다.

**Architecture:** 순수 TypeScript 도메인 엔진이 자원, 건설, 탐험 사건, 점수, 해금을 계산하고 Phaser 3 화면은 그 엔진을 호출해 상태를 표시한다. 저장과 학교용 설정은 브라우저 로컬 저장소를 사용하며, 초기 버전에는 서버·계정·채팅·광고·온라인 순위표를 넣지 않는다.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, Playwright, CSS.

## Global Constraints

- 대상은 초등학교 5~6학년이며 1인 플레이만 제공한다.
- 한 판은 3~15분으로 명확히 구분한다.
- 재미를 교육 설명보다 우선하고, 퀴즈나 교과 시험을 핵심 루프로 사용하지 않는다.
- 자원은 물·에너지·부품 3종만 사용하고, 행성 회복도는 장기 지표로 둔다.
- 폭력·공격 중심 전투, 광고·외부 링크, 낯선 사람과의 채팅, 뽑기·랜덤 상자·확률형 결제, 강제 공개 순위, 연속 출석 압박을 제공하지 않는다.
- 실패 시 즉시 게임 오버나 큰 자원 손실을 적용하지 않고 부분 보상과 재도전 경로를 제공한다.
- 학생 개인정보와 이름은 기본 수집하지 않으며 로컬 저장을 우선한다.
- 핵심 버튼과 자원 상태는 색상뿐 아니라 아이콘과 텍스트로도 표시한다.
- 초기 버전은 평원·빙하 계곡·빛나는 숲 3개 지역, 건물 6종, 탐험 사건 12개, 지원 로봇 4종, 미션 15개를 포함한다.

## File Structure

- Create: `package.json` — 개발·검증 명령과 런타임 의존성.
- Create: `index.html` — 게임 캔버스 호스트와 접근 가능한 제목.
- Create: `src/main.ts` — Phaser 게임 부트스트랩.
- Create: `src/core/types.ts` — 도메인 타입과 공개 인터페이스.
- Create: `src/core/rng.ts` — 시드 기반 결정적 난수.
- Create: `src/core/mission-data.ts` — 3개 지역, 15개 미션, 12개 사건의 선언형 데이터.
- Create: `src/core/game-state.ts` — 새 미션 상태와 프로필 기본값 생성.
- Create: `src/core/game-engine.ts` — 탐험·건설·사건 해결·미션 완료 계산.
- Create: `src/core/progression.ts` — 점수, 배지, 보상, 해금, 본부 성장 계산.
- Create: `src/core/save-manager.ts` — 저장소 추상화와 localStorage 어댑터.
- Create: `src/policy/settings.ts` — 쉬는 시간용 설정과 검증.
- Create: `src/ui/theme.ts` — 색상, 글꼴 크기, 간격, 공통 스타일 상수.
- Create: `src/scenes/BootScene.ts` — 공통 리소스와 초기 저장 상태 준비.
- Create: `src/scenes/HomeScene.ts` — 개척 본부, 계속하기, 미션 시작 진입점.
- Create: `src/scenes/MapScene.ts` — 행성 노드 맵과 미션 선택.
- Create: `src/scenes/MissionScene.ts` — 자원 HUD, 타일, 건물 배치, 탐험 행동.
- Create: `src/scenes/ResultScene.ts` — 개척·효율·회복 배지와 보상 표시.
- Create: `src/scenes/SettingsScene.ts` — 로컬 학교용 플레이 시간·기록 설정.
- Create: `src/ui/components/ResourceBar.ts` — 물·에너지·부품 표시.
- Create: `src/ui/components/MissionCard.ts` — 미션 목표와 예상 시간 표시.
- Create: `src/ui/components/BuildingPalette.ts` — 건물 선택과 비용·효과 표시.
- Create: `src/ui/components/EventModal.ts` — 사건 설명과 선택지 표시.
- Create: `src/ui/components/ResultPanel.ts` — 결과와 다음 행동 표시.
- Create: `src/styles.css` — 캔버스 크기와 반응형 레이아웃.
- Create: `tests/scaffold.test.ts` — 문서 제목과 초기 부트스트랩 테스트.
- Create: `tests/core/game-engine.test.ts` — 핵심 시뮬레이션 테스트.
- Create: `tests/core/progression.test.ts` — 점수·배지·해금 테스트.
- Create: `tests/core/save-manager.test.ts` — 저장·불러오기·초기화 테스트.
- Create: `tests/policy/settings.test.ts` — 학교 설정 검증 테스트.
- Create: `tests/e2e/smoke.spec.ts` — 브라우저 핵심 흐름 스모크 테스트.
- Create: `playwright.config.ts` — Vite preview를 사용하는 Playwright 설정.

## Task 1: Project Scaffold and Test Harness

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `src/main.ts`, `src/styles.css`.
- Create: `vitest.config.ts`, `playwright.config.ts`.

**Interfaces:**
- Produces npm scripts: `dev`, `build`, `test`, `test:watch`, `test:e2e`.
- Produces a browser entry point whose document title is `꼬마 행성 개척자`.

- [ ] **Step 1: Write the failing scaffold test**

```ts
import { describe, expect, it } from "vitest";

describe("project scaffold", () => {
  it("exposes the game title", () => {
    expect(document.title).toBe("꼬마 행성 개척자");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/scaffold.test.ts`
Expected: FAIL because the Vite document and test file do not exist.

- [ ] **Step 3: Add the minimal Vite and Phaser scaffold**

Install `phaser`, `typescript`, `vite`, `vitest`, `jsdom`, `@playwright/test`, and `@types/node`. Configure the `test` environment as `jsdom`, add a `#game-root` element to `index.html`, and start Phaser from `src/main.ts` with an empty `BootScene`.

- [ ] **Step 4: Run unit and production checks**

Run: `npm test -- --run tests/scaffold.test.ts` and `npm run build`
Expected: PASS and a successful Vite production build.

- [ ] **Step 5: Commit the scaffold**

```bash
git add package.json index.html tsconfig.json vite.config.ts vitest.config.ts playwright.config.ts src/main.ts src/styles.css tests/scaffold.test.ts
git commit -m "chore: scaffold little planet pioneer"
```

## Task 2: Domain Types, Mission Data, and Deterministic State

**Files:**
- Create: `src/core/types.ts`, `src/core/rng.ts`, `src/core/mission-data.ts`, `src/core/game-state.ts`.
- Create: `tests/core/game-state.test.ts`, `tests/core/mission-data.test.ts`, `tests/core/rng.test.ts`.

**Interfaces:**

```ts
export type ResourceKind = "water" | "energy" | "parts";
export type Resources = Record<ResourceKind, number>;
export type Biome = "plain" | "glacier" | "forest";
export type BuildingType = "solar" | "recycler" | "workshop" | "greenhouse" | "observatory" | "beacon";
export type DurationBucket = 3 | 5 | 10 | 15;

export interface Coordinate { x: number; y: number; }
export interface Building { id: string; type: BuildingType; position: Coordinate; }
export interface MissionTarget { buildingType: BuildingType; count: number; }
export interface SupportRobot { id: "waterdrop" | "spark" | "tick" | "sprout"; title: string; description: string; }
export interface EventChoice { id: string; label: string; cost: Partial<Resources>; reward: Partial<Resources>; restorationDelta: number; }
export interface ExplorationEvent { id: string; title: string; description: string; choices: EventChoice[]; }
export interface MissionDefinition {
  id: string; biome: Biome; duration: DurationBucket; title: string;
  initialResources: Resources; target: MissionTarget; events: ExplorationEvent[];
  availableBuildings: BuildingType[]; rewardCredits: number;
}
export interface PlanetState {
  missionId: string; resources: Resources; buildings: Building[];
  restoration: number; eventIndex: number; resolvedEventIds: string[];
}
export interface MissionResult {
  developmentScore: number; efficiencyScore: number; restorationScore: number;
  totalScore: number; completed: boolean; creditsEarned: number;
  badges: { development: number; efficiency: number; restoration: number };
}
export interface ProfileState {
  credits: number; completedMissionIds: string[]; bestScores: Record<string, number>;
  badges: Record<string, { development: number; efficiency: number; restoration: number }>;
  unlockedBuildingTypes: BuildingType[]; unlockedBiomeIds: Biome[]; headquartersLevel: number;
}
```

- [ ] **Step 1: Write failing tests for seeded reproducibility and initial state**

```ts
it("creates the same random event order for the same seed", () => {
  expect(createRng(42).nextInt(0, 100)).toBe(createRng(42).nextInt(0, 100));
});

it("creates a fresh mission with the declared resources and no buildings", () => {
  const state = createMissionState(plainMission, 1);
  expect(state.resources).toEqual(plainMission.initialResources);
  expect(state.buildings).toEqual([]);
  expect(state.restoration).toBe(0);
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- --run tests/core/rng.test.ts tests/core/game-state.test.ts`
Expected: FAIL with missing type, RNG, mission data, and state factory exports.

- [ ] **Step 3: Implement the pure types and data**

Implement a small integer seeded RNG, define the three initial biomes, create 15 mission definitions with 12 reusable events and four `SupportRobot` definitions, and export `createMissionState(mission: MissionDefinition, seed: number): PlanetState`. Do not put Phaser imports in `src/core`.

- [ ] **Step 4: Verify data invariants**

Run: `npm test -- --run tests/core/rng.test.ts tests/core/game-state.test.ts tests/core/mission-data.test.ts`
Expected: PASS; all missions have a duration of 3, 5, 10, or 15, exactly three resource keys, and at least one declared target.

- [ ] **Step 5: Commit the domain foundation**

```bash
git add src/core/types.ts src/core/rng.ts src/core/mission-data.ts src/core/game-state.ts tests/core/rng.test.ts tests/core/game-state.test.ts tests/core/mission-data.test.ts
git commit -m "feat: add deterministic planet domain"
```

## Task 3: Simulation Engine for Exploration and Building

**Files:**
- Create: `src/core/game-engine.ts`.
- Test: `tests/core/game-engine.test.ts`.

**Interfaces:**

```ts
export interface ActionError { code: "INSUFFICIENT_RESOURCE" | "INVALID_POSITION" | "BUILDING_UNAVAILABLE" | "EVENT_ALREADY_RESOLVED"; message: string; }
export type ActionResult = { ok: true; state: PlanetState } | { ok: false; error: ActionError; state: PlanetState };
export function canPlaceBuilding(state: PlanetState, mission: MissionDefinition, type: BuildingType, position: Coordinate): ActionResult;
export function placeBuilding(state: PlanetState, mission: MissionDefinition, type: BuildingType, position: Coordinate): ActionResult;
export function resolveEvent(state: PlanetState, mission: MissionDefinition, choiceId: string): ActionResult;
export function calculateBuildingEffects(state: PlanetState, mission: MissionDefinition): Resources;
export function completeMission(state: PlanetState, mission: MissionDefinition): MissionResult;
```

`MissionResult` contains `developmentScore`, `efficiencyScore`, `restorationScore`, `totalScore`, `completed`, `creditsEarned`, and the three badge levels. State transitions must be immutable so tests can compare the previous state with the next state.

- [ ] **Step 1: Write failing tests for validation and resource accounting**

```ts
it("rejects a building when the player cannot pay its cost", () => {
  const state = { ...baseState, resources: { water: 0, energy: 0, parts: 0 } };
  const result = placeBuilding(state, plainMission, "solar", { x: 1, y: 1 });
  expect(result.ok).toBe(false);
  expect(result.ok === false && result.error.code).toBe("INSUFFICIENT_RESOURCE");
  expect(state).toEqual(baseStateWithZeroResources);
});

it("applies an event choice cost, reward, and restoration delta exactly once", () => {
  const first = resolveEvent(baseState, plainMission, "repair-cable");
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  expect(first.state.resolvedEventIds).toContain("repair-cable");
  expect(resolveEvent(first.state, plainMission, "repair-cable").ok).toBe(false);
});
```

- [ ] **Step 2: Run the focused engine tests to verify they fail**

Run: `npm test -- --run tests/core/game-engine.test.ts`
Expected: FAIL because the engine functions and `MissionResult` do not exist.

- [ ] **Step 3: Implement the minimum immutable state transitions**

Encode fixed building costs, validate bounds and occupied tiles, apply event costs and rewards atomically, calculate adjacency/biome bonuses, and prevent resources from becoming negative. Use the declared event choices rather than hard-coded UI labels.

- [ ] **Step 4: Add mission scoring and edge-case tests**

Test valid placement, occupied placement, unavailable building, insufficient resources, event replay, partial completion, full completion, and a zero-event mission. Verify that failed actions leave the input state unchanged.

- [ ] **Step 5: Run all core tests and commit**

Run: `npm test -- --run tests/core`
Expected: PASS with deterministic results for every test.

```bash
git add src/core/game-engine.ts tests/core/game-engine.test.ts
git commit -m "feat: implement exploration and building simulation"
```

## Task 4: Progression, Unlocks, Save Data, and School Policy

**Files:**
- Create: `src/core/progression.ts`, `src/core/save-manager.ts`, `src/policy/settings.ts`.
- Test: `tests/core/progression.test.ts`, `tests/core/save-manager.test.ts`, `tests/policy/settings.test.ts`.

**Interfaces:**

```ts
export function applyMissionResult(profile: ProfileState, mission: MissionDefinition, result: MissionResult): ProfileState;
export function getUnlocks(profile: ProfileState): string[];
export interface SaveData { version: 1; profile: ProfileState; activeMission?: PlanetState; settings: SchoolSettings; }
export interface StorageAdapter { get(key: string): string | null; set(key: string, value: string): void; remove(key: string): void; }
export class SaveManager { constructor(storage: StorageAdapter); load(): SaveData | null; save(data: SaveData): void; clear(): void; }
export interface SchoolSettings { maxDuration: 3 | 5 | 10 | 15; leaderboardEnabled: false; anonymousName: string; dataSharingEnabled: false; }
export function validateSettings(input: Partial<SchoolSettings>): SchoolSettings;
```

- [ ] **Step 1: Write failing tests for score application and fixed unlocks**

```ts
it("keeps the highest score for a mission", () => {
  const afterLow = applyMissionResult(profile, mission, resultWithScore(50));
  const afterHigh = applyMissionResult(afterLow, mission, resultWithScore(80));
  const afterLower = applyMissionResult(afterHigh, mission, resultWithScore(60));
  expect(afterLower.bestScores[mission.id]).toBe(80);
});

it("rejects leaderboard and data sharing defaults", () => {
  const settings = validateSettings({});
  expect(settings.leaderboardEnabled).toBe(false);
  expect(settings.dataSharingEnabled).toBe(false);
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- --run tests/core/progression.test.ts tests/core/save-manager.test.ts tests/policy/settings.test.ts`
Expected: FAIL with missing progression, storage, and settings exports.

- [ ] **Step 3: Implement progression and settings**

Apply credits and completion IDs once per mission, preserve the highest score, calculate headquarters level from completed missions, and unlock content from explicit thresholds. Clamp `maxDuration` to the allowed values and force leaderboard/data sharing to `false` in the MVP.

- [ ] **Step 4: Implement versioned local persistence**

Serialize `SaveData` under one namespaced localStorage key, reject unknown versions, recover from malformed JSON by returning a clean default, and provide `clear()` for the settings screen. Use an in-memory adapter in tests.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- --run tests/core/progression.test.ts tests/core/save-manager.test.ts tests/policy/settings.test.ts`
Expected: PASS, including duplicate result application, malformed JSON, and clearing data.

```bash
git add src/core/progression.ts src/core/save-manager.ts src/policy/settings.ts tests/core/progression.test.ts tests/core/save-manager.test.ts tests/policy/settings.test.ts
git commit -m "feat: add progression and safe local saves"
```

## Task 5: Phaser Scene Shell and Navigation

**Files:**
- Create: `src/scenes/BootScene.ts`, `src/scenes/HomeScene.ts`, `src/scenes/MapScene.ts`, `src/scenes/ResultScene.ts`, `src/scenes/SettingsScene.ts`.
- Create: `src/ui/theme.ts`, `src/ui/components/MissionCard.ts`, `src/ui/components/ResultPanel.ts`.
- Modify: `src/main.ts`, `src/styles.css`.

**Interfaces:**

```ts
export interface SceneContext { saveManager: SaveManager; profile: ProfileState; settings: SchoolSettings; }
export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig;
```

- [ ] **Step 1: Write the browser smoke test first**

```ts
test("starts a short mission from the home screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("꼬마 행성 개척자")).toBeVisible();
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await expect(page.getByText("빛바랜 평원")).toBeVisible();
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: FAIL because the scenes and accessible UI labels do not exist.

- [ ] **Step 3: Implement the scene shell**

Create a shared `SceneContext` in the Phaser registry, route Home → Map → Mission placeholder → Result, and render large buttons with the exact Korean labels used by the test. Add a Settings scene reachable from Home and make every scene work at 1024×768 and 768×1024.

- [ ] **Step 4: Run build and smoke test**

Run: `npm run build` and `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: successful build and PASS for navigation.

- [ ] **Step 5: Commit navigation**

```bash
git add src/main.ts src/scenes src/ui/theme.ts src/ui/components/MissionCard.ts src/ui/components/ResultPanel.ts src/styles.css tests/e2e/smoke.spec.ts
git commit -m "feat: add Phaser navigation shell"
```

## Task 6: Mission Screen, Building Placement, and Exploration Events

**Files:**
- Create: `src/scenes/MissionScene.ts`.
- Create: `src/ui/components/ResourceBar.ts`, `src/ui/components/BuildingPalette.ts`, `src/ui/components/EventModal.ts`.
- Test: Extend `tests/e2e/smoke.spec.ts` with mission actions.

**Interfaces:**

```ts
export interface MissionSceneData { mission: MissionDefinition; state: PlanetState; }
export function renderResourceBar(scene: Phaser.Scene, resources: Resources): void;
export function renderBuildingPalette(scene: Phaser.Scene, mission: MissionDefinition, state: PlanetState): void;
```

- [ ] **Step 1: Add failing browser tests for a complete short mission**

```ts
test("shows resources, accepts a valid building, and reaches results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await expect(page.getByText("물")).toBeVisible();
  await page.getByRole("button", { name: "태양광 발전기" }).click();
  await page.locator("[data-tile='1-1']").click();
  await page.getByRole("button", { name: "미션 완료" }).click();
  await expect(page.getByText("개척 배지")).toBeVisible();
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: FAIL because the mission grid, resource bar, building palette, and result transition are not implemented.

- [ ] **Step 3: Implement the mission UI around the pure engine**

Render a small tile grid, resource bar, mission objective, building palette with cost/effect preview, and event modal. On click, call `placeBuilding` or `resolveEvent`; update the scene from the returned immutable state. Invalid actions show the engine error message without changing state.

- [ ] **Step 4: Implement safe checkpoint and exit actions**

Save `activeMission` after every successful action, add a visible `저장하고 나가기` button, and restore the saved state through the Home scene's `계속하기` action. Do not auto-start a new mission after completion.

- [ ] **Step 5: Run core, build, and browser checks**

Run: `npm test -- --run tests/core` then `npm run build` then `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: all core tests, the production build, and the short mission smoke flow pass.

- [ ] **Step 6: Commit the playable mission loop**

```bash
git add src/scenes/MissionScene.ts src/ui/components/ResourceBar.ts src/ui/components/BuildingPalette.ts src/ui/components/EventModal.ts tests/e2e/smoke.spec.ts
git commit -m "feat: add playable mission loop"
```

## Task 7: Results, Growth, Settings, and Accessible Safety UX

**Files:**
- Modify: `src/scenes/ResultScene.ts`, `src/scenes/HomeScene.ts`, `src/scenes/SettingsScene.ts`.
- Modify: `src/ui/components/ResultPanel.ts`, `src/styles.css`.
- Test: Extend `tests/e2e/smoke.spec.ts` with result, settings, and resume flows.

**Interfaces:**

```ts
export function formatMissionResult(result: MissionResult): string[];
export function formatHeadquarters(profile: ProfileState): string;
```

- [ ] **Step 1: Add failing browser tests for persistence and safe settings**

```ts
test("persists progress and exposes the safe play-time setting", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "설정" }).click();
  await expect(page.getByText("최대 플레이 시간")).toBeVisible();
  await page.getByRole("button", { name: "5분" }).click();
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByText("설정이 저장되었습니다")).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: FAIL because the result labels, headquarters update, and settings controls do not exist.

- [ ] **Step 3: Implement result and progression presentation**

After `completeMission`, call `applyMissionResult`, clear `activeMission`, save the new profile, show the three badge levels, credits, newly unlocked content, and headquarters change. Keep the result screen actionable with `다시 하기`, `행성 지도`, and `개척 본부` buttons.

- [ ] **Step 4: Implement the settings scene**

Provide buttons for 3·5·10·15 minute maximum duration, a local anonymous name, data-sharing-off status, and leaderboard-off status. The MVP must not create a network leaderboard; show both network options as disabled with a short explanation. Provide a clearly confirmed `저장 데이터 삭제` action.

- [ ] **Step 5: Add readable, low-pressure UX**

Use large text, strong contrast, keyboard focus outlines, pointer/touch targets of at least 44px, non-color status indicators, and a non-blinking save/exit control. Never autoplay another mission or show a countdown on the default path.

- [ ] **Step 6: Run all checks and commit**

Run: `npm test -- --run` then `npm run build` then `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: PASS for unit tests, production build, progress persistence, result display, and safe settings flow.

```bash
git add src/scenes/HomeScene.ts src/scenes/ResultScene.ts src/scenes/SettingsScene.ts src/ui/components/ResultPanel.ts src/styles.css tests/e2e/smoke.spec.ts
git commit -m "feat: add progression and safe school settings"
```

## Task 8: Content Completion and Final Verification

**Files:**
- Modify: `src/core/mission-data.ts`.
- Modify: `src/ui/theme.ts`, `src/styles.css`.
- Create: `docs/superpowers/verification/2026-08-11-little-planet-pioneer-mvp.md`.

- [ ] **Step 1: Add the complete MVP content**

Add exactly 15 missions across the three initial regions, 12 reusable but parameterized exploration events, and four support robots with IDs `waterdrop`, `spark`, `tick`, and `sprout`. Every mission must declare a duration bucket, target, initial resources, available buildings, and fixed reward.

- [ ] **Step 2: Add content invariant tests**

```ts
it("ships the agreed MVP content counts", () => {
  expect(missions).toHaveLength(15);
  expect(events).toHaveLength(12);
  expect(supportRobots).toHaveLength(4);
  expect(new Set(missions.map((mission) => mission.biome))).toEqual(new Set(["plain", "glacier", "forest"]));
});
```

- [ ] **Step 3: Run the complete verification suite**

Run: `npm test -- --run` then `npm run build` then `npm run test:e2e -- tests/e2e/smoke.spec.ts`
Expected: all tests pass and the production build completes without TypeScript errors.

- [ ] **Step 4: Manually verify the safety checklist**

Open the production preview and verify that the first session can be completed in 3 minutes, a 15-minute mission can be saved and resumed, no external network request is required, all key actions are reachable by keyboard or pointer, and no excluded feature appears in the UI.

- [ ] **Step 5: Record verification evidence**

Write the commands, pass/fail results, tested viewport sizes (1024×768 and 768×1024), and any known non-blocking limitations into `docs/superpowers/verification/2026-08-11-little-planet-pioneer-mvp.md`.

- [ ] **Step 6: Commit the completed MVP content and evidence**

```bash
git add src/core/mission-data.ts src/ui/theme.ts src/styles.css tests docs/superpowers/verification/2026-08-11-little-planet-pioneer-mvp.md
git commit -m "test: verify little planet pioneer MVP"
```

## Spec Coverage Self-Review

- Fun-first loop: Tasks 2, 3, 5, and 6 implement exploration, choices, construction, and replay.
- Three resources and six buildings: Tasks 2 and 3 define and test them.
- Three initial regions, 15 missions, 12 events, and four robots: Task 8 enforces the counts.
- Three-to-fifteen-minute sessions: Tasks 2, 5, 7, and 8 implement duration data, display, settings, and verification.
- Progression and personal records: Tasks 4 and 7 implement score, badges, unlocks, and local saves.
- No forced failure, ads, chat, external links, or randomized rewards: Global Constraints, Tasks 3, 4, 6, and 7 cover these.
- Accessible and low-pressure UI: Task 7 implements text/icon status, keyboard focus, touch targets, safe exit, and no default countdown.
- Deterministic and testable engine: Tasks 2 and 3 keep simulation pure and seeded.
- No placeholders or unresolved implementation decisions remain in the plan.
