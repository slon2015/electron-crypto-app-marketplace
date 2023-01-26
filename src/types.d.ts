export type FetchedMinerState =
  | {
      id: string;
      state: "running" | "paused";
    }
  | {
      state: "notExists";
    };

export type MinerServiceApi = {
  install(walletAddress: string): Promise<string>;
  inspectMiner(): Promise<FetchedMinerState>;
  onMinerStart(callback: () => void): void;
  onMinerStop(callback: () => void): void;
};

declare global {
  interface Window {
    minerService: MinerServiceApi;
  }
}
