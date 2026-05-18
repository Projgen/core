import { describe, expect, it, vi } from "vitest";
import { ProjgenError } from "@/shared";

import { promptForVariables } from "./prompt-for-variables";

const createMockPrompter = () => ({
  string: vi.fn(),
  number: vi.fn(),
  boolean: vi.fn(),
  select: vi.fn(),
  multiSelect: vi.fn(),
});

describe("promptForVariables", () => {
  describe("String variables", () => {
    it("uses provided string variable arguments before prompting", async () => {
      const prompter = createMockPrompter();

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
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [{ type: "string", name: "name", message: "Name", required: true }],
        prompter,
        false,
        { name: 123 },
      );

      expect(result).toEqual([{ name: "name", content: "123" }]);
      expect(prompter.string).not.toHaveBeenCalled();
    });

    it("prompts for string when no argument provided", async () => {
      const prompter = createMockPrompter();
      prompter.string.mockResolvedValue("answer");

      const result = await promptForVariables(
        [{ type: "string", name: "name", message: "Name", required: true }],
        prompter,
        false,
      );

      expect(prompter.string).toHaveBeenCalledWith("Name", true, undefined);
      expect(result).toEqual([{ name: "name", content: "answer" }]);
    });

    it("uses default value when skipping prompts and no argument provided", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "string",
            name: "name",
            message: "Name",
            required: true,
            default: "Projgen",
          },
        ],
        prompter,
        true,
      );

      expect(result).toEqual([{ name: "name", content: "Projgen" }]);
      expect(prompter.string).not.toHaveBeenCalled();
    });
  });

  describe("Number variables", () => {
    it("parses valid number from variable arguments", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [{ type: "number", name: "count", message: "Count", required: true }],
        prompter,
        false,
        { count: "42" },
      );

      expect(result).toEqual([{ name: "count", content: 42 }]);
      expect(prompter.number).not.toHaveBeenCalled();
    });

    it("throws error for invalid number from variable arguments", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [{ type: "number", name: "count", message: "Count", required: true }],
          prompter,
          false,
          { count: "not a number" },
        ),
      ).rejects.toThrow(
        new ProjgenError('Invalid number provided for variable "count".'),
      );
    });

    it("prompts for number when no argument provided", async () => {
      const prompter = createMockPrompter();
      prompter.number.mockResolvedValue(99);

      const result = await promptForVariables(
        [{ type: "number", name: "count", message: "Count", required: false }],
        prompter,
        false,
      );

      expect(prompter.number).toHaveBeenCalledWith("Count", false, undefined);
      expect(result).toEqual([{ name: "count", content: 99 }]);
    });

    it("uses default value when skipping prompts for number", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "number",
            name: "count",
            message: "Count",
            required: true,
            default: 10,
          },
        ],
        prompter,
        true,
      );

      expect(result).toEqual([{ name: "count", content: 10 }]);
    });
  });

  describe("Boolean variables", () => {
    it("uses provided boolean directly", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "boolean",
            name: "enabled",
            message: "Enabled",
            default: false,
          },
        ],
        prompter,
        false,
        { enabled: true },
      );

      expect(result).toEqual([{ name: "enabled", content: true }]);
      expect(prompter.boolean).not.toHaveBeenCalled();
    });

    it("converts 'true' string to boolean", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "boolean",
            name: "enabled",
            message: "Enabled",
            default: false,
          },
        ],
        prompter,
        false,
        { enabled: "true" },
      );

      expect(result).toEqual([{ name: "enabled", content: true }]);
    });

    it("converts 'false' string to boolean", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "boolean",
            name: "enabled",
            message: "Enabled",
            default: true,
          },
        ],
        prompter,
        false,
        { enabled: "false" },
      );

      expect(result).toEqual([{ name: "enabled", content: false }]);
    });

    it("throws error for invalid boolean string", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [
            {
              type: "boolean",
              name: "enabled",
              message: "Enabled",
              default: false,
            },
          ],
          prompter,
          false,
          { enabled: "maybe" },
        ),
      ).rejects.toThrow(
        new ProjgenError(
          'Invalid boolean provided for variable "enabled". Use true or false.',
        ),
      );
    });

    it("prompts for boolean when no argument provided", async () => {
      const prompter = createMockPrompter();
      prompter.boolean.mockResolvedValue(true);

      const result = await promptForVariables(
        [
          {
            type: "boolean",
            name: "enabled",
            message: "Enable feature",
            default: false,
          },
        ],
        prompter,
        false,
      );

      expect(prompter.boolean).toHaveBeenCalledWith("Enable feature", false);
      expect(result).toEqual([{ name: "enabled", content: true }]);
    });
  });

  describe("Select variables with string options", () => {
    it("uses provided select value when it matches options", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "select",
            name: "framework",
            message: "Framework",
            options: ["react", "vue", "svelte"],
            required: true,
          },
        ],
        prompter,
        false,
        { framework: "react" },
      );

      expect(result).toEqual([{ name: "framework", content: "react" }]);
      expect(prompter.select).not.toHaveBeenCalled();
    });

    it("throws error when select value is not in string options", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [
            {
              type: "select",
              name: "framework",
              message: "Framework",
              options: ["react", "vue", "svelte"],
              required: true,
            },
          ],
          prompter,
          false,
          { framework: "angular" },
        ),
      ).rejects.toThrow(
        new ProjgenError(
          'Invalid option provided for variable "framework". Valid options are: react, vue, svelte.',
        ),
      );
    });

    it("prompts for select when no argument provided", async () => {
      const prompter = createMockPrompter();
      prompter.select.mockResolvedValue("vue");

      const result = await promptForVariables(
        [
          {
            type: "select",
            name: "framework",
            message: "Choose framework",
            options: ["react", "vue", "svelte"],
            required: true,
          },
        ],
        prompter,
        false,
      );

      expect(prompter.select).toHaveBeenCalledWith("Choose framework", [
        "react",
        "vue",
        "svelte",
      ]);
      expect(result).toEqual([{ name: "framework", content: "vue" }]);
    });
  });

  describe("Select variables with number options", () => {
    it("uses provided select value when it matches number options", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "select",
            name: "version",
            message: "Version",
            options: [1, 2, 3],
            required: true,
          },
        ],
        prompter,
        false,
        { version: 2 },
      );

      expect(result).toEqual([{ name: "version", content: 2 }]);
      expect(prompter.select).not.toHaveBeenCalled();
    });

    it("throws error when select value is not in number options", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [
            {
              type: "select",
              name: "version",
              message: "Version",
              options: [1, 2, 3],
              required: true,
            },
          ],
          prompter,
          false,
          { version: 5 },
        ),
      ).rejects.toThrow(
        new ProjgenError(
          'Invalid option provided for variable "version". Valid options are: 1, 2, 3.',
        ),
      );
    });

    it("prompts for select when no argument provided for number options", async () => {
      const prompter = createMockPrompter();
      prompter.select.mockResolvedValue(3);

      const result = await promptForVariables(
        [
          {
            type: "select",
            name: "version",
            message: "Select version",
            options: [1, 2, 3],
            required: true,
          },
        ],
        prompter,
        false,
      );

      expect(prompter.select).toHaveBeenCalledWith("Select version", [1, 2, 3]);
      expect(result).toEqual([{ name: "version", content: 3 }]);
    });
  });

  describe("Select variables - error cases", () => {
    it("throws error when provided value has wrong type for select", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [
            {
              type: "select",
              name: "framework",
              message: "Framework",
              options: ["react", "vue"],
              required: true,
            },
          ],
          prompter,
          false,
          { framework: true },
        ),
      ).rejects.toThrow(
        new ProjgenError(
          'Invalid type provided for variable "framework". Expected string or number.',
        ),
      );
    });

    it("throws error when provided value type does not match options type", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [
            {
              type: "select",
              name: "version",
              message: "Version",
              options: [1, 2, 3],
              required: true,
            },
          ],
          prompter,
          false,
          { version: "1" },
        ),
      ).rejects.toThrow(
        new ProjgenError(
          'Type of provided value for variable "version" does not match expected type. Expected number.',
        ),
      );
    });
  });

  describe("Multi-select variables", () => {
    it("prompts for multi-select when no argument provided", async () => {
      const prompter = createMockPrompter();
      prompter.multiSelect.mockResolvedValue(["option1", "option2"]);

      const result = await promptForVariables(
        [
          {
            type: "multi-select",
            name: "features",
            message: "Select features",
            options: ["option1", "option2", "option3"],
            required: true,
          },
        ],
        prompter,
        false,
      );

      expect(prompter.multiSelect).toHaveBeenCalledWith(
        "Select features",
        ["option1", "option2", "option3"],
        true,
      );
      expect(result).toEqual([
        { name: "features", content: ["option1", "option2"] },
      ]);
    });

    it("handles multi-select with required false", async () => {
      const prompter = createMockPrompter();
      prompter.multiSelect.mockResolvedValue([]);

      const result = await promptForVariables(
        [
          {
            type: "multi-select",
            name: "features",
            message: "Select features",
            options: ["option1", "option2"],
            required: false,
          },
        ],
        prompter,
        false,
      );

      expect(prompter.multiSelect).toHaveBeenCalledWith(
        "Select features",
        ["option1", "option2"],
        false,
      );
      expect(result).toEqual([{ name: "features", content: [] }]);
    });
  });

  describe("Skip prompts behavior", () => {
    it("uses default for optional variables when skipping prompts", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "string",
            name: "optional",
            message: "Optional",
            required: false,
          },
        ],
        prompter,
        true,
      );

      expect(result).toEqual([{ name: "optional", content: null }]);
      expect(prompter.string).not.toHaveBeenCalled();
    });

    it("resolves default values when prompts are skipped", async () => {
      const prompter = createMockPrompter();
      prompter.string.mockResolvedValue("some input");

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

    it("prompts when skipPrompts is true but variable has no default and is required", async () => {
      const prompter = createMockPrompter();
      prompter.string.mockResolvedValue("input");

      const result = await promptForVariables(
        [
          {
            type: "string",
            name: "required",
            message: "Required",
            required: true,
          },
        ],
        prompter,
        true,
      );

      expect(prompter.string).toHaveBeenCalled();
      expect(result).toEqual([{ name: "required", content: "input" }]);
    });
  });

  describe("Unknown variable type", () => {
    it("throws error for unknown variable type from arguments", async () => {
      const prompter = createMockPrompter();

      await expect(
        promptForVariables(
          [
            {
              type: "unknown" as never,
              name: "weird",
              message: "Weird",
            },
          ],
          prompter,
          false,
          { weird: "value" },
        ),
      ).rejects.toThrow("Unknown variable type for variable");
    });

    it("silently skips unknown variable type when prompting without arguments", async () => {
      const prompter = createMockPrompter();

      const result = await promptForVariables(
        [
          {
            type: "unknown" as never,
            name: "weird",
            message: "Weird",
          },
        ],
        prompter,
        false,
      );

      // Unknown type without arguments results in empty result since no case matches
      expect(result).toEqual([]);
    });
  });

  describe("Multiple variables", () => {
    it("handles mix of provided arguments and prompted values", async () => {
      const prompter = createMockPrompter();
      prompter.number.mockResolvedValue(42);
      prompter.boolean.mockResolvedValue(true);

      const result = await promptForVariables(
        [
          { type: "string", name: "name", message: "Name", required: true },
          { type: "number", name: "count", message: "Count", required: true },
          {
            type: "boolean",
            name: "enabled",
            message: "Enabled",
            default: false,
          },
        ],
        prompter,
        false,
        { name: "test" },
      );

      expect(result).toEqual([
        { name: "name", content: "test" },
        { name: "count", content: 42 },
        { name: "enabled", content: true },
      ]);
      expect(prompter.string).not.toHaveBeenCalled();
      expect(prompter.number).toHaveBeenCalled();
      expect(prompter.boolean).toHaveBeenCalled();
    });
  });
});
