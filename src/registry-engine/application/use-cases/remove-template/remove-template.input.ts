import type { GetRegistryPort, ResolveTemplateLocationPort } from "../../ports";
import type { DeleteFilePort } from "../../ports/delete-file.port";
import type { SaveRegistryPort } from "../../ports/save-registry.port";

export interface RemoveTemplateInput {
  alias: string;
  getRegistry: GetRegistryPort;
  saveRegistry: SaveRegistryPort;
  resolveTemplateLocation: ResolveTemplateLocationPort;
  deleteFile: DeleteFilePort;
}
