import { TemplateError, type PatchJsonStep } from "@/template-engine/domain";
import type { VariableValue } from "@/template-engine/domain/variable-value";
import { replaceVariablesInString } from "../replace-variable-in-string";
import type { ReadFilePort } from "@/template-engine/application/ports/read-file.port";
import type { WriteFilePort } from "@/template-engine/application/ports/write-file.port";

export const executePatchJsonStep = async (
  step: PatchJsonStep,
  variables: VariableValue[],
  readFile: ReadFilePort,
  writeFile: WriteFilePort,
) => {
  const path = replaceVariablesInString(step.path, variables);
  const operation = step.operation;
  const jsonPath = step.jsonPath.map((part) =>
    replaceVariablesInString(part, variables),
  );

  // Has to be done this way, because value isn't just a string but a json object. This way, every part of the object can have variables in it
  const value = step.value
    ? JSON.parse(
        replaceVariablesInString(JSON.stringify(step.value), variables),
      )
    : undefined;

  const fileContent = await readFile(path);

  const json = JSON.parse(fileContent);

  const newContent = patchJson(json, operation, value, jsonPath);
  await writeFile(path, JSON.stringify(newContent, null, 2));
};

const patchJson = (
  json: unknown,
  operation: "set" | "append" | "remove",
  value: unknown,
  jsonPath: string[],
): unknown => {
  switch (operation) {
    case "set": {
      return setValueAtJsonPath(json, jsonPath, value);
    }
    case "append": {
      return appendValueAtJsonPath(json, jsonPath, value);
    }
    case "remove": {
      return removeValueAtJsonPath(json, jsonPath);
    }
  }
};

const setValueAtJsonPath = (
  json: unknown,
  jsonPath: string[],
  value: unknown,
): unknown => {
  if (typeof jsonPath[0] !== "string")
    throw new TemplateError("jsonPath has to be an array of strings");

  // Ensure we have an object to operate on; create missing objects along the path
  const obj: Record<string, unknown> = isRecord(json)
    ? (json as Record<string, unknown>)
    : {};

  if (jsonPath.length > 1) {
    obj[jsonPath[0]] = setValueAtJsonPath(
      obj[jsonPath[0]],
      jsonPath.slice(1),
      value,
    );
    return obj;
  }

  obj[jsonPath[0]] = value;
  return obj;
};

const appendValueAtJsonPath = (
  json: unknown,
  jsonPath: string[],
  value: unknown,
): unknown => {
  if (typeof jsonPath[0] !== "string") {
    throw new TemplateError("jsonPath has to be an array of strings");
  }

  if (!isRecord(json)) {
    throw new TemplateError(
      `Cannot append value to target at jsonPath ${jsonPath.join(
        ".",
      )} because there it's not a path of objects`,
    );
  }

  if (jsonPath.length > 1) {
    json[jsonPath[0]] = appendValueAtJsonPath(
      json[jsonPath[0]],
      jsonPath.slice(1),
      value,
    );
    return json;
  }

  const target = json[jsonPath[0]];

  if (Array.isArray(target) && Array.isArray(value)) {
    json[jsonPath[0]] = [...target, ...value];
    return json;
  }

  if (Array.isArray(target) && !Array.isArray(value)) {
    json[jsonPath[0]] = [...target, value];
    return json;
  }

  if (isRecord(target) && isRecord(value)) {
    json[jsonPath[0]] = { ...target, ...value };
    return json;
  }

  throw new TemplateError(
    `Cannot append value to target at jsonPath ${jsonPath.join(
      ".",
    )} because they are not compatible types`,
  );
};

const removeValueAtJsonPath = (json: unknown, jsonPath: string[]): unknown => {
  if (typeof jsonPath[0] !== "string")
    throw new TemplateError("jsonPath has to be an array of strings");
  if (isRecord(json)) {
    if (jsonPath.length > 1) {
      json[jsonPath[0]] = removeValueAtJsonPath(
        json[jsonPath[0]],
        jsonPath.slice(1),
      );
      return json;
    }
    delete json[jsonPath[0]];
    return json;
  }
  throw new TemplateError(
    `Cannot remove value at jsonPath ${jsonPath.join(
      ".",
    )} because there it's not a path of objects`,
  );
};

function isRecord(check: unknown): check is Record<string, unknown> {
  if (check && typeof check === "object") {
    return !!(check as Record<string, unknown>);
  }
  return false;
}
