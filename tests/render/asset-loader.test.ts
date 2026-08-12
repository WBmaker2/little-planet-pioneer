import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { AssetLoader } from "../../src/render/loaders/AssetLoader";

describe("AssetLoader", () => {
  it("returns a named primitive fallback when a GLB cannot be loaded", async () => {
    const loader = new AssetLoader({
      load: (_url, _onLoad, _onProgress, onError) => onError?.(new Error("missing")),
    });

    const object = await loader.load("rover");

    expect(object).toBeInstanceOf(THREE.Group);
    expect(object.name).toBe("asset-rover-fallback");
  });
});
