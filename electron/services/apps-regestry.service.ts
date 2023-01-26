import { join, normalize } from "path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

import { z } from "zod";

const AppEntry = z.object({
  appName: z.string(),
  containerId: z.string(),
});

const AppState = z.object({
  types: z.array(z.string()),
  installedApps: z.record(z.string(), z.array(AppEntry)),
});

type AppsState = z.infer<typeof AppState>;

type AppEntry = z.infer<typeof AppEntry>;

export class AppRegestryService {
  constructor(private readonly stateFileName: string) {}

  private load(): AppsState {
    try {
      const existingState: AppsState = JSON.parse(
        readFileSync(this.stateFileName).toString()
      );
      return AppState.parse(existingState);
    } catch (error: unknown) {
      return {
        types: [],
        installedApps: {},
      };
    }
  }

  private save(updatedState: AppsState) {
    const text = JSON.stringify(updatedState);
    const stateFileDir = normalize(join(this.stateFileName, ".."));
    if (!existsSync(stateFileDir)) {
      mkdirSync(stateFileDir, {
        recursive: true,
      });
    }
    writeFileSync(this.stateFileName, text);
  }

  private addAppTypeToRegestry(state: AppsState, appName: string): AppsState {
    if (!state.types.includes(appName)) {
      state.types.push(appName);
    }

    return state;
  }

  addToRegestry(appName: string, appContainerId: string) {
    const state = this.addAppTypeToRegestry(this.load(), appName);

    const regestry: Array<AppEntry> = state.installedApps[appName] ?? [];

    regestry.push({
      appName,
      containerId: appContainerId,
    });

    state.installedApps[appName] = regestry;

    this.save(state);
  }

  removeApps(containerIds: Array<string>) {
    const state = this.load();

    const appTypes = state.types;

    appTypes.forEach((appType) => {
      const apps = state.installedApps[appType];

      state.installedApps[appType] = apps.filter(
        (app) => !containerIds.includes(app.containerId)
      );
    });

    this.save(state);
  }

  getAllApps(appName?: string): Array<AppEntry> {
    const state = this.load();
    if (appName) {
      return state.installedApps[appName] ?? [];
    } else {
      const appTypes = state.types ?? [];

      return appTypes.flatMap((appType) => state.installedApps[appType] ?? []);
    }
  }

  getAppsCount(appName: string): number {
    const state = this.load();
    const apps = state.installedApps[appName] ?? [];

    return apps.length;
  }
}
