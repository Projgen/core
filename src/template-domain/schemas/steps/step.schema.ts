import z from "zod";
import {
  PatchJsonStepSchema,
  PatchTextStepSchema,
  RunStepSchema,
  WriteStepSchema,
} from ".";

export const StepSchema = z.discriminatedUnion("type", [
  RunStepSchema,
  WriteStepSchema,
  PatchTextStepSchema,
  PatchJsonStepSchema,
]);

export type Step = z.infer<typeof StepSchema>;
