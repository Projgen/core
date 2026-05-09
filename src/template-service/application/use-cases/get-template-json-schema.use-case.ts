import { TemplateSchema } from "@/template-domain";
import z from "zod";

export const getTemplateJsonSchema = (): unknown => {
  return z.toJSONSchema(TemplateSchema);
};
