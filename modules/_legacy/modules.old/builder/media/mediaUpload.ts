// RFC-009 — Upload Engine

import { UploadResult } from "./mediaTypes";

export async function uploadMedia(
  file: File
): Promise<UploadResult> {
  // TODO (perform upload)
  return {
    item: {
      id: "",
      kind: "image",
      url: "",
    },
  };
}
