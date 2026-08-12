# 《꼬마 행성 개척자》 3D 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace the dashboard-like Phaser presentation with a low-poly Three.js exploration scene while preserving the existing TypeScript simulation, save system, and child-safe DOM UI.

**Architecture:** Keep `src/core` as the simulation source of truth. Add `src/render` for Three.js scene/camera/objects/loaders and `src/ui3d` for compact DOM HUD and interaction drawers. Boot the 3D runtime first and fall back to the existing 2D scene if WebGL initialization or asset loading fails.

**Tech Stack:** Three.js, TypeScript, Vite, GLB/glTF 2.0, GLTFLoader, optional Meshopt/Draco, DOM/CSS HUD, Vitest, Playwright.

## Global Constraints

- Keep the center and lower-middle playfield clear during normal play.
- Use GLB/glTF 2.0 for runtime assets; primitive fallbacks are allowed for missing assets.
- Simulation state stays outside Three.js objects.
- No external network requirement, online account, chat, advertising, payment, or public student identity.
- Maintain 1024×768 and 768×1024 layouts and reduced-motion behavior.

### Task 1: Three.js runtime shell

**Files:**
- Modify: `package.json`, `src/main.ts`, `index.html`
- Create: `src/render/app/ThreeGameApp.ts`, `src/render/app/three-capabilities.ts`, `src/render/app/resize.ts`
- Test: `tests/render/three-capabilities.test.ts`, `tests/e2e/three-shell.spec.ts`

- [ ] Add a failing capability test for a WebGL-supported path and a safe fallback path.
- [ ] Run the focused test and verify it fails because the runtime shell does not exist.
- [ ] Install `three`, create a renderer with capped pixel ratio, explicit resize handling, animation loop, context-loss listener, and a DOM fallback hook.
- [ ] Run unit and shell browser tests.

### Task 2: Playable planet, camera, and rover

**Files:**
- Create: `src/render/objects/PlanetChunk.ts`, `src/render/objects/Rover.ts`, `src/render/app/CameraController.ts`
- Modify: `src/render/app/ThreeGameApp.ts`
- Test: `tests/render/rover-controller.test.ts`, `tests/e2e/three-rover-flow.spec.ts`

- [ ] Add failing tests for bounded rover movement, camera follow, and keyboard/pointer input gating.
- [ ] Implement a low-poly planet chunk, directional lighting, rover primitive fallback, explicit camera controller, and accessible keyboard input.
- [ ] Verify the rover moves toward an interaction node and cannot leave the island bounds.

### Task 3: Landmarks, buildings, and GLB loader boundary

**Files:**
- Create: `src/render/loaders/AssetLoader.ts`, `src/render/loaders/asset-manifest.ts`, `src/render/objects/BuildingObject.ts`, `src/render/objects/LandmarkObject.ts`, `src/render/objects/primitive-fallbacks.ts`
- Create: `public/assets/README.md`, optional `public/assets/**/*.glb`
- Test: `tests/render/asset-loader.test.ts`, `tests/e2e/three-building-flow.spec.ts`

- [ ] Add failing tests for stable asset keys, fallback when a GLB is missing, and building placement state synchronization.
- [ ] Implement GLTFLoader boundary, named asset manifest, cleanup/disposal, primitive fallback, and hologram placement preview.
- [ ] Add low-poly placeholder GLBs only if they can be validated; otherwise keep primitive factories as the shipped default.

### Task 4: Low-chrome 3D HUD and interaction surfaces

**Files:**
- Create: `src/ui3d/HudOverlay.ts`, `src/ui3d/InteractionPrompt.ts`, `src/ui3d/Drawer.ts`
- Modify: `src/styles.css`, `src/scenes/context.ts`
- Test: `tests/e2e/three-hud.spec.ts`

- [ ] Add failing browser assertions for one objective chip, one status strip, transient prompt, closed-by-default drawer, and modal input lock.
- [ ] Implement DOM overlays with semantic buttons, 44px targets, compact responsive layout, reduced motion, and explicit camera-input gating.
- [ ] Verify the normal play scene does not use the previous full card layout.

### Task 5: Simulation bridge and safe fallback

**Files:**
- Create: `src/render/bridge/SimulationBridge.ts`, `src/render/bridge/interaction-map.ts`
- Modify: `src/core/save-manager.ts`, `src/scenes/BootScene.ts`, `src/main.ts`
- Test: `tests/render/simulation-bridge.test.ts`, `tests/e2e/fallback-and-save.spec.ts`

- [ ] Add failing tests for building preview equality with `calculatePlacementPreview`, checkpoint save after interaction, and fallback to the existing 2D scene.
- [ ] Implement bridge actions for robot selection, landmark choice, building placement, production turn, save/resume, and result transition.
- [ ] Ensure renderer failure does not discard simulation state.

### Task 6: Asset validation, performance, and final playtest

**Files:**
- Create: `scripts/validate-3d-assets.mjs`, `docs/superpowers/verification/2026-08-11-little-planet-pioneer-3d.md`
- Modify: `vite.config.ts`, `playwright.config.ts`
- Generate: `docs/superpowers/verification/screenshots/3d-*.png`

- [ ] Validate GLB/glTF names, pivots, texture budget, compression choice, and missing-asset fallback.
- [ ] Run unit tests, typecheck, build, Playwright at both viewports, reduced-motion, and external-request checks.
- [ ] Capture boot, rover, building preview, result, fallback, and mobile screenshots.
- [ ] Record known limitations and do not claim real student validation without approved human participants.
