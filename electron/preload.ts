import { contextBridge, ipcRenderer } from "electron";

import { ContainerInfo, PollerMessagePort, PollerEvent } from "./types";

function inspectMiner(port: PollerMessagePort): Promise<ContainerInfo> {
  return new Promise((resolve, reject) => {
    console.log("Preload: inspect request received");
    port.addEventListener("message", (e) => {
      if (e.data.type === "miner-container-state" && e.data.status) {
        if (e.data.status === "OK") {
          resolve(e.data.container);
        } else {
          reject(new Error(e.data.cause));
        }
      }
    });
    console.log("Preload: inspect response installed");

    port.postMessage({ type: "miner-inspection-requested" });
    console.log("Preload: inspect request sent");
  });
}

function install(
  port: PollerMessagePort,
  walletAddress: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    console.log("Preload: install request received");

    port.postMessage({
      type: "miner-installation-requested",
      walletAddress,
    });

    console.log("Preload: install request sent");

    port.addEventListener("message", ({ data }: { data: PollerEvent }) => {
      if (data.type === "miner-created") {
        resolve(data.containerId);
        console.log("Preload: install request succeded");
      }
      if (data.type === "miner-creation-failed") {
        reject(new Error(data.cause));
        console.log("Preload: install request failed");
      }
    });
  });
}

ipcRenderer.once("port", (e) => {
  console.log("Renderer: Port received in preload");

  const port = e.ports[0] as PollerMessagePort;

  contextBridge.exposeInMainWorld("minerService", {
    install: (walletAddress: string) => install(port, walletAddress),

    inspectMiner: () => inspectMiner(port),

    onMinerStart: (callback: () => void) => {
      port.addEventListener("message", (e) => {
        if (e.data.type === "miner-started") {
          callback();
        }
      });
      console.log("Preload: onMinerStart callback set");
    },

    onMinerStop: (callback: () => void) => {
      port.addEventListener("message", (e) => {
        if (e.data.type === "miner-stopped") {
          callback();
        }
      });
      console.log("Preload: onMinerStop callback set");
    },
  });

  port.start();
  console.log("Preload: port started");
});
