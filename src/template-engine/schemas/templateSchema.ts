import z from "zod";

import { TemplateSchema } from "./template.ts";

export const getTemplateJsonSchema = (): unknown => {
  return z.toJSONSchema(TemplateSchema);
};
