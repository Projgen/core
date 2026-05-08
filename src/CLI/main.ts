#!/usr/bin/env node

import yargs, { type ArgumentsCamelCase } from "yargs";
import { hideBin } from "yargs/helpers";
import { tryCatch } from "../shared/utils/tryCatch.ts";
import { scaffoldFromTemplate } from "@/template-engine";
import {
  addTemplateToRegistry,
  findRegistry,
  removeTemplateFromRegistry,
} from "@/registry-engine";

import prompter from "../utils/prompter.ts";
import { printRegistry, printExpectedError } from "./presenters";

import { ProjgenError } from "@/shared";
import { TemplateError } from "@/template-domain";
import { UserCancellationError } from "./errors";

import {
  getTemplate,
  getTemplateFromFilePath,
} from "../template-service/templateFinder.ts";
import { getTemplateJsonSchema } from "../template-service/templateSchema.ts";

const create = async (
  templateSource: string,
  skipPrompts: boolean,
  variableArguments: Record<string, unknown> = {},
) => {
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
  await scaffoldFromTemplate(resolved.template, skipPrompts, variableArguments);
};

/*
########################
# CLI command Handlers #
########################
*/
const createHandler = async (
  argv: ArgumentsCamelCase<{
    templatePath: string | undefined;
    skipPrompts: boolean;
  }>,
) => {
  console.clear();

  if (!argv.templatePath) {
    console.error("Error: Template path is required.");
    return;
  }
  const creationResult = await tryCatch(
    create(argv.templatePath, argv.skipPrompts, argv),
  );

  if (creationResult.error) {
    if (creationResult.error instanceof UserCancellationError) {
      console.log("Operation cancelled by the user.");
    } else if (creationResult.error instanceof TemplateError) {
      printExpectedError("Template Error", creationResult.error);
    } else if (creationResult.error instanceof ProjgenError) {
      printExpectedError("Projgen Error", creationResult.error);
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
  const registry = await findRegistry();
  printRegistry(registry);
};

const removeHandler = async (
  argv: ArgumentsCamelCase<{ alias: string | undefined }>,
) => {
  if (!argv.alias) {
    console.error("Error: Alias is required.");
    return;
  }
  await removeTemplateFromRegistry(argv.alias);

  console.log(
    `Template with alias "${argv.alias}" has been removed from the registry.`,
  );
};

const schemaHandler = async () => {
  const schema = getTemplateJsonSchema();
  console.log(JSON.stringify(schema, null, 2));
};

yargs()
  .scriptName("projgen")
  .usage("$0 <command> [args]")
  .command({
    command: "create [templatePath]",
    describe: "Create a new project from a template",
    aliases: ["c", "cr"],
    builder: (yargs) => {
      return yargs
        .positional("templatePath", {
          type: "string",
          describe:
            "Template source: local path, file:// URL, http(s):// URL, or registry alias",
        })
        .option("skipPrompts", {
          alias: "y",
          type: "boolean",
          describe: "Skip all prompts",
          default: false,
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
  .command({
    command: "remove [alias]",
    describe: "Remove a template from the registry",
    aliases: ["rm"],
    builder: (yargs) => {
      return yargs.positional("alias", {
        type: "string",
        describe: "Alias of the template to remove from the registry",
      });
    },
    handler: removeHandler,
  })
  .command({
    command: "schema",
    describe: "Output the JSON schema for template files",
    handler: schemaHandler,
  })
  .help()
  .parse(hideBin(process.argv));
