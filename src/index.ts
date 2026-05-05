#!/usr/bin/env node

import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "node:fs";
import { tryCatch, tryCatchSync } from "./utils/tryCatch.ts";
import { type Template, TemplateSchema } from "./types/template.ts";
import { scaffoldFromTemplate } from "./core/templatingEngine.ts";
import {
  addTemplateToRegistry,
  getTemplatePathFromRegistry,
} from "./core/registryEngine.ts";

import { fileURLToPath } from "node:url";
import prompter from "./utils/prompter.ts";
import {
  logExpectedError,
  ProjgenError,
  TemplateError,
  UserCancellationError,
} from "./core/errors.ts";

type TemplateInput =
  | { kind: "remote-url"; url: URL }
  | { kind: "file-url"; path: string }
  | { kind: "path"; path: string };

type ResolvedTemplate = {
  template: Template;
  source: string;
  sourceKind: "remote-url" | "file-url" | "path";
  fromAlias?: string;
};

/**
 * Classify the raw user input into one of:
 * - remote URL (http/https)
 * - file URL (file:)
 * - plain filesystem path / alias
 */
const parseTemplateInput = (input: string): TemplateInput => {
  try {
    const url = new URL(input);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return { kind: "remote-url", url };
    }

    if (url.protocol === "file:") {
      return { kind: "file-url", path: fileURLToPath(url) };
    }
  } catch {
    // Not a URL → treat as path/alias
  }

  return { kind: "path", path: input };
};

const validateTemplate = (template: unknown): Template => {
  const validationResult = TemplateSchema.safeParse(template);

  if (!validationResult.success) {
    throw new ProjgenError(
      `Error: Invalid template file. ${validationResult.error.message}`,
    );
  }

  return validationResult.data;
};

/**
 * Load and validate a template from a local filesystem path.
 * Returns null if the file does not exist.
 */
const getTemplateFromFilePath = (templatePath: string): Template | null => {
  const absolutePath = path.resolve(process.cwd(), templatePath);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  const templateContent = fs.readFileSync(absolutePath, "utf-8");
  const templateData = tryCatchSync(() => JSON.parse(templateContent));

  if (templateData.error) {
    throw new TemplateError(
      `Error: Failed to parse JSON in template file at path "${templatePath}".`,
      { cause: templateData.error },
    );
  }

  const validatedTemplate = tryCatchSync(() =>
    validateTemplate(templateData.data),
  );

  if (validatedTemplate.error) {
    throw new TemplateError(
      `Error: Invalid template file at path "${templatePath}".`,
      { cause: validatedTemplate.error },
    );
  }

  return validatedTemplate.data;
};

/**
 * Load and validate a template from a remote URL.
 * This function only does network + validation; it has no prompts or registry side effects.
 */
const getTemplateFromUrl = async (templateUrl: URL): Promise<Template> => {
  const response = await fetch(templateUrl, { redirect: "follow" });

  if (!response.ok) {
    throw new ProjgenError(
      `Error: Failed to fetch template from "${templateUrl}". HTTP ${response.status}`,
    );
  }

  // Basic redirect safety: disallow redirects to a different origin.
  if (response.redirected) {
    const finalUrl = new URL(response.url);
    if (finalUrl.origin !== templateUrl.origin) {
      throw new ProjgenError(
        `Error: Template URL "${templateUrl}" redirected to a different origin "${finalUrl}". Refusing to use redirected template.`,
      );
    }
  }

  const templateData = await response.json();
  const validatedTemplate = tryCatchSync(() => validateTemplate(templateData));

  if (validatedTemplate.error) {
    throw new TemplateError(
      `Error: Invalid template data from "${templateUrl}".`,
      { cause: validatedTemplate.error },
    );
  }

  return validatedTemplate.data;
};

const toResolvedTemplate = (
  template: Template,
  parsedInput: TemplateInput,
  source: string,
  fromAlias?: string,
): ResolvedTemplate => {
  return {
    template,
    source,
    sourceKind: parsedInput.kind,
    ...(fromAlias ? { fromAlias } : {}),
  };
};

/**
 * Resolve a template from any supported source:
 * - remote URL (http/https)
 * - file URL (file:)
 * - local filesystem path
 * - registry alias (which may itself be any of the above)
 */
const getTemplate = async (input: string): Promise<ResolvedTemplate> => {
  const parsed = parseTemplateInput(input);

  if (parsed.kind === "remote-url") {
    const template = await getTemplateFromUrl(parsed.url);
    return toResolvedTemplate(template, parsed, parsed.url.toString());
  }

  if (parsed.kind === "file-url" || parsed.kind === "path") {
    const templateFromPath = await getTemplateFromFilePath(parsed.path);
    if (templateFromPath) {
      return toResolvedTemplate(templateFromPath, parsed, parsed.path);
    }
  }

  const registryTemplateSource = await getTemplatePathFromRegistry(input);
  if (registryTemplateSource) {
    // Allow registry entries to be paths, file URLs, or remote URLs.
    const resolvedTemplate = await getTemplate(registryTemplateSource);

    return {
      ...resolvedTemplate,
      fromAlias: resolvedTemplate.fromAlias ?? input,
    };
  }

  throw new ProjgenError(
    `Error: Template not found at source "${input}" or in registry with alias "${input}".`,
  );
};

const create = async (templateSource: string) => {
  const resolved = await getTemplate(templateSource);
  const { template } = resolved;

  if (resolved.sourceKind === "remote-url") {
    const aliasContext = resolved.fromAlias
      ? ` (resolved from alias "${resolved.fromAlias}")`
      : "";

    const allowDownload = await prompter.promptForBoolean({
      name: "allowDownload",
      message: `Do you trust the author "${template.author}" of the template "${template.name}" from "${resolved.source}"${aliasContext}?`,
      default: false,
      type: "boolean",
    });

    if (!allowDownload.content) {
      throw new UserCancellationError();
    }

    const saveToRegistry = await prompter.promptForBoolean({
      name: "saveToRegistry",
      message:
        "Do you want to save this template in your registry for later use?",
      default: false,
      type: "boolean",
    });

    if (saveToRegistry.content) {
      const aliasResult = await prompter.promptForString({
        name: "alias",
        type: "string",
        message: "Enter an alias to refer to this template in the registry:",
        required: false,
      });
      await addTemplateToRegistry(template, aliasResult.content);
    }
  }
  await scaffoldFromTemplate(template);
};

yargs()
  .scriptName("projgen")
  .usage("$0 <command> [args]")
  .command({
    command: "create [templatePath]",
    describe: "Create a new project from a template",
    aliases: ["c", "cr"],
    builder: (yargs) => {
      return yargs.positional("templatePath", {
        type: "string",
        describe:
          "Template source: local path, file:// URL, http(s):// URL, or registry alias",
      });
    },
    handler: async (argv) => {
      console.clear();
      const creationResult = await tryCatch(
        create(argv.templatePath as string),
      );

      if (creationResult.error) {
        if (creationResult.error instanceof UserCancellationError) {
          console.log("Operation cancelled by the user.");
        } else if (creationResult.error instanceof TemplateError) {
          logExpectedError("Template Error", creationResult.error);
        } else if (creationResult.error instanceof ProjgenError) {
          logExpectedError("Projgen Error", creationResult.error);
        } else {
          console.error("An unexpected error occurred:");
          console.error(creationResult.error);
        }
      } else {
        console.log("Project created successfully!");
      }
    },
  })
  .command({
    command: "add [templatePath] [alias]",
    describe: "Add a template to the registry",
    aliases: ["a"],
    builder: (yargs) => {
      return yargs
        .positional("templatePath", {
          type: "string",
          describe: "Path to the template file",
        })
        .positional("alias", {
          type: "string",
          describe: "Alias to refer to the template by in the registry",
        });
    },
    handler: async (argv) => {
      const template = await getTemplateFromFilePath(
        argv.templatePath as string,
      );
      if (!template) {
        throw new ProjgenError(
          `Error: Template not found at path "${argv.templatePath}".`,
        );
      }
      await addTemplateToRegistry(template, argv.alias as string);
    },
  })
  .help()
  .parse(hideBin(process.argv));
