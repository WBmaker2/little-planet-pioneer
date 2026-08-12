import * as THREE from "three";

export type SupportRobotId = "waterdrop" | "spark" | "tick" | "sprout";

const ROBOT_COLORS: Record<SupportRobotId, string> = {
  waterdrop: "#6edcff",
  spark: "#ffd36a",
  tick: "#ff9a80",
  sprout: "#91eadb",
};

export function createSupportRobotObject(id: SupportRobotId): THREE.Group {
  const robot = new THREE.Group();
  robot.name = `support-robot-${id}`;
  const material = new THREE.MeshStandardMaterial({
    color: ROBOT_COLORS[id],
    emissive: ROBOT_COLORS[id],
    emissiveIntensity: 0.25,
    roughness: 0.62,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), material);
  body.scale.y = 1.08;
  body.position.y = 0.4;
  robot.add(body);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 6),
    new THREE.MeshStandardMaterial({ color: "#071525", emissive: "#071525" }),
  );
  eye.position.set(0, 0.44, 0.18);
  robot.add(eye);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6), material);
  antenna.position.y = 0.7;
  robot.add(antenna);
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), material);
  beacon.position.y = 0.81;
  robot.add(beacon);

  return robot;
}
