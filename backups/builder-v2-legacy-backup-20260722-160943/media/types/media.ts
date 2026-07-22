export type MediaSource =
  | "UPLOAD"
  | "AI"
  | "STOCK"
  | "ICON";

export type MediaType =
  | "IMAGE"
  | "VIDEO"
  | "SVG"
  | "ICON"
  | "PDF"
  | "AUDIO";

export interface MediaAsset {
  id: string;

  createdAt: string;

  updatedAt: string;

  // File

  url: string;

  filename: string;

  fileHash: string;

  fileSize: number;

  mediaType: MediaType;

  mimeType: string;

  width?: number;

  height?: number;

  // Metadata

  alt?: string;

  title?: string;

  tags: string[];

  // Ownership

  siteId: string;

  uploadedById: string;

  // Usage

  usageCount: number;

  lastUsedAt?: string;

  // Source

  source: MediaSource;

  provider?: string;

  prompt?: string;

  negativePrompt?: string;

  model?: string;

  seed?: number;

  aspectRatio?: string;

  // Preview

  thumbnailUrl?: string;

  blurhash?: string;

  dominantColor?: string;

  // Organization

  isFavorite: boolean;

  folder?: string;

  metadata?: Record<string, unknown>;
}

export interface GenerateImageRequest {
  siteId?: string;
  prompt: string;
  negativePrompt?: string;
  style?: string;
  size?: "square" | "portrait" | "landscape";
  industry?: string;
  numberOfImages?: number;
}
