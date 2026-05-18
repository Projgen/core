export interface GetTemplateSourceFromRegistryPort {
  (alias: string): Promise<string | null>;
}
