export const assetManifest = {
  rover: "/assets/rover.glb",
  robotWaterdrop: "/assets/robot-waterdrop.glb",
  robotSpark: "/assets/robot-spark.glb",
  robotTick: "/assets/robot-tick.glb",
  robotSprout: "/assets/robot-sprout.glb",
  solar: "/assets/building-solar.glb",
  recycler: "/assets/building-recycler.glb",
  workshop: "/assets/building-workshop.glb",
  greenhouse: "/assets/building-greenhouse.glb",
  observatory: "/assets/building-observatory.glb",
  beacon: "/assets/building-beacon.glb",
} as const;

export type AssetKey = keyof typeof assetManifest;
