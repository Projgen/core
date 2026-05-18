import * as z from "zod";
import { TemplateVariableSchema } from "./variables/templateVariable.schema";
import { StepSchema } from "./steps";

export const TemplateSchema = z.object({
  id: z.string(), // Used to identify the template when running the command (projgen create <template-id>)
  name: z.string(), // Display name, should be a human-friendly version of the id
  description: z.string(), // A short description of the template
  version: z.string(), // The version of the template, should follow semantic versioning (e.g., "1.0.0")
  engineVersion: z.string(), // The version of the template engine that this template is compatible with
  author: z.string(), // The author of the template
  variables: z.array(TemplateVariableSchema), // Defines the variables that can be used in the template and are prompted for when running the create command
  steps: z.array(StepSchema), // Defines the steps to execute to scaffold the project with the template
});

export type Template = z.infer<typeof TemplateSchema>;
