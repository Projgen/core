import z from "zod";

import { TemplateSchema } from "../templateEngine/types/template.ts";

export const getTemplateJsonSchema = (): unknown => {
  return z.toJSONSchema(TemplateSchema);
};
