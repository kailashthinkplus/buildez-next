export type ProjectFile = Readonly<{
  path: string;
  content: string;
  contentHash: string;
  revision: number;
}>;

export type ProjectFileOperation = Readonly<{
  type: "create" | "update" | "delete" | "rename";
  path: string;
  targetPath?: string;
  contentHash?: string;
}>;

export type ProjectCheckpointSnapshot = Readonly<{
  version: 1;
  revision: number;
  files: ProjectFile[];
}>;
