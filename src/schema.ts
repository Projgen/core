#!/usr/bin/env node

// ####################################################################
// # Used in the build process to get the JSON schema of the template #
// # will be written into /template.schema.json                       #
// #####################################################################
import { getTemplateJsonSchema } from "./template-engine/schemas/templateSchema.ts";

console.log(JSON.stringify(getTemplateJsonSchema(), null, 2));
