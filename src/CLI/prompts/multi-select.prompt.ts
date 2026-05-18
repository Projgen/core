import { checkbox } from "@inquirer/prompts";
import type { MultiSelectPromptParams } from "./prompts.types";
import type { Arrayify } from "@/shared";

export const promptForMultiSelect = async <T>({
  message,
  options,
  required = false,
}: MultiSelectPromptParams<T>): Promise<Arrayify<T>> => {
  if (!Array.isArray(options)) {
    throw new Error("Options for multi-select prompt must be an array.");
  }
  const answer = await checkbox({
    message,
    choices: options,
    required,
  });
  return answer as Arrayify<T>;
};
