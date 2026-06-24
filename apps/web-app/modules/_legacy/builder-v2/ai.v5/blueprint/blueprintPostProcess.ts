// blueprintPostProcess.ts

import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";
import { generateFreepikImage } from "../image/freepikClient";
import { buildImagePrompt } from "../image/imagePromptBuilder";

export async function hydrateBlueprintImages(
  node: BlueprintNode
): Promise<BlueprintNode> {
  if (node.type === "image" && !node.props?.src) {
    const prompt = buildImagePrompt(node);

    const url = await generateFreepikImage({
      prompt,
      aspectRatio: "16:9",
    });

    return {
      ...node,
      props: {
        ...node.props,
        src: url,
      },
    };
  }

  if (!node.children?.length) return node;

  return {
    ...node,
    children: await Promise.all(
      node.children.map(hydrateBlueprintImages)
    ),
  };
}
