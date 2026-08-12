# 전략 깊이 확장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add deterministic support-robot choices, building production turns, placement previews, and a privacy-safe classroom playtest kit to the Little Planet Pioneer MVP.

**Architecture:** Keep all robot, production, and preview calculations in pure TypeScript domain functions. Phaser scenes render and persist those results; the playtest observer records anonymous in-memory session events only.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest, Playwright, DOM/CSS UI.

## Global Constraints

- No network, account, public leaderboard, chat, advertising, payments, or randomized rewards.
- Existing save data without `robotId` remains loadable and defaults to no robot.
- Resources never become negative.
- Every behavior change follows a failing test, minimal implementation, passing focused test, then full regression.

### Task 1: Domain robot and production rules

**Files:**
- Modify: `src/core/types.ts`, `src/core/game-engine.ts`, `src/core/game-state.ts`
- Test: `tests/core/game-engine.test.ts`, `tests/core/game-state.test.ts`

- [ ] Add failing tests for initial robot bonus, robot-specific production, adjacency production, and immutable state transitions.
- [ ] Run focused tests and confirm the new assertions fail.
- [ ] Add `SupportRobotId`, optional `robotId` on `PlanetState`, `applyRobotBonus`, `calculatePlacementPreview`, and production application inside `placeBuilding`.
- [ ] Run focused tests and confirm green.

### Task 2: Save compatibility and result accounting

**Files:**
- Modify: `src/core/save-manager.ts`, `src/core/progression.ts`, `src/ui/components/ResultPanel.ts`
- Test: `tests/core/save-manager.test.ts`, `tests/core/progression.test.ts`

- [ ] Add a failing test that an old save without `robotId` loads with `null`.
- [ ] Add a failing test for exact credits added on replay.
- [ ] Implement compatibility and expose `creditsAdded` without breaking current result data.
- [ ] Run focused tests and confirm green.

### Task 3: Mission robot picker and placement preview UI

**Files:**
- Create: `src/ui/components/RobotPicker.ts`
- Modify: `src/ui/components/BuildingPalette.ts`, `src/scenes/MissionScene.ts`, `src/styles.css`
- Test: `tests/e2e/smoke.spec.ts`

- [ ] Add browser assertions for robot labels, selected robot persistence, preview text, and production result.
- [ ] Run the focused browser test and confirm it fails because the UI does not exist.
- [ ] Render the picker, preview text, and a production summary after placement; use pointer and keyboard events.
- [ ] Run the focused browser test and confirm green.

### Task 4: Anonymous classroom playtest kit

**Files:**
- Create: `src/core/playtest-observer.ts`, `docs/playtests/little-planet-pioneer-classroom-protocol.md`
- Modify: `src/scenes/HomeScene.ts`, `src/scenes/MissionScene.ts`, `src/styles.css`
- Test: `tests/core/playtest-observer.test.ts`, `tests/e2e/smoke.spec.ts`

- [ ] Add failing tests for anonymous event collection, session export, reset, and no personally identifying fields.
- [ ] Implement in-memory observer and a teacher-only local summary panel reachable from settings.
- [ ] Add a printable 10–15 minute classroom protocol with consent and stop conditions.
- [ ] Run focused tests and browser checks.

### Task 5: Full verification and visual review

**Files:**
- Modify: `docs/superpowers/verification/2026-08-11-planet-pioneer-strategy-depth.md`
- Generate: `docs/superpowers/verification/screenshots/strategy-depth-*.png`

- [ ] Run all Vitest tests, typecheck, production build, and Playwright tests.
- [ ] Playtest 1024×768 and 768×1024 with reduced motion and keyboard input.
- [ ] Record findings, known limits, and exact counts; do not claim real student validation without human participants.
