import { ProjgenError } from "../../shared/errors/projgen-error";

export class UserCancellationError extends ProjgenError {
  constructor() {
    super("Operation cancelled by the user.");
  }
}
