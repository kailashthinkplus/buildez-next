"use client";

import { useMemo } from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";
import { getFieldSchemaForNode } from "../schema/fieldRegistry";
import FieldRenderer from "../renderer/FieldRenderer";

export function useInspectorFields(
  node: any,
  group: "content" | "layout" | "style" | "spacing" | "effects" | "advanced"
) {
  const updateNode = useBlueprintStore((s) => s.updateNode);

  return useMemo(() => {
    const fields = getFieldSchemaForNode(node.type, group);
    if (!fields.length) return [];

    return fields.map((field) => (
      <FieldRenderer
        key={field.key}
        field={field}
        value={node.data?.[field.key]}
        onChange={(value) =>
          updateNode(node.id, {
            data: {
              ...node.data,
              [field.key]: value,
            },
          })
        }
      />
    ));
  }, [node, group, updateNode]);
}
