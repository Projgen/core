import { TemplateError, type PatchTextStep } from "@/template-engine/domain";
import type { VariableValue } from "@/template-engine/domain/variable-value";
import { replaceVariablesInString } from "../replace-variable-in-string";
import type { FetchTextPort } from "@/template-engine/application/ports/fetch-text.port";
import type { ReadFilePort } from "@/template-engine/application/ports/read-file.port";
import type { WriteFilePort } from "@/template-engine/application/ports/write-file.port";

export const executePatchTextStep = async (
  step: PatchTextStep,
  variables: VariableValue[],
  fetchText: FetchTextPort,
  readFile: ReadFilePort,
  writeFile: WriteFilePort,
) => {
  const path = replaceVariablesInString(step.path, variables);
  const find = step.find
    ? replaceVariablesInString(step.find, variables)
    : undefined;

  const rawText = step.url ? await fetchText(step.url) : step.content || "";
  const text = replaceVariablesInString(rawText, variables);

  const fileContent = await readFile(path);

  const newContent = await patchText(step, find, text, fileContent);
  await writeFile(path, newContent);
};

const patchText = async (
  step: PatchTextStep,
  find: string | undefined,
  text: string,
  fileContent: string,
) => {
  switch (step.operation) {
    case "replace": {
      if (!find) {
        throw new TemplateError(
          `The "find" property is required for the "replace" operation in the patch-text step at path "${step.path}". This step will be skipped.`,
        );
      }
      return fileContent.replaceAll(find, text);
    }
    case "insert-after": {
      if (!find) {
        throw new TemplateError(
          `The "find" property is required for the "insert-after" operation in the patch-text step at path "${step.path}". This step will be skipped.`,
        );
      }
      return fileContent.replaceAll(find, `${find}${text}`);
    }
    case "insert-before": {
      if (!find) {
        throw new TemplateError(
          `The "find" property is required for the "insert-before" operation in the patch-text step at path "${step.path}". This step will be skipped.`,
        );
      }
      return fileContent.replaceAll(find, `${text}${find}`);
    }
    case "append": {
      return `${fileContent}${text}`;
    }
    case "prepend": {
      return `${text}${fileContent}`;
    }
    default: {
      throw new TemplateError(
        `Invalid operation "${step.operation}" in the patch-text step at path "${step.path}". This step will be skipped.`,
      );
    }
  }
};
