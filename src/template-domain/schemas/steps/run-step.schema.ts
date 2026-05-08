import z from "zod";
import { baseStepSchema } from "./base-step.schema";

// A Step to execute shell commands
export const RunStepSchema = baseStepSchema.safeExtend({
  // Common properties for all step types
  type: z.literal("run"), // Defines what kind of step it is

  // Unique properties for the "run" step type
  command: z.string(), // The command to run
  cwd: z.string().optional(), // The directory to run the command in relative to the project root, if not provided it will run in the root of the project
});

export type RunStep = z.infer<typeof RunStepSchema>;
