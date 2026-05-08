import { checkbox } from "@inquirer/prompts";
import type { MultiSelectPromptParams } from "./prompts.types";

export const promptForMultiSelect = async <T>({
  message,
  options,
  required = false,
}: MultiSelectPromptParams<T>): Promise<T[]> => {
  const answer = await checkbox<T>({
    message,
    choices: options,
    required,
  });
  return answer;
};
