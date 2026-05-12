import type { GetRegistryPort } from "../../ports/get-registry.port";
import type { ResolveTemplateLocationPort } from "../../ports/resolve-template-location.port";

export type GetTemplateSourceFromRegistryInput = {
  alias: string;
  getRegistry: GetRegistryPort;
  resolveTemplateLocation: ResolveTemplateLocationPort;
  registryUrl?: string;
};
