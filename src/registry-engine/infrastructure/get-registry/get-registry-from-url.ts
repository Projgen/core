import { registrySchema } from "@/registry-domain";
import { REGISTRY_ENGINE_VERSION } from "@/registry-engine/constants";

export const getRegistryFromUrl = async (registryUrl: string) => {
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
};
