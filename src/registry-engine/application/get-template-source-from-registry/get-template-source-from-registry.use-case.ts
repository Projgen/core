import { ProjgenError, tryCatch } from "@/shared";
import type { GetTemplateSourceFromRegistryInput } from "./get-template-source-from-registry.input";
import type { GetTemplateSourceFromRegistryResult } from "./get-template-source-from-registry.result";

export const getTemplateSourceFromRegistry = async ({
  alias,
  registryUrl,
  deps: { getRegistry, resolveTemplateLocation },
}: GetTemplateSourceFromRegistryInput): Promise<GetTemplateSourceFromRegistryResult> => {
  const registry = await tryCatch(getRegistry(registryUrl));

  // throw when local registry fetch fails, because it should have been created, when remote fetch fails, it is an expected exception
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
      registryUrl: externalRegistryUrl,
      deps: {
        getRegistry,
        resolveTemplateLocation,
      },
    });
    if (externalEntryPath.source) return externalEntryPath;
  }
  return { source: null };
};
