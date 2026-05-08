import { describe, expect, test } from "vitest";
import { ResolveTemplateLocationAdapter } from "./resolve-template-location.adapter";

describe("ResolveTemplateLocationAdapter", () => {
  test("resolves correctly from simple url", () => {
    const registryUrl = "https://example.com/registry/";
    const relativePath = "templates/myTemplate.json";
    const expectedUrl =
      "https://example.com/registry/templates/myTemplate.json";

    const result = ResolveTemplateLocationAdapter(relativePath, registryUrl);
    expect(result).toBe(expectedUrl);
  });

  test("resolves correctly from url without trailing slash", () => {
    const registryUrl = "https://example.com/registry";
    const relativePath = "templates/myTemplate.json";
    const expectedUrl = "https://example.com/templates/myTemplate.json";

    const result = ResolveTemplateLocationAdapter(relativePath, registryUrl);
    expect(result).toBe(expectedUrl);
  });

  test("resolves correctly with relative paths to url", () => {
    const registryUrl = "https://example.com/registry/";
    const relativePath = "../templates/myTemplate.json";
    const expectedUrl = "https://example.com/templates/myTemplate.json";

    const result = ResolveTemplateLocationAdapter(relativePath, registryUrl);
    expect(result).toBe(expectedUrl);
  });

  test("resolves correctly if registryUrl is a file", () => {
    const registryUrl = "https://example.com/registry/file.json";
    const relativePath = "templates/myTemplate.json";
    const expectedUrl =
      "https://example.com/registry/templates/myTemplate.json";

    const result = ResolveTemplateLocationAdapter(relativePath, registryUrl);
    expect(result).toBe(expectedUrl);
  });

  test("resolves file path correctly when registryUrl is not provided", () => {
    const relativePath = "templates/myTemplate.json";
    const result = ResolveTemplateLocationAdapter(relativePath);
    expect(result).toContain("registry");
    expect(result).toContain("templates\\myTemplate.json");
  });

  test("resolves file path correctly with relative paths when registryUrl is not provided", () => {
    const relativePath = "../templates/myTemplate.json";
    const result = ResolveTemplateLocationAdapter(relativePath);
    expect(result).not.toContain("registry");
    expect(result).toContain("templates\\myTemplate.json");
  });
});
