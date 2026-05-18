import { getAppDataDir } from "@/shared";
import path from "path";

export const getRegistryPath = (): string => {
  return path.join(getAppDataDir(), "registry.json");
};
