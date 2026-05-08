import z from "zod";
import { stringVariableSchema } from "./string-variable.schema";
import { numberVariableSchema } from "./number-variable.schema";
import { booleanVariableSchema } from "./bool-variable.schema";
import { selectVariableSchema } from "./select-variable.schema";
import { multiSelectVariableSchema } from "./multi-select-variable.schema";

export const VariableSchema = z.discriminatedUnion("type", [
  stringVariableSchema,
  numberVariableSchema,
  booleanVariableSchema,
  selectVariableSchema,
  multiSelectVariableSchema,
]);

export type Variable = z.infer<typeof VariableSchema>;
