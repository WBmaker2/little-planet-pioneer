import { describe, expect, it } from "vitest";
import { PlaytestObserver } from "../../src/core/playtest-observer";

describe("PlaytestObserver", () => {
  it("records an anonymous session summary with key interaction events", () => {
    const observer = new PlaytestObserver(() => 1000);
    observer.startMission("plain-01");
    observer.record("robot-selected", { robotId: "spark" });
    observer.record("preview-shown");
    observer.record("first-action", { buildingType: "solar" });
    observer.finish(true);

    expect(observer.getSummary()).toEqual({
      missionId: "plain-01",
      durationMs: 0,
      completed: true,
      eventTypes: ["mission-started", "robot-selected", "preview-shown", "first-action", "mission-completed"],
      helpRequests: 0,
    });
    expect(JSON.stringify(observer.getSummary())).not.toContain("학생");
  });

  it("counts help requests, can reset, and never accepts a student name", () => {
    let now = 1000;
    const observer = new PlaytestObserver(() => now);
    observer.startMission("plain-01");
    now = 2500;
    observer.record("help-requested");
    observer.finish(false);

    expect(observer.getSummary().durationMs).toBe(1500);
    expect(observer.getSummary().helpRequests).toBe(1);
    expect(() => observer.record("help-requested", { studentName: "민수" } as never)).not.toThrow();
    expect(JSON.stringify(observer.getSummary())).not.toContain("민수");
    observer.reset();
    expect(observer.getSummary()).toBeNull();
  });
});
