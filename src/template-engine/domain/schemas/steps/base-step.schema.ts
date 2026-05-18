import z from "zod";
import { StepConditionSchema } from "../condition.schema";

export const baseStepSchema = z.object({
  type: z.string(), // The type of the step, used to determine how to execute the step
  when: z.array(StepConditionSchema).optional(), // An optional condition that determines whether this step should be executed, if not provided the step will always be executed
  continueOnError: z.boolean().optional(), // Whether to continue executing the next steps if this step fails, handled as false by default
  name: z.string().optional(), // An optional name for the step, used for logging and error messages
  description: z.string().optional(), // An optional description for the step, used for logging and error messages
});

export type BaseStep = z.infer<typeof baseStepSchema>;
