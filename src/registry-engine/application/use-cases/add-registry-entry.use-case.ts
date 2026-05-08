import path from "path";
import fs from "fs/promises";

import {
  getRegistryPath,
  readRegistry,
} from "@/registry-engine/infrastructure";
import { getAppDataDir } from "@/shared";
import type { Template } from "@/template-domain";
import { RegistryError } from "@/registry-engine/errors";

export const addTemplateToRegistry = async (
  template: Template,
  specialAlias: string | null = null,
): Promise<void> => {
  const registry = await readRegistry();
  const configDir = getAppDataDir();
  const templatePath = path.join(configDir, `${template.id}.json`);

  const alias = specialAlias || template.id;

  const aliasExists = registry.templates.some((entry) => entry.alias === alias);
  if (aliasExists) {
    throw new RegistryError(
      `Error: A template with the same alias already exists in the registry: ${alias}.`,
    );
  }

  const fileExists = await fs
    .access(templatePath)
    .then(() => true)
    .catch(() => false);

  if (fileExists) {
    throw new RegistryError(
      `Error: A template with the same ID already exists at ${templatePath}.`,
    );
  }

  await fs.writeFile(templatePath, JSON.stringify(template, null, 2), "utf8");
  registry.templates.push({ alias, path: `${template.id}.json` });
  await fs.writeFile(
    getRegistryPath(),
    JSON.stringify(registry, null, 2),
    "utf8",
  );

  console.log(
    `Template "${template.name}" added to registry with alias "${alias}".`,
  );
};
