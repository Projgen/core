import type { WriteStep } from "@/template-engine/domain";
import type { VariableValue } from "@/template-engine/domain/variable-value";
import { replaceVariablesInString } from "../replace-variable-in-string";
import type { FetchTextPort } from "@/template-engine/application/ports/fetch-text.port";
import type { WriteFilePort } from "@/template-engine/application/ports/write-file.port";

export const executeWriteStep = async (
  step: WriteStep,
  variables: VariableValue[],
  fetchText: FetchTextPort,
  writeFile: WriteFilePort,
) => {
  const path = replaceVariablesInString(step.path, variables);
  const rawContent = step.url ? await fetchText(step.url) : step.content || "";

  const content = replaceVariablesInString(rawContent, variables);

  await writeFile(path, content);
};
