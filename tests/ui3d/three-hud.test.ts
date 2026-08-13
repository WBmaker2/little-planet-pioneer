import { describe, expect, it, vi } from "vitest";
import { ThreeHud } from "../../src/ui3d/ThreeHud";

describe("ThreeHud guidance", () => {
  it("keeps the operation panel visible with a clear first-step prompt", () => {
    const host = document.createElement("div");
    const hud = new ThreeHud(host, { onStart: vi.fn() });

    hud.mount();

    expect(host.querySelector<HTMLElement>(".three-hud__drawer")?.hidden).toBe(false);
    expect(host.querySelector(".three-hud__drawer-toggle")).toBeNull();
    expect(host.querySelector(".three-hud__drawer-close")).toBeNull();
    expect(host.querySelector(".three-hud__drawer-step")?.textContent).toContain("1/5");
    hud.dispose();
  });

  it("highlights each operation-panel action in order", () => {
    const host = document.createElement("div");
    const hud = new ThreeHud(host, { onStart: vi.fn() });

    hud.mount();
    hud.updateDiscovery({ discoveredCount: 3, total: 3, isComplete: true });
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("2단계");
    expect(host.querySelector<HTMLButtonElement>(".three-hud__robot")?.classList.contains("gi-pulse")).toBe(true);

    host.querySelector<HTMLButtonElement>(".three-hud__robot")?.click();
    expect(host.querySelector(".three-hud__drawer-step")?.textContent).toContain("3/5");
    expect(host.querySelector<HTMLButtonElement>(".three-hud__building")?.classList.contains("gi-pulse")).toBe(true);

    host.querySelector<HTMLButtonElement>(".three-hud__building")?.click();
    expect(host.querySelector(".three-hud__drawer-step")?.textContent).toContain("4/5");
    expect(host.querySelector<HTMLButtonElement>(".three-hud__place")?.classList.contains("gi-pulse")).toBe(true);

    hud.showPlacementComplete();
    expect(host.querySelector(".three-hud__drawer-step")?.textContent).toContain("5/5");
    expect(host.querySelector<HTMLButtonElement>(".three-hud__produce")?.classList.contains("gi-pulse")).toBe(true);
    hud.dispose();
  });

  it("offers a pulsing next-exploration action after production completes", () => {
    const host = document.createElement("div");
    const onNextExploration = vi.fn();
    const hud = new ThreeHud(host, { onStart: vi.fn(), onNextExploration });

    hud.mount();
    hud.showProductionComplete();

    const nextAction = host.querySelector<HTMLButtonElement>(".three-hud__guide-action");
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("첫 생산 완료");
    expect(nextAction?.textContent).toContain("탐험 계속하기");
    expect(nextAction?.classList.contains("gi-pulse")).toBe(true);

    nextAction?.click();
    expect(onNextExploration).toHaveBeenCalledOnce();
    hud.dispose();
  });

  it("opens a dated update history from the landing HUD", () => {
    const host = document.createElement("div");
    const hud = new ThreeHud(host, { onStart: vi.fn() });

    hud.mount();
    const updatesButton = host.querySelector<HTMLButtonElement>(".three-hud__updates-toggle");
    const updatesDialog = host.querySelector<HTMLElement>(".three-hud__updates-dialog");
    expect(updatesButton?.textContent).toContain("업데이트 내역");
    expect(updatesDialog?.hidden).toBe(true);

    updatesButton?.click();
    expect(updatesDialog?.hidden).toBe(false);
    expect(updatesDialog?.textContent).toContain("2026-08-13");
    hud.dispose();
  });

  it("explains one simple action at each part of the first mission", () => {
    const host = document.createElement("div");
    const hud = new ThreeHud(host, { onStart: vi.fn() });

    hud.mount();
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("탐험 시작");

    host.querySelector<HTMLButtonElement>(".three-hud__start")?.click();
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("반짝이는 보석 3개");

    hud.updateDiscovery({ discoveredCount: 1, total: 3, isComplete: false });
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("2개 남았어");
    hud.dispose();
  });

  it("shows Lumi guidance beside the always-open operation panel after the first mission", () => {
    const host = document.createElement("div");
    const hud = new ThreeHud(host, { onStart: vi.fn() });

    hud.mount();
    expect(host.querySelector(".three-hud__guide")?.textContent).toContain("루미");
    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("탐험 시작");

    hud.updateDiscovery({ discoveredCount: 3, total: 3, isComplete: true });

    expect(host.querySelector(".three-hud__guide-message")?.textContent).toContain("작전 패널");
    expect(host.querySelector(".three-hud__drawer")?.hidden).toBe(false);
    expect(host.querySelector(".three-hud__drawer-step")?.textContent).toContain("2/5");
    expect(host.querySelector<HTMLButtonElement>(".three-hud__robot")?.classList.contains("gi-pulse")).toBe(true);
    hud.dispose();
  });
});
