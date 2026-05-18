import { assertSameOriginRedirect } from "@/shared";
import type { LoadExternalTemplatePort } from "@/template-service/domain/ports/load-external-template.port";

export const loadTemplateFromRemoteAdapter: LoadExternalTemplatePort = async (
  url: string,
): Promise<unknown | null> => {
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    return null;
  }

  assertSameOriginRedirect(response, new URL(url));

  const templateData = await response.json();
  return templateData;
};
