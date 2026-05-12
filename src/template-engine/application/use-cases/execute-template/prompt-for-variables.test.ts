import { describe, expect, it, vi } from "vitest";

import { promptForVariables } from "./prompt-for-variables";

describe("promptForVariables", () => {
  it("uses provided variable arguments before prompting", async () => {
    const prompter = {
      string: vi.fn(),
      number: vi.fn(),
      boolean: vi.fn(),
      select: vi.fn(),
      multiSelect: vi.fn(),
    };

    const result = await promptForVariables(
      [{ type: "string", name: "name", message: "Name", required: true }],
      prompter,
      false,
      { name: "Jane" },
    );

    expect(result).toEqual([{ name: "name", content: "Jane" }]);
    expect(prompter.string).not.toHaveBeenCalled();
  });

  it("coerces provided string variable arguments to strings", async () => {
    const prompter = {
      string: vi.fn(),
      number: vi.fn(),
      boolean: vi.fn(),
      select: vi.fn(),
      multiSelect: vi.fn(),
    };

    const result = await promptForVariables(
      [{ type: "string", name: "name", message: "Name", required: true }],
      prompter,
      false,
      { name: 123 },
    );

    expect(result).toEqual([{ name: "name", content: "123" }]);
    expect(prompter.string).not.toHaveBeenCalled();
  });

  it("resolves default values when prompts are skipped", async () => {
    const prompter = {
      string: vi.fn().mockResolvedValue("some input"),
      number: vi.fn(),
      boolean: vi.fn(),
      select: vi.fn(),
      multiSelect: vi.fn(),
    };

    const result = await promptForVariables(
      [
        {
          type: "string",
          name: "name",
          message: "Name",
          required: true,
          default: "Projgen",
        },
        {
          type: "string",
          name: "optional",
          message: "Optional",
          required: false,
        },
        {
          type: "string",
          name: "prompted",
          message: "Prompted",
          required: true,
        },
      ],
      prompter,
      true,
    );

    expect(result).toEqual([
      { name: "name", content: "Projgen" },
      { name: "optional", content: null },
      { name: "prompted", content: "some input" },
    ]);
    expect(prompter.string).toHaveBeenCalledWith("Prompted", true, undefined);
    expect(prompter.string).toHaveBeenCalledTimes(1);
  });

  it("prompts when no argument or skip fallback exists", async () => {
    const prompter = {
      string: vi.fn().mockResolvedValue("answer"),
      number: vi.fn(),
      boolean: vi.fn(),
      select: vi.fn(),
      multiSelect: vi.fn(),
    };

    const result = await promptForVariables(
      [{ type: "string", name: "name", message: "Name", required: true }],
      prompter,
      false,
    );

    expect(prompter.string).toHaveBeenCalledWith("Name", true, undefined);
    expect(result).toEqual([{ name: "name", content: "answer" }]);
  });
});
