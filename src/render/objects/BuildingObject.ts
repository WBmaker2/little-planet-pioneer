import * as THREE from "three";
import type { BuildingType } from "../../core/types";

const BUILDING_COLORS: Record<BuildingType, string> = {
  solar: "#ffd36a",
  recycler: "#91eadb",
  workshop: "#ff9a80",
  greenhouse: "#79df9d",
  observatory: "#b39cff",
  beacon: "#6edcff",
};

export function createBuildingObject(type: BuildingType): THREE.Group {
  const building = new THREE.Group();
  building.name = `building-${type}`;
  const material = new THREE.MeshStandardMaterial({
    color: BUILDING_COLORS[type],
    emissive: BUILDING_COLORS[type],
    emissiveIntensity: 0.14,
    roughness: 0.7,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.08, 10), material);
  base.position.y = 0.2;
  building.add(base);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.34), material);
  body.position.y = 0.39;
  building.add(body);

  if (type === "solar") {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.2), material);
    panel.position.set(0, 0.62, 0);
    panel.rotation.z = -0.25;
    building.add(panel);
  } else if (type === "beacon") {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.48, 8), material);
    mast.position.y = 0.72;
    building.add(mast);
    const signal = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), material);
    signal.position.y = 1;
    building.add(signal);
  } else {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.18, 6), material);
    cap.position.y = 0.62;
    building.add(cap);
  }

  return building;
}
