import { beforeEach, describe, expect, it, vi } from "vitest";

import { TEMPLATE_ENGINE_VERSION } from "@/template-engine/domain/constants/template-engine-version";
import { executeTemplate } from "./execute-template.use-case";
import type { ExecuteTemplateInput } from "./execute-template.input";
import { assertTemplateEngineCompatibility } from "./assertVersionCompatability";
import { promptForVariables } from "./prompt-for-variables";
import { executeRunStep } from "./steps/execute-run-step";
import { executeWriteStep } from "./steps/execute-write-step";
import { executePatchTextStep } from "./steps/execute-patch-text-step";
import { executePatchJsonStep } from "./steps/execute-patch-json-step";
import { evaluateStepCondition } from "./evaluate-step-condition";

vi.mock("./assertVersionCompatability", () => ({
  assertTemplateEngineCompatibility: vi.fn(),
}));
vi.mock("./prompt-for-variables", () => ({
  promptForVariables: vi.fn(),
}));
vi.mock("./steps/execute-run-step", () => ({
  executeRunStep: vi.fn(),
}));
vi.mock("./steps/execute-write-step", () => ({
  executeWriteStep: vi.fn(),
}));
vi.mock("./steps/execute-patch-text-step", () => ({
  executePatchTextStep: vi.fn(),
}));
vi.mock("./steps/execute-patch-json-step", () => ({
  executePatchJsonStep: vi.fn(),
}));
vi.mock("./evaluate-step-condition", () => ({
  evaluateStepCondition: vi.fn(),
}));

const assertTemplateEngineCompatibilityMock = vi.mocked(
  assertTemplateEngineCompatibility,
);
const promptForVariablesMock = vi.mocked(promptForVariables);
const executeRunStepMock = vi.mocked(executeRunStep);
const executeWriteStepMock = vi.mocked(executeWriteStep);
const executePatchTextStepMock = vi.mocked(executePatchTextStep);
const executePatchJsonStepMock = vi.mocked(executePatchJsonStep);
const evaluateStepConditionMock = vi.mocked(evaluateStepCondition);

const createInput = (overrides: Partial<ExecuteTemplateInput> = {}) => {
  const baseTemplate: ExecuteTemplateInput["template"] = {
    id: "sample",
    name: "Sample",
    description: "Sample template",
    version: "1.0.0",
    engineVersion: TEMPLATE_ENGINE_VERSION,
    author: "Projgen",
    variables: [
      { type: "string", name: "name", message: "Name", required: true },
    ],
    steps: [],
  };

  return {
    template: baseTemplate,
    prompter: {
      string: vi.fn(),
      number: vi.fn(),
      boolean: vi.fn(),
      select: vi.fn(),
      multiSelect: vi.fn(),
    },
    runCommand: vi.fn(),
    fetchText: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    ...overrides,
  } satisfies ExecuteTemplateInput;
};

describe("executeTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checks version compatibility and resolves variables before executing steps", async () => {
    const input = createInput({
      template: {
        ...createInput().template,
        steps: [{ type: "run", command: "npm", args: ["test"], cwd: "." }],
      },
    });

    promptForVariablesMock.mockResolvedValue([
      { name: "name", content: "Jane" },
    ]);

    await executeTemplate(input);

    expect(assertTemplateEngineCompatibilityMock).toHaveBeenCalledWith(
      TEMPLATE_ENGINE_VERSION,
      TEMPLATE_ENGINE_VERSION,
    );
    expect(promptForVariablesMock).toHaveBeenCalledWith(
      input.template.variables,
      input.prompter,
      false,
      {},
    );
    expect(executeRunStepMock).toHaveBeenCalledWith(
      input.template.steps[0],
      [{ name: "name", content: "Jane" }],
      input.runCommand,
    );
    expect(executeWriteStepMock).not.toHaveBeenCalled();
    expect(executePatchTextStepMock).not.toHaveBeenCalled();
    expect(executePatchJsonStepMock).not.toHaveBeenCalled();
  });

  it("skips conditional steps that do not match", async () => {
    const conditionalStep = {
      type: "run",
      command: "echo",
      when: [{ variable: "enabled", operator: "eq", value: true }],
    } as const;

    const input = createInput({
      template: {
        ...createInput().template,
        steps: [conditionalStep],
      },
    });

    promptForVariablesMock.mockResolvedValue([
      { name: "enabled", content: false },
    ]);
    evaluateStepConditionMock.mockReturnValue(false);

    await executeTemplate(input);

    expect(evaluateStepConditionMock).toHaveBeenCalledWith(
      conditionalStep.when[0],
      [{ name: "enabled", content: false }],
    );
    expect(executeRunStepMock).not.toHaveBeenCalled();
  });

  it("dispatches each supported step type", async () => {
    const steps = [
      { type: "run", command: "npm", args: ["run", "build"] },
      { type: "write", path: "README.md", content: "hello" },
      {
        type: "patch-text",
        path: "README.md",
        operation: "append",
        content: " world",
      },
      {
        type: "patch-json",
        path: "package.json",
        operation: "set",
        jsonPath: ["name"],
        value: "sample",
      },
    ] as const;

    const input = createInput({
      template: {
        ...createInput().template,
        steps: [...steps],
      },
    });

    promptForVariablesMock.mockResolvedValue([]);

    await executeTemplate(input);

    expect(executeRunStepMock).toHaveBeenCalledWith(
      steps[0],
      [],
      input.runCommand,
    );
    expect(executeWriteStepMock).toHaveBeenCalledWith(
      steps[1],
      [],
      input.fetchText,
      input.writeFile,
    );
    expect(executePatchTextStepMock).toHaveBeenCalledWith(
      steps[2],
      [],
      input.fetchText,
      input.readFile,
      input.writeFile,
    );
    expect(executePatchJsonStepMock).toHaveBeenCalledWith(
      steps[3],
      [],
      input.readFile,
      input.writeFile,
    );
  });

  it("continues after a failing step when continueOnError is enabled", async () => {
    const failingStep = {
      type: "run",
      command: "fail",
      continueOnError: true,
    } as const;
    const nextStep = {
      type: "write",
      path: "README.md",
      content: "ok",
    } as const;

    const input = createInput({
      template: {
        ...createInput().template,
        steps: [failingStep, nextStep],
      },
    });

    promptForVariablesMock.mockResolvedValue([]);
    executeRunStepMock.mockRejectedValueOnce(new Error("boom"));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await executeTemplate(input);

    expect(executeRunStepMock).toHaveBeenCalledTimes(1);
    expect(executeWriteStepMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Step "run" failed, continuing because continueOnError is enabled.',
    );

    consoleErrorSpy.mockRestore();
  });

  it("warns on unsupported step types", async () => {
    const input = createInput({
      template: {
        ...createInput().template,
        steps: [{ type: "unknown", continueOnError: false } as never],
      },
    });

    promptForVariablesMock.mockResolvedValue([]);
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    await executeTemplate(input);

    expect(consoleWarnSpy).toHaveBeenCalledWith("Unknown step type");
    expect(executeRunStepMock).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it("propagates failures from non-recoverable steps", async () => {
    const input = createInput({
      template: {
        ...createInput().template,
        steps: [
          { type: "run", command: "fail" },
          { type: "write", path: "README.md", content: "ok" },
        ],
      },
    });

    promptForVariablesMock.mockResolvedValue([]);
    executeRunStepMock.mockRejectedValueOnce(new Error("boom"));

    await expect(executeTemplate(input)).rejects.toThrow("boom");
    expect(executeWriteStepMock).not.toHaveBeenCalled();
  });
});
