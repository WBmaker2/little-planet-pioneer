export interface LandmarkPosition {
  id: string;
  x: number;
  z: number;
}

export function findNearbyLandmarks(
  rover: { x: number; z: number },
  landmarks: readonly LandmarkPosition[],
  radius = 0.75,
): string[] {
  const radiusSquared = radius * radius;
  return landmarks
    .filter(({ x, z }) => {
      const dx = x - rover.x;
      const dz = z - rover.z;
      return dx * dx + dz * dz <= radiusSquared;
    })
    .map(({ id }) => id);
}
