export type FullscreenBuilderState = Readonly<{
  enabled: boolean;
  focusMode: boolean;
  sidebarsCollapsed: boolean;
  browserFullscreenSupported: boolean;
  escapeExits: boolean;
  persistedPreferenceKey: string;
}>;

export const FULLSCREEN_BUILDER_PREFERENCE_KEY = "buildez.builder.fullscreen.focus";

export function buildFullscreenBuilderState(
  enabled: boolean,
  browserFullscreenSupported = true
): FullscreenBuilderState {
  return {
    enabled,
    focusMode: enabled,
    sidebarsCollapsed: enabled,
    browserFullscreenSupported,
    escapeExits: true,
    persistedPreferenceKey: FULLSCREEN_BUILDER_PREFERENCE_KEY,
  };
}

export function readFullscreenPreference(storage: Pick<Storage, "getItem"> | null | undefined): boolean {
  try {
    return storage?.getItem(FULLSCREEN_BUILDER_PREFERENCE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeFullscreenPreference(
  storage: Pick<Storage, "setItem"> | null | undefined,
  enabled: boolean
): void {
  try {
    storage?.setItem(FULLSCREEN_BUILDER_PREFERENCE_KEY, String(enabled));
  } catch {
    // Preference persistence is non-critical.
  }
}
