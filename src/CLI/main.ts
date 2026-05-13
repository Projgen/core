#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { TemplateError } from "@/template-engine";
import { UserCancellationError } from "./errors/user-cancellation-error.ts";
import { printExpectedError } from "./presenters/print-error.ts";
import { ProjgenError } from "@/shared";
import { createCommand } from "./commands/create.command.ts";
import { addCommand } from "./commands/add.command.ts";
import { listCommand } from "./commands/list.command.ts";
import { removeCommand } from "./commands/remove.command.ts";
import { schemaCommand } from "./commands/schema.command.ts";

const errorHandler = (func: () => void): void => {
  try {
    func();
  } catch (error) {
    if (error instanceof UserCancellationError) {
      console.log("Operation cancelled by the user.");
    } else if (error instanceof TemplateError) {
      printExpectedError("Template Error", error);
    } else if (error instanceof ProjgenError) {
      printExpectedError("Projgen Error", error);
    } else {
      console.error("An unexpected error occurred:");
      console.error(error);
    }
  }
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
    handler: (args) => {
      errorHandler(() => {
        if (!args.templatePath) {
          throw new ProjgenError("Template path is required.");
        }
        createCommand(args.templatePath, args.skipPrompts);
      });
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
    handler: (args) => {
      errorHandler(() => {
        if (!args.templatePath) {
          throw new ProjgenError("Template path is required.");
        }
        addCommand(args.templatePath, args.alias);
      });
    },
  })
  .command({
    command: "list",
    describe: "List all registry entries",
    aliases: ["ls"],
    handler: () => {
      errorHandler(() => {
        listCommand();
      });
    },
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
    handler: (args) => {
      errorHandler(() => {
        if (!args.alias) {
          throw new ProjgenError("Alias is required for the remove command.");
        }
        removeCommand(args.alias);
      });
    },
  })
  .command({
    command: "schema",
    describe: "Output the JSON schema for template files",
    handler: () => {
      errorHandler(() => {
        schemaCommand();
      });
    },
  })
  .help()
  .parse(hideBin(process.argv));
