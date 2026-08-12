export class DiscoveryTracker {
  private readonly landmarkIds: ReadonlySet<string>;
  private readonly discoveredIds = new Set<string>();

  constructor(landmarkIds: readonly string[], discoveredIds: readonly string[] = []) {
    this.landmarkIds = new Set(landmarkIds);
    discoveredIds.forEach((id) => {
      if (this.landmarkIds.has(id)) this.discoveredIds.add(id);
    });
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

  get ids(): string[] {
    return [...this.discoveredIds];
  }

  discover(landmarkId: string): boolean {
    if (!this.landmarkIds.has(landmarkId) || this.discoveredIds.has(landmarkId)) return false;
    this.discoveredIds.add(landmarkId);
    return true;
  }
}
