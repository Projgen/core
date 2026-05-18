import { tryCatch } from "@/shared";
import type { LoadInternalTemplatePort } from "@/template-service/domain/ports/load-intenal-template.port";
import fs from "fs/promises";

export const loadTemplateFromFileAdapter: LoadInternalTemplatePort = async (
  path: string,
): Promise<unknown | null> => {
  const content = await tryCatch(fs.readFile(path, "utf-8"));
  if (content.error) {
    return null;
  }
  const parsed = JSON.parse(content.data);
  return parsed;
};
