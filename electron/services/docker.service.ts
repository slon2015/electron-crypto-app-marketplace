import Dockerode from "dockerode";
import "reflect-metadata";

export type DockerContainerSpec = {
  image: string;
  args?: Array<string>;
  name?: string;
};

export class DockerService {
  constructor(private readonly docker: Dockerode) {}

  async createContainer(spec: DockerContainerSpec): Promise<string> {
    const container = await this.docker.createContainer({
      Image: spec.image,
      Cmd: spec.args,
      name: spec.name,
    });

    return container.id;
  }

  async getContainerState(
    id: string
  ): Promise<"running" | "paused" | "notFound"> {
    try {
      const containerInfo = await this.docker.getContainer(id).inspect();
      if (
        containerInfo.State.Paused ||
        containerInfo.State.Status === "created" ||
        containerInfo.State.Status === "exited" ||
        containerInfo.State.OOMKilled ||
        containerInfo.State.Dead
      ) {
        return "paused";
      }
      if (containerInfo.State.Running || containerInfo.State.Restarting) {
        return "running";
      }
      throw new Error("Invalid container status");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "statusCode" in error &&
        error.statusCode === 404
      ) {
        return "notFound";
      }
      throw error;
    }
  }

  async startContainer(id: string): Promise<void> {
    await this.docker.getContainer(id).start();
  }

  async stopContainer(id: string): Promise<void> {
    await this.docker.getContainer(id).stop();
  }

  async removeContainer(id: string): Promise<void> {
    await this.docker.getContainer(id).remove({
      force: true,
    });
  }
}
