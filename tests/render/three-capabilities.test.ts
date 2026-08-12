import { describe, expect, it } from "vitest";
import { detectWebGLSupport } from "../../src/render/app/three-capabilities";

describe("detectWebGLSupport", () => {
  it("recognizes a browser canvas with a WebGL context", () => {
    expect(detectWebGLSupport(() => ({ getContext: () => ({}) }))).toBe(true);
  });

  it("returns false when a browser cannot create WebGL", () => {
    expect(detectWebGLSupport(() => ({ getContext: () => null }))).toBe(false);
  });
});
