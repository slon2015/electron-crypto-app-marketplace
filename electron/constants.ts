import { homedir } from "os";
import { join, normalize } from "path";

export const idleThresholdInSeconds = 60 * 5;
export const appRegistryFileName = normalize(
  join(homedir(), "defi-os", "apps-registry.json")
);
