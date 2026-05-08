import path from "path";

import type { ResolveTemplateLocationPort } from "@/registry-engine/application";
import { getRegistryPath } from "../get-registry/get-registry-file-path";

export const ResolveTemplateLocationAdapter: ResolveTemplateLocationPort = (
  relativePath: string,
  registryUrl?: string,
): string => {
  if (registryUrl) {
    return new URL(relativePath, registryUrl).toString();
  }
  return path.resolve(getRegistryPath(), relativePath);
};
