// RFC-009 — Media Fetch + Resolve Logic

import { MediaItem } from "./mediaTypes";

export async function fetchMedia(): Promise<MediaItem[]> {
  // TODO (fetch from backend)
  return [];
}

export function getMediaById(
  items: MediaItem[],
  id: string
): MediaItem | null {
  // TODO (find specific item)
  return null;
}
