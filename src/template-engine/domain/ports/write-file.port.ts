export interface WriteFilePort {
  (path: string, content: string): Promise<void>;
}
