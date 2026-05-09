import { getTemplateFromRegistry } from "./get-template-from-registry.use-case";

import { describe, expect, test } from "vitest";
import type { GetRegistryPort, ResolveTemplateLocationPort } from "../ports";
import type { Registry } from "@/registry-domain";

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

describe("GetTemplateFromRegistryUseCase", () => {
  test("should fetch template from registry and return it", async () => {
    const result = await getTemplateFromRegistry({
      alias: "template1",
      getRegistry: mockGetRegistry,
      resolveTemplateLocation: mockResolveTemplateLocation,
    });
    expect(result).toBe("templates/template1.json");
  });

  test("should fetch template from linked registry if not found in base registry", async () => {
    const result = await getTemplateFromRegistry({
      alias: "template3",
      getRegistry: mockGetRegistry,
      resolveTemplateLocation: mockResolveTemplateLocation,
    });
    expect(result).toBe("templates/template3.json");
  });

  test("should return null if template is not found in any registry", async () => {
    const result = await getTemplateFromRegistry({
      alias: "nonexistent-template",
      getRegistry: mockGetRegistry,
      resolveTemplateLocation: mockResolveTemplateLocation,
    });
    expect(result).toBeNull();
  });
});
