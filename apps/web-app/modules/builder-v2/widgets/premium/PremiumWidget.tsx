"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";
import type { BuilderNode } from "../../types/blueprint";
import PremiumWidgetPreview from "./PremiumWidgetPreview";
import type { CSSProperties } from "react";

type PremiumWidgetProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryCta?: string;
  secondaryCta?: string;
  items?: string[];
};

export default function PremiumWidget({ node }: { node: BuilderNode }) {
  const { props, style } = useWidget<PremiumWidgetProps>(node);
  const normalizedStyle = normalizeBoxShorthand(style);

  return (
    <WidgetFrame nodeId={node.id}>
      <PremiumWidgetPreview
        type={node.type}
        eyebrow={props.eyebrow}
        title={props.title}
        body={props.body}
        primaryCta={props.primaryCta}
        secondaryCta={props.secondaryCta}
        items={props.items}
        style={normalizedStyle}
      />
    </WidgetFrame>
  );
}

function normalizeBoxShorthand(style: Record<string, unknown>): CSSProperties {
  const next = { ...style };
  expandBox(next, "padding");
  expandBox(next, "margin");
  return next as CSSProperties;
}

function expandBox(style: Record<string, unknown>, base: "padding" | "margin") {
  const sides =
    base === "padding"
      ? ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]
      : ["marginTop", "marginRight", "marginBottom", "marginLeft"];
  const value = style[base];

  if (value === undefined || value === null || value === "") return;

  const expanded =
    typeof value === "number"
      ? [value, value, value, value]
      : String(value).trim().split(/\s+/).filter(Boolean);

  const [top, right = top, bottom = top, left = right] = expanded;
  [top, right, bottom, left].forEach((sideValue, index) => {
    const side = sides[index];
    if (style[side] === undefined || style[side] === null || style[side] === "") {
      style[side] = sideValue;
    }
  });

  delete style[base];
}
