import type { GetTemplateSourceResult } from "./get-template-source.result";
import type { GetTemplateSourceInput } from "./get-template-source.input";
import { parseURL } from "@/shared";
import { fileURLToPath } from "node:url";

export const getTemplateSource = async ({
  source: raw,
  deps: { getTemplateSourceFromRegistry },
}: GetTemplateSourceInput): Promise<GetTemplateSourceResult> => {
  const source = raw.trim();

  const url = parseURL(source);

  // Check for file url
  if (url?.protocol === "file:") {
    return { kind: "path", source: fileURLToPath(url) };
  }

  const sourceKind = getSourceKind(source);
  if (sourceKind === "remote-url" || sourceKind === "path") {
    return { kind: sourceKind, source };
  }

  // Handle as alias
  const path = await getTemplateSourceFromRegistry(source);
  if (!path) {
    return { kind: "not-found", source: null };
  }
  const pathKind = getSourceKind(path);
  if (pathKind === "remote-url" || pathKind === "path") {
    return { kind: pathKind, source: path };
  }
  return { kind: "not-found", source: null };
};

const getSourceKind = (raw: string): GetTemplateSourceResult["kind"] | null => {
  const source = raw.trim();

  const url = parseURL(source);
  // Check for remote url
  if (url?.protocol === "http:" || url?.protocol === "https:") {
    return "remote-url";
  }
  // Check for file url
  if (url?.protocol === "file:") {
    return "path";
  }
  // Check for path
  if (
    source.includes("/") ||
    source.includes("\\") ||
    source.endsWith(".json")
  ) {
    return "path";
  }
  return null;
};
