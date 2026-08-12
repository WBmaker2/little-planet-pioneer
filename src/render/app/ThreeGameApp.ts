import * as THREE from "three";
import { detectWebGLSupport } from "./three-capabilities";
import { RoverController, roverDirectionFromKeyboardEvent, type RoverDirection, type RoverInput } from "./RoverController";
import { DiscoveryTracker } from "./DiscoveryTracker";
import { findNearbyLandmarks, type LandmarkPosition } from "./landmark-discovery";
import { createRoverObject } from "../objects/Rover";
import { createSupportRobotObject, type SupportRobotId } from "../objects/SupportRobot";
import { createBuildingObject } from "../objects/BuildingObject";
import type { BuildingType, Coordinate } from "../../core/types";

export interface DiscoveryState {
  discoveredIds: string[];
  discoveredCount: number;
  total: number;
  isComplete: boolean;
}

export interface ThreeGameAppOptions {
  onFallback: (reason: string) => void;
  onDiscovery?: (state: DiscoveryState) => void;
  detectWebGLSupport?: () => boolean;
  initialDiscoveredLandmarkIds?: string[];
}

export class ThreeGameApp {
  private renderer: THREE.WebGLRenderer | null = null;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  private readonly roverController = new RoverController({ x: 0, z: 0 });
  private readonly rover = createRoverObject();
  private readonly input: RoverInput = { forward: false, backward: false, left: false, right: false };
  private readonly discoveryTracker: DiscoveryTracker;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly landmarks = new Map<THREE.Object3D, string>();
  private readonly landmarkPositions = new Map<string, LandmarkPosition>();
  private readonly buildings = new Map<string, THREE.Object3D>();
  private supportRobot: THREE.Group | null = null;
  private lastFrameTime = 0;
  private exploring = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: ThreeGameAppOptions,
  ) {
    this.discoveryTracker = new DiscoveryTracker(["crystal", "seed", "beacon"], options.initialDiscoveredLandmarkIds);
  }

  start(): boolean {
    const canUseWebGL = this.options.detectWebGLSupport ?? detectWebGLSupport;
    if (!canUseWebGL()) {
      this.options.onFallback("이 브라우저에서는 WebGL을 사용할 수 없습니다.");
      return false;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      this.renderer.setClearColor(0x071525, 1);
      this.renderer.domElement.className = "three-canvas";
      this.renderer.domElement.setAttribute("aria-label", "3D 행성 개척 장면");
      this.host.replaceChildren(this.renderer.domElement);
      this.host.hidden = false;
      this.createShellScene();
      this.resize();
      window.addEventListener("resize", this.resize);
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("keyup", this.handleKeyUp);
      window.addEventListener("blur", this.handleWindowBlur);
      this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDown);
      this.renderer.domElement.addEventListener("webglcontextlost", this.handleContextLost);
      this.renderer.setAnimationLoop(this.render);
      return true;
    } catch {
      this.dispose();
      this.options.onFallback("3D 장면을 시작하지 못했습니다.");
      return false;
    }
  }

  beginExploration(): void {
    this.exploring = true;
    if (this.renderer) this.renderer.domElement.style.cursor = "crosshair";
  }

  setRoverInput(direction: RoverDirection, pressed: boolean): void {
    this.input[direction] = pressed;
  }

  setSupportRobot(robotId: SupportRobotId): void {
    if (this.supportRobot) this.scene.remove(this.supportRobot);
    this.supportRobot = createSupportRobotObject(robotId);
    this.scene.add(this.supportRobot);
  }

  placeBuilding(type: BuildingType, position: Coordinate): void {
    const buildingId = `${type}-${position.x}-${position.y}`;
    if (this.buildings.has(buildingId)) return;
    const building = createBuildingObject(type);
    building.position.set(-1.05 + position.x * 0.58, 0, -0.4 + position.y * 0.58);
    this.buildings.set(buildingId, building);
    this.scene.add(building);
  }

  private createShellScene(): void {
    this.scene.background = new THREE.Color("#071525");
    this.scene.fog = new THREE.Fog("#071525", 8, 22);
    this.camera.position.set(0, 5.8, 7.8);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(new THREE.HemisphereLight("#d9fff7", "#172c45", 2.1));
    const sun = new THREE.DirectionalLight("#ffe9ae", 3.2);
    sun.position.set(-4, 7, 5);
    this.scene.add(sun);

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 32, 18),
      new THREE.MeshStandardMaterial({ color: "#183f55", roughness: 0.92, metalness: 0.04 }),
    );
    planet.scale.y = 0.52;
    planet.position.y = -1.1;
    this.scene.add(planet);

    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(2.65, 2.95, 0.34, 12),
      new THREE.MeshStandardMaterial({ color: "#2e806f", roughness: 0.88 }),
    );
    island.position.y = 0.15;
    this.scene.add(island);

    this.scene.add(this.rover);

    const landmarkPositions: ReadonlyArray<readonly [string, number, number, number]> = [
      ["crystal", -1.4, 0.38, -0.7],
      ["seed", 1.35, 0.42, -0.55],
      ["beacon", 0.9, 0.38, 1.15],
    ];
    for (const [id, x, y, z] of landmarkPositions) {
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({ color: "#91eadb", emissive: "#35cfb8", emissiveIntensity: 0.65 }),
      );
      marker.position.set(x, y, z);
      marker.userData.baseY = y;
      marker.visible = !(this.options.initialDiscoveredLandmarkIds ?? []).includes(id);
      this.landmarks.set(marker, id);
      this.landmarkPositions.set(id, { id, x, z });
      this.scene.add(marker);
    }
  }

  private readonly resize = (): void => {
    if (!this.renderer) return;
    const width = Math.max(1, this.host.clientWidth || window.innerWidth);
    const height = Math.max(1, this.host.clientHeight || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly render = (time = 0): void => {
    if (!this.renderer) return;
    const deltaSeconds = this.lastFrameTime === 0 ? 0 : Math.min(0.05, (time - this.lastFrameTime) / 1000);
    this.lastFrameTime = time;
    const position = this.roverController.update(
      this.exploring ? this.input : { forward: false, backward: false, left: false, right: false },
      deltaSeconds,
    );
    const pulseTime = time / 600;
    for (const marker of this.landmarks.keys()) {
      marker.rotation.y += deltaSeconds * 1.8;
      marker.position.y = marker.userData.baseY + Math.sin(pulseTime + marker.position.x) * 0.06;
    }
    this.rover.position.x = position.x;
    this.rover.position.z = position.z;
    this.rover.rotation.y = this.roverController.heading;
    if (this.supportRobot) {
      this.supportRobot.position.set(position.x - 0.58, 0.02 + Math.sin(pulseTime * 1.2) * 0.04, position.z + 0.58);
      this.supportRobot.rotation.y = -this.roverController.heading * 0.5;
    }
    this.discoverNearbyLandmarks(position);
    this.camera.lookAt(position.x * 0.18, 0, position.z * 0.18);
    this.renderer.render(this.scene, this.camera);
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const direction = roverDirectionFromKeyboardEvent(event);
    if (!direction) return;
    event.preventDefault();
    this.input[direction] = true;
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const direction = roverDirectionFromKeyboardEvent(event);
    if (!direction) return;
    event.preventDefault();
    this.input[direction] = false;
  };

  private readonly handleWindowBlur = (): void => {
    this.input.forward = false;
    this.input.backward = false;
    this.input.left = false;
    this.input.right = false;
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.renderer || !this.exploring) return;
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects([...this.landmarks.keys()], false)[0]?.object;
    const landmarkId = hit ? this.landmarks.get(hit) : this.findNearestLandmarkAtPointer(event, bounds);
    if (landmarkId) this.discoverLandmark(landmarkId);
  };

  private discoverNearbyLandmarks(position: { x: number; z: number }): void {
    if (!this.exploring) return;
    for (const landmarkId of findNearbyLandmarks(position, [...this.landmarkPositions.values()])) {
      this.discoverLandmark(landmarkId);
    }
  }

  private discoverLandmark(landmarkId: string): void {
    if (!this.discoveryTracker.discover(landmarkId)) return;
    for (const [object, id] of this.landmarks) {
      if (id === landmarkId) object.visible = false;
    }
    this.options.onDiscovery?.({
      discoveredIds: this.discoveryTracker.ids,
      discoveredCount: this.discoveryTracker.discoveredCount,
      total: this.landmarks.size,
      isComplete: this.discoveryTracker.isComplete,
    });
  }

  private findNearestLandmarkAtPointer(event: PointerEvent, bounds: DOMRect): string | undefined {
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    let nearest: { id: string; distance: number } | undefined;
    for (const [object, id] of this.landmarks) {
      if (!object.visible) continue;
      const projected = object.position.clone().project(this.camera);
      const x = bounds.left + (projected.x + 1) * 0.5 * bounds.width;
      const y = bounds.top + (1 - projected.y) * 0.5 * bounds.height;
      const distance = Math.hypot(pointerX - x, pointerY - y);
      if (distance <= 44 && (!nearest || distance < nearest.distance)) nearest = { id, distance };
    }
    return nearest?.id;
  }

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
    this.dispose();
    this.options.onFallback("3D 그래픽이 일시적으로 중단되어 안전 모드로 전환했습니다.");
  };

  dispose(): void {
    this.renderer?.setAnimationLoop(null);
    this.renderer?.domElement.removeEventListener("webglcontextlost", this.handleContextLost);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleWindowBlur);
    this.renderer?.domElement.removeEventListener("pointerdown", this.handlePointerDown);
    this.renderer?.dispose();
    this.renderer = null;
    this.host.replaceChildren();
  }
}
