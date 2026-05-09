import type { Registry } from "@/registry-domain";

export type SaveRegistryPort = (registry: Registry) => Promise<void>;
