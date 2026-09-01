export const DORMANT_DESIGN_TOKENS_KEY = "__buildezDormantDesignTokens";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function archiveDesignTokens(settings: unknown, designTokens: unknown) {
  if (designTokens == null) return asRecord(settings);

  return {
    ...asRecord(settings),
    [DORMANT_DESIGN_TOKENS_KEY]: designTokens,
  };
}

export function restoreDesignTokens(settings: unknown) {
  const currentSettings = asRecord(settings);
  const designTokens = currentSettings[DORMANT_DESIGN_TOKENS_KEY] ?? null;
  const nextSettings = { ...currentSettings };
  delete nextSettings[DORMANT_DESIGN_TOKENS_KEY];

  return {
    designTokens,
    settings: Object.keys(nextSettings).length ? nextSettings : null,
  };
}
