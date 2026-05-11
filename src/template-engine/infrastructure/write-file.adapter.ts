import { mkdir, writeFile } from "fs/promises";
import type { WriteFilePort } from "../application/ports/write-file.port";
import { dirname } from "path";

export const writeFileAdapter: WriteFilePort = async (
  path: string,
  content: string,
) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};
