import z from "zod";
import { baseVariableSchema } from "./base-variable.schema";

// The Schema for a multi-select variable
export const multiSelectVariableSchema = baseVariableSchema.safeExtend({
  type: z.literal("multi-select"), // The type of the variable, used to determine how to prompt the user for input
  required: z.boolean(), // Whether the user must provide a value when prompted
  options: z.array(z.union([z.string(), z.number()])), // An array of option for the multi-select variable type
});

export type MultiSelectVariable = z.infer<typeof multiSelectVariableSchema>;
