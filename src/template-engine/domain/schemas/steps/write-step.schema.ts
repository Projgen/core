import z from "zod";
import { baseStepSchema } from "./base-step.schema";

// A Step to write files to the file system. Will create the file if it doesn't exist and overwrite it if it does exist
export const WriteStepSchema = baseStepSchema.safeExtend({
  // Common properties for all step types
  type: z.literal("write"), // Defines what kind of step it is

  // Unique properties for the "write" step type
  path: z.string(), // The path to the file to write, relative to the project root
  content: z.string().optional(), // The content to write to the file
  url: z.string().optional(), // An optional url to fetch the content from, if provided it will ignore the content field and use the fetched content for the file instead,can be used to copy a file from github for example
});

export type WriteStep = z.infer<typeof WriteStepSchema>;
