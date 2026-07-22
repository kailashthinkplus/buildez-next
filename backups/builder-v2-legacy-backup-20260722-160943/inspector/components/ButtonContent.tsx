"use client";

import type {
  BuilderNode,
  ButtonProps,
} from "../../types/blueprint";

interface Props {
  node: BuilderNode;
}

const variants = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Outline", value: "outline" },
  { label: "Ghost", value: "ghost" },
];

export default function ButtonContent({
  node,
}: Props) {
  return <div className="p-4 text-sm text-gray-600">Button Content (Placeholder)</div>;
}