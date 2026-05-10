import { TemplateSchema } from "@/template-engine";
import z from "zod";

export const getTemplateJsonSchema = (): unknown => {
  return z.toJSONSchema(TemplateSchema);
};
