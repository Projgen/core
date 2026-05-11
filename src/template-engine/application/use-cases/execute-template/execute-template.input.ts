import type { Template } from "@/template-engine/domain";
import type { PrompterPort } from "../../ports/prompter.port";

export interface ExecuteTemplateInput {
  template: Template;
  prompter: PrompterPort;
  skipPrompts?: boolean;
  variableArguments?: Record<string, unknown>;
}
