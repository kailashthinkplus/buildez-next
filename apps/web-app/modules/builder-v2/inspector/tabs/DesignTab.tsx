"use client";

import { useEffect, useState } from "react";
import { Columns3, Sparkles, Upload } from "lucide-react";
import type {
  BuilderBlueprint,
  BuilderNode,
} from "../../types/blueprint";
import ColorPicker from "../components/ColorPicker";
import GoogleFontsPicker from "../components/GoogleFontsPicker";
import ColumnStructurePicker from "../../layout/ColumnStructurePicker";
import MediaPicker from "../../media/components/MediaPicker";
import {
  getContainerWidthModeProps,
  getEffectiveContainerMaxWidth,
} from "../utils/containerWidth";
import {
  resetResponsiveOverride,
  isResponsiveValue,
  setResponsiveOverride,
} from "../../core/responsive";
import { useCanvasStore } from "../../store/useCanvasStore";
import {
  DeviceSwitcher,
  Field,
  Section,
  AlignmentInput,
  SegmentedInput,
  SelectInput,
  SliderWithInput,
  TextInput,
  UnitInput,
  getResponsiveValue,
  getResponsiveResolution,
  setResponsiveStyleValue,
  setStyleValue,
  clearResponsiveStyleValue,
  removeStyleProperty,
  type InspectorDevice,
} from "./InspectorControls";

interface DesignTabProps {
  node: BuilderNode;
  blueprint: BuilderBlueprint;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
  onApplyColumnStructure(id: string, widths: number[]): void;
  siteId: string;
}

const TEXT_TYPES = new Set(["heading", "text", "button"]);
const LAYOUT_TYPES = new Set(["page", "section", "container", "column", "grid", "footer"]);
const PARENT_CONTAINER_TYPES = new Set(["page", "section", "container"]);
const MEDIA_TYPES = new Set(["image", "video"]);
const PREMIUM_TYPES = new Set([
  "smartHeader", "hero", "leadForm", "contactForm", "cardGrid", "featureGrid",
  "features", "galleryLightbox", "gallery", "masonryGallery", "faq", "accordion",
  "testimonials", "pricing", "offerGrid", "floatingWhatsApp", "locationMap",
  "smartFooter", "cta", "tabs", "statsCounter", "logoCloud", "team", "portfolio",
  "timeline", "socialLinks", "carousel", "beforeAfter", "table", "countdown",
  "codeBlock", "embed", "blogGrid", "postList", "categoryList", "popupModal",
]);
const SIZE_UNITS = [
  "px",
  "%",
  "rem",
  "em",
  "vw",
  "vh",
  "auto",
  "fit-content",
  "min-content",
  "max-content",
] as const;

export default function DesignTab({
  node,
  blueprint,
  onUpdateNode,
  onApplyColumnStructure,
  siteId,
}: DesignTabProps) {
  const device = useCanvasStore((state) => state.device);
  const setDevice = useCanvasStore((state) => state.setDevice);
  const [structurePickerOpen, setStructurePickerOpen] = useState(false);
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [backgroundError, setBackgroundError] = useState("");
  const style = node.style ?? {};
  const parentNode = node.parentId
  ? blueprint.nodes[node.parentId]
  : undefined;

const siblingColumnCount =
  parentNode?.type === "container"
    ? Math.max(
        1,
        (parentNode.children ?? []).filter(
          (childId) => blueprint.nodes[childId]?.type === "column"
        ).length
      )
    : 1;

const defaultColumnWidth = `${100 / siblingColumnCount}%`;
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

  const responsiveResolution = (key: string, fallback: unknown = "") =>
    getResponsiveResolution(style[key], device, fallback);

  const setResponsive = (key: string, value: unknown) =>
    setResponsiveStyleValue(node, key, value, device, onUpdateNode);
  const clearResponsive = (key: string) =>
    clearResponsiveStyleValue(node, key, device, onUpdateNode);

  const setResponsiveValues = (values: Record<string, unknown>) => {
    const nextStyle: Record<string, unknown> = { ...node.style };
    for (const [key, value] of Object.entries(values)) {
      nextStyle[key] = setResponsiveOverride(node.style?.[key], device, value);
    }
    onUpdateNode(node.id, { style: nextStyle });
  };

  const resetCurrentDeviceOverrides = () => {
    const nextStyle: Record<string, unknown> = { ...node.style };

    for (const [key, value] of Object.entries(node.style ?? {})) {
      if (isResponsiveValue(value) && Object.prototype.hasOwnProperty.call(value, device)) {
        nextStyle[key] = resetResponsiveOverride(value, device);
      }
    }

    onUpdateNode(node.id, {
      style: nextStyle,
    });
  };

  const setGlobal = (key: string, value: unknown) =>
    setStyleValue(node, key, value, onUpdateNode);
  const setGlobalValues = (values: Record<string, unknown>) =>
    onUpdateNode(node.id, { style: { ...node.style, ...values } });

  const setBackgroundUrl = (url: string) =>
    setGlobal("backgroundImage", url ? `url("${url}")` : "");

  const uploadBackground = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setBackgroundBusy(true);
    setBackgroundError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);
      const response = await fetch("/api/builder-v2/assets/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.asset?.url) throw new Error(body?.error || "Upload failed");
      setBackgroundUrl(String(body.asset.url));
    } catch (error) {
      setBackgroundError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBackgroundBusy(false);
    }
  };

  const generateBackground = async () => {
    const prompt = backgroundPrompt.trim();
    if (!prompt) {
      setBackgroundError("Add a background image prompt first.");
      return;
    }
    setBackgroundBusy(true);
    setBackgroundError("");
    try {
      const response = await fetch("/api/ai-v8/generate-images", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: [prompt], industry: "GENERIC", size: "landscape", siteId }),
      });
      const body = await response.json().catch(() => ({}));
      const url = body?.images?.find?.((image: any) => image?.url)?.url || body?.url || body?.image?.url;
      if (!response.ok || !url) throw new Error(body?.error || "Image generation failed");
      setBackgroundUrl(String(url));
    } catch (error) {
      setBackgroundError(error instanceof Error ? error.message : "Image generation failed");
    } finally {
      setBackgroundBusy(false);
    }
  };

  const setLayoutValues = (values: Record<string, unknown>) => {
    const nextProps = {
      ...node.props,
    };
    const nextStyle: Record<string, unknown> = {
      ...node.style,
      display: setResponsiveOverride(node.style?.display, device, "flex"),
    };

    if (values.alignItems !== undefined) {
      nextProps.align = values.alignItems;
    }

    if (values.justifyContent !== undefined) {
      nextProps.justify = values.justifyContent;
    }

    for (const [key, value] of Object.entries(values)) {
      nextStyle[key] = setResponsiveOverride(node.style?.[key], device, value);
    }

    onUpdateNode(node.id, {
      props: nextProps,
      style: nextStyle,
    });
  };

  const horizontalAlign = isRowDirection
    ? String(responsive("justifyContent", "flex-start"))
    : String(responsive("alignItems", "flex-start"));
  const verticalAlign = isRowDirection
    ? String(responsive("alignItems", "flex-start"))
    : String(responsive("justifyContent", "flex-start"));

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
    const values: Record<string, unknown> = { width };
    if (node.type === "container") {
      values.maxWidth = width;
    }
    if (node.type === "column") {
      values.flex = `0 0 ${width}`;
      values.maxWidth = width;
    }
    setResponsiveValues(values);
  };

  const setWidthMode = (value: string) => {
    onUpdateNode(node.id, {
      props: getContainerWidthModeProps(node, value === "full" ? "full" : "boxed"),
    });
  };

  return (
    <div className="space-y-3 pb-8">
      {PREMIUM_TYPES.has(node.type) && (
        <PremiumElementDesign
          node={node}
          siteId={siteId}
          onUpdateNode={onUpdateNode}
        />
      )}
      {isLayout && (
        <Section title="Layout" description="Structure and alignment" defaultOpen>
          {isParentContainer && (
            <>
              <Field label="Container width">
                <SegmentedInput
                  value={containerWidthMode}
                  onChange={setWidthMode}
                  options={[
                    { value: "full", label: "Full width" },
                    { value: "boxed", label: "Boxed" },
                  ]}
                />
              </Field>

              {containerWidthMode === "boxed" && (
                <Field
                  label="Boxed max width"
                  hint={node.props?.maxWidth === undefined && node.style?.maxWidth === undefined
                    ? "Site default"
                    : device}
                >
                  <UnitInput
                    value={getEffectiveContainerMaxWidth(node, blueprint, device)}
                    onChange={(value) => {
                      onUpdateNode(node.id, {
                        props: {
                          ...node.props,
                          maxWidth: setResponsiveOverride(
                            node.props?.maxWidth ?? node.style?.maxWidth,
                            device,
                            value
                          ),
                        },
                      });
                    }}
                    min={320}
                    max={4000}
                  />
                </Field>
              )}
            </>
          )}

          {hasDimensionControls && (
  <div className="space-y-4">
    <Field label="Width" hint="%">
      <SliderWithInput
        value={percentValue(
  responsive(
    "width",
    node.type === "column"
      ? defaultColumnWidth
      : "100%"
  )
)}
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

          <div className="grid grid-cols-1 gap-3">
            {!isParentContainer && node.type !== "column" && (
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
            )}

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
            <AlignmentInput
              value={horizontalAlign}
              onChange={setHorizontalAlign}
              kind="horizontal"
            />
          </Field>

          <Field label="Vertical align">
            <AlignmentInput
              value={verticalAlign}
              onChange={setVerticalAlign}
              kind="vertical"
            />
          </Field>

          {node.type !== "section" && (
  <Field label="Gap" hint={device}>
    <SliderWithInput
      value={responsive("gap", 16)}
      onChange={(value) => setResponsive("gap", value)}
      min={0}
      max={120}
    />
  </Field>
)}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Align">
              <AlignmentInput
                value={responsive("alignItems", style.alignItems ?? "stretch")}
                onChange={(value) => setResponsive("alignItems", value)}
                kind="vertical"
              />
            </Field>

            <Field label="Justify">
              <AlignmentInput
                value={responsive("justifyContent", style.justifyContent ?? "flex-start")}
                onChange={(value) => setResponsive("justifyContent", value)}
                kind="horizontal"
              />
            </Field>
          </div>

          <Field label="Grid columns">
  <SelectInput
    value={responsive("gridTemplateColumns", style.gridTemplateColumns ?? "repeat(3, minmax(0, 1fr))")}
    onChange={(value) => setResponsive("gridTemplateColumns", value)}
    options={[
      { value: "repeat(1, minmax(0, 1fr))", label: "1 column" },
      { value: "repeat(2, minmax(0, 1fr))", label: "2 columns" },
      { value: "repeat(3, minmax(0, 1fr))", label: "3 columns" },
      { value: "repeat(4, minmax(0, 1fr))", label: "4 columns" },
      { value: "repeat(5, minmax(0, 1fr))", label: "5 columns" },
      { value: "repeat(6, minmax(0, 1fr))", label: "6 columns" },
      { value: "1fr 2fr", label: "1 / 2 split" },
      { value: "2fr 1fr", label: "2 / 1 split" },
      { value: "1fr 1fr 2fr", label: "1 / 1 / 2 split" },
      { value: "2fr 1fr 1fr", label: "2 / 1 / 1 split" },
    ]}
  />
</Field>
          {isColumnStructureTarget && (
            <button
              type="button"
              onClick={() => setStructurePickerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Columns3 size={16} aria-hidden />
              Choose column structure
            </button>
          )}

          {isParentContainer && (
            <Field label="Columns direction">
              <SegmentedInput
                value={String(
                  responsive("flexDirection", node.props?.direction ?? "row")
                )}
                onChange={(value) =>
                  onUpdateNode(node.id, {
                    props: {
                      ...node.props,
                      direction: value,
                    },
                    style: {
                      ...node.style,
                      display: "flex",
                      flexDirection: setResponsiveOverride(
                        node.style?.flexDirection,
                        device,
                        value
                      ) as any,
                    },
                  })
                }
                options={[
                  { value: "row", label: "Horizontal" },
                  { value: "column", label: "Vertical" },
                ]}
              />
            </Field>
          )}

          {node.type === "column" && (
            <Field label="Column content direction">
              <SegmentedInput
                value={String(node.props?.layout ?? "vertical")}
                onChange={(value) =>
                  onUpdateNode(node.id, {
                    props: { ...node.props, layout: value },
                    style: {
                      ...node.style,
                      display: "flex",
                      flexDirection: value === "horizontal" ? "row" : "column",
                    },
                  })
                }
                options={[
                  { value: "vertical", label: "Vertical" },
                  { value: "horizontal", label: "Horizontal" },
                ]}
              />
            </Field>
          )}
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

          <Field label="Text color">
  <ColorPicker
    value={String(responsive("color", style.color ?? "#0f172a"))}
    onChange={(color) => setResponsive("color", color)}
    onClear={() => clearResponsive("color")}
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
            <AlignmentInput
              value={responsive("textAlign", style.textAlign ?? "left")}
              onChange={(value) => setResponsive("textAlign", value)}
              kind="text"
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
                onChange={(value) =>
                  setResponsiveValues({ width: value, height: value })
                }
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
              value={String(responsive("color", style.color ?? "#0f172a"))}
              onChange={(color) => setResponsive("color", color)}
              onClear={() => clearResponsive("color")}
            />
          </Field>
          <Field label="Background">
            <ColorPicker
              value={String(responsive("backgroundColor", style.backgroundColor ?? "transparent"))}
              onChange={(color) => setResponsive("backgroundColor", color)}
              onClear={() => clearResponsive("backgroundColor")}
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
              <UnitInput
                value={responsive("width", "100%")}
                onChange={(value) => setResponsive("width", value)}
                min={0}
                max={4000}
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
              <UnitInput
                value={responsive("width", "100%")}
                onChange={(value) => setResponsive("width", value)}
                min={0}
                max={4000}
              />
            </Field>
            <Field label="Thickness" hint={device}>
              <SliderWithInput
                value={responsive("borderTopWidth", responsive("height", 1))}
                onChange={(value) =>
                  setResponsiveValues({ borderTopWidth: value, height: value })
                }
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
              onChange={(color) =>
                onUpdateNode(node.id, {
                  style: {
                    ...node.style,
                    borderTopColor: color,
                    color,
                  },
                })
              }
            />
          </Field>
        </Section>
      )}

      <Section title="Size" description="Width, height and overflow" defaultOpen={!hasPrimaryStyleSection}>
  <div className="space-y-4">
    <SizeSliderControl
      label="Width"
      value={responsive("width", 0)}
      onChange={(value) => setResponsive("width", value)}
      device={device}
      max={4000}
    />

    <SizeSliderControl
      label="Height"
      value={responsive("height", 0)}
      onChange={(value) => setResponsive("height", value)}
      device={device}
      max={2400}
    />

    <SizeSliderControl
      label="Min width"
      value={responsive("minWidth", 0)}
      onChange={(value) => setResponsive("minWidth", value)}
      device={device}
      max={4000}
    />

    <SizeSliderControl
      label="Min height"
      value={responsive("minHeight", 0)}
      onChange={(value) => setResponsive("minHeight", value)}
      device={device}
      max={2400}
    />

    {!isParentContainer && (
      <SizeSliderControl
        label="Max width"
        value={responsive("maxWidth", 0)}
        onChange={(value) => setResponsive("maxWidth", value)}
        device={device}
        max={4000}
      />
    )}

    <SizeSliderControl
      label="Max height"
      value={responsive("maxHeight", 0)}
      onChange={(value) => setResponsive("maxHeight", value)}
      device={device}
      max={2400}
    />
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
            value={String(responsive("backgroundColor", style.backgroundColor ?? "transparent"))}
            onChange={(color) => setResponsive("backgroundColor", color)}
            onClear={() => clearResponsive("backgroundColor")}
          />
        </Field>
        <Field label="Background image">
          <TextInput
            value={backgroundImageUrl(style.backgroundImage)}
            onChange={(value) => setGlobal("backgroundImage", value ? `url("${value}")` : "")}
            placeholder="https://..."
          />
        </Field>
        <MediaPicker
          siteId={siteId}
          label="Background media"
          value={backgroundImageUrl(style.backgroundImage)}
          onChange={(asset) => setBackgroundUrl(asset.url)}
        />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.1] hover:text-white">
          <Upload size={15} aria-hidden />
          {backgroundBusy ? "Working..." : "Upload background image"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={backgroundBusy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadBackground(file);
            }}
          />
        </label>
        <Field label="AI background prompt">
          <TextInput
            value={backgroundPrompt}
            onChange={setBackgroundPrompt}
            placeholder="Cinematic architectural background..."
          />
        </Field>
        <button
          type="button"
          disabled={backgroundBusy}
          onClick={() => void generateBackground()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-50"
        >
          <Sparkles size={16} aria-hidden />
          {backgroundBusy ? "Generating..." : "Generate AI Background"}
        </button>
        {backgroundError && <p className="text-xs text-red-300">{backgroundError}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size">
            <SelectInput
              value={responsive("backgroundSize", "cover")}
              onChange={(value) => setResponsive("backgroundSize", value)}
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
              value={responsive("backgroundRepeat", "no-repeat")}
              onChange={(value) => setResponsive("backgroundRepeat", value)}
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
              value={responsive("backgroundPosition", "center center")}
              onChange={(value) => setResponsive("backgroundPosition", value)}
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
              value={responsive("backgroundAttachment", "scroll")}
              onChange={(value) => setResponsive("backgroundAttachment", value)}
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
        <Field label="Border direction">
          <div className="grid grid-cols-5 gap-1 rounded-md border border-white/10 bg-black/20 p-1">
            {[
              { key: "all", label: "All" },
              { key: "Top", label: "T" },
              { key: "Right", label: "R" },
              { key: "Bottom", label: "B" },
              { key: "Left", label: "L" },
            ].map((direction) => (
              <button
                key={direction.key}
                type="button"
                title={direction.key === "all" ? "All sides" : `${direction.key} border`}
                onClick={() => {
                  const parts = borderParts(style.border);
                  const sides = direction.key === "all" ? ["Top", "Right", "Bottom", "Left"] : [direction.key];
                  const next: Record<string, unknown> = { border: undefined };
                  sides.forEach((side) => {
                    next[`border${side}Width`] = style[`border${side}Width`] ?? parts.width;
                    next[`border${side}Style`] = style[`border${side}Style`] ?? (parts.style === "none" ? "solid" : parts.style);
                    next[`border${side}Color`] = style[`border${side}Color`] ?? parts.color;
                  });
                  setGlobalValues(next);
                }}
                className="rounded px-2 py-1.5 text-[11px] text-white/60 transition hover:bg-blue-500/20 hover:text-blue-200"
              >
                {direction.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Border style">
            <SelectInput
              value={String(style.borderTopStyle ?? borderParts(style.border).style)}
              onChange={(value) => {
                setGlobalValues({ border: undefined, borderTopStyle: value, borderRightStyle: value, borderBottomStyle: value, borderLeftStyle: value });
              }}
              options={[
                { value: "none", label: "None" },
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
                { value: "double", label: "Double" },
                { value: "groove", label: "Groove" },
              ]}
            />
          </Field>
          <Field label="Border width">
            <UnitInput
              value={style.borderTopWidth ?? borderParts(style.border).width}
              onChange={(value) => {
                setGlobalValues({ border: undefined, borderTopWidth: value, borderRightWidth: value, borderBottomWidth: value, borderLeftWidth: value });
              }}
              min={0}
              max={40}
              units={["px", "rem", "em"]}
            />
          </Field>
        </div>
        <Field label="Border color">
          <ColorPicker
            value={String(style.borderTopColor ?? borderParts(style.border).color)}
            onChange={(color) => {
              setGlobalValues({ border: undefined, borderTopColor: color, borderRightColor: color, borderBottomColor: color, borderLeftColor: color });
            }}
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
        <Field label="Custom shadow">
          <TextInput
            value={style.boxShadow ?? ""}
            onChange={(value) => setGlobal("boxShadow", value || "none")}
            placeholder="0 12px 30px rgba(0, 0, 0, .18)"
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
              <UnitInput
                value={responsive(key, "")}
                onChange={(value) => setResponsive(key, value)}
                min={-2400}
                max={2400}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Device" description="Choose the breakpoint to edit">
        <DeviceSwitcher
          value={device}
          onChange={setDevice}
          inheritedLabel={buildDeviceHint(device, responsiveResolution("width", "auto"))}
          onReset={device === "desktop" ? undefined : resetCurrentDeviceOverrides}
        />
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

function PremiumElementDesign({
  node,
  siteId,
  onUpdateNode,
}: {
  node: BuilderNode;
  siteId: string;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
}) {
  const style = node.style ?? {};
  const set = (key: string, value: unknown) =>
    setStyleValue(node, key, value, onUpdateNode);
  const unset = (key: string) =>
    removeStyleProperty(node, key, onUpdateNode);
  const color = (key: string, fallback: string) => String(style[key] ?? fallback);
  const value = (key: string, fallback: string | number) => style[key] ?? fallback;
  const hasMedia = ["hero", "features", "galleryLightbox", "gallery", "masonryGallery", "offerGrid", "team", "portfolio", "carousel", "blogGrid", "postList"].includes(node.type);
  const hasCards = ["cardGrid", "featureGrid", "testimonials", "pricing", "offerGrid", "statsCounter", "logoCloud", "team", "portfolio", "timeline", "blogGrid", "postList", "categoryList"].includes(node.type);

  return (
    <>
      <Section title="Widget surface" description="Background, border and overall treatment" defaultOpen>
        <Field label="Background"><ColorPicker value={color("backgroundColor", "theme.colors.surface")} onChange={(v) => set("backgroundColor", v)} onClear={() => unset("backgroundColor")} /></Field>
        <Field label="Text color"><ColorPicker value={color("color", "theme.colors.textPrimary")} onChange={(v) => set("color", v)} onClear={() => unset("color")} /></Field>
        <Field label="Border color"><ColorPicker value={color("elementBorderColor", "theme.colors.border")} onChange={(v) => set("elementBorderColor", v)} onClear={() => unset("elementBorderColor")} /></Field>
      </Section>

      <Section title="Eyebrow" description="Label typography and color">
        <Field label="Font"><GoogleFontsPicker value={String(value("eyebrowFontFamily", "Inter"))} onChange={(v) => set("eyebrowFontFamily", v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size"><SliderWithInput value={value("eyebrowFontSize", 12)} onChange={(v) => set("eyebrowFontSize", v)} min={9} max={32} unit="px" /></Field>
          <Field label="Weight"><SelectInput value={value("eyebrowFontWeight", 700)} onChange={(v) => set("eyebrowFontWeight", Number(v))} options={[{value:"400",label:"Regular"},{value:"500",label:"Medium"},{value:"600",label:"Semibold"},{value:"700",label:"Bold"},{value:"800",label:"Extra bold"}]} /></Field>
        </div>
        <Field label="Color"><ColorPicker value={color("eyebrowColor", "theme.colors.primary")} onChange={(v) => set("eyebrowColor", v)} onClear={() => unset("eyebrowColor")} /></Field>
      </Section>

      <Section title="Title" description="Headline typography and color">
        <Field label="Font"><GoogleFontsPicker value={String(value("titleFontFamily", "Inter"))} onChange={(v) => set("titleFontFamily", v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size"><SliderWithInput value={value("titleFontSize", 30)} onChange={(v) => set("titleFontSize", v)} min={18} max={88} unit="px" /></Field>
          <Field label="Weight"><SelectInput value={value("titleFontWeight", 600)} onChange={(v) => set("titleFontWeight", Number(v))} options={[{value:"400",label:"Regular"},{value:"500",label:"Medium"},{value:"600",label:"Semibold"},{value:"700",label:"Bold"},{value:"800",label:"Extra bold"}]} /></Field>
        </div>
        <Field label="Color"><ColorPicker value={color("titleColor", "theme.colors.textPrimary")} onChange={(v) => set("titleColor", v)} onClear={() => unset("titleColor")} /></Field>
      </Section>

      <Section title="Body text" description="Supporting copy typography">
        <Field label="Font"><GoogleFontsPicker value={String(value("bodyFontFamily", "Inter"))} onChange={(v) => set("bodyFontFamily", v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size"><SliderWithInput value={value("bodyFontSize", 16)} onChange={(v) => set("bodyFontSize", v)} min={12} max={36} unit="px" /></Field>
          <Field label="Line height"><SliderWithInput value={value("bodyLineHeight", 1.6)} onChange={(v) => set("bodyLineHeight", v)} min={1} max={2.2} step={0.1} /></Field>
        </div>
        <Field label="Color"><ColorPicker value={color("bodyColor", "theme.colors.textSecondary")} onChange={(v) => set("bodyColor", v)} onClear={() => unset("bodyColor")} /></Field>
      </Section>

      <Section title="Primary CTA" description="Button typography, colors and shape">
        <Field label="Font"><GoogleFontsPicker value={String(value("ctaFontFamily", "Inter"))} onChange={(v) => set("ctaFontFamily", v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Font size"><SliderWithInput value={value("ctaFontSize", 14)} onChange={(v) => set("ctaFontSize", v)} min={11} max={28} unit="px" /></Field>
          <Field label="Radius"><SliderWithInput value={value("ctaBorderRadius", 10)} onChange={(v) => set("ctaBorderRadius", v)} min={0} max={40} unit="px" /></Field>
        </div>
        <Field label="Background"><ColorPicker value={color("ctaBackgroundColor", "theme.colors.primary")} onChange={(v) => set("ctaBackgroundColor", v)} onClear={() => unset("ctaBackgroundColor")} /></Field>
        <Field label="Text color"><ColorPicker value={color("ctaColor", "theme.colors.primaryContrast")} onChange={(v) => set("ctaColor", v)} onClear={() => unset("ctaColor")} /></Field>
      </Section>

      {hasMedia && (
        <Section title="Featured media" description="Default image and image treatment">
          <MediaPicker siteId={siteId} label="Image" value={String(value("mediaUrl", ""))} onChange={(asset) => set("mediaUrl", asset.url)} />
          <Field label="Image URL"><TextInput value={value("mediaUrl", "")} onChange={(v) => set("mediaUrl", v)} placeholder="https://..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position"><SelectInput value={value("mediaObjectPosition", "center center")} onChange={(v) => set("mediaObjectPosition", v)} options={[{value:"center center",label:"Center"},{value:"top center",label:"Top"},{value:"bottom center",label:"Bottom"},{value:"center left",label:"Left"},{value:"center right",label:"Right"}]} /></Field>
            <Field label="Radius"><SliderWithInput value={value("mediaBorderRadius", 12)} onChange={(v) => set("mediaBorderRadius", v)} min={0} max={48} unit="px" /></Field>
          </div>
        </Section>
      )}

      {hasCards && (
        <Section title="Cards" description="Repeated item appearance">
          <Field label="Background"><ColorPicker value={color("cardBackgroundColor", "theme.colors.surfaceAlt")} onChange={(v) => set("cardBackgroundColor", v)} onClear={() => unset("cardBackgroundColor")} /></Field>
          <Field label="Text color"><ColorPicker value={color("cardTextColor", "theme.colors.textPrimary")} onChange={(v) => set("cardTextColor", v)} onClear={() => unset("cardTextColor")} /></Field>
          <Field label="Icon color"><ColorPicker value={color("cardIconColor", "theme.colors.primary")} onChange={(v) => set("cardIconColor", v)} onClear={() => unset("cardIconColor")} /></Field>
        </Section>
      )}
    </>
  );
}

function responsiveStyleValue(value: unknown, device: InspectorDevice, fallback: unknown) {
  return getResponsiveValue(value, device, fallback);
}

function buildDeviceHint(
  device: InspectorDevice,
  resolution: ReturnType<typeof getResponsiveResolution>
) {
  if (resolution.hasOverride) return `${device} override active`;
  if (resolution.inheritedFrom) return `${device} inherits from ${resolution.inheritedFrom}`;
  return `${device} uses base value`;
}

function percentValue(value: unknown) {
  if (typeof value === "number") return Math.max(1, Math.min(100, value));
  if (typeof value !== "string") return 100;
  const match = value.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Number(match[1]) : 100;
}
function SizeSliderControl({
  label,
  value,
  onChange,
  device,
  max,
}: {
  label: string;
  value: unknown;
  onChange(value: string | number): void;
  device: InspectorDevice;
  max: number;
}) {
  const parsed = parseCssUnit(value);
  const [draftValue, setDraftValue] = useState(parsed.value);
  const [unit, setUnit] = useState(parsed.unit);

  useEffect(() => {
    const next = parseCssUnit(value);
    setDraftValue(next.value);
    setUnit(next.unit);
  }, [value]);

  const isKeyword = ["auto", "fit-content", "min-content", "max-content"].includes(unit);
  const unitMax = getSizeUnitMax(unit, max);
  const step = unit === "rem" || unit === "em" ? 0.1 : 1;

  const commit = (nextValue = draftValue, nextUnit = unit) => {
    if (["auto", "fit-content", "min-content", "max-content"].includes(nextUnit)) {
      onChange(nextUnit);
      return;
    }

    const numeric = Number(String(nextValue).trim());

    if (!Number.isFinite(numeric)) {
      setDraftValue("0");
      onChange(nextUnit === "px" ? 0 : `0${nextUnit}`);
      return;
    }

    const clamped = Math.max(0, Math.min(numeric, getSizeUnitMax(nextUnit, max)));
    const formatted = formatNumber(clamped);

    setDraftValue(formatted);
    onChange(nextUnit === "px" ? clamped : `${formatted}${nextUnit}`);
  };

  return (
    <Field label={label} hint={device}>
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={unitMax}
          step={step}
          value={Number(draftValue) || 0}
          onChange={(event) => setDraftValue(event.target.value)}
          onMouseUp={() => commit()}
          onTouchEnd={() => commit()}
          className="w-full accent-blue-500"
          disabled={isKeyword}
        />

        <div className="flex h-10 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
          <input
            type="number"
            min={0}
            max={unitMax}
            step={step}
            value={isKeyword ? "" : draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={() => commit()}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            placeholder={isKeyword ? unit : "0"}
            disabled={isKeyword}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none disabled:text-white/35"
          />

          <select
            value={unit}
            onChange={(event) => {
              const nextUnit = event.target.value;
              setUnit(nextUnit);
              commit(draftValue, nextUnit);
            }}
            className="w-24 border-l border-white/10 bg-[#11131A] px-2 text-xs text-white outline-none"
          >
            {SIZE_UNITS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Field>
  );
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
  const [linked, setLinked] = useState(true);
  const shorthandKey = keys[0].startsWith("padding") ? "padding" : "margin";
const shorthandValue = responsive(shorthandKey, "0");

const [draft, setDraft] = useState({
  top: String(responsive(keys[0], shorthandValue) ?? "0"),
  right: String(responsive(keys[1], shorthandValue) ?? "0"),
  bottom: String(responsive(keys[2], shorthandValue) ?? "0"),
  left: String(responsive(keys[3], shorthandValue) ?? "0"),
});

  const updateDraft = (side: keyof typeof draft, value: string) => {
    if (linked) {
      setDraft({ top: value, right: value, bottom: value, left: value });
      return;
    }

    setDraft((current) => ({ ...current, [side]: value }));
  };

  const commit = (side: keyof typeof draft, key: string, value: string) => {
    if (linked) {
      keys.forEach((sideKey) => setResponsive(sideKey, value));
      return;
    }

    setResponsive(key, value);
  };

  const renderUnitBox = (
    label: string,
    side: keyof typeof draft,
    keyName: string
  ) => (
    <label key={side} className="space-y-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-white/35">
        {label}
      </span>
      <div className="flex h-9 overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
        <input
          value={draft[side]}
          onChange={(event) => updateDraft(side, event.target.value)}
          onBlur={(event) => commit(side, keyName, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none"
          placeholder="0"
        />
        <span className="flex w-9 items-center justify-center border-l border-white/10 text-xs text-white/35">
          px
        </span>
      </div>
    </label>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-white/75">
          {title} <span className="font-normal text-white/35">({device})</span>
        </div>

        <button
          type="button"
          onClick={() => setLinked((value) => !value)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
            linked
              ? "border-blue-400/60 bg-blue-500/15 text-blue-300"
              : "border-white/10 bg-white/[0.05] text-white/45"
          }`}
          title={linked ? "Unlink values" : "Link values"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {renderUnitBox("Top", "top", keys[0])}
        {renderUnitBox("Right", "right", keys[1])}
        {renderUnitBox("Bottom", "bottom", keys[2])}
        {renderUnitBox("Left", "left", keys[3])}
      </div>
    </div>
  );
}

function borderParts(value: unknown) {
  const border = typeof value === "string" ? value.trim() : "";
  if (!border || border === "none") {
    return { width: "1px", style: "none", color: "#e5e7eb" };
  }
  const width = border.match(/(?:^|\s)(\d+(?:\.\d+)?(?:px|rem|em))/i)?.[1] ?? "1px";
  const style = border.match(/(?:^|\s)(solid|dashed|dotted|double|groove|ridge|inset|outset)(?:\s|$)/i)?.[1] ?? "solid";
  const color = border.match(/(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+)$/i)?.[1] ?? "#e5e7eb";
  return { width, style, color };
}

function parseCssUnit(value: unknown): { value: string; unit: string } {
  if (typeof value === "number") {
    return { value: formatNumber(value), unit: "px" };
  }

  if (typeof value !== "string" || !value.trim()) {
    return { value: "0", unit: "px" };
  }

  const raw = value.trim();

  if (["auto", "fit-content", "min-content", "max-content"].includes(raw)) {
    return { value: "0", unit: raw };
  }

  const match = raw.match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh)$/);

  if (match) {
    return {
      value: formatNumber(Number(match[1])),
      unit: match[2],
    };
  }

  return { value: "0", unit: "px" };
}

function getSizeUnitMax(unit: string, fallbackMax: number) {
  if (unit === "%") return 100;
  if (unit === "vw" || unit === "vh") return 100;
  if (unit === "rem" || unit === "em") return 100;
  return fallbackMax;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return String(Math.round(value * 100) / 100);
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
