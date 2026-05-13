import { ProjgenError } from "@/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { removeTemplateFromRegistry } from "./remove-template.use-case";
import type { GetRegistryPort } from "../../ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../ports/resolve-template-location.port";
import type { DeleteFilePort } from "../../ports/delete-file.port";
import type { SaveRegistryPort } from "../../ports/save-registry.port";
import type { Registry } from "../../../domain/schemas/registry.schema";

describe("removeTemplateFromRegistry", () => {
  const makeRegistry = (): Registry => ({
    version: 1,
    templates: [
      { alias: "to-remove", path: "templates/to-remove.json" },
      { alias: "other", path: "templates/other.json" },
    ],
  });

  const getRegistry = vi.fn<GetRegistryPort>();
  const saveRegistry = vi.fn<SaveRegistryPort>();
  const resolveTemplateLocation = vi.fn<ResolveTemplateLocationPort>();
  const deleteFile = vi.fn<DeleteFilePort>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should remove template, save registry and delete template file", async () => {
    const registry = makeRegistry();

    getRegistry.mockResolvedValue(registry);
    saveRegistry.mockResolvedValue(undefined);
    resolveTemplateLocation.mockReturnValue("resolved/to-remove.json");
    deleteFile.mockResolvedValue(undefined);

    await removeTemplateFromRegistry({
      alias: "to-remove",
      deps: {
        getRegistry,
        saveRegistry,
        resolveTemplateLocation,
        deleteFile,
      },
    });

    expect(getRegistry).toHaveBeenCalledTimes(1);
    expect(saveRegistry).toHaveBeenCalledWith({
      version: 1,
      templates: [{ alias: "other", path: "templates/other.json" }],
    });
    expect(resolveTemplateLocation).toHaveBeenCalledWith(
      "templates/to-remove.json",
    );
    expect(deleteFile).toHaveBeenCalledWith("resolved/to-remove.json");
  });

  test("should throw if alias is not found in registry", async () => {
    getRegistry.mockResolvedValue(makeRegistry());

    await expect(
      removeTemplateFromRegistry({
        alias: "missing",
        deps: {
          getRegistry,
          saveRegistry,
          resolveTemplateLocation,
          deleteFile,
        },
      }),
    ).rejects.toThrow(ProjgenError);

    expect(saveRegistry).not.toHaveBeenCalled();
    expect(resolveTemplateLocation).not.toHaveBeenCalled();
    expect(deleteFile).not.toHaveBeenCalled();
  });

  test("should throw if removing entry from registry fails", async () => {
    const registry = makeRegistry();
    vi.spyOn(registry.templates, "splice").mockReturnValue([]);
    getRegistry.mockResolvedValue(registry);

    await expect(
      removeTemplateFromRegistry({
        alias: "to-remove",
        deps: {
          getRegistry,
          saveRegistry,
          resolveTemplateLocation,
          deleteFile,
        },
      }),
    ).rejects.toThrow(ProjgenError);

    expect(saveRegistry).not.toHaveBeenCalled();
    expect(resolveTemplateLocation).not.toHaveBeenCalled();
    expect(deleteFile).not.toHaveBeenCalled();
  });

  test("should throw if saveRegistry fails", async () => {
    getRegistry.mockResolvedValue(makeRegistry());
    saveRegistry.mockRejectedValue(new Error("Failed to save registry"));

    await expect(
      removeTemplateFromRegistry({
        alias: "to-remove",
        deps: {
          getRegistry,
          saveRegistry,
          resolveTemplateLocation,
          deleteFile,
        },
      }),
    ).rejects.toThrow(ProjgenError);

    expect(resolveTemplateLocation).not.toHaveBeenCalled();
    expect(deleteFile).not.toHaveBeenCalled();
  });

  test("should throw if deleteFile fails", async () => {
    getRegistry.mockResolvedValue(makeRegistry());
    saveRegistry.mockResolvedValue(undefined);
    resolveTemplateLocation.mockReturnValue("resolved/to-remove.json");
    deleteFile.mockRejectedValue(new Error("Failed to delete file"));

    await expect(
      removeTemplateFromRegistry({
        alias: "to-remove",
        deps: {
          getRegistry,
          saveRegistry,
          resolveTemplateLocation,
          deleteFile,
        },
      }),
    ).rejects.toThrow(ProjgenError);

    expect(saveRegistry).toHaveBeenCalledTimes(1);
    expect(resolveTemplateLocation).toHaveBeenCalledWith(
      "templates/to-remove.json",
    );
    expect(deleteFile).toHaveBeenCalledWith("resolved/to-remove.json");
  });
});
