export class DiscoveryTracker {
  private readonly landmarkIds: ReadonlySet<string>;
  private readonly discoveredIds = new Set<string>();

  constructor(landmarkIds: readonly string[]) {
    this.landmarkIds = new Set(landmarkIds);
  }

  get discoveredCount(): number {
    return this.discoveredIds.size;
  }

  get progress(): number {
    return this.landmarkIds.size === 0 ? 1 : this.discoveredCount / this.landmarkIds.size;
  }

  get isComplete(): boolean {
    return this.discoveredCount === this.landmarkIds.size;
  }

  discover(landmarkId: string): boolean {
    if (!this.landmarkIds.has(landmarkId) || this.discoveredIds.has(landmarkId)) return false;
    this.discoveredIds.add(landmarkId);
    return true;
  }
}
