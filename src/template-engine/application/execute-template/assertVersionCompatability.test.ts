import { describe, expect, it } from "vitest";

import { TemplateError } from "@/template-engine/domain";
import { assertTemplateEngineCompatibility } from "./assertVersionCompatability";

describe("assertTemplateEngineCompatibility", () => {
  it("accepts compatible major and minor versions", () => {
    expect(() =>
      assertTemplateEngineCompatibility("1.2.0", "1.3.0"),
    ).not.toThrow();
  });

  it("rejects incompatible major versions", () => {
    expect(() => assertTemplateEngineCompatibility("2.0.0", "1.9.0")).toThrow(
      TemplateError,
    );
  });

  it("rejects newer template minor versions", () => {
    expect(() => assertTemplateEngineCompatibility("1.4.0", "1.3.0")).toThrow(
      TemplateError,
    );
  });

  it("rejects invalid version formats", () => {
    expect(() => assertTemplateEngineCompatibility("invalid", "1.3.0")).toThrow(
      TemplateError,
    );
  });
});
