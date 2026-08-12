import type Phaser from "phaser";
import { BUILDING_COSTS } from "../../core/game-engine";
import type { BuildingType, MissionDefinition, PlanetState } from "../../core/types";

export const BUILDING_NAMES: Record<BuildingType, string> = {
  solar: "태양광 발전기",
  recycler: "물 재활용기",
  workshop: "부품 작업장",
  greenhouse: "생태 온실",
  observatory: "관측소",
  beacon: "통신 기지",
};

export function createBuildingPalette(
  mission: MissionDefinition,
  selected: BuildingType | null,
  onSelect: (type: BuildingType) => void,
): HTMLElement {
  const palette = document.createElement("aside");
  palette.className = "building-palette";
  palette.innerHTML = `<div><p class="eyebrow">건설 장비</p><h2>시설 선택</h2></div>`;

  for (const type of mission.availableBuildings) {
    const cost = BUILDING_COSTS[type];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "building-button";
    button.setAttribute("aria-pressed", String(selected === type));
    button.innerHTML = `<strong>${BUILDING_NAMES[type]}</strong><span>💧 ${cost.water} · ⚡ ${cost.energy} · 🔩 ${cost.parts}</span>`;
    button.addEventListener("click", () => onSelect(type));
    palette.append(button);
  }

  return palette;
}

export function renderBuildingPalette(
  _scene: Phaser.Scene,
  mission: MissionDefinition,
  _state: PlanetState,
): void {
  const current = document.querySelector(".building-palette");
  current?.replaceWith(createBuildingPalette(mission, null, () => undefined));
}
