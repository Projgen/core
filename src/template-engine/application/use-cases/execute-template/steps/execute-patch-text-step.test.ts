import { describe, expect, it, vi } from "vitest";

import { TemplateError } from "@/template-engine/domain";
import { executePatchTextStep } from "./execute-patch-text-step";

describe("executePatchTextStep", () => {
  it("replaces text in the target file", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("hello world");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "replace",
        find: "world",
        content: "Projgen",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(readFile).toHaveBeenCalledWith("README.md");
    expect(writeFile).toHaveBeenCalledWith("README.md", "hello Projgen");
  });

  it("throws when replace-style operations are missing find", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn();
    const writeFile = vi.fn();

    await expect(
      executePatchTextStep(
        {
          type: "patch-text",
          path: "README.md",
          operation: "insert-after",
          content: "!",
        },
        [],
        fetchText,
        readFile,
        writeFile,
      ),
    ).rejects.toThrow(TemplateError);
  });

  it("inserts content after the matched text", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("hello world How are you?");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "insert-after",
        find: "world",
        content: "!",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith(
      "README.md",
      "hello world! How are you?",
    );
  });

  it("inserts content before the matched text", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("hello world");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "insert-before",
        find: "world",
        content: "beautiful ",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith(
      "README.md",
      "hello beautiful world",
    );
  });

  it("appends content when requested", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("body");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "append",
        content: "\nfooter",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith("README.md", "body\nfooter");
  });

  it("prepends inline content when requested", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("body");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "prepend",
        content: "header\n",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith("README.md", "header\nbody");
  });
});
