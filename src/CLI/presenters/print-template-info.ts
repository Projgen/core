import type { Template } from "@/template-engine";

export const printTemplateInfo = (template: Template) => {
  console.log(`\n${template.name} #${template.version} - ${template.author}`);
  console.log(`${template.description}\n`);
};
