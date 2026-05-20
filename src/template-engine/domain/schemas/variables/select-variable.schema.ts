import z from "zod";
import { baseVariableSchema } from "./base-variable.schema";

// The Schema for a select variable
export const selectVariableSchema = baseVariableSchema.safeExtend({
  type: z.literal("select"), // The type of the variable, used to determine how to prompt the user for input
  required: z.boolean(), // Whether the user must provide a value when prompted, is ignored for single selects (one must be selected there)
  options: z.union([z.array(z.string()), z.array(z.number())]), // An array of option for the select variable type, should only be provided if the variable type is "select", will be ignored otherwhise
  default: z.union([z.string(), z.number()]).optional(), // The default value for the variable, will be used if user skips variable promptings with -y
});

export type SelectVariable = z.infer<typeof selectVariableSchema>;
