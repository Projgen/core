import type { GetRegistryPort } from "../../domain/ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../domain/ports/resolve-template-location.port";
import type { DeleteFilePort } from "../../domain/ports/delete-file.port";
import type { SaveRegistryPort } from "../../domain/ports/save-registry.port";

export type RemoveTemplateInput = {
  alias: string;
  deps: {
    getRegistry: GetRegistryPort;
    saveRegistry: SaveRegistryPort;
    resolveTemplateLocation: ResolveTemplateLocationPort;
    deleteFile: DeleteFilePort;
  };
};
