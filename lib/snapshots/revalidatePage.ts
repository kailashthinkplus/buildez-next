// /lib/snapshots/revalidatePage.ts
import { revalidateTag } from "next/cache";

export async function revalidatePage(pageId: string) {
  // Your runtime uses tag-based revalidation
  await revalidateTag(`page-${pageId}`);
}
