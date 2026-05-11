import type { FetchTextPort } from "../application/ports/fetch-text.port";

const fetchTextAdapter: FetchTextPort = async (
  url: string,
): Promise<string> => {
  return fetch(url).then((res) => res.text());
};
