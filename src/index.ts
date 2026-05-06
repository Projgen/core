#!/usr/bin/env node

import yargs, { type ArgumentsCamelCase } from "yargs";
import { hideBin } from "yargs/helpers";
import { tryCatch } from "./utils/tryCatch.ts";
import { scaffoldFromTemplate } from "./core/templatingEngine.ts";
import {
  addTemplateToRegistry,
  loadRegistry,
  printRegistry,
} from "./core/registryEngine.ts";

import prompter from "./utils/prompter.ts";
import {
  logExpectedError,
  ProjgenError,
  TemplateError,
  UserCancellationError,
} from "./core/errors.ts";
import { getTemplate, getTemplateFromFilePath } from "./core/templateFinder.ts";

const create = async (templateSource: string) => {
  const resolved = await getTemplate(templateSource);

  if (resolved.sourceKind === "remote-url") {
    const aliasContext = resolved.fromAlias
      ? ` (resolved from alias "${resolved.fromAlias}")`
      : "";

    const allowDownload = await prompter.promptForBoolean({
      name: "allowDownload",
      message: `Do you trust the author "${resolved.template.author}" of the template "${resolved.template.name}" from "${resolved.source}"${aliasContext}?`,
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
      await addTemplateToRegistry(resolved.template, aliasResult.content);
    }
  }
  await scaffoldFromTemplate(resolved.template);
};

/*
########################
# CLI command Handlers #
########################
*/
const createHandler = async (
  argv: ArgumentsCamelCase<{ templatePath: string | undefined }>,
) => {
  console.clear();

  if (!argv.templatePath) {
    console.error("Error: Template path is required.");
    return;
  }
  const creationResult = await tryCatch(create(argv.templatePath as string));

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
};

const addHandler = async (
  argv: ArgumentsCamelCase<{
    templatePath: string | undefined;
    alias: string | undefined;
  }>,
) => {
  if (!argv.templatePath) {
    console.error("Error: Template path is required.");
    return;
  }

  const template = getTemplateFromFilePath(argv.templatePath);
  if (!template) {
    throw new ProjgenError(
      `Error: Template not found at path "${argv.templatePath}".`,
    );
  }
  await addTemplateToRegistry(template, argv.alias || null);
};

const listHandler = async () => {
  const registry = await loadRegistry();
  printRegistry(registry);
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
    handler: createHandler,
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
    handler: addHandler,
  })
  .command({
    command: "list",
    describe: "List all registry entries",
    aliases: ["ls"],
    handler: listHandler,
  })
  .help()
  .parse(hideBin(process.argv));
