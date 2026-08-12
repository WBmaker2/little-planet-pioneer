import type { ExplorationEvent, ResourceKind, Resources } from "../../core/types";

const RESOURCE_NAMES: Record<ResourceKind, string> = { water: "물", energy: "에너지", parts: "부품" };

function describeResources(values: Partial<Resources>): string {
  const entries = (Object.entries(values) as Array<[ResourceKind, number]>).filter(([, amount]) => amount > 0);
  return entries.length ? entries.map(([kind, amount]) => `${RESOURCE_NAMES[kind]} ${amount}`).join(", ") : "없음";
}

export function createEventModal(
  event: ExplorationEvent,
  resources: Resources,
  onChoose: (choiceId: string) => void,
): HTMLElement {
  const panel = document.createElement("aside");
  panel.className = "event-panel";
  panel.innerHTML = `<p class="eyebrow">탐험 사건</p><h2>${event.title}</h2><p>${event.description}</p>`;

  const actions = document.createElement("div");
  actions.className = "event-actions";
  for (const choice of event.choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-choice";
    const canAfford = (Object.entries(choice.cost) as Array<[ResourceKind, number]>).every(
      ([kind, amount]) => resources[kind] >= amount,
    );
    button.textContent = `${choice.label} · 필요: ${describeResources(choice.cost)} · 보상: ${describeResources(choice.reward)} · 회복도 +${choice.restorationDelta}`;
    button.disabled = !canAfford;
    if (!canAfford) button.title = "필요한 자원이 부족합니다.";
    button.addEventListener("click", () => onChoose(choice.id));
    actions.append(button);
  }
  panel.append(actions);
  return panel;
}
