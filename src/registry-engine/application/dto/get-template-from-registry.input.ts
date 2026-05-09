import type { GetRegistryPort } from "../ports";
import type { ResolveTemplateLocationPort } from "../ports/resolve-template-location.port";

export type GetTemplateInput = {
  alias: string;
  getRegistry: GetRegistryPort;
  resolveTemplateLocation: ResolveTemplateLocationPort;
  registryUrl?: string;
};
