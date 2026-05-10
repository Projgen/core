import z from "zod";
import { registryEntrySchema } from "./registry-entry.schema";

export const registrySchema = z
  .object({
    version: z.number().int().positive(),
    templates: z.array(registryEntrySchema),
    linkedRegistries: z.array(z.string()).optional(), // The paths / URLs to other registries to link to
  })
  .superRefine((registry, ctx) => {
    const seen = new Set<string>();

    for (const [index, template] of registry.templates.entries()) {
      if (seen.has(template.alias)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate alias: ${template.alias}`,
          path: ["templates", index, "alias"],
        });
      }

      seen.add(template.alias);
    }
  });

export type Registry = z.infer<typeof registrySchema>;
