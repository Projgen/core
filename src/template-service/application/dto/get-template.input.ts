import type { TemplateSourceKind } from "../types/template-source-kind";

export type GetTemplateInput = {
  templateSource: { kind: TemplateSourceKind; value: string };
};
