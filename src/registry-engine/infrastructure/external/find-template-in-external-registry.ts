import { registrySchema } from "@/registry-domain";
import { REGISTRY_ENGINE_VERSION } from "@/registry-engine/application/constants";

export const getTemplatePathFromExternalRegistry = async (
  alias: string,
  registryUrl: string,
): Promise<string | null> => {
  try {
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

    const entry = validationResult.data.templates.find(
      (template) => template.alias === alias,
    );

    if (!entry) {
      return null;
    }

    return entry.path;
  } catch (error) {
    console.error(
      `Error: Failed to fetch external registry from ${registryUrl}. ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
};
