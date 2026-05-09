import type { LoadExternalTemplatePort } from "../ports/load-external-template.port";
import type { LoadInternalTemplatePort } from "../ports/load-intenal-template.port";
import type { TemplateSourceKind } from "../types/template-source-kind";

export type GetTemplateInput = {
  templateSource: { kind: Omit<TemplateSourceKind, "alias">; value: string };
  loadInternalTemplate: LoadInternalTemplatePort;
  loadExternalTemplate: LoadExternalTemplatePort;
};
