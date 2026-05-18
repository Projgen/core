import type { FetchTextPort } from "../domain/ports/fetch-text.port";

export const fetchTextAdapter: FetchTextPort = async (
  url: string,
): Promise<string> => {
  return fetch(url).then((res) => res.text());
};
