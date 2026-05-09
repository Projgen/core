import type { Template } from "@/template-domain";
import type { GetRegistryPort } from "../ports";
import type { SaveTemplatePort } from "../ports/save-template.port";
import type { SaveRegistryPort } from "../ports/save-registry.port";

export type AddTemplateInput = {
  template: Template;
  getRegistry: GetRegistryPort;
  saveTemplate: SaveTemplatePort;
  saveRegistry: SaveRegistryPort;
  specialAlias?: string;
};
