import { cliPrompter } from "./cli-prompter";

export const confirmRemoteDownloadPrompt = async (
  source: string,
): Promise<boolean> => {
  const accepted = await cliPrompter.promptForBoolean({
    message: `The template source "${source}" is a remote URL. Do you want to proceed with downloading the template?`,
    defaultValue: false,
  });
  return accepted.valueOf();
};
