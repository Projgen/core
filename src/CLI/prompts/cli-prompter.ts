import { promptForBoolean } from "./bool.prompt";
import { promptForMultiSelect } from "./multi-select.prompt";
import { promptForNumber } from "./number.prompt";
import type { Prompter } from "./prompts.types";
import { promptForSelect } from "./select.prompt";
import { promptForString } from "./string.prompt";

export const cliPrompter: Prompter = {
  promptForString,
  promptForNumber,
  promptForBoolean,
  promptForSelect,
  promptForMultiSelect,
};
