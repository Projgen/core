import { ProjgenError } from "../../errors/projgen-error.ts";

// Throws if a fetch response was a redirect to a different origin
export const assertSameOriginRedirect = (
  response: Response,
  originalUrl: URL,
): void => {
  if (!response.redirected) return;

  const finalUrl = new URL(response.url);
  if (finalUrl.origin !== originalUrl.origin) {
    throw new ProjgenError(
      `Error: Template URL "${originalUrl}" redirected to a different origin "${finalUrl}". Refusing to use redirected template.`,
    );
  }
};
