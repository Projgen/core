export interface RunCommandPort {
  (command: string, args: string[], cwd?: string): Promise<void>;
}
