"use client";

import React from "react";
import {
  ContentField,
  StyleField,
  LayoutField,
  InspectorSchema,
} from "./schemaTypes";

import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs mb-1 text-white/60 select-none">{children}</div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
      {children}
    </div>
  );
}

// -----------------------
// BASIC INPUTS
// -----------------------

function TextInput({ value, onChange }: any) {
  return (
    <input
      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/40"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextareaInput({ value, onChange }) {
  return (
    <textarea
      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/40"
      rows={4}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NumberInput({ value, min, max, onChange }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/40"
    />
  );
}

function ColorInput({ value, onChange }) {
  return (
    <input
      type="color"
      value={value || "#000000"}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 rounded bg-transparent cursor-pointer"
    />
  );
}

function SelectInput({ value, options, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0F1118] text-white">
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ========================================================================
// CONTENT FIELD RENDERER
// ========================================================================

function RenderContentField({ field, node, update }) {
  const value = node.props?.[field.key];

  switch (field.type) {
    case "text":
      return (
        <>
          <Label>{field.label}</Label>
          <TextInput value={value} onChange={(v) => update({ [field.key]: v })} />
        </>
      );

    case "textarea":
      return (
        <>
          <Label>{field.label}</Label>
          <TextareaInput
            value={value}
            onChange={(v) => update({ [field.key]: v })}
          />
        </>
      );

    case "number":
      return (
        <>
          <Label>{field.label}</Label>
          <NumberInput
            value={value}
            min={field.min}
            max={field.max}
            onChange={(v) => update({ [field.key]: v })}
          />
        </>
      );

    case "select":
      return (
        <>
          <Label>{field.label}</Label>
          <SelectInput
            value={value}
            options={field.options}
            onChange={(v) => update({ [field.key]: v })}
          />
        </>
      );

    case "repeater":
      return <RepeaterField field={field} node={node} update={update} />;

    default:
      return null;
  }
}

// ========================================================================
// STYLE FIELD RENDERER
// ========================================================================

function RenderStyleField({ field, node, updateStyle }) {
  const style = node.props?.style || {};

  switch (field.type) {
    case "color":
      return (
        <>
          <Label>{field.label}</Label>
          <ColorInput
            value={style[field.key]}
            onChange={(v) => updateStyle({ [field.key]: v })}
          />
        </>
      );

    case "background":
      return (
        <Card>
          <Label>{field.label}</Label>
          <ColorInput
            value={style.backgroundColor}
            onChange={(v) => updateStyle({ backgroundColor: v })}
          />
        </Card>
      );

    case "gradient":
      return (
        <Card>
          <Label>{field.label}</Label>
          <TextInput
            value={style.gradient || ""}
            onChange={(v) => updateStyle({ gradient: v })}
          />
        </Card>
      );

    case "backgroundImage":
      return (
        <Card>
          <Label>{field.label}</Label>
          <TextInput
            value={style.backgroundImage || ""}
            onChange={(v) => updateStyle({ backgroundImage: v })}
          />
        </Card>
      );

    case "typography":
      return (
        <Card>
          <Label>Typography</Label>

          <div className="space-y-4">
            <div>
              <Label>Font Size</Label>
              <NumberInput
                value={style.fontSize}
                onChange={(v) => updateStyle({ fontSize: v })}
              />
            </div>

            <div>
              <Label>Font Weight</Label>
              <SelectInput
                value={style.fontWeight}
                options={[
                  { label: "100", value: "100" },
                  { label: "200", value: "200" },
                  { label: "300", value: "300" },
                  { label: "400 (Normal)", value: "400" },
                  { label: "500", value: "500" },
                  { label: "600", value: "600" },
                  { label: "700 (Bold)", value: "700" },
                  { label: "800", value: "800" },
                ]}
                onChange={(v) => updateStyle({ fontWeight: v })}
              />
            </div>

            <div>
              <Label>Letter Spacing</Label>
              <NumberInput
                value={style.letterSpacing}
                onChange={(v) => updateStyle({ letterSpacing: v })}
              />
            </div>

            <div>
              <Label>Line Height</Label>
              <NumberInput
                value={style.lineHeight}
                onChange={(v) => updateStyle({ lineHeight: v })}
              />
            </div>
          </div>
        </Card>
      );

    default:
      return null;
  }
}

// ========================================================================
// LAYOUT FIELD RENDERER (A + B)
// ========================================================================

function RenderLayoutField({ field, node, updateLayout }) {
  const layout = node.props?.layout || {};
  const spacing = node.props?.spacing || {};

  switch (field.type) {
    case "layout-flex":
      return (
        <Card>
          <Label>{field.label}</Label>

          <div className="space-y-4 mt-2">
            <div>
              <Label>Justify</Label>
              <SelectInput
                value={layout.justify || "start"}
                options={[
                  { label: "Start", value: "start" },
                  { label: "Center", value: "center" },
                  { label: "End", value: "end" },
                  { label: "Space Between", value: "between" },
                  { label: "Space Around", value: "around" },
                  { label: "Space Evenly", value: "evenly" },
                ]}
                onChange={(v) => updateLayout({ justify: v })}
              />
            </div>

            <div>
              <Label>Align</Label>
              <SelectInput
                value={layout.align || "stretch"}
                options={[
                  { label: "Stretch", value: "stretch" },
                  { label: "Start", value: "start" },
                  { label: "Center", value: "center" },
                  { label: "End", value: "end" },
                ]}
                onChange={(v) => updateLayout({ align: v })}
              />
            </div>

            <div>
              <Label>Flex Direction</Label>
              <SelectInput
                value={layout.direction || "column"}
                options={[
                  { label: "Row", value: "row" },
                  { label: "Column", value: "column" },
                  { label: "Row Reverse", value: "row-reverse" },
                  { label: "Column Reverse", value: "column-reverse" },
                ]}
                onChange={(v) => updateLayout({ direction: v })}
              />
            </div>

            <div>
              <Label>Gap</Label>
              <NumberInput
                value={layout.gap ?? 0}
                onChange={(v) => updateLayout({ gap: v })}
              />
            </div>
          </div>
        </Card>
      );

    case "spacing":
      return (
        <Card>
          <Label>Spacing</Label>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <Label>Padding Top</Label>
              <NumberInput
                value={spacing.padding?.top ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      padding: { ...spacing.padding, top: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Padding Bottom</Label>
              <NumberInput
                value={spacing.padding?.bottom ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      padding: { ...spacing.padding, bottom: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Padding Left</Label>
              <NumberInput
                value={spacing.padding?.left ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      padding: { ...spacing.padding, left: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Padding Right</Label>
              <NumberInput
                value={spacing.padding?.right ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      padding: { ...spacing.padding, right: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Margin Top</Label>
              <NumberInput
                value={spacing.margin?.top ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      margin: { ...spacing.margin, top: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Margin Bottom</Label>
              <NumberInput
                value={spacing.margin?.bottom ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      margin: { ...spacing.margin, bottom: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Margin Left</Label>
              <NumberInput
                value={spacing.margin?.left ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      margin: { ...spacing.margin, left: v },
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Margin Right</Label>
              <NumberInput
                value={spacing.margin?.right ?? 0}
                onChange={(v) =>
                  updateLayout({
                    spacing: {
                      ...spacing,
                      margin: { ...spacing.margin, right: v },
                    },
                  })
                }
              />
            </div>
          </div>
        </Card>
      );

    default:
      return null;
  }
}

// ========================================================================
// MAIN RENDERER
// ========================================================================

export function InspectorRenderer({ node, schema }) {
  const updateNodeProps = useBlueprintStore((s) => s.updateNodeProps);

  if (!node || !schema) return null;

  const updateContent = (d) => updateNodeProps(node.id, d);

  const updateStyleFn = (d) =>
    updateNodeProps(node.id, {
      style: { ...(node.props?.style || {}), ...d },
    });

  const updateLayoutFn = (d) =>
    updateNodeProps(node.id, {
      layout: { ...(node.props?.layout || {}), ...d },
      spacing: { ...(node.props?.spacing || {}), ...d.spacing },
    });

  return (
    <div className="space-y-8">
      {/* CONTENT */}
      {schema.content?.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-3">
            Content
          </div>
          <Card>
            {schema.content.map((f, i) => (
              <div key={i} className="mb-4">
                <RenderContentField field={f} node={node} update={updateContent} />
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* STYLES */}
      {schema.styles?.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-3">
            Styles
          </div>
          <Card>
            {schema.styles.map((f, i) => (
              <div key={i} className="mb-4">
                <RenderStyleField
                  field={f}
                  node={node}
                  updateStyle={updateStyleFn}
                />
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* LAYOUT */}
      {schema.layout?.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-3">
            Layout
          </div>
          {schema.layout.map((f, i) => (
            <div key={i} className="mb-4">
              <RenderLayoutField
                field={f}
                node={node}
                updateLayout={updateLayoutFn}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
