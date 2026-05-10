import z from "zod";

export const registryEntrySchema = z.object({
  alias: z // The alias to refere to the template by when using the CLI
    .string()
    .min(1) // The alias has to be at least 1 character long
    .regex(/^[a-zA-Z0-9-_]+$/), // The alias can only contain letters, numbers, - and _
  path: z.string().min(1), // The path to the template file
});

export type RegistryEntry = z.infer<typeof registryEntrySchema>;
