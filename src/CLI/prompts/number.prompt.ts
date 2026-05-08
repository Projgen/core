import { number } from "@inquirer/prompts";
import type { NumberPromptParams } from "./prompts.types";

export const promptForNumber = async ({
  message,
  required = false,
  defaultValue,
}: NumberPromptParams): Promise<number | null> => {
  const answer = await number({
    message,
    required,
    default: defaultValue,
  });

  return answer ?? null;
};
