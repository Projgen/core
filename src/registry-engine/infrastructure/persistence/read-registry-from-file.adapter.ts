import fs from "fs/promises";

import { registrySchema, type Registry } from "@/registry-domain";
import {
  ensureRegistryExists,
  getRegistryPath,
} from "@/registry-engine/infrastructure/persistence";
import { RegistryError, type GetPrimaryRegistryPort } from "@/registry-engine";
import { REGISTRY_ENGINE_VERSION } from "../../constants";

export const getRegistryFromFile: GetPrimaryRegistryPort =
  async (): Promise<Registry> => {
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
