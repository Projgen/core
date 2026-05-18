import type { GetTemplateSourceFromRegistryPort } from "../../domain/ports/get-template-source-from-registry.port";

export type GetTemplateSourceInput = {
  source: string;
  deps: {
    getTemplateSourceFromRegistry: GetTemplateSourceFromRegistryPort;
  };
};
