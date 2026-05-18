import { select } from "@inquirer/prompts";
import type { SelectPromptParams } from "./prompts.types";

export const promptForSelect = async <T>({
  message,
  options,
  initialValue,
}: SelectPromptParams<T>): Promise<T> => {
  const answer = await select<T>({
    message,
    choices: options,
    default: initialValue,
  });
  return answer;
};
