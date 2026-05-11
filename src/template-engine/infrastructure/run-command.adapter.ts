import { spawn } from "node:child_process";
import type { RunCommandPort } from "../application/ports/run-command.port";

export const runCommandAdapter: RunCommandPort = async (
  command: string,
  args: string[],
  cwd?: string,
) => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command "${command} ${args.join(" ")}" exited with code ${code}`,
        ),
      );
    });
  });
};
