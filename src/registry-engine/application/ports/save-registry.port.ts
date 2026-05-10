import type { Registry } from "@/registry-engine/domain";

export type SaveRegistryPort = (registry: Registry) => Promise<void>;
