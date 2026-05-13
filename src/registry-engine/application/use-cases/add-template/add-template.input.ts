import type { Template } from "@/template-engine";
import type { GetRegistryPort } from "../../ports/get-registry.port";
import type { SaveTemplatePort } from "../../ports/save-template.port";
import type { SaveRegistryPort } from "../../ports/save-registry.port";

export type AddTemplateInput = {
  template: Template;
  deps: {
    getRegistry: GetRegistryPort;
    saveTemplate: SaveTemplatePort;
    saveRegistry: SaveRegistryPort;
    specialAlias?: string | undefined;
  };
};
