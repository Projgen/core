import { describe, expect, it, vi } from "vitest";

import { TemplateError } from "@/template-engine/domain";
import { executePatchJsonStep } from "./execute-patch-json-step";

describe("executePatchJsonStep", () => {
  it("sets a nested value and writes formatted json", async () => {
    const readFile = vi
      .fn()
      .mockResolvedValue(
        JSON.stringify({ compilerOptions: { paths: { "@/*": ["old/*"] } } }),
      );
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchJsonStep(
      {
        type: "patch-json",
        path: "tsconfig.json",
        operation: "set",
        jsonPath: ["compilerOptions", "paths", "@/*"],
        value: ["src/*"],
      },
      [],
      readFile,
      writeFile,
    );

    expect(readFile).toHaveBeenCalledWith("tsconfig.json");
    expect(writeFile).toHaveBeenCalledWith(
      "tsconfig.json",
      JSON.stringify(
        { compilerOptions: { paths: { "@/*": ["src/*"] } } },
        null,
        2,
      ),
    );
  });

  it("appends to an array at the json path", async () => {
    const readFile = vi
      .fn()
      .mockResolvedValue(
        JSON.stringify({ compilerOptions: { paths: { "@/*": ["src/*"] } } }),
      );
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchJsonStep(
      {
        type: "patch-json",
        path: "tsconfig.json",
        operation: "append",
        jsonPath: ["compilerOptions", "paths", "@/*"],
        value: ["src/app/*"],
      },
      [],
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith(
      "tsconfig.json",
      JSON.stringify(
        { compilerOptions: { paths: { "@/*": ["src/*", "src/app/*"] } } },
        null,
        2,
      ),
    );
  });

  it("removes a property at the json path", async () => {
    const readFile = vi
      .fn()
      .mockResolvedValue(
        JSON.stringify({
          compilerOptions: {
            paths: { "@/*": ["src/*"], "@app/*": ["src/app/*"] },
          },
        }),
      );
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchJsonStep(
      {
        type: "patch-json",
        path: "tsconfig.json",
        operation: "remove",
        jsonPath: ["compilerOptions", "paths", "@app/*"],
      },
      [],
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith(
      "tsconfig.json",
      JSON.stringify(
        { compilerOptions: { paths: { "@/*": ["src/*"] } } },
        null,
        2,
      ),
    );
  });

  it("throws when append targets incompatible types", async () => {
    const readFile = vi.fn().mockResolvedValue(JSON.stringify({ name: "old" }));
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await expect(
      executePatchJsonStep(
        {
          type: "patch-json",
          path: "package.json",
          operation: "append",
          jsonPath: ["name"],
          value: "new",
        },
        [],
        readFile,
        writeFile,
      ),
    ).rejects.toThrow(TemplateError);
  });
});
