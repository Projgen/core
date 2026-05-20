import { describe, expect, it, vi } from "vitest";

import { executeRunStep } from "./execute-run-step";

describe("executeRunStep", () => {
  it("interpolates command, args, and cwd before invoking the port", async () => {
    const runCommand = vi.fn().mockResolvedValue(undefined);

    await executeRunStep(
      {
        type: "run",
        command: "{{packageManager}}",
        args: ["run", "{{script}}"],
        cwd: "{{root}}",
      },
      [
        { name: "packageManager", content: "npm" },
        { name: "script", content: "build" },
        { name: "root", content: "." },
      ],
      runCommand,
    );

    expect(runCommand).toHaveBeenCalledWith(
      "npm",
      ["run", "build"],
      ".",
      "all",
    );
  });

  it("uses an empty args array when none are provided", async () => {
    const runCommand = vi.fn().mockResolvedValue(undefined);

    await executeRunStep({ type: "run", command: "echo" }, [], runCommand);

    expect(runCommand).toHaveBeenCalledWith("echo", [], undefined, "all");
  });

  it("throws an error for invalid verbosity levels", async () => {
    const runCommand = vi.fn().mockResolvedValue(undefined);

    await expect(
      executeRunStep(
        {
          type: "run",
          command: "echo",
          verbosity: "{{verbosity}}",
        },
        [{ name: "verbosity", content: "invalid" }],
        runCommand,
      ),
    ).rejects.toThrow(
      'Invalid verbosity level "invalid" in step "undefined". Valid options are "all", "warning", or "none".',
    );
  });
});
