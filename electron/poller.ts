import { inspect } from "util";

import Dockerode from "dockerode";

import { AppRegestryService } from "./services/apps-regestry.service";
import { DockerService } from "./services/docker.service";
import { IdleService } from "./services/idle.service";
import { MinerAppService } from "./services/miner-app.service";
import { ContainerInfo, PollerMessagePortMain } from "./types";
import { appRegistryFileName, idleThresholdInSeconds } from "./constants";

async function cleanupNotFoundContainers(
  regestry: AppRegestryService,
  docker: DockerService
): Promise<void> {
  const apps = regestry.getAllApps();

  const ids = await Promise.all(
    apps.map(async (app) => {
      const containerId = app.containerId;
      const containerExists =
        (await docker.getContainerState(containerId)) !== "notFound";

      return containerExists ? null : containerId;
    })
  );

  regestry.removeApps(ids.filter(Boolean) as Array<string>);
}

async function getMinerContainerInfo(
  dockerService: DockerService,
  minerService: MinerAppService
): Promise<ContainerInfo> {
  console.log("Poller: inspect request received");

  if (!minerService.isInstalled()) {
    return {
      state: "notExists",
    };
  }
  const containerId = minerService.getContainerId();
  console.log("Poller: miner container id received");
  const containerState = await dockerService.getContainerState(containerId);
  if (containerState === "notFound") {
    return {
      state: "notExists",
    };
  }
  console.log("Poller: miner container status received");
  return {
    id: containerId,
    state: containerState,
  };
}

export async function setup(port: PollerMessagePortMain): Promise<() => void> {
  console.log("Poller: setup start");
  const idleChecker = new IdleService(idleThresholdInSeconds);
  const dockerService = new DockerService(new Dockerode());
  const regestryService = new AppRegestryService(appRegistryFileName);
  const minerService = new MinerAppService(regestryService, dockerService);

  await cleanupNotFoundContainers(regestryService, dockerService);

  const pollInterval = setInterval(idleChecker.check.bind(idleChecker), 5000);

  idleChecker.on("idle-detected", () => {
    const minerContainerId = minerService.getContainerId();
    if (minerContainerId) {
      dockerService.startContainer(minerContainerId);
      port.postMessage({
        type: "miner-started",
      });
    }
  });

  idleChecker.on("activation-detected", () => {
    const minerContainerId = minerService.getContainerId();
    if (minerContainerId) {
      dockerService.stopContainer(minerContainerId);
      port.postMessage({
        type: "miner-stopped",
      });
    }
  });

  port.on("message", async (e) => {
    console.log(`Poller: Message received ${JSON.stringify(e.data)}`);
    if (e.data.type === "miner-installation-requested") {
      console.log("Poller: install request received");

      try {
        const containerId = await minerService.installApp(e.data.walletAddress);
        port.postMessage({
          type: "miner-created",
          containerId,
        });
      } catch (error: unknown) {
        port.postMessage({
          type: "miner-creation-failed",
          cause: inspect(error),
        });
      }
    }

    if (e.data.type === "miner-inspection-requested") {
      try {
        const info = await getMinerContainerInfo(dockerService, minerService);
        port.postMessage({
          type: "miner-container-state",
          status: "OK",
          container: info,
        });
      } catch (error: unknown) {
        port.postMessage({
          type: "miner-container-state",
          status: "ERROR",
          cause: inspect(error),
        });
      }
    }
  });

  port.start();

  return () => {
    clearInterval(pollInterval);
  };
}
