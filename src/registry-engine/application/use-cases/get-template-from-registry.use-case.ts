import { ProjgenError, tryCatch } from "@/shared";
import type { GetTemplateInput } from "../dto/get-template-from-registry.input";
import type { GetTemplateResult } from "../dto/get-template-from-registry.result";

export const getTemplateFromRegistry = async ({
  alias,
  getRegistry,
  registryUrl,
  resolveTemplateLocation,
}: GetTemplateInput): Promise<GetTemplateResult> => {
  const registry = await tryCatch(getRegistry(registryUrl));

  if (registry.error && registryUrl) return null;
  if (registry.error)
    throw new ProjgenError("Failed to fetch registry", {
      cause: registry.error,
    });

  const entry = registry.data.templates.find(
    (template) => template.alias === alias,
  );

  if (entry) return resolveTemplateLocation(entry.path, registryUrl);

  for (const externalRegistryUrl of registry.data.linkedRegistries ?? []) {
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
