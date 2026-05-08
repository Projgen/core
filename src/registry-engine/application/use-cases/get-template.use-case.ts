import path from "node:path";

import { readRegistry } from "@/registry-engine/infrastructure";
import { getTemplatePathFromExternalRegistry } from "@/registry-engine/infrastructure";
import { getAppDataDir } from "@/shared";

export const findRegistryEntry = async (
  alias: string,
): Promise<string | null> => {
  const registry = await readRegistry();

  const entry = registry.templates.find((template) => template.alias === alias);

  if (!entry) {
    for (const externalRegistryUrl of registry.linkedRegistries ?? []) {
      const externalTemplatePath = await getTemplatePathFromExternalRegistry(
        alias,
        externalRegistryUrl,
      );
      if (externalTemplatePath) {
        return externalTemplatePath;
      }
    }
    return null;
  }

  return path.join(getAppDataDir(), entry.path);
};
