import * as THREE from "three";

export function createRoverObject(): THREE.Group {
  const rover = new THREE.Group();
  rover.name = "rover";
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.3, 0.95),
    new THREE.MeshStandardMaterial({ color: "#ffd36a", roughness: 0.55, metalness: 0.18 }),
  );
  body.position.y = 0.48;
  rover.add(body);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.48, 8),
    new THREE.MeshStandardMaterial({ color: "#91eadb", emissive: "#35cfb8", emissiveIntensity: 0.3 }),
  );
  mast.position.set(0, 0.8, 0.12);
  rover.add(mast);

  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.28, 0.28]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: "#13253a", roughness: 0.95 }),
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.32, z);
      rover.add(wheel);
    }
  }
  rover.position.set(0, 0.22, 0.85);
  return rover;
}
