import path from "path";
import fs from "fs/promises";

import {
  getRegistryPath,
  readRegistry,
} from "@/registry-engine/infrastructure";
import { getAppDataDir, ProjgenError } from "@/shared";
import type { RemoveTemplateInput } from "../dto/remove-template.input";

export const removeTemplateFromRegistry = async ({
  alias,
}: RemoveTemplateInput): Promise<void> => {
  const registry = await readRegistry();
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
  const templatePath = path.join(getAppDataDir(), removedEntry.path);
  await fs.unlink(templatePath);
};
