import z from "zod";
import { JsonValueSchema } from "./json-value.schema";

export const StepConditionSchema = z.object({
  variable: z.string(), // The name of the variable to check the condition against, should reference a variable defined in the template's variables array
  operator: z.enum([
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "contains",
    "notContains",
    "isNull",
    "isNotNull",
    "matches", // checks for regex match
    "notMatches", // checks for regex not match
  ]), // The operator to use for the condition (e.g., "eq" for equals, "neq" for not equals, "gt" for greater than, etc.)
  value: JsonValueSchema, // The value to compare the variable against, should be of the same type as the variable being checked
});

export type StepCondition = z.infer<typeof StepConditionSchema>;
