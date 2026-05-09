import type { GetTemplateInput } from "../dto/get-template.input";
import type { GetTemplateResult } from "../dto/get-template.result";

export const getTemplate =
  async ({}: GetTemplateInput): Promise<GetTemplateResult> => {
    throw new Error("Not implemented");
  };
