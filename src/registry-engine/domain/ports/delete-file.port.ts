export interface DeleteFilePort {
  (filePath: string): Promise<void>;
}
