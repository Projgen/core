import type { Registry } from "@/registry-domain";

// Returns default registry from file or external registry if URL is provided
export type GetRegistryPort = (registryUrl?: string) => Promise<Registry>;
