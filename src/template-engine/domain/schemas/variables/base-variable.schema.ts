import z from "zod";

export const baseVariableSchema = z.object({
  name: z.string(), // The name of the variable by which it can be referenced later in the template
  message: z.string(), // The message to display when prompting the user for input for this variable
});
