import { getTemplateJsonSchema } from "@/template-service";

export const schemaCommand = () => {
  const schema = getTemplateJsonSchema();
  console.log(JSON.stringify(schema, null, 2));
};
