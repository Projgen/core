import type { Registry } from "@/registry-engine";

export interface SaveRegistryPort {
  (registry: Registry): Promise<void>;
}
