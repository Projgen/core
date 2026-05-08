// Converts string to URL, returns null if it's not a valid URL
export function parseURL(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}
