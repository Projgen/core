import type { Arrayify } from "@/shared";

export type StringPromptParams = {
  message: string;
  required?: boolean | undefined;
  defaultValue?: string | undefined;
};

export type NumberPromptParams = {
  message: string;
  required?: boolean | undefined;
  defaultValue?: number | undefined;
};

export type BooleanPromptParams = {
  message: string;
  defaultValue?: boolean | undefined;
};

export type SelectOption<TValue> = {
  value: TValue;
  label?: string;
  description?: string;
  shortLabel?: string;
  disabled?: boolean | string;
};

export type SelectPromptParams<TValue> = {
  message: string;
  options: readonly SelectOption<TValue>[];
  initialValue?: TValue;
};

export type MultiSelectPromptParams<TValue> = {
  message: string;
  options: readonly SelectOption<TValue>[];
  required?: boolean;
};

export interface Prompter {
  promptForString(params: StringPromptParams): Promise<string>;
  promptForNumber(params: NumberPromptParams): Promise<number | null>;
  promptForBoolean(params: BooleanPromptParams): Promise<boolean>;
  promptForSelect<TValue>(params: SelectPromptParams<TValue>): Promise<TValue>;
  promptForMultiSelect<TValue>(
    params: MultiSelectPromptParams<TValue>,
  ): Promise<Arrayify<TValue>>;
}
