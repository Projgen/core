import z from "zod";

import { TemplateSchema } from "../template-domain/schemas/template.schema.ts";

export const getTemplateJsonSchema = (): unknown => {
  return z.toJSONSchema(TemplateSchema);
};
