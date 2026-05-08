import fs from "fs/promises";

import { getAppDataDir } from "@/shared";
import { getRegistryPath } from "./get-registry-file-path";
import { REGISTRY_ENGINE_VERSION } from "@/registry-engine/application/constants";

export const ensureRegistryExists = async (): Promise<void> => {
  const appDataDir = getAppDataDir();

  const registryPath = getRegistryPath();

  await fs.mkdir(appDataDir, { recursive: true });

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
