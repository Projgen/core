import {
  getRegistryAdapter,
  getTemplateSourceFromRegistry,
  resolveTemplateLocationAdapter,
} from "@/registry-engine";

import {
  executeTemplate,
  fetchTextAdapter,
  readFileAdapter,
  runCommandAdapter,
  writeFileAdapter,
} from "@/template-engine";
import {
  getTemplate,
  getTemplateSource,
  loadTemplateFromFileAdapter,
  loadTemplateFromRemoteAdapter,
  type GetTemplateSourceFromRegistryPort,
} from "@/template-service";
import { cliPrompter } from "../prompts";
import type { Arrayify } from "@/shared/utils";
import { ProjgenError } from "@/shared";
import { confirmRemoteDownloadPrompt } from "../prompts/confirm-remote-download.prompt";
import { UserCancellationError } from "../errors";

const _getTemplateSourceFromRegistry: GetTemplateSourceFromRegistryPort = (
  source: string,
) =>
  getTemplateSourceFromRegistry({
    alias: source,
    deps: {
      getRegistry: getRegistryAdapter,
      resolveTemplateLocation: resolveTemplateLocationAdapter,
    },
  }).then((result) => {
    return result.source;
  });

export const createCommand = async (
  templatePath: string,
  skipPrompts: boolean = false,
  variables: Record<string, unknown> = {},
) => {
  const templateSource = await getTemplateSource({
    source: templatePath,
    deps: {
      getTemplateSourceFromRegistry: _getTemplateSourceFromRegistry,
    },
  });
  if (templateSource.kind === "not-found" || !templateSource.source) {
    throw new ProjgenError(`Template source "${templatePath}" not found.`);
  }

  if (templateSource.kind === "remote-url") {
    const accepted = await confirmRemoteDownloadPrompt(templateSource.source);
    if (!accepted) {
      throw new UserCancellationError();
    }
  }

  const { template } = await getTemplate({
    templateSource: { kind: templateSource.kind, value: templateSource.source },
    deps: {
      loadExternalTemplate: loadTemplateFromRemoteAdapter,
      loadInternalTemplate: loadTemplateFromFileAdapter,
    },
  });

  if (!template) {
    throw new ProjgenError(
      `Failed to load template from source "${templatePath}".`,
    );
  }

  await executeTemplate({
    template,
    skipPrompts,
    variableArguments: variables,
    deps: {
      prompter: {
        string: (message: string, required?: boolean, defaultValue?: string) =>
          cliPrompter.promptForString({
            message,
            required,
            defaultValue,
          }),
        number: (message: string, required?: boolean, defaultValue?: number) =>
          cliPrompter.promptForNumber({ message, required, defaultValue }),
        boolean: (message: string, defaultValue?: boolean) =>
          cliPrompter.promptForBoolean({ message, defaultValue }),
        select: <T extends string | number>(message: string, options: T[]) =>
          cliPrompter.promptForSelect<T>({
            message,
            options: options.map((value) => ({ value: value as T })),
          }),
        multiSelect: <T extends string | number>(
          message: string,
          options: Arrayify<T>,
        ): Promise<Arrayify<T>> =>
          cliPrompter.promptForMultiSelect<T>({
            message,
            options: options.map((value) => ({ value: value as T })),
          }),
      },
      runCommand: runCommandAdapter,
      fetchText: fetchTextAdapter,
      readFile: readFileAdapter,
      writeFile: writeFileAdapter,
    },
  });
};
