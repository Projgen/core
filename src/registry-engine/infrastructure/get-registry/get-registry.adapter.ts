import type { GetRegistryPort } from "@/registry-engine/application";
import { getRegistryFromFile } from "./get-registry-from-file";
import { getRegistryFromUrl } from "./get-registry-from-url";

export const getRegistry: GetRegistryPort = async (registryUrl?: string) => {
  return registryUrl
    ? await getRegistryFromUrl(registryUrl)
    : await getRegistryFromFile();
};
