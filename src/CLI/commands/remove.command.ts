import {
  deleteFileAdapter,
  getRegistryAdapter,
  removeTemplateFromRegistry,
  resolveTemplateLocationAdapter,
  writeRegistryToFileAdapter,
} from "@/registry-engine";

export const removeCommand = async (alias: string) => {
  await removeTemplateFromRegistry({
    alias,
    deps: {
      deleteFile: deleteFileAdapter,
      getRegistry: getRegistryAdapter,
      resolveTemplateLocation: resolveTemplateLocationAdapter,
      saveRegistry: writeRegistryToFileAdapter,
    },
  });
};
