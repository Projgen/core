import type { VariableValue } from "@/template-engine/domain/variable-value";
import type { RunStep } from "@/template-engine/domain";
import { replaceVariablesInString } from "../replace-variable-in-string";
import type { RunCommandPort } from "@/template-engine/domain/ports/run-command.port";

export const executeRunStep = async (
  step: RunStep,
  variables: VariableValue[],
  runCommand: RunCommandPort,
) => {
  const command = replaceVariablesInString(step.command, variables);
  const args =
    step.args?.map((arg) => replaceVariablesInString(arg, variables)) ?? [];
  const cwd = step.cwd
    ? replaceVariablesInString(step.cwd, variables)
    : undefined;

  await runCommand(command, args, cwd);
};
