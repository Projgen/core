import type { Template } from "@/template-engine/domain";
import type { PrompterPort } from "../../ports/prompter.port";
import type { RunCommandPort } from "../../ports/run-command.port";
import type { FetchTextPort } from "../../ports/fetch-text.port";
import type { ReadFilePort } from "../../ports/read-file.port";
import type { WriteFilePort } from "../../ports/write-file.port";

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
