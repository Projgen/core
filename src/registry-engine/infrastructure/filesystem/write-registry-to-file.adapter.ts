import type { SaveRegistryPort } from "@/registry-engine/application/ports/save-registry.port";
import { getRegistryPath } from "../get-registry/get-registry-file-path";
import fs from "fs/promises";
import { ProjgenError, tryCatch } from "@/shared";

export const writeRegistryToFileAdapter: SaveRegistryPort = async (
  registry,
) => {
  const registryPath = getRegistryPath();
  const writeFileRes = await tryCatch(
    fs.writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8"),
  );

  if (writeFileRes.error) {
    throw new ProjgenError(
      `Error writing registry to file: ${registryPath}. ${writeFileRes.error.message}`,
      { cause: writeFileRes.error },
    );
  }
};
