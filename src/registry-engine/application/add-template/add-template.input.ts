import type { Template } from "@/template-engine";
import type { GetRegistryPort } from "../../domain/ports/get-registry.port";
import type { SaveTemplatePort } from "../../domain/ports/save-template.port";
import type { SaveRegistryPort } from "../../domain/ports/save-registry.port";

export type AddTemplateInput = {
  template: Template;
  deps: {
    getRegistry: GetRegistryPort;
    saveTemplate: SaveTemplatePort;
    saveRegistry: SaveRegistryPort;
    specialAlias?: string | undefined;
  };
};
