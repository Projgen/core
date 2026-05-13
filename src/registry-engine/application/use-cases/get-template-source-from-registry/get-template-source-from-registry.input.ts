import type { GetRegistryPort } from "../../ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../ports/resolve-template-location.port";

export type GetTemplateSourceFromRegistryInput = {
  alias: string;
  registryUrl?: string;
  deps: {
    getRegistry: GetRegistryPort;
    resolveTemplateLocation: ResolveTemplateLocationPort;
  };
};
