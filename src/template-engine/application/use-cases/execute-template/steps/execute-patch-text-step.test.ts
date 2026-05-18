import { describe, expect, it, vi } from "vitest";

import { TemplateError } from "@/template-engine/domain";
import { executePatchTextStep } from "./execute-patch-text-step";

describe("executePatchTextStep", () => {
  it("loads replacement text from a URL when provided", async () => {
    const fetchText = vi.fn().mockResolvedValue("from url");
    const readFile = vi.fn().mockResolvedValue("hello world");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "replace",
        find: "world",
        url: "https://example.com/snippet.txt",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(fetchText).toHaveBeenCalledWith("https://example.com/snippet.txt");
    expect(writeFile).toHaveBeenCalledWith("README.md", "hello from url");
  });

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

  it("throws when replace is missing find", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn();
    const writeFile = vi.fn();

    await expect(
      executePatchTextStep(
        {
          type: "patch-text",
          path: "README.md",
          operation: "replace",
          content: "!",
        },
        [],
        fetchText,
        readFile,
        writeFile,
      ),
    ).rejects.toThrow(
      'The "find" property is required for the "replace" operation',
    );
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

  it("throws when insert-before is missing find", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn();
    const writeFile = vi.fn();

    await expect(
      executePatchTextStep(
        {
          type: "patch-text",
          path: "README.md",
          operation: "insert-before",
          content: "!",
        },
        [],
        fetchText,
        readFile,
        writeFile,
      ),
    ).rejects.toThrow(
      'The "find" property is required for the "insert-before" operation',
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

  it("treats empty inline content as an empty string", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("body");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executePatchTextStep(
      {
        type: "patch-text",
        path: "README.md",
        operation: "append",
        content: "",
      },
      [],
      fetchText,
      readFile,
      writeFile,
    );

    expect(writeFile).toHaveBeenCalledWith("README.md", "body");
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

  it("throws on invalid patch operation", async () => {
    const fetchText = vi.fn();
    const readFile = vi.fn().mockResolvedValue("body");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await expect(
      executePatchTextStep(
        {
          type: "patch-text",
          path: "README.md",
          operation: "unknown" as never,
          content: "header\n",
        },
        [],
        fetchText,
        readFile,
        writeFile,
      ),
    ).rejects.toThrow(
      'Invalid operation "unknown" in the patch-text step at path "README.md". This step will be skipped.',
    );
  });
});
