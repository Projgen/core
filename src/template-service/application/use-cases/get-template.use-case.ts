import { TemplateSchema } from "@/template-engine";
import type { GetTemplateInput } from "../dto/get-template.input";
import type { GetTemplateResult } from "../dto/get-template.result";
import { ProjgenError } from "@/shared";

export const getTemplate = async ({
  templateSource,
  loadInternalTemplate,
  loadExternalTemplate,
}: GetTemplateInput): Promise<GetTemplateResult> => {
  let template: unknown | null = null;
  switch (templateSource.kind) {
    case "remote-url":
      template = await loadExternalTemplate(templateSource.value);
      break;
    case "path":
      template = await loadInternalTemplate(templateSource.value);
      break;
    default:
      throw new ProjgenError(
        "Invalid template source kind" + templateSource.kind,
      );
  }

  if (!template) {
    return { template: null };
  }

  const parsed = TemplateSchema.safeParse(template);
  if (!parsed.success) {
    throw new ProjgenError("Invalid template format");
  }

  return {
    template: parsed.data,
  };
};
