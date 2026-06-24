export type MediaKind = "image" | "video" | "svg" | "file";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  url: string;
  width?: number;
  height?: number;
  size?: number;
  mime?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface UploadResult {
  item: MediaItem;
}
