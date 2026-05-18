import { ProjgenError, tryCatch } from "@/shared";
import type { RemoveTemplateInput } from "./remove-template.input";

export const removeTemplateFromRegistry = async ({
  alias,
  deps: { getRegistry, saveRegistry, resolveTemplateLocation, deleteFile },
}: RemoveTemplateInput): Promise<void> => {
  const registry = await getRegistry();
  const templateIndex = registry.templates.findIndex(
    (template) => template.alias === alias,
  );

  if (templateIndex === -1) {
    throw new ProjgenError(
      `Template with alias "${alias}" not found in registry.`,
    );
  }

  const [removedEntry] = registry.templates.splice(templateIndex, 1);

  if (!removedEntry) {
    throw new ProjgenError(
      `Failed to remove template with alias "${alias}" from registry.`,
    );
  }

  const writeRegistryRes = await tryCatch(saveRegistry(registry));

  if (writeRegistryRes.error) {
    throw new ProjgenError(`Error saving registry: ${writeRegistryRes.error}`, {
      cause: writeRegistryRes.error,
    });
  }
  const templatePath = resolveTemplateLocation(removedEntry.path);
  const deleteFileRes = await tryCatch(deleteFile(templatePath));

  if (deleteFileRes.error) {
    throw new ProjgenError(
      `Error deleting template file at "${templatePath}": ${deleteFileRes.error}`,
      { cause: deleteFileRes.error },
    );
  }
};
