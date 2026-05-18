import type { GetRegistryPort } from "../../domain/ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../domain/ports/resolve-template-location.port";

export type GetTemplateSourceFromRegistryInput = {
  alias: string;
  registryUrl?: string;
  deps: {
    getRegistry: GetRegistryPort;
    resolveTemplateLocation: ResolveTemplateLocationPort;
  };
};
