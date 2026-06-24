import {
  RuntimeWriteInput,
  RuntimeReadInput,
} from "./types";

export interface RuntimeStorageAdapter {
  writeSiteSnapshot(input: RuntimeWriteInput): Promise<void>;

  readPage(input: RuntimeReadInput): Promise<{
    html: string;
    contentHash: string;
  } | null>;
}
