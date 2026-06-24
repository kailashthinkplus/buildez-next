"use client";

import MediaPicker from "../../media/components/MediaPicker";
import type { MediaAsset } from "../../media/types/media";
import type { BuilderNode } from "../../types/blueprint";
import { useNodeUpdater } from "../tabs/hooks/useNodeUpdater";

/* ==========================================================
   TYPES
========================================================== */

interface MediaPropertyProps {
  node: BuilderNode;

  siteId: string;

  property: string;

  label: string;
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function MediaProperty({
  node,
  siteId,
  property,
  label,
}: MediaPropertyProps) {
  const { updateProp } = useNodeUpdater();

  function handleSelect(asset: MediaAsset) {
    updateProp(
      node.id,
      property,
      asset.url
    );

    // Future:
    // updateProp(node.id,"mediaId",asset.id);
    // updateProp(node.id,"alt",asset.alt);
    // updateProp(node.id,"title",asset.title);
  }

  return (
    <MediaPicker
      siteId={siteId}
      label={label}
      value={String(node.props?.[property] ?? "")}
      onChange={handleSelect}
    />
  );
}