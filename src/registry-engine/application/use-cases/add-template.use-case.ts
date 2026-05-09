import type { AddTemplateInput } from "../dto/add-template.input";
import { ProjgenError, tryCatch } from "@/shared";

export const addTemplateToRegistry = async ({
  template,
  getRegistry,
  saveTemplate,
  saveRegistry,
  specialAlias,
}: AddTemplateInput): Promise<void> => {
  const registry = await getRegistry();

  const alias = specialAlias || template.id;
  const aliasExists = registry.templates.some((entry) => entry.alias === alias);
  if (aliasExists) {
    throw new ProjgenError(
      `Error: A template with the same alias already exists in the registry: ${alias}.`,
    );
  }

  const writeTemplateRes = await tryCatch(saveTemplate(template));

  if (writeTemplateRes.error) {
    throw new ProjgenError(
      `Error saving template "${template.name}" to registry: ${writeTemplateRes.error}`,
      { cause: writeTemplateRes.error },
    );
  }

  registry.templates.push({ alias, path: `${template.id}.json` });
  const writeRegistryRes = await tryCatch(saveRegistry(registry));

  if (writeRegistryRes.error) {
    throw new ProjgenError(`Error saving registry: ${writeRegistryRes.error}`, {
      cause: writeRegistryRes.error,
    });
  }
};
