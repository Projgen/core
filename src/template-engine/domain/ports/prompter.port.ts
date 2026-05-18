import type { Arrayify } from "@/shared";

export interface PrompterPort {
  string(
    message: string,
    required?: boolean,
    defaultValue?: string,
  ): Promise<string>;
  number(
    message: string,
    required?: boolean,
    defaultValue?: number,
  ): Promise<number | null>;
  boolean(message: string, defaultValue?: boolean): Promise<boolean>;
  select<T extends string | number>(message: string, options: T[]): Promise<T>;
  multiSelect<T extends string | number>(
    message: string,
    options: Arrayify<T>,
    required?: boolean,
  ): Promise<Arrayify<T>>;
}
