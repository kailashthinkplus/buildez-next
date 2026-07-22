import { createRegressionSpec, assertCondition, assertEqual } from "../helpers/testAssertions";
import {
  FULLSCREEN_BUILDER_PREFERENCE_KEY,
  buildFullscreenBuilderState,
  readFullscreenPreference,
  writeFullscreenPreference,
} from "../../workspace/fullscreenBuilder";

const enabled = buildFullscreenBuilderState(true, true);
const disabled = buildFullscreenBuilderState(false, false);
const storage = new Map<string, string>();
const storageAdapter = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
};
writeFullscreenPreference(storageAdapter, true);

export const fullscreenBuilderSpec = createRegressionSpec({
  id: "workspace/fullscreen-builder",
  title: "Fullscreen Builder metadata and preference baseline",
  bugIds: ["BUG-0013"],
  level: "L2",
  status: "compile-safe",
  runnerRequirement: "Connect to browser fullscreen API once component/browser runner exists.",
  assertions: [
    assertCondition("fullscreen enables focus mode", enabled.focusMode),
    assertCondition("fullscreen collapses sidebars", enabled.sidebarsCollapsed),
    assertCondition("escape exits fullscreen", enabled.escapeExits),
    assertEqual("disabled state is not focus mode", disabled.focusMode, false),
    assertEqual("preference key is stable", enabled.persistedPreferenceKey, FULLSCREEN_BUILDER_PREFERENCE_KEY),
    assertEqual("preference persists", readFullscreenPreference(storageAdapter), true),
  ],
});
