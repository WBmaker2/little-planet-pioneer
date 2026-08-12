import type { MissionDefinition } from "../../core/types";
import { BIOME_NAMES } from "../theme";
import { createButton } from "../ui-root";
import { BUILDING_NAMES } from "./BuildingPalette";

export function createMissionCard(mission: MissionDefinition, onStart: () => void): HTMLElement {
  const card = document.createElement("article");
  card.className = "mission-card";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `${BIOME_NAMES[mission.biome]} · 약 ${mission.duration}분`;

  const title = document.createElement("h2");
  title.textContent = mission.title;

  const objective = document.createElement("p");
  objective.textContent = `${BUILDING_NAMES[mission.target.buildingType]} 시설 ${mission.target.count}개를 완성하세요.`;

  card.append(eyebrow, title, objective, createButton("탐험 시작", onStart));
  return card;
}
