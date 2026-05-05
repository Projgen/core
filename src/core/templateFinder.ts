import { fileURLToPath } from "node:url";
import { TemplateSchema, type Template } from "../types/template.ts";
import { ProjgenError, TemplateError } from "./errors.ts";
import { getTemplatePathFromRegistry } from "./registryEngine.ts";
import { parseURL } from "../utils/parseUrl.ts";
import { blockCrossOriginRedirect } from "../utils/blockCrossOriginRedirect.ts";
import path from "node:path";
import fs from "node:fs";
import { tryCatchSync } from "../utils/tryCatch.ts";

export type ResolvedTemplate = {
  template: Template;
  source: string;
  sourceKind: "remote-url" | "file-url" | "path";
  fromAlias?: string;
};

export type TemplateInput =
  | { kind: "remote-url"; url: URL }
  | { kind: "file-url"; path: string }
  | { kind: "path"; path: string };

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

// Load and validate a template from a local file path.
// Returns null if the file doesn't exist, or throws if the file exists but is invalid.
export const getTemplate = async (input: string): Promise<ResolvedTemplate> => {
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

// Classify the raw user input into one of:
// - remote URL (http/https)
// - file URL (file:)
// - plain filesystem path or alias
function parseTemplateInput(input: string): TemplateInput {
  const url = parseURL(input);

  if (url?.protocol === "http:" || url?.protocol === "https:") {
    return { kind: "remote-url", url };
  }
  if (url?.protocol === "file:") {
    return { kind: "file-url", path: fileURLToPath(url) };
  }

  return { kind: "path", path: input };
}

// Load and validate a template from a remote URL. Throws if the fetch fails or if the data is invalid.
const getTemplateFromUrl = async (templateUrl: URL): Promise<Template> => {
  const response = await fetch(templateUrl, { redirect: "follow" });

  if (!response.ok) {
    throw new ProjgenError(
      `Error: Failed to fetch template from "${templateUrl}". HTTP ${response.status}`,
    );
  }

  blockCrossOriginRedirect(response, templateUrl);

  const templateData = await response.json();
  const validatedTemplate = TemplateSchema.safeParse(templateData);

  if (!validatedTemplate.success) {
    throw new TemplateError(
      `Error: Invalid template data from "${templateUrl}".`,
      { cause: validatedTemplate.error },
    );
  }

  return validatedTemplate.data;
};

export function getTemplateFromFilePath(templatePath: string): Template | null {
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

  const validatedTemplate = TemplateSchema.safeParse(templateData.data);

  if (!validatedTemplate.success) {
    throw new TemplateError(
      `Error: Invalid template file at path "${templatePath}".`,
      { cause: validatedTemplate.error },
    );
  }

  return validatedTemplate.data;
}
