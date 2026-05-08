import { confirm } from "@inquirer/prompts";
import type { BooleanPromptParams } from "./prompts.types";

export const promptForBoolean = async ({
  message,
  defaultValue,
}: BooleanPromptParams): Promise<boolean> => {
  const answer = await confirm({
    message,
    ...(defaultValue !== undefined ? { default: defaultValue } : {}),
  });
  return answer;
};
