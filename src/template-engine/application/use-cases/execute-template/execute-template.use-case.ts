import { TEMPLATE_ENGINE_VERSION } from "@/template-engine/domain/constants/template-engine-version";
import { assertTemplateEngineCompatibility } from "./assertVersionCompatability";
import { promptForVariables } from "./prompt-for-variables";
import type { ExecuteTemplateInput } from "./execute-template.input";
import { executeRunStep } from "./steps/execute-run-step";
import { executeWriteStep } from "./steps/execute-write-step";
import { executePatchTextStep } from "./steps/execute-patch-text-step";
import { executePatchJsonStep } from "./steps/execute-patch-json-step";
import { evaluateStepCondition } from "./evaluate-step-condition";

export const executeTemplate = async ({
  template,
  prompter,
  skipPrompts = false,
  variableArguments = {},
}: ExecuteTemplateInput) => {
  assertTemplateEngineCompatibility(
    template.engineVersion,
    TEMPLATE_ENGINE_VERSION,
  );

  const variables = await promptForVariables(
    template.variables,
    prompter,
    skipPrompts,
    variableArguments,
  );

  for (const step of template.steps) {
    if (
      step.when &&
      !step.when.every((condition) =>
        evaluateStepCondition(condition, variables),
      )
    ) {
      continue;
    }
    try {
      switch (step.type) {
        case "run":
          await executeRunStep(step, variables);
          break;
        case "write":
          await executeWriteStep(step, variables);
          break;
        case "patch-text":
          await executePatchTextStep(step, variables);
          break;
        case "patch-json":
          await executePatchJsonStep(step, variables);
          break;
        default:
          console.warn("Unknown step type"); // This should never happen due to the schema validation, but it's good to have just in case
      }
    } catch (error) {
      if (!step.continueOnError) {
        throw error;
      }

      console.error(
        `Step "${step.type}" failed, continuing because continueOnError is enabled.`,
      );
    }
  }
};
