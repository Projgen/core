import type { TemplateSourceKind } from "@/template-service/domain/template-source-kind";

export type GetTemplateSourceResult =
  | {
      source: string;
      kind: Exclude<TemplateSourceKind, "alias">;
    }
  | {
      source: null;
      kind: "not-found";
    };
