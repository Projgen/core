export interface FetchTextPort {
  (url: string): Promise<string>;
}
