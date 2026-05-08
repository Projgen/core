import z from "zod";
import { baseVariableSchema } from "./base-variable.schema";

// The Schema for a string variable
export const stringVariableSchema = baseVariableSchema.safeExtend({
  type: z.literal("string"), // The type of the variable, used to determine how to prompt the user for input
  default: z.string().optional(), // An optional default value for the variable
  required: z.boolean(), // Whether the user must provide a value when prompted
});

export type StringVariable = z.infer<typeof stringVariableSchema>;
