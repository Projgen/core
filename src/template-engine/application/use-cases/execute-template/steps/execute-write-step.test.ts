import { describe, expect, it, vi } from "vitest";

import { executeWriteStep } from "./execute-write-step";

describe("executeWriteStep", () => {
  it("fetches content when url is provided and writes interpolated output", async () => {
    const fetchText = vi.fn().mockResolvedValue("Hello {{name}}");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executeWriteStep(
      {
        type: "write",
        path: "{{folder}}/README.md",
        url: "https://example.com/readme",
      },
      [
        { name: "folder", content: "docs" },
        { name: "name", content: "Projgen" },
      ],
      fetchText,
      writeFile,
    );

    expect(fetchText).toHaveBeenCalledWith("https://example.com/readme");
    expect(writeFile).toHaveBeenCalledWith("docs/README.md", "Hello Projgen");
  });

  it("uses url content when both url and inline content are provided", async () => {
    const fetchText = vi.fn().mockResolvedValue("Hello {{name}} from url");
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executeWriteStep(
      {
        type: "write",
        path: "README.md",
        content: "Inline {{name}}",
        url: "https://example.com/readme",
      },
      [{ name: "name", content: "Projgen" }],
      fetchText,
      writeFile,
    );

    expect(fetchText).toHaveBeenCalledWith("https://example.com/readme");
    expect(writeFile).toHaveBeenCalledWith(
      "README.md",
      "Hello Projgen from url",
    );
  });

  it("uses inline content when url is absent", async () => {
    const fetchText = vi.fn();
    const writeFile = vi.fn().mockResolvedValue(undefined);

    await executeWriteStep(
      { type: "write", path: "README.md", content: "Hi {{name}}" },
      [{ name: "name", content: "Projgen" }],
      fetchText,
      writeFile,
    );

    expect(fetchText).not.toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledWith("README.md", "Hi Projgen");
  });
});
