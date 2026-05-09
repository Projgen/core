import { describe, it, expect } from "vitest";

import { getTemplate } from "./get-template.use-case";
import { ProjgenError } from "@/shared";

const validTemplate = {
  id: "t1",
  name: "T1",
  description: "desc",
  version: "1.0.0",
  engineVersion: "1.0.0",
  author: "me",
  variables: [{ name: "v1", message: "msg", type: "string", required: true }],
  steps: [{ type: "write", path: "README.md", content: "hello" }],
};

describe("getTemplate", () => {
  it("loads and parses template from remote-url", async () => {
    const res = await getTemplate({
      templateSource: { kind: "remote-url", value: "https://x" },
      loadExternalTemplate: async () => validTemplate,
      loadInternalTemplate: async () => null,
    });

    expect(res).toEqual({ template: validTemplate });
  });

  it("loads and parses template from path", async () => {
    const res = await getTemplate({
      templateSource: { kind: "path", value: "./t.json" },
      loadExternalTemplate: async () => null,
      loadInternalTemplate: async () => validTemplate,
    });

    expect(res).toEqual({ template: validTemplate });
  });

  it("returns null when loader returns falsy", async () => {
    const res = await getTemplate({
      templateSource: { kind: "path", value: "./t.json" },
      loadExternalTemplate: async () => null,
      loadInternalTemplate: async () => null,
    });

    expect(res).toEqual({ template: null });
  });

  it("throws ProjgenError when template invalid", async () => {
    await expect(
      getTemplate({
        templateSource: { kind: "path", value: "./t.json" },
        loadExternalTemplate: async () => null,
        loadInternalTemplate: async () => ({ bad: "object" }),
      }),
    ).rejects.toBeInstanceOf(ProjgenError);
  });
});
