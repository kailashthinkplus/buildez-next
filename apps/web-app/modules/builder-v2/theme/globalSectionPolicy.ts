export type GlobalSectionKind = "header" | "footer";

export type GlobalSectionPolicy = Readonly<{
  kind: GlobalSectionKind;
  editableAsNativeBuilderNodes: boolean;
  allowOpaqueBlob: boolean;
  allowAIGeneration: boolean;
  ownership: "site-shared";
  requiredModel: "native-builder-structure";
  notes: string[];
}>;

export const HEADER_FOOTER_EDITABLE_POLICY: readonly GlobalSectionPolicy[] = [
  {
    kind: "header",
    editableAsNativeBuilderNodes: false,
    allowOpaqueBlob: false,
    allowAIGeneration: false,
    ownership: "site-shared",
    requiredModel: "native-builder-structure",
    notes: [
      "Header must become an editable native Builder section before AI generation may emit it.",
      "Do not persist opaque header markup blobs as Builder output.",
      "Preview and publish must consume the same shared native header model once implemented.",
    ],
  },
  {
    kind: "footer",
    editableAsNativeBuilderNodes: false,
    allowOpaqueBlob: false,
    allowAIGeneration: false,
    ownership: "site-shared",
    requiredModel: "native-builder-structure",
    notes: [
      "Footer must become an editable native Builder section before AI generation may emit it.",
      "Do not persist opaque footer markup blobs as Builder output.",
      "Preview and publish must consume the same shared native footer model once implemented.",
    ],
  },
] as const;

export function getGlobalSectionPolicy(kind: GlobalSectionKind): GlobalSectionPolicy {
  return HEADER_FOOTER_EDITABLE_POLICY.find((policy) => policy.kind === kind) ?? HEADER_FOOTER_EDITABLE_POLICY[0];
}

export function canEmitGlobalSectionFromAI(kind: GlobalSectionKind): boolean {
  return getGlobalSectionPolicy(kind).allowAIGeneration;
}

export function canUseOpaqueGlobalSection(kind: GlobalSectionKind): boolean {
  return getGlobalSectionPolicy(kind).allowOpaqueBlob;
}

export function validateGlobalSectionOutput(
  kind: GlobalSectionKind,
  output: { opaqueMarkup?: unknown; nativeNodes?: unknown }
): { valid: boolean; reasons: string[] } {
  const policy = getGlobalSectionPolicy(kind);
  const reasons: string[] = [];

  if (output.opaqueMarkup && !policy.allowOpaqueBlob) {
    reasons.push(`${kind} cannot be represented as opaque markup.`);
  }

  if (!output.nativeNodes && policy.editableAsNativeBuilderNodes) {
    reasons.push(`${kind} requires native Builder nodes.`);
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}
