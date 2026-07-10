export type AICommandCapability = Readonly<{
  commandName: string;
  nativeCommandAvailable: boolean;
  canAIPlan: boolean;
  canAIExecute: false;
  requiresTransaction: boolean;
  blockers: string[];
  notes: string[];
}>;

const COMMANDS = [
  "InsertNodeCommand",
  "UpdateNodeCommand",
  "MoveNodeCommand",
  "ReorderNodeCommand",
  "ReparentNodeCommand",
  "DuplicateNodeCommand",
  "DeleteNodeCommand",
  "WrapInContainerCommand",
  "CopyElementCommand",
  "PasteElementCommand",
  "CopyStyleCommand",
  "PasteStyleCommand",
] as const;

export function buildCommandCapabilities(): AICommandCapability[] {
  return COMMANDS.map((commandName) =>
    Object.freeze({
      commandName,
      nativeCommandAvailable: true,
      canAIPlan: true,
      canAIExecute: false as const,
      requiresTransaction: [
        "InsertNodeCommand",
        "MoveNodeCommand",
        "ReorderNodeCommand",
        "ReparentNodeCommand",
        "DuplicateNodeCommand",
        "DeleteNodeCommand",
        "PasteElementCommand",
        "PasteStyleCommand",
      ].includes(commandName),
      blockers: ["BUG-0031", "BUG-0033", "RELEASE_GATE_FAILED"],
      notes: [
        "AI may describe command intent as metadata only.",
        "AI must not execute CommandBus until history, transactions, and release gates are stable.",
      ],
    })
  );
}
