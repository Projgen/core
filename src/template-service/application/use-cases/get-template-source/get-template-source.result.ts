import type { TemplateSourceKind } from "../types/template-source-kind";

export interface GetTemplateSourceResult {
  source: string | null;
  kind: TemplateSourceKind | "not-found";
}
