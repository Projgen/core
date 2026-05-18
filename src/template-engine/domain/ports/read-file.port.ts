export interface ReadFilePort {
  (path: string): Promise<string>;
}
