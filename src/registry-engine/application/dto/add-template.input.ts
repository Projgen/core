import type { Template } from "@/template-domain";

export type AddTemplateInput = {
  template: Template;
  specialAlias?: string;
};
