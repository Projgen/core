import type { GetRegistryPort } from "../../ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../ports/resolve-template-location.port";
import type { DeleteFilePort } from "../../ports/delete-file.port";
import type { SaveRegistryPort } from "../../ports/save-registry.port";

export type RemoveTemplateInput = {
  alias: string;
  getRegistry: GetRegistryPort;
  saveRegistry: SaveRegistryPort;
  resolveTemplateLocation: ResolveTemplateLocationPort;
  deleteFile: DeleteFilePort;
};
