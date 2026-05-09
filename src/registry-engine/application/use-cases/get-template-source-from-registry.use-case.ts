import { ProjgenError, tryCatch } from "@/shared";
import type { GetTemplateSourceFromRegistryInput } from "../dto/get-template-source-from-registry.input";
import type { GetTemplateSourceFromRegistryResult } from "../dto/get-template-source-from-registry.result";

export const getTemplateSourceFromRegistry = async ({
  alias,
  getRegistry,
  registryUrl,
  resolveTemplateLocation,
}: GetTemplateSourceFromRegistryInput): Promise<GetTemplateSourceFromRegistryResult> => {
  const registry = await tryCatch(getRegistry(registryUrl));

  if (registry.error && registryUrl) return { source: null };
  if (registry.error)
    throw new ProjgenError("Failed to fetch registry", {
      cause: registry.error,
    });

  const entry = registry.data.templates.find(
    (template) => template.alias === alias,
  );

  if (entry)
    return { source: resolveTemplateLocation(entry.path, registryUrl) };

  for (const externalRegistryUrl of registry.data.linkedRegistries ?? []) {
    const externalEntryPath = await getTemplateSourceFromRegistry({
      alias,
      getRegistry,
      registryUrl: externalRegistryUrl,
      resolveTemplateLocation,
    });
    if (externalEntryPath) return externalEntryPath;
  }
  return { source: null };
};
