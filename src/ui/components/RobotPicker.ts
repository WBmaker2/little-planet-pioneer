import { supportRobots } from "../../core/mission-data";
import type { SupportRobot } from "../../core/types";

export function createRobotPicker(
  selected: SupportRobot["id"] | null | undefined,
  locked: boolean,
  onSelect: (robotId: SupportRobot["id"]) => void,
): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "robot-picker";
  const title = document.createElement("div");
  title.innerHTML = `<p class="eyebrow">지원 로봇</p><h2>이번 탐험의 동료</h2>`;
  const choices = document.createElement("div");
  choices.className = "robot-choices";

  for (const robot of supportRobots) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "robot-button";
    button.setAttribute("aria-pressed", String(selected === robot.id));
    button.disabled = locked;
    button.innerHTML = `<strong>${robot.title}</strong><span>${robot.description}</span>`;
    button.addEventListener("click", () => onSelect(robot.id));
    choices.append(button);
  }

  const status = document.createElement("p");
  status.className = "robot-status";
  status.textContent = selected ? `${supportRobots.find(({ id }) => id === selected)?.title}가 선택되었습니다` : "로봇 없이 시작하거나 한 명을 선택하세요.";
  choices.append(status);
  panel.append(title, choices);
  return panel;
}
