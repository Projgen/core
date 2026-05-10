import type { GetRegistryPort } from "../../ports";
import type { ResolveTemplateLocationPort } from "../../ports/resolve-template-location.port";

export interface GetTemplateSourceFromRegistryInput {
  alias: string;
  getRegistry: GetRegistryPort;
  resolveTemplateLocation: ResolveTemplateLocationPort;
  registryUrl?: string;
}
