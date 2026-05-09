import type { SaveTemplatePort } from "@/registry-engine/application/ports/save-template.port";
import { getAppDataDir, ProjgenError } from "@/shared";
import path from "path";
import fs from "fs/promises";

export const writeTemplateToFileAdapter: SaveTemplatePort = async (
  template,
) => {
  const configDir = getAppDataDir();
  const templatePath = path.join(configDir, `${template.id}.json`);

  const fileExists = await fs
    .access(templatePath)
    .then(() => true)
    .catch(() => false);

  if (fileExists) {
    throw new ProjgenError(
      `Error: A template with the same ID already exists at ${templatePath}.`,
    );
  }
  await fs.writeFile(templatePath, JSON.stringify(template, null, 2), "utf8");
};
