import type { GetTemplateSourceFromRegistryPort } from "../../ports/get-template-source-from-registry.port";

export type GetTemplateSourceInput = {
  source: string;
  getTemplateSourceFromRegistry: GetTemplateSourceFromRegistryPort;
};
