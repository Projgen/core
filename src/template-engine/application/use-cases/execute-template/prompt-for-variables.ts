import { ProjgenError } from "@/shared";
import type { TemplateVariable } from "@/template-engine/domain";
import type { VariableValue } from "@/template-engine/domain/variable-value";
import type { PrompterPort } from "../../ports/prompter.port";

export const promptForVariables = async (
  variables: TemplateVariable[],
  prompter: PrompterPort,
  skipPrompts: boolean = false,
  variableArguments: Record<string, unknown> = {},
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
          if (
            typeof variableArguments[variable.name] !== "string" &&
            typeof variableArguments[variable.name] !== "number"
          ) {
            throw new ProjgenError(
              `Invalid type provided for variable "${variable.name}". Expected string or number.`,
            );
          }
          if (
            typeof variable.options[0] !==
            typeof variableArguments[variable.name]
          ) {
            throw new ProjgenError(
              `Type of provided value for variable "${variable.name}" does not match expected type. Expected ${typeof variable.options[0]}.`,
            );
          }
          const selectValue = variableArguments[variable.name] as
            | string
            | number;

          // Because variable.options is string[] | number[], both cases have to be handled separately, otherwise variable.options.includes takes in never type
          if (
            typeof variable.options[0] === "number" &&
            typeof selectValue === "number" &&
            !(variable.options as number[]).includes(selectValue)
          ) {
            throw new ProjgenError(
              `Invalid option provided for variable "${variable.name}". Valid options are: ${variable.options?.join(
                ", ",
              )}.`,
            );
          }
          if (
            typeof variable.options[0] === "string" &&
            typeof selectValue === "string" &&
            !(variable.options as string[]).includes(selectValue)
          ) {
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
        const value = await prompter.string(
          variable.message,
          variable.required,
          variable.default,
        );
        variableValues.push({ name: variable.name, content: value });
        break;
      case "number":
        const numValue = await prompter.number(
          variable.message,
          variable.required,
          variable.default,
        );
        variableValues.push({ name: variable.name, content: numValue });
        break;
      case "boolean":
        const boolValue = await prompter.boolean(
          variable.message,
          variable.default,
        );
        variableValues.push({ name: variable.name, content: boolValue });
        break;
      case "select":
        const selectValue = await prompter.select<
          (typeof variable.options)[number]
        >(variable.message, variable.options);
        variableValues.push({ name: variable.name, content: selectValue });
        break;
      case "multi-select":
        const multiSelectValue = await prompter.multiSelect(
          variable.message,
          variable.options.map((option) => String(option)),
          variable.required,
        );
        variableValues.push({ name: variable.name, content: multiSelectValue });
        break;
    }
  }
  return variableValues;
};
