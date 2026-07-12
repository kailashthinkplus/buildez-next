"use client";

import WidgetFrame from "../sdk/WidgetFrame";
import { useWidget } from "../sdk/useWidget";
import type { BuilderNode } from "../../types/blueprint";
import ProductionWidgetView from "./ProductionWidgetView";
import type { CSSProperties } from "react";

type PremiumWidgetProps = {
  eyebrow?: unknown;
  title?: unknown;
  body?: unknown;
  primaryCta?: unknown;
  secondaryCta?: unknown;
  items?: unknown;
};

export default function PremiumWidget({ node }: { node: BuilderNode }) {
  const { blueprint, props, style } = useWidget<PremiumWidgetProps>(node);
  const normalizedStyle = normalizeBoxShorthand(style);
  const tokens = blueprint?.theme?.tokens as Record<string, any> | undefined;

  return (
    <WidgetFrame nodeId={node.id}>
      <ProductionWidgetView
        type={node.type}
        eyebrow={props.eyebrow}
        title={props.title}
        body={props.body}
        primaryCta={props.primaryCta}
        secondaryCta={props.secondaryCta}
        items={props.items}
        style={normalizedStyle}
        theme={{
          primary: tokens?.colors?.primary ?? "#2563eb",
          primaryContrast: tokens?.colors?.primaryContrast ?? "#ffffff",
          surface: tokens?.colors?.surface ?? "#ffffff",
          surfaceAlt: tokens?.colors?.surfaceAlt ?? "#f1f5f9",
          textPrimary: tokens?.colors?.textPrimary ?? "#0f172a",
          textSecondary: tokens?.colors?.textSecondary ?? "#475569",
          border: tokens?.colors?.border ?? "#dbe3ef",
          accent: tokens?.colors?.accent ?? "#f97316",
          cardRadius: tokens?.radius?.card ?? 12,
          buttonRadius: tokens?.radius?.button ?? 10,
          cardShadow: tokens?.shadow?.card ?? "0 16px 42px rgba(15, 23, 42, 0.08)",
        }}
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
