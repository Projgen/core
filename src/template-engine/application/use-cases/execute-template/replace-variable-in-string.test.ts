import { describe, expect, it } from "vitest";

import { replaceVariablesInString } from "./replace-variable-in-string";

describe("replaceVariablesInString", () => {
  it("replaces all variable placeholders", () => {
    expect(
      replaceVariablesInString("Hello {{name}} and {{name}}", [
        { name: "name", content: "world" },
      ]),
    ).toBe("Hello world and world");
  });

  it("stringifies non-string values", () => {
    expect(
      replaceVariablesInString("Count: {{count}}", [{ name: "count", content: 3 }]),
    ).toBe("Count: 3");
  });
});