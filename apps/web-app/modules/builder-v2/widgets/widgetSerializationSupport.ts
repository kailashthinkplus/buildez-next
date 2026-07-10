import { buildWidgetCapabilities } from "./widgetCapabilities";

export type WidgetSerializationSupport = Readonly<{
  type: string;
  requirements: readonly string[];
  supportsClipboard: boolean;
  supportsUndoRedo: boolean;
  requiresNativeEditableShape: boolean;
  opaqueOutputAllowed: boolean;
}>;

export function buildWidgetSerializationSupport(): WidgetSerializationSupport[] {
  return buildWidgetCapabilities().map((capability) => ({
    type: String(capability.type),
    requirements: capability.serializationRequirements,
    supportsClipboard: capability.clipboardSupport,
    supportsUndoRedo: capability.undoRedoSupport,
    requiresNativeEditableShape: true,
    opaqueOutputAllowed: false,
  }));
}

export function validateWidgetSerializationSupport(): { valid: boolean; issues: string[] } {
  const issues = buildWidgetSerializationSupport().flatMap((support) => {
    const missing = ["id", "type", "parentId", "children", "props", "style"].filter(
      (field) => !support.requirements.includes(field)
    );
    return missing.map((field) => `${support.type} missing ${field}`);
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
