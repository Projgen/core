export class ProjgenError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class TemplateError extends ProjgenError {}
export class RegistryError extends ProjgenError {}

export class UserCancellationError extends ProjgenError {
  constructor() {
    super("Operation cancelled by the user.");
  }
}

export const logExpectedError = (label: string, error: ProjgenError): void => {
  console.error(`${label}: ${error.message}`);
  if (error.cause) {
    console.error("Cause:", String(error.cause));
  }
};
