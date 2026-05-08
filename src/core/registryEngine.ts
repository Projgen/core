import path from "node:path";
import fs from "node:fs/promises";
import {
  type Registry,
  registrySchema,
} from "../registryEngine/types/registry.ts";
import { getConfigDir } from "../utils/getConfigDir.ts";
import type { Template } from "../templateEngine/types/template.ts";
import { ProjgenError, RegistryError } from "./errors.ts";
import { printTable } from "../utils/printTable.ts";

const REGISTRY_ENGINE_VERSION = 1;

const getRegistryPath = (): string => {
  return path.join(getConfigDir(), "registry.json");
};

const ensureRegistryExists = async (): Promise<void> => {
  const configDir = getConfigDir();

  const registryPath = getRegistryPath();

  await fs.mkdir(configDir, { recursive: true });

  try {
    await fs.access(registryPath);
  } catch {
    await fs.writeFile(
      registryPath,
      JSON.stringify(
        {
          version: REGISTRY_ENGINE_VERSION,
          templates: [],
          linkedRegistries: [
            "https://raw.githubusercontent.com/Projgen/templates/refs/heads/main/registry.json",
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
  }
};

export const loadRegistry = async (): Promise<Registry> => {
  await ensureRegistryExists();
  const registryPath = getRegistryPath();
  const registryContent = await fs.readFile(registryPath, "utf-8");
  const parsedRegistry = JSON.parse(registryContent);
  const validationResult = registrySchema.safeParse(parsedRegistry);

  if (!validationResult.success) {
    throw new RegistryError(
      `Error: Invalid registry file. ${validationResult.error.message}`,
    );
  }

  if (validationResult.data.version !== REGISTRY_ENGINE_VERSION) {
    throw new RegistryError(
      `Error: Unsupported registry version. Expected version ${REGISTRY_ENGINE_VERSION}.`,
    );
  }

  return validationResult.data;
};

const getTemplatePathFromExternalRegistry = async (
  alias: string,
  registryUrl: string,
): Promise<string | null> => {
  try {
    const response = await fetch(registryUrl);

    if (!response.ok) {
      console.error(
        `Error: Failed to fetch external registry from ${registryUrl}. Status: ${response.status}`,
      );
      return null;
    }

    const registryData = await response.json();
    const validationResult = registrySchema.safeParse(registryData);

    if (!validationResult.success) {
      console.error(
        `Error: Invalid registry format from ${registryUrl}. ${validationResult.error.message}`,
      );
      return null;
    }

    if (validationResult.data.version !== REGISTRY_ENGINE_VERSION) {
      console.error(
        `Error: Unsupported registry version from ${registryUrl}. Expected version ${REGISTRY_ENGINE_VERSION}.`,
      );
      return null;
    }

    const entry = validationResult.data.templates.find(
      (template) => template.alias === alias,
    );

    if (!entry) {
      return null;
    }

    return entry.path;
  } catch (error) {
    console.error(
      `Error: Failed to fetch external registry from ${registryUrl}. ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
};

export const getTemplatePathFromRegistry = async (
  alias: string,
): Promise<string | null> => {
  const registry = await loadRegistry();

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

  return path.join(getConfigDir(), entry.path);
};

export const addTemplateToRegistry = async (
  template: Template,
  specialAlias: string | null = null,
): Promise<void> => {
  const registry = await loadRegistry();
  const configDir = getConfigDir();
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

export const printRegistryEntries = (
  entries: { alias: string; path: string }[],
) => {
  if (entries.length === 0) {
    console.log("No templates in registry.");
    return;
  }

  printTable(
    entries.map((entry) => [entry.alias, entry.path]),
    ["Alias", "Path"],
  );
};

export const printlinkedRegistries = (linkedRegistries: string[]) => {
  if (linkedRegistries.length === 0) {
    console.log("No linked registries.");
    return;
  }

  printTable(
    linkedRegistries.map((url) => [url]),
    ["Linked Registry URL"],
  );
};

export const printRegistry = (registry: Registry) => {
  console.log(`Registry Version: ${registry.version}`);
  console.log("\nTemplates:");
  printRegistryEntries(registry.templates);
  console.log("\nLinked Registries:");
  printlinkedRegistries(registry.linkedRegistries ?? []);
};

export const removeTemplateFromRegistry = async (
  alias: string,
): Promise<void> => {
  const registry = await loadRegistry();
  const templateIndex = registry.templates.findIndex(
    (template) => template.alias === alias,
  );
  if (templateIndex === -1) {
    throw new ProjgenError(
      `Template with alias "${alias}" not found in registry.`,
    );
  }
  const [removedEntry] = registry.templates.splice(templateIndex, 1);
  if (!removedEntry) {
    throw new ProjgenError(
      `Failed to remove template with alias "${alias}" from registry.`,
    );
  }
  await fs.writeFile(
    getRegistryPath(),
    JSON.stringify(registry, null, 2),
    "utf8",
  );
  const templatePath = path.join(getConfigDir(), removedEntry.path);
  await fs.unlink(templatePath);
};
