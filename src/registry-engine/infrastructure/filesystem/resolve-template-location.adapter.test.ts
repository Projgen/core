import path from "node:path";

import { describe, expect, test } from "vitest";
import { getRegistryPath } from "../get-registry/get-registry-file-path";
import { resolveTemplateLocationAdapter } from "./resolve-template-location.adapter";

describe("ResolveTemplateLocationAdapter", () => {
  describe("when registryUrl is provided", () => {
    test("resolves a simple url", () => {
      const registryUrl = "https://example.com/registry/";
      const relativePath = "templates/myTemplate.json";
      const expectedUrl =
        "https://example.com/registry/templates/myTemplate.json";

      const result = resolveTemplateLocationAdapter(relativePath, registryUrl);
      expect(result).toBe(expectedUrl);
    });

    test("resolves a url without trailing slash", () => {
      const registryUrl = "https://example.com/registry";
      const relativePath = "templates/myTemplate.json";
      const expectedUrl = "https://example.com/templates/myTemplate.json";

      const result = resolveTemplateLocationAdapter(relativePath, registryUrl);
      expect(result).toBe(expectedUrl);
    });

    test("resolves a relative paths to url", () => {
      const registryUrl = "https://example.com/registry/";
      const relativePath = "../templates/myTemplate.json";
      const expectedUrl = "https://example.com/templates/myTemplate.json";

      const result = resolveTemplateLocationAdapter(relativePath, registryUrl);
      expect(result).toBe(expectedUrl);
    });

    test("resolves if registryUrl is a file", () => {
      const registryUrl = "https://example.com/registry/file.json";
      const relativePath = "templates/myTemplate.json";
      const expectedUrl =
        "https://example.com/registry/templates/myTemplate.json";

      const result = resolveTemplateLocationAdapter(relativePath, registryUrl);
      expect(result).toBe(expectedUrl);
    });
  });

  describe("when registryUrl is not provided", () => {
    test("resolves file path", () => {
      const relativePath = "templates/myTemplate.json";
      const result = resolveTemplateLocationAdapter(relativePath);
      const expected = path.resolve(
        path.dirname(getRegistryPath()),
        relativePath,
      );

      expect(result).toBe(expected);
    });

    test("resolves file path with relative path", () => {
      const relativePath = "../templates/myTemplate.json";
      const result = resolveTemplateLocationAdapter(relativePath);
      const expected = path.resolve(
        path.dirname(getRegistryPath()),
        relativePath,
      );

      expect(result).not.toContain("registry");
      expect(result).toBe(expected);
    });
  });
});
