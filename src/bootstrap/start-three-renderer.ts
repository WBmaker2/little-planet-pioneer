import { createDefaultSaveData, createLocalStorageAdapter, SaveManager } from "../core/save-manager";
import type { BuildingType } from "../core/types";
import { SimulationBridge } from "../render/bridge/SimulationBridge";
import { ThreeGameApp } from "../render/app/ThreeGameApp";
import { ThreeHud } from "../ui3d/ThreeHud";
import type { RendererRoots } from "./start-legacy-renderer";

const RESOURCE_LABELS = { water: "물", energy: "에너지", parts: "부품" } as const;
const PREVIEW_RESOURCE_LABELS = { water: "물", energy: "에너지", parts: "건설 부품" } as const;
const BUILDING_LABELS: Record<BuildingType, string> = {
  solar: "태양광 발전기",
  recycler: "재활용기",
  workshop: "작업장",
  greenhouse: "온실",
  observatory: "관측소",
  beacon: "통신 비콘",
};

function formatPlacementPreview(preview: ReturnType<SimulationBridge["previewBuilding"]>): string {
  if (!preview.allowed) return preview.error?.message ?? "이 위치에는 배치할 수 없어요";
  const changes = Object.entries(preview.resourceDelta)
    .filter(([, value]) => value !== 0)
    .map(([resource, value]) => `${PREVIEW_RESOURCE_LABELS[resource as keyof typeof PREVIEW_RESOURCE_LABELS]} ${value > 0 ? "+" : ""}${value}`);
  return changes.length ? `예상 생산 ${changes.join(" · ")}` : "예상 변화 없음";
}

export async function startThreeRenderer(
  roots: RendererRoots,
  onFallback: () => void,
): Promise<boolean> {
  if (!roots.threeRoot || !roots.threeUiRoot) return false;

  const saveManager = new SaveManager(createLocalStorageAdapter(window.localStorage));
  const savedData = saveManager.load() ?? createDefaultSaveData();
  const simulationBridge = new SimulationBridge({
    seed: 20260812,
    state: savedData.activeMission,
    onChange: (state) => {
      const latest = saveManager.load() ?? createDefaultSaveData();
      saveManager.save({ ...latest, activeMission: state });
    },
  });

  let threeGame: ThreeGameApp | null = null;
  const hud = new ThreeHud(roots.threeUiRoot, {
    onStart: () => threeGame?.beginExploration(),
    onRoverInput: (direction, pressed) => threeGame?.setRoverInput(direction, pressed),
    onRobotSelect: (robotId) => {
      simulationBridge.selectRobot(robotId as "waterdrop" | "spark" | "tick" | "sprout");
      hud.updateResources(simulationBridge.state.resources);
      threeGame?.setSupportRobot(robotId as "waterdrop" | "spark" | "tick" | "sprout");
    },
    onBuildingSelect: (buildingType) => {
      hud.updateBuildingPreview(formatPlacementPreview(simulationBridge.previewBuilding(buildingType, { x: 0, y: 0 })));
    },
    onBuildingPlace: (buildingType) => {
      const result = simulationBridge.placeBuilding(buildingType, { x: 0, y: 0 });
      if (!result.ok) {
        hud.showToast(result.error.message);
        return;
      }
      threeGame?.placeBuilding(buildingType, { x: 0, y: 0 });
      hud.updateResources(simulationBridge.state.resources);
      hud.showToast(`${BUILDING_LABELS[buildingType]}를 배치했어요`);
    },
    onProductionTurn: () => {
      simulationBridge.produceTurn();
      hud.updateResources(simulationBridge.state.resources);
      const production = simulationBridge.lastProduction;
      const changes = Object.entries(production)
        .filter(([, value]) => value > 0)
        .map(([resource, value]) => `${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]} +${value}`);
      hud.showToast(`생산 턴 완료 · ${changes.length ? changes.join(" · ") : "생산 없음"}`);
    },
  });

  threeGame = new ThreeGameApp(roots.threeRoot, {
    initialDiscoveredLandmarkIds: simulationBridge.state.discoveredLandmarkIds ?? [],
    onDiscovery: (state) => {
      hud.updateDiscovery(state);
      const latest = saveManager.load() ?? createDefaultSaveData();
      saveManager.save({
        ...latest,
        activeMission: { ...simulationBridge.state, discoveredLandmarkIds: state.discoveredIds },
      });
    },
    onFallback: () => {
      hud.dispose();
      onFallback();
    },
  });

  if (!threeGame.start()) return false;

  hud.mount();
  hud.updateResources(simulationBridge.state.resources);
  const restoredDiscoveries = simulationBridge.state.discoveredLandmarkIds ?? [];
  if (restoredDiscoveries.length > 0) {
    hud.updateDiscovery({
      discoveredIds: restoredDiscoveries,
      discoveredCount: restoredDiscoveries.length,
      total: 3,
      isComplete: restoredDiscoveries.length >= 3,
    }, false);
  }
  simulationBridge.state.buildings.forEach((building) => {
    threeGame?.placeBuilding(building.type, building.position);
  });
  if (roots.legacyRoot) roots.legacyRoot.hidden = true;
  if (roots.legacyUiRoot) roots.legacyUiRoot.hidden = true;
  roots.threeUiRoot.hidden = false;
  return true;
}
