import { getRegistryAdapter } from "@/registry-engine";
import { printRegistry } from "../presenters";

export const listCommand = async () => {
  const registry = await getRegistryAdapter();
  printRegistry(registry);
};
