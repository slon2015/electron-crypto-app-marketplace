import type { MessagePortMain } from "electron";
import { EventEmitter } from "stream";

export type ContainerInfo =
  | {
      id: string;
      state: "running" | "paused";
    }
  | {
      state: "notExists";
    };

type GenericEvent<T extends string> = {
  type: T;
};

export type MinerCreated = GenericEvent<"miner-created"> & {
  containerId: string;
};
export type MinerCreationFailed = GenericEvent<"miner-creation-failed"> & {
  cause: string;
};
export type MinerStarted = GenericEvent<"miner-started">;
export type MinerStopped = GenericEvent<"miner-stopped">;
export type MinerContainerState = GenericEvent<"miner-container-state"> &
  (
    | {
        status: "OK";
        container: ContainerInfo;
      }
    | { status: "ERROR"; cause: string }
  );

export type PollerEvent =
  | MinerCreated
  | MinerCreationFailed
  | MinerStarted
  | MinerStopped
  | MinerContainerState;

export type MinerInstallationRequested =
  GenericEvent<"miner-installation-requested"> & {
    walletAddress: string;
  };

export type MinerInspectionRequested =
  GenericEvent<"miner-inspection-requested">;

export type RendererEvent =
  | MinerInstallationRequested
  | MinerInspectionRequested;

export type PollerMessagePortMain = Omit<
  MessagePortMain,
  "postMessage" | "on"
> & {
  postMessage(e: PollerEvent): void;
  on(type: "message", callback: (e: { data: RendererEvent }) => unknown);
};

type PollerMessagePortEvent = Parameters<
  Parameters<MessagePort["addEventListener"]>[1]
>[0] & {
  data: PollerEvent;
};

export type PollerMessagePort = Omit<
  MessagePort,
  "onmessage" | "postMessage"
> & {
  onmessage: (e: { data: PollerEvent }) => void;
  postMessage(e: RendererEvent);
  addEventListener(
    type: "message",
    listener: (e: PollerMessagePortEvent) => void
  );
};
