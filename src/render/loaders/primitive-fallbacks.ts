import * as THREE from "three";
import type { AssetKey } from "./asset-manifest";

export function createPrimitiveFallback(key: AssetKey): THREE.Group {
  const group = new THREE.Group();
  group.name = `asset-${key}-fallback`;
  const palette = key.startsWith("robot") ? "#91eadb" : key === "rover" ? "#ffd36a" : "#35cfb8";
  const material = new THREE.MeshStandardMaterial({ color: palette, roughness: 0.72, metalness: 0.1 });
  const body = new THREE.Mesh(
    key.startsWith("robot") ? new THREE.SphereGeometry(0.18, 12, 8) : new THREE.BoxGeometry(0.42, 0.36, 0.42),
    material,
  );
  body.position.y = 0.28;
  group.add(body);
  const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.16, 8), material);
  marker.position.y = 0.58;
  group.add(marker);
  return group;
}
