import { describe, expect, it, vi } from "vitest";
import { ThreeGameApp } from "../../src/render/app/ThreeGameApp";

describe("ThreeGameApp fallback", () => {
  it("calls the fallback hook when WebGL capability detection fails", () => {
    const host = document.createElement("div");
    let reason = "";
    const contextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(() => ({}) as WebGLRenderingContext);
    const app = new ThreeGameApp(host, {
      detectWebGLSupport: () => false,
      onFallback: (message) => { reason = message; },
    });

    try {
      expect(app.start()).toBe(false);
      expect(reason).toContain("WebGL");
      expect(host.childElementCount).toBe(0);
    } finally {
      contextSpy.mockRestore();
    }
  });
});
