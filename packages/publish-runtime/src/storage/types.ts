export type RuntimePageAsset = {
  slug: string;
  html: string;
  contentHash: string;
};

export type RuntimeWriteInput = {
  siteId: string;
  snapshotId: string;
  pages: RuntimePageAsset[];
};

export type RuntimeReadInput = {
  siteId: string;
  slug: string;
};
