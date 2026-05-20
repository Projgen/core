export interface RunCommandPort {
  (
    command: string,
    args: string[],
    cwd?: string,
    verbosity?: "all" | "warning" | "none",
  ): Promise<void>;
}
