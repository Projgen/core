import {
  addTemplateToRegistry,
  getRegistryAdapter,
  getTemplateSourceFromRegistry,
  resolveTemplateLocationAdapter,
  writeRegistryToFileAdapter,
  writeTemplateToFileAdapter,
} from "@/registry-engine";
import { ProjgenError } from "@/shared";
import {
  getTemplate,
  getTemplateSource,
  loadTemplateFromFileAdapter,
  loadTemplateFromRemoteAdapter,
} from "@/template-service";
import { confirmRemoteDownloadPrompt } from "../prompts/confirm-remote-download.prompt";
import { UserCancellationError } from "../errors";

export const addCommand = async (
  templatePath: string,
  alias: string | undefined,
) => {
  const templateSource = await getTemplateSource({
    source: templatePath,
    deps: {
      getTemplateSourceFromRegistry: (source: string) =>
        getTemplateSourceFromRegistry({
          alias: source,
          deps: {
            getRegistry: getRegistryAdapter,
            resolveTemplateLocation: resolveTemplateLocationAdapter,
          },
        }).then((result) => {
          if (!result) {
            throw new ProjgenError(
              `Error: No template found in registry for alias "${source}".`,
            );
          }
          return result.source;
        }),
    },
  });

  if (templateSource.kind === "not-found") {
    throw new ProjgenError(
      `Error: Template source "${templatePath}" not found.`,
    );
  }

  if (templateSource.kind === "remote-url") {
    const confirmed = await confirmRemoteDownloadPrompt(templateSource.source);
    if (!confirmed) {
      throw new UserCancellationError();
    }
  }

  const { template } = await getTemplate({
    templateSource: {
      kind: templateSource.kind,
      value: templateSource.source,
    },
    deps: {
      loadExternalTemplate: loadTemplateFromRemoteAdapter,
      loadInternalTemplate: loadTemplateFromFileAdapter,
    },
  });

  if (!template) {
    throw new ProjgenError(
      `Error: Failed to load template from source "${templateSource.source}".`,
    );
  }

  await addTemplateToRegistry({
    template,
    deps: {
      getRegistry: getRegistryAdapter,
      saveRegistry: writeRegistryToFileAdapter,
      saveTemplate: writeTemplateToFileAdapter,
      specialAlias: alias,
    },
  });
};
