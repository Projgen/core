import spawn from "cross-spawn";
import type { RunCommandPort } from "../domain/ports/run-command.port";

export const runCommandAdapter: RunCommandPort = async (
  command: string,
  args: string[],
  cwd?: string,
  verbosity?: "all" | "warning" | "none",
) => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: verbosity === "none" ? "ignore" : "pipe",
    });

    if (verbosity !== "none") {
      if (verbosity === "all" && child.stdout) {
        child.stdout.on("data", (chunk) => {
          process.stdout.write(chunk);
        });
      }

      if ((verbosity === "all" || verbosity === "warning") && child.stderr) {
        child.stderr.on("data", (chunk) => {
          process.stderr.write(chunk);
        });
      }
    }

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
