import { type Template, type Variable, TemplateError } from "@/template-domain";
import type { Variable as VariableValue } from "./types/variable.ts";
import prompter, { type Prompter } from "../utils/prompter.ts";
import { ProjgenError } from "@/shared";
import { steps } from "./steps";

const TEMPLATE_ENGINE_VERSION = "2.0";

const assertTemplateEngineCompatibility = (template: Template): void => {
  const [major = NaN, minor = NaN] =
    TEMPLATE_ENGINE_VERSION.split(".").map(Number);
  const [templateMajor = NaN, templateMinor = NaN] = template.engineVersion
    .split(".")
    .map(Number);

  if (
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    Number.isNaN(templateMajor) ||
    Number.isNaN(templateMinor)
  ) {
    throw new TemplateError(
      `Invalid template engine version format. Template requires version ${template.engineVersion}, but current version is ${TEMPLATE_ENGINE_VERSION}.`,
    );
  }

  if (templateMajor !== major || templateMinor > minor) {
    throw new TemplateError(
      `Incompatible template engine version. Template requires version ${template.engineVersion}, but current version is ${TEMPLATE_ENGINE_VERSION}.`,
    );
  }
};

export const scaffoldFromTemplate = async (
  template: Template,
  skipPrompts: boolean,
  variableArguments: Record<string, unknown> = {},
) => {
  assertTemplateEngineCompatibility(template);
  printTemplateInfo(template);
  const variables = await promptForVariables(
    template.variables,
    skipPrompts,
    variableArguments,
  );

  // Run Steps
  for (const step of template.steps) {
    try {
      switch (step.type) {
        case "run":
          await steps.runStep(step, variables);
          break;
        case "write":
          await steps.writeStep(step, variables);
          break;
        case "patch-text":
          await steps.patchTextStep(step, variables);
          break;
        case "patch-json":
          await steps.patchJsonStep(step, variables);
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

const printTemplateInfo = (
  template: Template,
  logger: (message: string) => void = console.log,
) => {
  logger(`\n${template.name} #${template.version} - ${template.author}`);
  logger(`${template.description}\n`);
};

const promptForVariables = async (
  variables: Variable[],
  skipPrompts: boolean = false,
  variableArguments: Record<string, unknown> = {},
  _prompter: Prompter = prompter,
): Promise<VariableValue[]> => {
  // Implementation for prompting users for variable values
  let variableValues: VariableValue[] = [];
  for (const variable of variables) {
    if (variable.name in variableArguments) {
      console.log(`Using provided value for variable "${variable.name}".`);
      switch (variable.type) {
        case "string":
          variableValues.push({
            name: variable.name,
            content: String(variableArguments[variable.name]),
          });
          continue;
        case "number":
          const numValue = Number(variableArguments[variable.name]);
          if (isNaN(numValue)) {
            throw new ProjgenError(
              `Invalid number provided for variable "${variable.name}".`,
            );
          }
          variableValues.push({
            name: variable.name,
            content: numValue,
          });
          continue;
        case "boolean":
          if (typeof variableArguments[variable.name] == "boolean") {
            variableValues.push({
              name: variable.name,
              content: variableArguments[variable.name] as boolean,
            });
            continue;
          }
          const boolValue = String(
            variableArguments[variable.name],
          ).toLowerCase();
          if (boolValue === "true") {
            variableValues.push({
              name: variable.name,
              content: true,
            });
          } else if (boolValue === "false") {
            variableValues.push({
              name: variable.name,
              content: false,
            });
          } else {
            throw new ProjgenError(
              `Invalid boolean provided for variable "${variable.name}". Use true or false.`,
            );
          }
          continue;
        case "select":
          const selectValue = String(variableArguments[variable.name]);
          if (!variable.options || !variable.options.includes(selectValue)) {
            throw new ProjgenError(
              `Invalid option provided for variable "${variable.name}". Valid options are: ${variable.options?.join(
                ", ",
              )}.`,
            );
          }
          variableValues.push({
            name: variable.name,
            content: selectValue,
          });
          continue;
        default:
          throw new ProjgenError(
            `Unknown variable type for variable ${variable}.`,
          );
      }
    }
    if (skipPrompts) {
      if ("default" in variable && variable.default !== undefined) {
        variableValues.push({
          name: variable.name,
          content: variable.default,
        });
        continue;
      } else if ("required" in variable && !variable.required) {
        variableValues.push({
          name: variable.name,
          content: null,
        });
        continue;
      }
    }
    switch (variable.type) {
      case "string":
        const value = await _prompter.promptForString(variable);
        variableValues.push(value);
        break;
      case "number":
        const numValue = await _prompter.promptForNumber(variable);
        variableValues.push(numValue);
        break;
      case "boolean":
        const boolValue = await _prompter.promptForBoolean(variable);
        variableValues.push(boolValue);
        break;
      case "select":
        const selectValue = await _prompter.promptForSelect(variable);
        variableValues.push(selectValue);
        break;
    }
  }
  return variableValues;
};
