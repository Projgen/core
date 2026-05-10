import z from "zod";
import { baseStepSchema } from "./base-step.schema";
import { JsonValueSchema } from "../json-value.schema";

// A Step to edit JSON files (usefull for config files)
export const PatchJsonStepSchema = baseStepSchema.safeExtend({
  // Common properties for all step types
  type: z.literal("patch-json"), // Defines what kind of step it is

  // Unique properties for the "patch-json" step type
  path: z.string(), // The path to the JSON file to patch, relative to the project root
  operation: z.enum(["set", "append", "remove"]), // The operation to perform on the JSON file.
  // set: set the value the the defined path, removing anything that was there before, will create the path if it doesn't exist.
  // append: only works if the value at the defined path is an array or object, will append the provided value to the array, will create the array if it doesn't exist.
  // remove: will remove the value at the defined path
  jsonPath: z.array(z.string()), // The path to the value relative to the root of the json file as an array (e.g., compilerOptions.paths -> ["compilerOptions", "paths"])
  value: JsonValueSchema.optional(), // The value to use for the patch, required for "set" and "append" operations, will be ignored for "remove" operation
});

export type PatchJsonStep = z.infer<typeof PatchJsonStepSchema>;
