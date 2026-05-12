import { registrySchema, type Registry } from "@/registry-engine";
import { REGISTRY_ENGINE_VERSION } from "@/registry-engine/domain/constants/registry-engine-version";
import { RegistryError } from "@/registry-engine";
import { ProjgenError } from "@/shared";

export const getRegistryFromUrl = async (
  registryUrl: string,
): Promise<Registry> => {
  const response = await fetch(registryUrl);

  if (!response.ok) {
    throw new ProjgenError(
      `Error: Failed to fetch external registry from ${registryUrl}. Status: ${response.status}`,
    );
  }

  const registryData = await response.json();
  const validationResult = registrySchema.safeParse(registryData);

  if (!validationResult.success) {
    throw new RegistryError(
      `Error: Invalid registry format from ${registryUrl}. ${validationResult.error.message}`,
    );
  }

  if (validationResult.data.version !== REGISTRY_ENGINE_VERSION) {
    throw new RegistryError(
      `Error: Unsupported registry version from ${registryUrl}. Expected version ${REGISTRY_ENGINE_VERSION}.`,
    );
  }
  return validationResult.data;
};
