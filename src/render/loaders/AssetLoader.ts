import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetManifest, type AssetKey } from "./asset-manifest";
import { createPrimitiveFallback } from "./primitive-fallbacks";

interface LoaderLike {
  load: (
    url: string,
    onLoad: (asset: { scene: THREE.Object3D }) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: unknown) => void,
  ) => void;
}

export class AssetLoader {
  private readonly loader: LoaderLike;

  constructor(loader: LoaderLike = new GLTFLoader()) {
    this.loader = loader;
  }

  load(key: AssetKey): Promise<THREE.Object3D> {
    return new Promise((resolve) => {
      this.loader.load(
        assetManifest[key],
        (asset) => resolve(asset.scene.clone(true)),
        undefined,
        () => resolve(createPrimitiveFallback(key)),
      );
    });
  }
}
