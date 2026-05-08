import type { GetRegistryPort } from "@/registry-engine/application";
import { getRegistryFromFile } from "./get-registry-from-file";
import { getRegistryFromUrl } from "./get-registry-from-url";

export const getRegistry: GetRegistryPort = async (registryUrl?: string) => {
  const registry = registryUrl
    ? await getRegistryFromUrl(registryUrl)
    : await getRegistryFromFile();

  if (!registry) {
    return {
      registry: null,
      message: `Failed to load registry from ${registryUrl ? `URL: ${registryUrl}` : "local file"}.`,
    };
  }
  return {
    registry,
    message: "success",
  };
};
