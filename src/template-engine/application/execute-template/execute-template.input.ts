import type { Template } from "@/template-engine/domain";
import type { PrompterPort } from "../../domain/ports/prompter.port";
import type { RunCommandPort } from "../../domain/ports/run-command.port";
import type { FetchTextPort } from "../../domain/ports/fetch-text.port";
import type { ReadFilePort } from "../../domain/ports/read-file.port";
import type { WriteFilePort } from "../../domain/ports/write-file.port";

export type ExecuteTemplateInput = {
  template: Template;
  skipPrompts?: boolean;
  variableArguments?: Record<string, unknown>;
  deps: {
    prompter: PrompterPort;
    runCommand: RunCommandPort;
    fetchText: FetchTextPort;
    readFile: ReadFilePort;
    writeFile: WriteFilePort;
  };
};
