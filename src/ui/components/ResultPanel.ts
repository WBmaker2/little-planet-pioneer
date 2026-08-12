import type { MissionResult, ProfileState } from "../../core/types";
import { createButton } from "../ui-root";

export interface ResultPanelActions {
  onRetry: () => void;
  onMap: () => void;
  onHome: () => void;
}

export interface ResultPanelData {
  result: MissionResult;
  profile: ProfileState;
  newUnlocks: string[];
}

function badgeStars(level: number): string {
  return `${"★".repeat(level)}${"☆".repeat(3 - level)}`;
}

export function formatMissionResult(result: MissionResult): string[] {
  return [
    `개척 ${result.developmentScore}점`,
    `효율 ${result.efficiencyScore}점`,
    `회복 ${result.restorationScore}점`,
  ];
}

export function formatHeadquarters(profile: ProfileState): string {
  return `개척 본부 Lv.${profile.headquartersLevel}`;
}

export function createResultPanel(
  data: ResultPanelData,
  actions: ResultPanelActions,
): HTMLElement {
  const panel = document.createElement("article");
  panel.className = "result-panel";

  const heading = document.createElement("div");
  heading.innerHTML = `
    <p class="eyebrow">${data.result.completed ? "미션 달성" : "탐험 기록 저장"}</p>
    <h1>개척 배지</h1>
    <p>${formatHeadquarters(data.profile)}</p>
  `;

  const metrics = document.createElement("div");
  metrics.className = "result-metrics";
  const labels = ["개척", "효율", "회복"];
  const levels = [data.result.badges.development, data.result.badges.efficiency, data.result.badges.restoration];
  const scores = formatMissionResult(data.result);
  labels.forEach((label, index) => {
    const metric = document.createElement("section");
    metric.innerHTML = `<span>${label}</span><strong aria-label="${label} 배지 ${levels[index]}개">${badgeStars(levels[index])}</strong><small>${scores[index]}</small>`;
    metrics.append(metric);
  });

  const credits = document.createElement("div");
  credits.className = "credit-reward";
  credits.innerHTML = `<span>획득 크레딧</span><strong>+${data.result.creditsAdded ?? data.result.creditsEarned}</strong>`;

  panel.append(heading, metrics, credits);

  if (data.newUnlocks.length > 0) {
    const unlocks = document.createElement("div");
    unlocks.className = "unlock-list";
    unlocks.innerHTML = `<h2>새로운 발견</h2><p>${data.newUnlocks.join(" · ")}</p>`;
    panel.append(unlocks);
  }

  const actionsRow = document.createElement("div");
  actionsRow.className = "button-row";
  actionsRow.append(
    createButton("다시 하기", actions.onRetry, "secondary"),
    createButton("행성 지도", actions.onMap),
    createButton("개척 본부", actions.onHome, "ghost"),
  );
  panel.append(actionsRow);
  return panel;
}
