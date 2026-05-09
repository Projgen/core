import type { Template } from "@/template-domain";

export type SaveTemplatePort = (template: Template) => Promise<void>;
