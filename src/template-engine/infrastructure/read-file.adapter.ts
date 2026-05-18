import { ProjgenError } from "@/shared";
import type { ReadFilePort } from "../domain/ports/read-file.port";
import fs from "fs/promises";
export const readFileAdapter: ReadFilePort = async (
  path: string,
): Promise<string> => {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error) {
    throw new ProjgenError(`Error reading file "${path}": ${error}`);
  }
};
