import type { GetRegistryPort } from "@/registry-engine/domain/ports/get-registry.port";
import { getRegistryFromFile } from "./get-registry-from-file";
import { getRegistryFromUrl } from "./get-registry-from-url";

export const getRegistryAdapter: GetRegistryPort = async (
  registryUrl?: string,
) => {
  return registryUrl
    ? await getRegistryFromUrl(registryUrl)
    : await getRegistryFromFile();
};
