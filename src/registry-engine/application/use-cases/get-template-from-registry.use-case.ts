import { ProjgenError } from "@/shared";
import type { GetTemplateInput } from "../dto/get-template.input";
import type { GetTemplateResult } from "../dto/get-template.result";

export const getTemplateFromRegistry = async ({
  alias,
  getRegistry,
  registryUrl,
  resolveTemplateLocation,
}: GetTemplateInput): Promise<GetTemplateResult> => {
  const response = await getRegistry(registryUrl);

  if (response.message !== "success" || !response.registry) {
    throw new ProjgenError(
      `Error: Failed to load registry. ${response.message}`,
    );
  }

  const registry = response.registry;

  const entry = registry.templates.find((template) => template.alias === alias);

  if (entry) return resolveTemplateLocation(entry.path, registryUrl);

  for (const externalRegistryUrl of registry.linkedRegistries ?? []) {
    const externalEntryPath = await getTemplateFromRegistry({
      alias,
      getRegistry,
      registryUrl: externalRegistryUrl,
      resolveTemplateLocation,
    });
    if (externalEntryPath) return externalEntryPath;
  }
  return null;
};
