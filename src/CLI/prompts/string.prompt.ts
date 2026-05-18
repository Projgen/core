import { input } from "@inquirer/prompts";
import type { StringPromptParams } from "./prompts.types";

export const promptForString = async ({
  message,
  required = false,
  defaultValue,
}: StringPromptParams): Promise<string> => {
  const answer = await input({
    message,
    required,
    ...(defaultValue !== undefined ? { default: defaultValue } : {}),
    validate: (value) => {
      if (!required) return true;
      return value.trim().length > 0 || "This value is required.";
    },
  });
  return answer;
};
