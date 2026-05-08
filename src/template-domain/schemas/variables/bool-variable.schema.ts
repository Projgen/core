import z from "zod";
import { baseVariableSchema } from "./base-variable.schema";

// The Schema for a boolean variable
export const booleanVariableSchema = baseVariableSchema.safeExtend({
  type: z.literal("boolean"), // The type of the variable, used to determine how to prompt the user for input
  default: z.boolean().optional(), // An optional default value for the variable
  // Doesn't need a required field since it will always have a value (true or false)
});

export type BooleanVariable = z.infer<typeof booleanVariableSchema>;
