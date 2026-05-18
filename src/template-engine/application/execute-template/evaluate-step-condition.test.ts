import { describe, expect, it } from "vitest";

import { TemplateError } from "@/template-engine/domain";
import { evaluateStepCondition } from "./evaluate-step-condition";

const variables = [
  { name: "name", content: "projgen" },
  { name: "count", content: 3 },
  { name: "enabled", content: true },
  { name: "items", content: ["a", "b"] },
  { name: "nullable", content: null },
];

describe("evaluateStepCondition", () => {
  it.each([
    [{ variable: "name", operator: "eq", value: "projgen" }, true],
    [{ variable: "name", operator: "neq", value: "other" }, true],
    [{ variable: "count", operator: "gt", value: 2 }, true],
    [{ variable: "count", operator: "lt", value: 4 }, true],
    [{ variable: "count", operator: "gte", value: 3 }, true],
    [{ variable: "count", operator: "lte", value: 3 }, true],
    [{ variable: "items", operator: "contains", value: "a" }, true],
    [{ variable: "items", operator: "notContains", value: "z" }, true],
    [{ variable: "nullable", operator: "isNull", value: null }, true],
    [{ variable: "enabled", operator: "isNotNull", value: null }, true],
    [{ variable: "name", operator: "matches", value: "proj.*" }, true],
    [{ variable: "name", operator: "notMatches", value: "foo" }, true],
  ] as const)("returns %s", (condition, expected) => {
    expect(evaluateStepCondition(condition as never, variables as never)).toBe(
      expected,
    );
  });

  it("throws when variable is missing", () => {
    expect(() =>
      evaluateStepCondition(
        { variable: "missing", operator: "eq", value: "x" },
        variables as never,
      ),
    ).toThrow(TemplateError);
  });

  it("throws when operator and value types do not match", () => {
    expect(() =>
      evaluateStepCondition(
        { variable: "count", operator: "gt", value: "x" as never },
        variables as never,
      ),
    ).toThrow(TemplateError);
  });
});
