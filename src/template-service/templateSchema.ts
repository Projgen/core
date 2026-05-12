import z from "zod";

import { TemplateSchema } from "@/template-engine";

export const getTemplateJsonSchema = (): unknown => {
  return z.toJSONSchema(TemplateSchema);
};
