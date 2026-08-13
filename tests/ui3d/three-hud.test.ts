import { describe, expect, it, vi } from "vitest";
import { ThreeHud } from "../../src/ui3d/ThreeHud";

describe("ThreeHud guidance", () => {
  it("shows Lumi guidance and a next-stage action after the first mission", () => {
    const host = document.createElement("div");
    const onNextStage = vi.fn();
    const hud = new ThreeHud(host, { onStart: vi.fn(), onNextStage });

    hud.mount();
    expect(host.querySelector(".three-hud__guide")?.textContent).toContain("루미");
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("탐험 시작");

    hud.updateDiscovery({ discoveredCount: 3, total: 3, isComplete: true });

    const nextStage = host.querySelector<HTMLButtonElement>(".three-hud__guide-action");
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("작전 패널");
    expect(nextStage?.hidden).toBe(false);

    nextStage?.click();
    expect(onNextStage).toHaveBeenCalledOnce();
    hud.dispose();
  });
});
