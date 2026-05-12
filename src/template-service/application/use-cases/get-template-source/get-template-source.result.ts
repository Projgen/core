import type { TemplateSourceKind } from "@/template-service/domain/template-source-kind";

export type GetTemplateSourceResult = {
  source: string | null;
  kind: TemplateSourceKind | "not-found";
};
