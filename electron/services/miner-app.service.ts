import { AppRegestryService } from "./apps-regestry.service";
import { DockerService } from "./docker.service";

const minerAppType = "miner:xmrig";

export class MinerAppService {
  constructor(
    private readonly regestry: AppRegestryService,
    private readonly docker: DockerService
  ) {}

  async installApp(walletAddress: string): Promise<string> {
    if (this.regestry.getAppsCount(minerAppType) > 0) {
      throw new Error(`Miner app already installed`);
    }

    const appContainerId = await this.docker.createContainer({
      image: "xmrig/miner",
      args: ["-o", "xmrpool.eu:5555", "-u", walletAddress, "-p", "x"],
      name: "defi-os-miner",
    });

    try {
      this.regestry.addToRegestry(minerAppType, appContainerId);
      return appContainerId;
    } catch (error: unknown) {
      await this.docker.removeContainer(appContainerId);
      throw error;
    }
  }

  isInstalled(): boolean {
    const apps = this.regestry.getAllApps(minerAppType);

    return apps.length > 0;
  }

  getContainerId(): string {
    const apps = this.regestry.getAllApps(minerAppType);

    if (apps.length > 0) {
      return apps[0].containerId;
    } else {
      throw new Error("Miner container not installed");
    }
  }
}
