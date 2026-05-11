import type { Variable } from "./domain/variable";

export const replaceVariablesInString = (
  str: string,
  variables: Variable[],
) => {
  let result = str;
  for (const variable of variables) {
    const regex = new RegExp(`{{${variable.name}}}`, "g");
    result = result.replace(regex, String(variable.content));
  }
  return result;
};
