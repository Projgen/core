import z from "zod";
import { baseVariableSchema } from "./base-variable.schema";

// The Schema for a number variable
export const numberVariableSchema = baseVariableSchema.safeExtend({
  type: z.literal("number"), // The type of the variable, used to determine how to prompt the user for input
  default: z.number().optional(), // An optional default value for the variable
  required: z.boolean(), // Whether the user must provide a value when prompted
});

export type NumberVariable = z.infer<typeof numberVariableSchema>;
