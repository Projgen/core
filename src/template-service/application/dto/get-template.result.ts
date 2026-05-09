import type { Template } from "@/template-domain";

export type GetTemplateResult = {
  template: Template;
  source: string;
} | null;
