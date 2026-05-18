import { getTemplateSourceFromRegistry } from "./get-template-source-from-registry.use-case";

import { describe, expect, test } from "vitest";
import type { GetRegistryPort } from "../../domain/ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../domain/ports/resolve-template-location.port";
import type { Registry } from "@/registry-engine";

const mockBaseRegistry: Registry = {
  version: 1,
  templates: [
    { alias: "template1", path: "templates/template1.json" },
    { alias: "template2", path: "templates/template2.json" },
  ],
  linkedRegistries: ["https://external-registry.com/registry.json"],
};

const mockExternalRegistry: Registry = {
  version: 1,
  templates: [
    { alias: "template3", path: "templates/template3.json" },
    { alias: "template4", path: "templates/template4.json" },
  ],
};

const mockGetRegistry: GetRegistryPort = async (url?: string) => {
  if (url === "https://external-registry.com/registry.json") {
    return mockExternalRegistry;
  }
  return mockBaseRegistry;
};

const mockResolveTemplateLocation: ResolveTemplateLocationPort = (
  path: string,
) => {
  return path;
};

describe("GetTemplateSourceFromRegistryUseCase", () => {
  test("should fetch template source from registry and return it", async () => {
    const result = await getTemplateSourceFromRegistry({
      alias: "template1",
      deps: {
        getRegistry: mockGetRegistry,
        resolveTemplateLocation: mockResolveTemplateLocation,
      },
    });
    expect(result.source).toBe("templates/template1.json");
  });

  test("should fetch template source from linked registry if not found in base registry", async () => {
    const result = await getTemplateSourceFromRegistry({
      alias: "template3",
      deps: {
        getRegistry: mockGetRegistry,
        resolveTemplateLocation: mockResolveTemplateLocation,
      },
    });
    expect(result.source).toBe("templates/template3.json");
  });

  test("should continue to next linked registry if previous linked registry doesn't contain template", async () => {
    const mockBaseRegistryWithTwoLinks: Registry = {
      version: 1,
      templates: [{ alias: "template1", path: "templates/template1.json" }],
      linkedRegistries: [
        "https://first.com/registry.json",
        "https://second.com/registry.json",
      ],
    };

    const firstExternal: Registry = {
      version: 1,
      templates: [{ alias: "other", path: "templates/other.json" }],
    };

    const secondExternal: Registry = {
      version: 1,
      templates: [{ alias: "template5", path: "templates/template5.json" }],
    };

    const mockGetRegistryChain: GetRegistryPort = async (url?: string) => {
      if (url === "https://first.com/registry.json") return firstExternal;
      if (url === "https://second.com/registry.json") return secondExternal;
      return mockBaseRegistryWithTwoLinks;
    };

    const result = await getTemplateSourceFromRegistry({
      alias: "template5",
      deps: {
        getRegistry: mockGetRegistryChain,
        resolveTemplateLocation: mockResolveTemplateLocation,
      },
    });
    expect(result.source).toBe("templates/template5.json");
  });

  test("should return null if template is not found in any registry", async () => {
    const result = await getTemplateSourceFromRegistry({
      alias: "nonexistent-template",
      deps: {
        getRegistry: mockGetRegistry,
        resolveTemplateLocation: mockResolveTemplateLocation,
      },
    });
    expect(result.source).toBeNull();
  });

  test("should return null if registry fetch fails for remote registry", async () => {
    const mockFailingGetRegistry: GetRegistryPort = async () => {
      throw new Error("Failed to fetch registry");
    };
    const result = await getTemplateSourceFromRegistry({
      alias: "template3",
      registryUrl: "https://external-registry.com/registry.json",
      deps: {
        getRegistry: mockFailingGetRegistry,
        resolveTemplateLocation: mockResolveTemplateLocation,
      },
    });
    expect(result.source).toBeNull();
  });

  test("should throw an error if registry fetch fails for local registry", async () => {
    const mockFailingGetRegistry: GetRegistryPort = async () => {
      throw new Error("Failed to fetch registry");
    };
    await expect(
      getTemplateSourceFromRegistry({
        alias: "template1",
        deps: {
          getRegistry: mockFailingGetRegistry,
          resolveTemplateLocation: mockResolveTemplateLocation,
        },
      }),
    ).rejects.toThrow("Failed to fetch registry");
  });
});
