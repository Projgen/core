import os from "node:os";
import path from "node:path";

export const getAppDataDir = (): string => {
  const home = os.homedir();

  if (process.platform === "win32") {
    return path.join(
      process.env.LOCALAPPDATA || path.join(home, "AppData", "Local"),
      "projgen",
    );
  }

  if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", "projgen");
  }

  return path.join(
    process.env.XDG_DATA_HOME || path.join(home, ".local", "share"),
    "projgen",
  );
};
