import fs from "fs/promises";

export const fileExists = async (filePath: string) => {
  return await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
};
