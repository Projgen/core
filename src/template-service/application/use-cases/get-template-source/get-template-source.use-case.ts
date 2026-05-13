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

  // Check for remote url
  if (url?.protocol === "http:" || url?.protocol === "https:") {
    return { kind: "remote-url", source };
  }
  // Check for file url
  if (url?.protocol === "file:") {
    return { kind: "path", source: fileURLToPath(url) };
  }
  // Check for path
  if (
    source.includes("/") ||
    source.includes("\\") ||
    source.endsWith(".json")
  ) {
    return { kind: "path", source };
  }
  // Handle as alias
  const path = await getTemplateSourceFromRegistry(source);

  if (path) {
    return { kind: "path", source: path };
  }
  return { kind: "not-found", source: null };
};
