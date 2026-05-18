import { describe, expect, test } from "vitest";
import { getTemplateSource } from "./get-template-source.use-case";

describe("getTemplateSource", () => {
  test("returns remote-url for http(s) urls", async () => {
    const result = await getTemplateSource({
      source: " https://example.com/t.json ",
      deps: {
        getTemplateSourceFromRegistry: async () => null,
      },
    });

    expect(result).toEqual({
      kind: "remote-url",
      source: "https://example.com/t.json",
    });
  });

  test("returns path when source looks like a path", async () => {
    const result = await getTemplateSource({
      source: " templates/my.json ",
      deps: {
        getTemplateSourceFromRegistry: async () => null,
      },
    });

    expect(result).toEqual({ kind: "path", source: "templates/my.json" });
  });

  test("returns path when source is just a json file name", async () => {
    const result = await getTemplateSource({
      source: "mytemplate.json",
      deps: {
        getTemplateSourceFromRegistry: async () => null,
      },
    });

    expect(result).toEqual({ kind: "path", source: "mytemplate.json" });
  });

  test("returns path for file urls", async () => {
    const result = await getTemplateSource({
      source: "file:///C:/templates/my.json",
      deps: {
        getTemplateSourceFromRegistry: async () => null,
      },
    });

    expect(result).toEqual({ kind: "path", source: "C:\\templates\\my.json" });
  });

  test("returns path when registry returns a path", async () => {
    const result = await getTemplateSource({
      source: "my-alias",
      deps: {
        getTemplateSourceFromRegistry: async () => "/registry/mytemplate",
      },
    });

    expect(result).toEqual({ kind: "path", source: "/registry/mytemplate" });
  });

  test("returns not-found when alias is not in registry", async () => {
    const result = await getTemplateSource({
      source: "unknown-alias",
      deps: {
        getTemplateSourceFromRegistry: async () => null,
      },
    });

    expect(result).toEqual({ kind: "not-found", source: null });
  });

  test("returns remote-url when registry returns a remote url", async () => {
    const result = await getTemplateSource({
      source: "alias-from-registry",
      deps: {
        getTemplateSourceFromRegistry: async () =>
          "https://example.com/from-registry.json",
      },
    });

    expect(result).toEqual({
      kind: "remote-url",
      source: "https://example.com/from-registry.json",
    });
  });

  test("returns path when registry returns a file url", async () => {
    const result = await getTemplateSource({
      source: "alias-file-url",
      deps: {
        getTemplateSourceFromRegistry: async () => "file:///C:/templates/from-registry.json",
      },
    });

    expect(result).toEqual({
      kind: "path",
      source: "file:///C:/templates/from-registry.json",
    });
  });

  test("returns not-found when registry returns a non-path, non-url value", async () => {
    const result = await getTemplateSource({
      source: "alias-weird",
      deps: {
        getTemplateSourceFromRegistry: async () => "someAlias",
      },
    });

    expect(result).toEqual({ kind: "not-found", source: null });
  });
});
