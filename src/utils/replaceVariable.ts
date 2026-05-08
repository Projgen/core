import type { Variable } from "../templateEngine/types/variable";

export const resolveVariablesInString = (
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
