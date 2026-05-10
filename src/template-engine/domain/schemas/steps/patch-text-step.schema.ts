import z from "zod";
import { baseStepSchema } from "./base-step.schema";

// A Step to edit text in a file
export const PatchTextStepSchema = baseStepSchema.safeExtend({
  // Common properties for all step types
  type: z.literal("patch-text"), // Defines what kind of step it is

  // Unique properties for the "patch-text" step type
  path: z.string(), // The path to the file to patch, relative to the project root
  operation: z.enum([
    "replace",
    "insert-after",
    "insert-before",
    "append",
    "prepend",
  ]), // The operation to perform on the file. Replace can be used to delete the part as well
  find: z.string().optional(), // The text to find in the file to determine where to apply the patch. The operation will be applied to all instances of the found text in the file
  // find is not used for append and prepend, since they are relative to the whole file, not to a specific part of it

  // Either use content or url, not both
  content: z.string().optional(), // The content to use for the patch, use empty string and replace to remove the found text
  url: z.string().optional(), // An optional url to fetch the content from, if provided it will ignore the content field and use the fetched content for the patch instead,can be used to copy a file from github for example
});

export type PatchTextStep = z.infer<typeof PatchTextStepSchema>;
