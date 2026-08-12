import type { BuildingType, SupportRobot } from "./types";

export type PlaytestEventType =
  | "mission-started"
  | "robot-selected"
  | "preview-shown"
  | "first-action"
  | "help-requested"
  | "mission-completed"
  | "mission-finished";

export interface PlaytestDetails {
  robotId?: SupportRobot["id"];
  buildingType?: BuildingType;
}

interface PlaytestEvent {
  type: PlaytestEventType;
  at: number;
}

export interface PlaytestSummary {
  missionId: string;
  durationMs: number;
  completed: boolean;
  eventTypes: PlaytestEventType[];
  helpRequests: number;
}

export class PlaytestObserver {
  private missionId: string | null = null;
  private startedAt = 0;
  private finishedAt = 0;
  private completed = false;
  private events: PlaytestEvent[] = [];

  constructor(private readonly clock: () => number = () => Date.now()) {}

  startMission(missionId: string): void {
    this.reset();
    this.missionId = missionId;
    this.startedAt = this.clock();
    this.events.push({ type: "mission-started", at: this.startedAt });
  }

  record(type: Exclude<PlaytestEventType, "mission-started" | "mission-completed" | "mission-finished">, details: PlaytestDetails = {}): void {
    if (!this.missionId) return;
    // Keep only aggregate interaction categories; never store names or arbitrary payloads.
    void details;
    this.events.push({ type, at: this.clock() });
  }

  finish(completed: boolean): void {
    if (!this.missionId) return;
    this.completed = completed;
    this.finishedAt = this.clock();
    this.events.push({ type: completed ? "mission-completed" : "mission-finished", at: this.finishedAt });
  }

  getSummary(): PlaytestSummary | null {
    if (!this.missionId) return null;
    const end = this.finishedAt || this.clock();
    return {
      missionId: this.missionId,
      durationMs: Math.max(0, end - this.startedAt),
      completed: this.completed,
      eventTypes: this.events.map(({ type }) => type),
      helpRequests: this.events.filter(({ type }) => type === "help-requested").length,
    };
  }

  reset(): void {
    this.missionId = null;
    this.startedAt = 0;
    this.finishedAt = 0;
    this.completed = false;
    this.events = [];
  }
}
