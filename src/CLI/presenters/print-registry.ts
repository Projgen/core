import type { Registry } from "@/registry-engine/domain";
import { printTable } from "../ui";

export const printRegistryEntries = (
  entries: { alias: string; path: string }[],
) => {
  if (entries.length === 0) {
    console.log("No templates in registry.");
    return;
  }

  printTable(
    entries.map((entry) => [entry.alias, entry.path]),
    ["Alias", "Path"],
  );
};

export const printlinkedRegistries = (linkedRegistries: string[]) => {
  if (linkedRegistries.length === 0) {
    console.log("No linked registries.");
    return;
  }

  printTable(
    linkedRegistries.map((url) => [url]),
    ["Linked Registry URL"],
  );
};

export const printRegistry = (registry: Registry) => {
  console.log(`Registry Version: ${registry.version}`);
  console.log("\nTemplates:");
  printRegistryEntries(registry.templates);
  console.log("\nLinked Registries:");
  printlinkedRegistries(registry.linkedRegistries ?? []);
};
