import type { Registry } from "@/registry-engine/domain";
import type { Template } from "@/template-domain";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { addTemplateToRegistry } from "./add-template.use-case";
import type { GetRegistryPort } from "../ports";
import type { SaveTemplatePort } from "../ports/save-template.port";
import type { SaveRegistryPort } from "../ports/save-registry.port";
import { ProjgenError } from "@/shared";

describe("addTemplateToRegistry", () => {
  const template: Template = {
    id: "react-basic",
    name: "React Basic",
    description: "A basic React template",
    version: "1.0.0",
    author: "John Doe",
    engineVersion: "1.0.0",
    variables: [],
    steps: [],
  };

  const makeRegistry = (): Registry => ({
    version: 1,
    templates: [{ alias: "some-template", path: "some-template.json" }],
  });

  const getRegistry = vi.fn<GetRegistryPort>();
  const saveTemplate = vi.fn<SaveTemplatePort>();
  const saveRegistry = vi.fn<SaveRegistryPort>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should add template and write updated registry", async () => {
    const registry = makeRegistry();

    getRegistry.mockResolvedValue(registry);
    saveTemplate.mockResolvedValue(undefined);
    saveRegistry.mockResolvedValue(undefined);

    const expectedRegistry = {
      ...registry,
      templates: [
        ...registry.templates,
        { alias: template.id, path: `${template.id}.json` },
      ],
    };

    await addTemplateToRegistry({
      template,
      getRegistry,
      saveTemplate,
      saveRegistry,
    });

    expect(getRegistry).toHaveBeenCalledTimes(1);
    expect(saveTemplate).toHaveBeenCalledWith(template);
    expect(saveRegistry).toHaveBeenCalledWith(expectedRegistry);
  });

  test("should throw error if alias already exists", async () => {
    getRegistry.mockResolvedValue({
      version: 1,
      templates: [{ alias: "react-basic", path: "react-basic.json" }],
    });
    saveTemplate.mockResolvedValue(undefined);
    saveRegistry.mockResolvedValue(undefined);

    await expect(
      addTemplateToRegistry({
        template,
        getRegistry,
        saveTemplate,
        saveRegistry,
      }),
    ).rejects.toThrow(ProjgenError);

    expect(saveTemplate).not.toHaveBeenCalled();
    expect(saveRegistry).not.toHaveBeenCalled();
  });

  test("should throw error if saveTemplate fails", async () => {
    getRegistry.mockResolvedValue(makeRegistry());
    saveTemplate.mockRejectedValue(new Error("Failed to save template"));

    await expect(
      addTemplateToRegistry({
        template,
        getRegistry,
        saveTemplate,
        saveRegistry,
      }),
    ).rejects.toThrow(ProjgenError);

    expect(saveRegistry).not.toHaveBeenCalled();
  });

  test("should throw error if saveRegistry fails", async () => {
    getRegistry.mockResolvedValue(makeRegistry());
    saveTemplate.mockResolvedValue(undefined);
    saveRegistry.mockRejectedValue(new Error("Failed to save registry"));

    await expect(
      addTemplateToRegistry({
        template,
        getRegistry,
        saveTemplate,
        saveRegistry,
      }),
    ).rejects.toThrow(ProjgenError);

    expect(saveTemplate).toHaveBeenCalledTimes(1);
    expect(saveRegistry).toHaveBeenCalledTimes(1);
  });
});
