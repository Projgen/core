import { TemplateSchema } from "@/template-engine";
import z from "zod";

export const getTemplateJsonSchema = (): unknown => {
  const jsonSchema = z.toJSONSchema(TemplateSchema);
  jsonSchema.properties = {
    $schema: {
      type: "string",
      description: "The JSON Schema version used for this template",
      example:
        "https://raw.githubusercontent.com/Projgen/core/refs/heads/master/template.schema.json",
    },
    ...jsonSchema.properties,
  };
  return jsonSchema;
};
