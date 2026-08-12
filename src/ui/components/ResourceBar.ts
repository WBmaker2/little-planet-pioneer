import type Phaser from "phaser";
import type { Resources } from "../../core/types";

const RESOURCE_META = [
  { key: "water", label: "물", icon: "💧" },
  { key: "energy", label: "에너지", icon: "⚡" },
  { key: "parts", label: "부품", icon: "🔩" },
] as const;

export function createResourceBar(resources: Resources): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "resource-bar";
  bar.setAttribute("aria-label", "현재 자원");

  for (const item of RESOURCE_META) {
    const resource = document.createElement("div");
    resource.className = `resource resource--${item.key}`;
    resource.innerHTML = `<span aria-hidden="true">${item.icon}</span><span>${item.label}</span><strong>${resources[item.key]}</strong>`;
    bar.append(resource);
  }

  return bar;
}

export function renderResourceBar(_scene: Phaser.Scene, resources: Resources): void {
  document.querySelector(".resource-bar")?.replaceWith(createResourceBar(resources));
}
