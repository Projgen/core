import type { GetTemplateSourceFromRegistryPort } from "../ports/get-template-source-from-registry.port";

export interface GetTemplateSourceInput {
  source: string;
  getTemplateSourceFromRegistry: GetTemplateSourceFromRegistryPort;
}
