import type { Template } from "@/template-engine";

export interface SaveTemplatePort {
  (template: Template): Promise<void>;
}
