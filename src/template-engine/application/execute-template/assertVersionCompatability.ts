import { TemplateError } from "@/template-engine";

export const assertTemplateEngineCompatibility = (
  version: string,
  versionToMatch: string,
): void => {
  const [major = NaN, minor = NaN] = versionToMatch.split(".").map(Number);
  const [templateMajor = NaN, templateMinor = NaN] = version
    .split(".")
    .map(Number);

  if (
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    Number.isNaN(templateMajor) ||
    Number.isNaN(templateMinor)
  ) {
    throw new TemplateError(
      `Invalid template engine version format. Template requires version ${version}, but current version is ${versionToMatch}.`,
    );
  }

  if (templateMajor !== major || templateMinor > minor) {
    throw new TemplateError(
      `Incompatible template engine version. Template requires version ${version}, but current version is ${versionToMatch}.`,
    );
  }
};