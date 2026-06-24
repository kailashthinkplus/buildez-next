"use client";

import type { BuilderNode } from "../../types/blueprint";

import TextProperty from "../properties/TextProperty";
import SelectProperty from "../properties/SelectProperty";

/* ==========================================================
   TYPES
========================================================== */

interface HeadingContentProps {
  node: BuilderNode;
}

const headingLevels = [
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
];

/* ==========================================================
   COMPONENT
========================================================== */

export default function HeadingContent({
  node,
}: HeadingContentProps) {
  return (
    <div className="space-y-6">

      <TextProperty
        node={node}
        property="text"
        label="Heading"
        placeholder="Enter heading..."
      />

      <SelectProperty
        node={node}
        property="level"
        label="Heading Level"
        options={headingLevels}
      />

    </div>
  );
}