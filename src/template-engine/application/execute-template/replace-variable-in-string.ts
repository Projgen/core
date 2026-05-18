import type { VariableValue } from "@/template-engine/domain/variable-value";

export const replaceVariablesInString = (
  str: string,
  variables: VariableValue[],
) => {
  let result = str;
  for (const variable of variables) {
    const regex = new RegExp(`{{${variable.name}}}`, "g");
    result = result.replace(regex, String(variable.content));
  }
  return result;
};
