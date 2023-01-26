import EventEmitter from "events";
import { powerMonitor } from "electron";

export class IdleService extends EventEmitter {
  private wasIdle = false;

  constructor(private readonly idleThresholdInSeconds: number) {
    super();
  }

  check(): void {
    const state = powerMonitor.getSystemIdleState(this.idleThresholdInSeconds);

    if ((state === "idle" || state === "locked") && !this.wasIdle) {
      this.wasIdle = true;
      this.emit("idle-detected");
    }
    if (state === "active" && this.wasIdle) {
      this.wasIdle = false;
      this.emit("activation-detected");
    }
  }

  isInIdleState(): boolean {
    return this.wasIdle;
  }
}
