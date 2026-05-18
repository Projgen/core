import path, { dirname } from "path";

import type { ResolveTemplateLocationPort } from "@/registry-engine/domain/ports/resolve-template-location.port";
import { getRegistryPath } from "../get-registry/get-registry-file-path";

export const resolveTemplateLocationAdapter: ResolveTemplateLocationPort = (
  relativePath: string,
  registryUrl?: string,
): string => {
  if (registryUrl) {
    return new URL(relativePath, registryUrl).toString();
  }
  return path.resolve(dirname(getRegistryPath()), relativePath);
};
