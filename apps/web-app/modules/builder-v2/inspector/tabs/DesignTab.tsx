"use client";

import { useState } from "react";
import type { BuilderNode } from "../../types/blueprint";
import ColorPicker from "../components/ColorPicker";
import GoogleFontsPicker from "../components/GoogleFontsPicker";
import ColumnStructurePicker from "../../layout/ColumnStructurePicker";
import {
  DeviceSwitcher,
  Field,
  Section,
  SegmentedInput,
  SelectInput,
  SliderWithInput,
  TextInput,
  getResponsiveValue,
  setResponsiveStyleValue,
  setStyleValue,
  setPropValue,
  type InspectorDevice,
} from "./InspectorControls";

interface DesignTabProps {
  node: BuilderNode;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
  onApplyColumnStructure(id: string, widths: number[]): void;
}

const TEXT_TYPES = new Set(["heading", "text", "button"]);
const LAYOUT_TYPES = new Set(["page", "section", "container", "column", "grid", "footer"]);
const PARENT_CONTAINER_TYPES = new Set(["page", "section", "container"]);
const MEDIA_TYPES = new Set(["image", "video"]);

export default function DesignTab({
  node,
  onUpdateNode,
  onApplyColumnStructure,
}: DesignTabProps) {
  const [device, setDevice] = useState<InspectorDevice>("desktop");
  const [structurePickerOpen, setStructurePickerOpen] = useState(false);
  const style = node.style ?? {};
  const isText = TEXT_TYPES.has(node.type);
  const isLayout = LAYOUT_TYPES.has(node.type);
  const isParentContainer = PARENT_CONTAINER_TYPES.has(node.type);
  const isIcon = node.type === "icon";
  const isMedia = MEDIA_TYPES.has(node.type);
  const isSpacer = node.type === "spacer";
  const isDivider = node.type === "divider";
  const hasPrimaryStyleSection = isText || isLayout || isIcon || isMedia || isSpacer || isDivider;
  const isColumnStructureTarget = ["page", "section", "container", "column"].includes(node.type);
  const columnStructureTargetId =
    node.type === "column" && node.parentId ? node.parentId : node.id;
  const hasDimensionControls = node.type === "container" || node.type === "column";
  const containerWidthMode = String(
    node.props?.container ?? node.props?.widthMode ?? (node.type === "page" ? "full" : "boxed")
  );
  const flexDirection = String(responsiveStyleValue(style.flexDirection, device, node.props?.direction ?? "column"));
  const isRowDirection = flexDirection === "row" || flexDirection === "row-reverse";

  const responsive = (key: string, fallback: unknown = "") =>
    getResponsiveValue(style[key], device, fallback);

  const setResponsive = (key: string, value: unknown) =>
    setResponsiveStyleValue(node, key, value, device, onUpdateNode);

  const setGlobal = (key: string, value: unknown) =>
    setStyleValue(node, key, value, onUpdateNode);

  const setLayoutValues = (values: Record<string, unknown>) => {
    onUpdateNode(node.id, {
      props: {
        ...node.props,
        align: values.alignItems ?? node.props?.align,
        justify: values.justifyContent ?? node.props?.justify,
      },
      style: {
        ...node.style,
        display: "flex",
        ...values,
      },
    });
  };

  const horizontalAlign = isRowDirection
    ? String(style.justifyContent ?? "flex-start")
    : String(style.alignItems ?? "stretch");
  const verticalAlign = isRowDirection
    ? String(style.alignItems ?? "stretch")
    : String(style.justifyContent ?? "flex-start");

  const setHorizontalAlign = (value: string) => {
    setLayoutValues(
      isRowDirection
        ? { justifyContent: value }
        : { alignItems: value }
    );
  };

  const setVerticalAlign = (value: string) => {
    setLayoutValues(
      isRowDirection
        ? { alignItems: value }
        : { justifyContent: value }
    );
  };

  const setWidthPercent = (value: number) => {
    const width = `${value}%`;
    onUpdateNode(node.id, {
      style: {
        ...node.style,
        width,
        ...(node.type === "container"
          ? {
              maxWidth: width,
            }
          : {}),
        ...(node.type === "column"
          ? {
              flex: `0 0 ${width}`,
              maxWidth: width,
            }
          : {}),
      },
    });
  };

  return (
    <div className="space-y-3 pb-8">
      {isLayout && (
        <Section title="Layout" description="Structure and alignment" defaultOpen>
          {isParentContainer && (
            <>
              <Field label="Container width">
                <SegmentedInput
                  value={containerWidthMode}
                  onChange={(value) => {
                    onUpdateNode(node.id, {
                      props: {
                        ...node.props,
                        container: value,
                        widthMode: value,
                      },
                    });
                  }}
                  options={[
                    { value: "full", label: "Full width" },
                    { value: "boxed", label: "Boxed" },
                  ]}
                />
              </Field>

              {containerWidthMode === "boxed" && (
                <Field label="Boxed max width">
                  <TextInput
                    value={node.props?.maxWidth ?? responsive("maxWidth", "1280px")}
                    onChange={(value) => {
                      setPropValue(node, "maxWidth", value, onUpdateNode);
                      setResponsive("maxWidth", value);
                    }}
                    placeholder="1280px"
                  />
                </Field>
              )}
            </>
          )}

          {hasDimensionControls && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Width" hint="%">
                <SliderWithInput
                  value={percentValue(responsive("width", node.type === "column" ? "100%" : "100%"))}
                  onChange={setWidthPercent}
                  min={1}
                  max={100}
                  unit="%"
                />
              </Field>
              <Field label="Min height" hint={device}>
                <SliderWithInput
                  value={responsive("minHeight", node.type === "column" ? 80 : 0)}
                  onChange={(value) => setResponsive("minHeight", value)}
                  min={0}
                  max={1200}
                />
              </Field>
            </div>
          )}

          {isColumnStructureTarget && (
            <button
              type="button"
              onClick={() => setStructurePickerOpen(true)}
              className="flex w-full items-center justify-center rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            >
              Choose column structure
            </button>
          )}

          <Field label="Display">
            <SegmentedInput
              value={responsive("display", style.display ?? "block")}
              onChange={(value) => setResponsive("display", value)}
              options={[
                { value: "block", label: "Block" },
                { value: "flex", label: "Flex" },
                { value: "grid", label: "Grid" },
                { value: "none", label: "Hide" },
              ]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Direction">
              <SelectInput
                value={responsive("flexDirection", style.flexDirection ?? "column")}
                onChange={(value) => setResponsive("flexDirection", value)}
                options={[
                  { value: "row", label: "Row" },
                  { value: "column", label: "Column" },
                  { value: "row-reverse", label: "Row reverse" },
                  { value: "column-reverse", label: "Column reverse" },
                ]}
              />
            </Field>

            <Field label="Wrap">
              <SelectInput
                value={responsive("flexWrap", style.flexWrap ?? "nowrap")}
                onChange={(value) => setResponsive("flexWrap", value)}
                options={[
                  { value: "nowrap", label: "No wrap" },
                  { value: "wrap", label: "Wrap" },
                  { value: "wrap-reverse", label: "Reverse" },
                ]}
              />
            </Field>
          </div>

          <Field label="Horizontal align">
            <SegmentedInput
              value={horizontalAlign}
              onChange={setHorizontalAlign}
              options={[
                { value: "flex-start", label: "Left" },
                { value: "center", label: "Center" },
                { value: "flex-end", label: "Right" },
                { value: "stretch", label: "Stretch" },
              ]}
            />
          </Field>

          <Field label="Vertical align">
            <SegmentedInput
              value={verticalAlign}
              onChange={setVerticalAlign}
              options={[
                { value: "flex-start", label: "Top" },
                { value: "center", label: "Center" },
                { value: "flex-end", label: "Bottom" },
                { value: "stretch", label: "Stretch" },
              ]}
            />
          </Field>

          <Field label="Gap" hint={device}>
            <SliderWithInput
              value={responsive("gap", 16)}
              onChange={(value) => setResponsive("gap", value)}
              min={0}
              max={120}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Align">
              <SelectInput
                value={responsive("alignItems", style.alignItems ?? "stretch")}
                onChange={(value) => setResponsive("alignItems", value)}
                options={[
                  { value: "stretch", label: "Stretch" },
                  { value: "flex-start", label: "Start" },
                  { value: "center", label: "Center" },
                  { value: "flex-end", label: "End" },
                  { value: "baseline", label: "Baseline" },
                ]}
              />
            </Field>

            <Field label="Justify">
              <SelectInput
                value={responsive("justifyContent", style.justifyContent ?? "flex-start")}
                onChange={(value) => setResponsive("justifyContent", value)}
                options={[
                  { value: "flex-start", label: "Start" },
                  { value: "center", label: "Center" },
                  { value: "flex-end", label: "End" },
                  { value: "space-between", label: "Between" },
                  { value: "space-around", label: "Around" },
                  { value: "space-evenly", label: "Evenly" },
                ]}
              />
            </Field>
          </div>

          <Field label="Grid columns">
            <TextInput
              value={responsive("gridTemplateColumns", style.gridTemplateColumns ?? "")}
              onChange={(value) => setResponsive("gridTemplateColumns", value)}
              placeholder="repeat(3, 1fr)"
            />
          </Field>
        </Section>
      )}

      {isText && (
        <Section title="Typography" description="Font, size and text styling" defaultOpen>
          {node.type === "heading" && (
            <Field label="Heading preset">
              <SegmentedInput
                value={String(node.props?.level ?? "h2")}
                onChange={(value) => {
                  const sizes: Record<string, number> = { h1: 56, h2: 40, h3: 28 };
                  onUpdateNode(node.id, {
                    props: { ...node.props, level: value },
                    style: {
                      ...node.style,
                      fontSize: {
                        ...(typeof node.style?.fontSize === "object" ? node.style.fontSize : {}),
                        [device]: sizes[value] ?? Number(responsive("fontSize", 32)),
                      },
                    },
                  });
                }}
                options={[
                  { value: "h1", label: "H1" },
                  { value: "h2", label: "H2" },
                  { value: "h3", label: "H3" },
                ]}
              />
            </Field>
          )}

          <Field label="Font family">
            <GoogleFontsPicker
              value={String(style.fontFamily ?? "system-ui")}
              onChange={(font) => setGlobal("fontFamily", font)}
            />
          </Field>

          <Field label="Font size" hint={device}>
            <SliderWithInput
              value={responsive("fontSize", node.type === "heading" ? 40 : 16)}
              onChange={(value) => setResponsive("fontSize", value)}
              min={8}
              max={120}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight">
              <SelectInput
                value={style.fontWeight ?? 400}
                onChange={(value) => setGlobal("fontWeight", Number(value))}
                options={[
                  { value: "300", label: "Light" },
                  { value: "400", label: "Regular" },
                  { value: "500", label: "Medium" },
                  { value: "600", label: "Semibold" },
                  { value: "700", label: "Bold" },
                  { value: "800", label: "Extra bold" },
                ]}
              />
            </Field>
            <Field label="Line height">
              <SliderWithInput
                value={style.lineHeight ?? 1.4}
                onChange={(value) => setGlobal("lineHeight", value)}
                min={0.8}
                max={3}
                step={0.1}
                unit=""
              />
            </Field>
          </div>

          <Field label="Alignment">
            <SegmentedInput
              value={style.textAlign ?? "left"}
              onChange={(value) => setGlobal("textAlign", value)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
                { value: "justify", label: "Justify" },
              ]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Transform">
              <SelectInput
                value={style.textTransform ?? "none"}
                onChange={(value) => setGlobal("textTransform", value)}
                options={[
                  { value: "none", label: "None" },
                  { value: "uppercase", label: "Uppercase" },
                  { value: "lowercase", label: "Lowercase" },
                  { value: "capitalize", label: "Capitalize" },
                ]}
              />
            </Field>
            <Field label="Decoration">
              <SelectInput
                value={style.textDecoration ?? "none"}
                onChange={(value) => setGlobal("textDecoration", value)}
                options={[
                  { value: "none", label: "None" },
                  { value: "underline", label: "Underline" },
                  { value: "line-through", label: "Strike" },
                ]}
              />
            </Field>
          </div>

          <Field label="Letter spacing">
            <SliderWithInput
              value={style.letterSpacing ?? 0}
              onChange={(value) => setGlobal("letterSpacing", value)}
              min={0}
              max={12}
              step={0.1}
            />
          </Field>
        </Section>
      )}

      {node.type === "icon" && (
        <Section title="Icon" description="Size, color and background" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon size" hint={device}>
              <SliderWithInput
                value={responsive("fontSize", 24)}
                onChange={(value) => setResponsive("fontSize", value)}
                min={8}
                max={120}
              />
            </Field>
            <Field label="Box size" hint={device}>
              <SliderWithInput
                value={responsive("width", 48)}
                onChange={(value) => {
                  setResponsive("width", value);
                  setResponsive("height", value);
                }}
                min={16}
                max={180}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Padding" hint={device}>
              <SliderWithInput
                value={responsive("padding", 8)}
                onChange={(value) => setResponsive("padding", value)}
                min={0}
                max={48}
              />
            </Field>
            <Field label="Radius" hint={device}>
              <SliderWithInput
                value={responsive("borderRadius", 12)}
                onChange={(value) => setResponsive("borderRadius", value)}
                min={0}
                max={80}
              />
            </Field>
          </div>

          <Field label="Icon color">
            <ColorPicker
              value={String(style.color ?? "#0f172a")}
              onChange={(color) => setGlobal("color", color)}
            />
          </Field>
          <Field label="Background">
            <ColorPicker
              value={String(style.backgroundColor ?? "transparent")}
              onChange={(color) => setGlobal("backgroundColor", color)}
            />
          </Field>
        </Section>
      )}

      {isMedia && (
        <Section title="Media" description="Fit and aspect ratio" defaultOpen>
          <Field label="Object fit">
            <SegmentedInput
              value={style.objectFit ?? "cover"}
              onChange={(value) => setGlobal("objectFit", value)}
              options={[
                { value: "cover", label: "Cover" },
                { value: "contain", label: "Contain" },
                { value: "fill", label: "Fill" },
                { value: "none", label: "None" },
              ]}
            />
          </Field>
          <Field label="Object position">
            <SelectInput
              value={style.objectPosition ?? "center center"}
              onChange={(value) => setGlobal("objectPosition", value)}
              options={[
                { value: "center center", label: "Center" },
                { value: "top center", label: "Top" },
                { value: "bottom center", label: "Bottom" },
                { value: "center left", label: "Left" },
                { value: "center right", label: "Right" },
              ]}
            />
          </Field>
          <Field label="Aspect ratio">
            <SelectInput
              value={style.aspectRatio ?? ""}
              onChange={(value) => setGlobal("aspectRatio", value || undefined)}
              options={[
                { value: "", label: "Auto" },
                { value: "1 / 1", label: "Square" },
                { value: "4 / 3", label: "Standard" },
                { value: "16 / 9", label: "Widescreen" },
                { value: "21 / 9", label: "Cinematic" },
                { value: "9 / 16", label: "Portrait" },
              ]}
            />
          </Field>
        </Section>
      )}

      {isSpacer && (
        <Section title="Spacer" description="Responsive width and height" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Width" hint={device}>
              <TextInput
                value={responsive("width", "100%")}
                onChange={(value) => setResponsive("width", value)}
                placeholder="100%"
              />
            </Field>
            <Field label="Height" hint={device}>
              <SliderWithInput
                value={responsive("height", 24)}
                onChange={(value) => setResponsive("height", value)}
                min={0}
                max={320}
              />
            </Field>
          </div>
        </Section>
      )}

      {isDivider && (
        <Section title="Divider" description="Line width, style and color" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Line width" hint={device}>
              <TextInput
                value={responsive("width", "100%")}
                onChange={(value) => setResponsive("width", value)}
                placeholder="100%"
              />
            </Field>
            <Field label="Thickness" hint={device}>
              <SliderWithInput
                value={responsive("borderTopWidth", responsive("height", 1))}
                onChange={(value) => {
                  setResponsive("borderTopWidth", value);
                  setResponsive("height", value);
                }}
                min={1}
                max={24}
              />
            </Field>
          </div>
          <Field label="Line style">
            <SegmentedInput
              value={style.borderTopStyle ?? "solid"}
              onChange={(value) => setGlobal("borderTopStyle", value)}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
                { value: "double", label: "Double" },
              ]}
            />
          </Field>
          <Field label="Line color">
            <ColorPicker
              value={String(style.borderTopColor ?? style.color ?? "#cbd5e1")}
              onChange={(color) => {
                setGlobal("borderTopColor", color);
                setGlobal("color", color);
              }}
            />
          </Field>
        </Section>
      )}

      <Section title="Size" description="Width, height and overflow" defaultOpen={!hasPrimaryStyleSection}>
        <div className="grid grid-cols-2 gap-3">
          {["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"].map((key) => (
            <Field key={key} label={labelize(key)} hint={device}>
              <TextInput
                value={responsive(key, "")}
                onChange={(value) => setResponsive(key, value)}
                placeholder={key.includes("Width") || key === "width" ? "100%" : "auto"}
              />
            </Field>
          ))}
        </div>
        <Field label="Overflow">
          <SegmentedInput
            value={responsive("overflow", style.overflow ?? "visible")}
            onChange={(value) => setResponsive("overflow", value)}
            options={[
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
              { value: "auto", label: "Auto" },
              { value: "scroll", label: "Scroll" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Spacing" description="Padding and margin">
        <BoxControls
          title="Padding"
          keys={["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]}
          responsive={responsive}
          setResponsive={setResponsive}
          device={device}
        />
        <BoxControls
          title="Margin"
          keys={["marginTop", "marginRight", "marginBottom", "marginLeft"]}
          responsive={responsive}
          setResponsive={setResponsive}
          device={device}
        />
      </Section>

      <Section title="Background">
        <Field label="Background color">
          <ColorPicker
            value={String(style.backgroundColor ?? "transparent")}
            onChange={(color) => setGlobal("backgroundColor", color)}
          />
        </Field>
        <Field label="Text color">
          <ColorPicker
            value={String(style.color ?? "#0f172a")}
            onChange={(color) => setGlobal("color", color)}
          />
        </Field>
        <Field label="Background image">
          <TextInput
            value={backgroundImageUrl(style.backgroundImage)}
            onChange={(value) => setGlobal("backgroundImage", value ? `url("${value}")` : "")}
            placeholder="https://..."
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size">
            <SelectInput
              value={style.backgroundSize ?? "cover"}
              onChange={(value) => setGlobal("backgroundSize", value)}
              options={[
                { value: "cover", label: "Cover" },
                { value: "contain", label: "Contain" },
                { value: "auto", label: "Auto" },
                { value: "100% 100%", label: "Stretch" },
              ]}
            />
          </Field>
          <Field label="Repeat">
            <SelectInput
              value={style.backgroundRepeat ?? "no-repeat"}
              onChange={(value) => setGlobal("backgroundRepeat", value)}
              options={[
                { value: "no-repeat", label: "No repeat" },
                { value: "repeat", label: "Repeat" },
                { value: "repeat-x", label: "Repeat X" },
                { value: "repeat-y", label: "Repeat Y" },
              ]}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position">
            <SelectInput
              value={style.backgroundPosition ?? "center center"}
              onChange={(value) => setGlobal("backgroundPosition", value)}
              options={[
                { value: "center center", label: "Center" },
                { value: "top center", label: "Top" },
                { value: "bottom center", label: "Bottom" },
                { value: "center left", label: "Left" },
                { value: "center right", label: "Right" },
              ]}
            />
          </Field>
          <Field label="Attachment">
            <SelectInput
              value={style.backgroundAttachment ?? "scroll"}
              onChange={(value) => setGlobal("backgroundAttachment", value)}
              options={[
                { value: "scroll", label: "Scroll" },
                { value: "fixed", label: "Fixed" },
                { value: "local", label: "Local" },
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="Border & Shadow">
        <Field label="Border">
          <TextInput
            value={style.border ?? ""}
            onChange={(value) => setGlobal("border", value)}
            placeholder="1px solid #e5e7eb"
          />
        </Field>
        <Field label="Radius" hint={device}>
          <SliderWithInput
            value={responsive("borderRadius", 0)}
            onChange={(value) => setResponsive("borderRadius", value)}
            min={0}
            max={80}
          />
        </Field>
        <Field label="Shadow">
          <SelectInput
            value={style.boxShadow ?? "none"}
            onChange={(value) => setGlobal("boxShadow", value)}
            options={[
              { value: "none", label: "None" },
              { value: "0 1px 2px rgba(15, 23, 42, 0.12)", label: "Subtle" },
              { value: "0 12px 30px rgba(15, 23, 42, 0.16)", label: "Soft" },
              { value: "0 24px 60px rgba(15, 23, 42, 0.22)", label: "Elevated" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Effects">
        <Field label="Transform">
          <TextInput
            value={responsive("transform", style.transform ?? "")}
            onChange={(value) => setResponsive("transform", value)}
            placeholder="translateY(0) scale(1)"
          />
        </Field>
        <Field label="Transition">
          <TextInput
            value={style.transition ?? ""}
            onChange={(value) => setGlobal("transition", value)}
            placeholder="all 200ms ease"
          />
        </Field>
        <Field label="Opacity">
          <SliderWithInput
            value={style.opacity ?? 1}
            onChange={(value) => setGlobal("opacity", value)}
            min={0}
            max={1}
            step={0.05}
            unit=""
          />
        </Field>
      </Section>

      <Section title="Position" description="Position and stacking">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position">
            <SelectInput
              value={style.position ?? "static"}
              onChange={(value) => setGlobal("position", value)}
              options={[
                { value: "static", label: "Static" },
                { value: "relative", label: "Relative" },
                { value: "absolute", label: "Absolute" },
                { value: "fixed", label: "Fixed" },
                { value: "sticky", label: "Sticky" },
              ]}
            />
          </Field>
          <Field label="Z-index">
            <TextInput
              value={style.zIndex ?? ""}
              onChange={(value) => setGlobal("zIndex", value === "" ? undefined : Number(value))}
              placeholder="0"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["top", "right", "bottom", "left"].map((key) => (
            <Field key={key} label={labelize(key)} hint={device}>
              <TextInput
                value={responsive(key, "")}
                onChange={(value) => setResponsive(key, value)}
                placeholder="auto"
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Device" description="Choose the breakpoint to edit">
        <DeviceSwitcher value={device} onChange={setDevice} />
      </Section>

      <ColumnStructurePicker
        open={structurePickerOpen}
        onClose={() => setStructurePickerOpen(false)}
        onSelect={(columns) => {
          const widths = Array.isArray(columns)
            ? columns
            : Array.from({ length: columns }, () => 100 / columns);
          onApplyColumnStructure(columnStructureTargetId, widths);
          setStructurePickerOpen(false);
        }}
      />
    </div>
  );
}

function responsiveStyleValue(value: unknown, device: InspectorDevice, fallback: unknown) {
  return getResponsiveValue(value, device, fallback);
}

function percentValue(value: unknown) {
  if (typeof value === "number") return Math.max(1, Math.min(100, value));
  if (typeof value !== "string") return 100;
  const match = value.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Number(match[1]) : 100;
}

function BoxControls({
  title,
  keys,
  responsive,
  setResponsive,
  device,
}: {
  title: string;
  keys: string[];
  responsive(key: string, fallback?: unknown): unknown;
  setResponsive(key: string, value: unknown): void;
  device: InspectorDevice;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-white/65">
        {title} <span className="font-normal text-white/35">({device})</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((key, index) => (
          <TextInput
            key={key}
            value={responsive(key, "")}
            onChange={(value) => setResponsive(key, value)}
            placeholder={["T", "R", "B", "L"][index]}
          />
        ))}
      </div>
    </div>
  );
}

function labelize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function backgroundImageUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const match = value.match(/^url\((["']?)(.*?)\1\)$/);
  return match?.[2] ?? value;
}
