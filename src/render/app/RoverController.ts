export interface RoverPosition {
  x: number;
  z: number;
}

export interface RoverInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export class RoverController {
  public readonly position: RoverPosition;
  public heading = 0;

  constructor(start: RoverPosition = { x: 0, z: 0 }, private readonly speed = 2, private readonly bounds = 2) {
    this.position = { ...start };
  }

  update(input: RoverInput, deltaSeconds: number): RoverPosition {
    const xDirection = Number(input.right) - Number(input.left);
    const zDirection = Number(input.backward) - Number(input.forward);
    const length = Math.hypot(xDirection, zDirection);
    if (length === 0) return this.position;

    const scale = (this.speed * Math.max(0, deltaSeconds)) / Math.max(1, length);
    this.position.x = Math.max(-this.bounds, Math.min(this.bounds, this.position.x + xDirection * scale));
    this.position.z = Math.max(-this.bounds, Math.min(this.bounds, this.position.z + zDirection * scale));
    this.heading = Math.atan2(xDirection, -zDirection);
    return this.position;
  }
}
