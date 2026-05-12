import type { Registry } from "@/registry-engine";

// Returns default registry from file or external registry if URL is provided
export interface GetRegistryPort {
  (registryUrl?: string): Promise<Registry>;
}
