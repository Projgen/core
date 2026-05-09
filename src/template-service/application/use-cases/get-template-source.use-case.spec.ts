import { describe, expect, test } from "vitest";
import { getTemplateSource } from "./get-template-source.use-case";

describe("getTemplateSource", () => {
  test("returns remote-url for http(s) urls", async () => {
    const result = await getTemplateSource({
      source: " https://example.com/t.json ",
      getTemplateSourceFromRegistry: async () => null,
    });

    expect(result).toEqual({
      kind: "remote-url",
      source: "https://example.com/t.json",
    });
  });

  test("returns path when source looks like a path", async () => {
    const result = await getTemplateSource({
      source: " templates/my.json ",
      getTemplateSourceFromRegistry: async () => null,
    });

    expect(result).toEqual({ kind: "path", source: "templates/my.json" });
  });

  test("returns path when source is just a json file name", async () => {
    const result = await getTemplateSource({
      source: "mytemplate.json",
      getTemplateSourceFromRegistry: async () => null,
    });

    expect(result).toEqual({ kind: "path", source: "mytemplate.json" });
  });

  test("returns path for file urls", async () => {
    const result = await getTemplateSource({
      source: "file:///C:/templates/my.json",
      getTemplateSourceFromRegistry: async () => null,
    });

    expect(result).toEqual({ kind: "path", source: "C:\\templates\\my.json" });
  });

  test("returns alias when registry returns a path", async () => {
    const result = await getTemplateSource({
      source: "my-alias",
      getTemplateSourceFromRegistry: async () => "/registry/mytemplate",
    });

    expect(result).toEqual({ kind: "alias", source: "/registry/mytemplate" });
  });

  test("returns not-found when alias is not in registry", async () => {
    const result = await getTemplateSource({
      source: "unknown-alias",
      getTemplateSourceFromRegistry: async () => null,
    });

    expect(result).toEqual({ kind: "not-found", source: null });
  });
});
