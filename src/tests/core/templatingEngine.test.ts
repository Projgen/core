import { beforeEach, describe, expect, test, vi } from "vitest";

const { runStepMock, writeStepMock, patchTextStepMock, patchJsonStepMock } =
  vi.hoisted(() => ({
    runStepMock: vi.fn(),
    writeStepMock: vi.fn(),
    patchTextStepMock: vi.fn(),
    patchJsonStepMock: vi.fn(),
  }));

vi.mock("../../core/steps/steps.ts", () => ({
  default: {
    runStep: runStepMock,
    writeStep: writeStepMock,
    patchTextStep: patchTextStepMock,
    patchJsonStep: patchJsonStepMock,
  },
}));

import { scaffoldFromTemplate } from "../../template-engine/templatingEngine.ts";
import type { Template } from "../../template-engine/schemas/template.ts";

describe("scaffoldFromTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("stops on a failed step when continueOnError is false", async () => {
    runStepMock.mockRejectedValueOnce(new Error("step failed"));

    const template: Template = {
      id: "template",
      name: "Template",
      description: "Template description",
      version: "1.0.0",
      engineVersion: "2.0",
      author: "Author",
      variables: [],
      steps: [
        {
          type: "run",
          command: "echo first",
          continueOnError: false,
        },
        {
          type: "run",
          command: "echo second",
          continueOnError: false,
        },
      ],
    };

    await expect(scaffoldFromTemplate(template, true)).rejects.toThrow(
      "step failed",
    );

    expect(runStepMock).toHaveBeenCalledTimes(1);
  });

  test("continues after a failed step when continueOnError is true", async () => {
    runStepMock
      .mockRejectedValueOnce(new Error("step failed"))
      .mockResolvedValueOnce(undefined);

    const template: Template = {
      id: "template",
      name: "Template",
      description: "Template description",
      version: "1.0.0",
      engineVersion: "2.0",
      author: "Author",
      variables: [],
      steps: [
        {
          type: "run",
          command: "echo first",
          continueOnError: true,
        },
        {
          type: "run",
          command: "echo second",
          continueOnError: false,
        },
      ],
    };

    await expect(scaffoldFromTemplate(template, true)).resolves.toBeUndefined();

    expect(runStepMock).toHaveBeenCalledTimes(2);
  });
});
