import type { ProjgenError } from "../../shared/errors";

export const printExpectedError = (
  label: string,
  error: ProjgenError,
): void => {
  console.error(`${label}: ${error.message}`);
  if (error.cause) {
    console.error("Cause:", String(error.cause));
  }
};
