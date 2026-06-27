"use client";

import { useMemo, useState } from "react";
import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";
import { WidgetRegistry } from "../../core/registry/WidgetRegistry";
import WysiwygEditor from "../components/WysiwygEditor";
import MediaPicker from "../../media/components/MediaPicker";
import {
  Field,
  SegmentedInput,
  Section,
  SelectInput,
  SliderWithInput,
  TextArea,
  TextInput,
  ToggleInput,
  setPropValue,
  setStyleValue,
} from "./InspectorControls";

interface ContentTabProps {
  node: BuilderNode;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
  siteId: string;
}

export default function ContentTab({
  node,
  onUpdateNode,
  siteId,
}: ContentTabProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const registryProperties = useMemo(() => {
    if (!WidgetRegistry.has(node.type)) return [];
    return WidgetRegistry.get(node.type).properties;
  }, [node.type]);
  const schemaProperties = useMemo(
    () => getInspectorSchemaProperties(node, registryProperties),
    [node, registryProperties]
  );

  const contentValue = useMemo(() => {
    if (node.type === "button") {
      return String(node.props?.label ?? node.props?.text ?? "");
    }
    return String(node.props?.text ?? node.props?.content ?? node.props?.html ?? "");
  }, [node]);

  const setText = (value: string) => {
    if (node.type === "button") {
      onUpdateNode(node.id, {
        props: {
          ...node.props,
          text: value,
          label: value,
        },
      });
      return;
    }

    onUpdateNode(node.id, {
      props: {
        ...node.props,
        text: value,
        html: node.type === "text" ? value : node.props?.html,
      },
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);

      const res = await fetch("/api/builder-v2/assets/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const body = await res.json();
      const uploadedUrl = body?.asset?.url;
      if (!uploadedUrl) {
        throw new Error("No URL returned from upload");
      }

      setPropValue(node, "src", uploadedUrl, onUpdateNode);
    } catch (err) {
      console.error("[builder-v2/image-upload] exception", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const isPrimaryText = node.type === "heading" || node.type === "button";
  const hasPrimaryContentSection =
    node.type === "text" ||
    isPrimaryText ||
    node.type === "image" ||
    node.type === "video" ||
    node.type === "icon" ||
    node.type === "spacer" ||
    node.type === "divider";

  return (
    <div className="space-y-3 pb-8">
      {node.type === "text" && (
        <Section
          title="Text"
          description="Edit the visible copy"
          defaultOpen
        >
          <Field label="WYSIWYG content">
            <WysiwygEditor
              value={String(node.props?.html ?? node.props?.text ?? "")}
              onChange={(value) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    html: value,
                    text: stripHtml(value),
                  },
                });
              }}
            />
          </Field>
        </Section>
      )}

      {isPrimaryText && (
        <Section
          title="Content"
          description="Edit the visible copy"
          defaultOpen
        >
          <Field label={node.type === "button" ? "Button label" : "Text"}>
            <TextArea
              rows={node.type === "button" ? 2 : 5}
              value={contentValue}
              onChange={setText}
              placeholder="Enter text..."
            />
          </Field>
        </Section>
      )}

      {node.type === "heading" && (
        <Section title="Heading Level" description="Set the semantic heading level">
          <Field label="Level">
            <SelectInput
              value={String(node.props?.level ?? "h2")}
              onChange={(value) => setPropValue(node, "level", value, onUpdateNode)}
              options={[
                { value: "h1", label: "H1 - Main page heading" },
                { value: "h2", label: "H2 - Section heading" },
                { value: "h3", label: "H3 - Subheading" },
                { value: "h4", label: "H4" },
                { value: "h5", label: "H5" },
                { value: "h6", label: "H6" },
              ]}
            />
          </Field>
        </Section>
      )}

      {node.type === "button" && (
        <Section title="Link" description="Set the button destination">
          <Field label="URL">
            <TextInput
              value={node.props?.url ?? node.props?.href ?? ""}
              onChange={(value) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    url: value,
                    href: value,
                  },
                });
              }}
              placeholder="https://example.com"
            />
          </Field>

          <ToggleInput
            label="Open in new tab"
            checked={node.props?.target === "_blank"}
            onChange={(checked) => setPropValue(node, "target", checked ? "_blank" : "_self", onUpdateNode)}
          />
        </Section>
      )}

      {node.type === "image" && (
        <Section
          title="Image"
          description="Set the image source and alt text"
          defaultOpen
        >
          <Field label="Media library">
            <MediaPicker
              siteId={siteId}
              label="Image asset"
              value={String(node.props?.src ?? "")}
              onChange={(asset) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    src: asset.url,
                    alt: node.props?.alt ?? asset.alt ?? asset.title ?? "",
                  },
                });
              }}
            />
          </Field>

          <Field label="Upload">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              disabled={uploadingImage}
              className="w-full rounded-md border border-white/10 bg-white/[0.06] p-2 text-xs text-white file:mr-3 file:rounded file:border-0 file:bg-blue-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </Field>

          <Field label="Image URL">
            <TextInput
              value={node.props?.src ?? ""}
              onChange={(value) => setPropValue(node, "src", value, onUpdateNode)}
              placeholder="https://..."
            />
          </Field>

          {uploadingImage && <p className="text-xs text-white/45">Uploading...</p>}
          {node.props?.src && (
            <img
              src={String(node.props.src)}
              alt=""
              className="h-36 w-full rounded-md border border-white/10 object-cover"
            />
          )}

          <Field label="Alt text">
            <TextInput
              value={node.props?.alt ?? ""}
              onChange={(value) => setPropValue(node, "alt", value, onUpdateNode)}
              placeholder="Describe the image for accessibility"
            />
          </Field>
        </Section>
      )}

      {node.type === "video" && (
        <Section
          title="Video"
          description="Set the video source and playback behavior"
          defaultOpen
        >
          <Field label="Video URL">
            <TextInput
              value={node.props?.src ?? ""}
              onChange={(value) => setPropValue(node, "src", value, onUpdateNode)}
              placeholder="https://example.com/video.mp4"
            />
          </Field>
          <Field label="Poster image">
            <TextInput
              value={node.props?.poster ?? ""}
              onChange={(value) => setPropValue(node, "poster", value, onUpdateNode)}
              placeholder="https://example.com/poster.jpg"
            />
          </Field>
          <Field label="MIME type">
            <SelectInput
              value={node.props?.mimeType ?? "video/mp4"}
              onChange={(value) => setPropValue(node, "mimeType", value, onUpdateNode)}
              options={[
                { value: "video/mp4", label: "MP4" },
                { value: "video/webm", label: "WebM" },
                { value: "video/ogg", label: "Ogg" },
              ]}
            />
          </Field>
          <ToggleInput
            label="Show controls"
            checked={node.props?.controls !== false}
            onChange={(value) => setPropValue(node, "controls", value, onUpdateNode)}
          />
          <ToggleInput
            label="Autoplay"
            checked={Boolean(node.props?.autoplay)}
            onChange={(value) => setPropValue(node, "autoplay", value, onUpdateNode)}
          />
          <ToggleInput
            label="Muted"
            checked={Boolean(node.props?.muted)}
            onChange={(value) => setPropValue(node, "muted", value, onUpdateNode)}
          />
          <ToggleInput
            label="Loop"
            checked={Boolean(node.props?.loop)}
            onChange={(value) => setPropValue(node, "loop", value, onUpdateNode)}
          />
          <ToggleInput
            label="Plays inline"
            checked={node.props?.playsInline !== false}
            onChange={(value) => setPropValue(node, "playsInline", value, onUpdateNode)}
          />
        </Section>
      )}

      {node.type === "icon" && (
        <Section
          title="Icon"
          description="Pick an icon and accessibility behavior"
          defaultOpen
        >
          <Field label="Icon">
            <SelectInput
              value={node.props?.iconName ?? node.props?.glyph ?? "star"}
              onChange={(value) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    iconName: value,
                    glyph: value,
                  },
                });
              }}
              options={[
                { value: "star", label: "Star" },
                { value: "heart", label: "Heart" },
                { value: "check", label: "Check" },
                { value: "arrow-right", label: "Arrow right" },
                { value: "phone", label: "Phone" },
                { value: "mail", label: "Mail" },
                { value: "map-pin", label: "Map pin" },
                { value: "user", label: "User" },
                { value: "search", label: "Search" },
                { value: "shopping-cart", label: "Shopping cart" },
                { value: "play", label: "Play" },
                { value: "sparkles", label: "Sparkles" },
              ]}
            />
          </Field>
          <Field label="Accessible label">
            <TextInput
              value={node.props?.ariaLabel ?? ""}
              onChange={(value) => setPropValue(node, "ariaLabel", value, onUpdateNode)}
              placeholder="Feature icon"
            />
          </Field>
          <ToggleInput
            label="Decorative only"
            checked={node.props?.decorative !== false}
            onChange={(value) => setPropValue(node, "decorative", value, onUpdateNode)}
          />
        </Section>
      )}

      {node.type === "spacer" && (
        <Section title="Spacer" description="Control empty breathing room" defaultOpen>
          <Field label="Height">
            <TextInput
              value={node.style?.height ?? 24}
              onChange={(value) =>
                onUpdateNode(node.id, {
                  style: {
                    ...node.style,
                    height: value,
                    minHeight: value,
                  },
                })
              }
              placeholder="48px"
            />
          </Field>
        </Section>
      )}

      {node.type === "divider" && (
        <Section
          title="Divider"
          description="Line orientation, style and sizing"
          defaultOpen
        >
          <Field label="Orientation">
            <SegmentedInput
              value={node.props?.orientation ?? "horizontal"}
              onChange={(value) => setPropValue(node, "orientation", value, onUpdateNode)}
              options={[
                { value: "horizontal", label: "Horizontal" },
                { value: "vertical", label: "Vertical" },
              ]}
            />
          </Field>
          <Field label="Line style">
            <SelectInput
              value={node.props?.lineStyle ?? "solid"}
              onChange={(value) => setPropValue(node, "lineStyle", value, onUpdateNode)}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
                { value: "double", label: "Double" },
              ]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thickness">
              <TextInput
                value={node.style?.height ?? 1}
                onChange={(value) => setStyleValue(node, "height", value, onUpdateNode)}
                placeholder="1px"
              />
            </Field>
            <Field label="Length">
              <TextInput
                value={node.style?.width ?? "100%"}
                onChange={(value) => setStyleValue(node, "width", value, onUpdateNode)}
                placeholder="100%"
              />
            </Field>
          </div>
        </Section>
      )}

      {schemaProperties.length > 0 && (
        <Section
          title="Widget Options"
          description="Edit registered widget properties"
          defaultOpen={!hasPrimaryContentSection}
        >
          <div className="space-y-4">
            {schemaProperties.map((property) => (
              <WidgetOptionField
                key={`${property.target ?? "props"}-${property.id}`}
                node={node}
                property={property}
                onUpdateNode={onUpdateNode}
              />
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Style Preset"
        description="Apply a shared visual preset"
        defaultOpen={!hasPrimaryContentSection}
      >
        <Field label="Token preset">
          <SelectInput
            value={node.props?.stylePreset ?? "custom"}
            onChange={(value) => setPropValue(node, "stylePreset", value, onUpdateNode)}
            options={[
              { value: "custom", label: "Custom" },
              { value: "brand-primary", label: "Brand primary" },
              { value: "brand-secondary", label: "Brand secondary" },
              { value: "muted", label: "Muted surface" },
              { value: "card", label: "Card" },
            ]}
          />
        </Field>
      </Section>
    </div>
  );
}

function WidgetOptionField({
  node,
  property,
  onUpdateNode,
}: {
  node: BuilderNode;
  property: WidgetProperty;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
}) {
  const target = property.target ?? "props";
  const current =
    target === "style"
      ? node.style?.[property.id]
      : node.props?.[property.id];
  const value = current ?? property.defaultValue ?? "";

  const setValue = (next: unknown) => {
    if (target === "style") {
      setStyleValue(node, property.id, next, onUpdateNode);
      return;
    }

    setPropValue(node, property.id, next, onUpdateNode);
  };

  if (property.id === "items") {
    const items = Array.isArray(node.props?.items)
      ? node.props.items.map(String)
      : [];

    return (
      <Field label={property.label}>
        <TextArea
          rows={6}
          value={items.join("\n")}
          onChange={(next) =>
            setValue(
              next
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
          placeholder={property.placeholder ?? "One item per line"}
        />
      </Field>
    );
  }

  switch (property.type) {
    case "textarea":
      return (
        <Field label={property.label}>
          <TextArea
            rows={4}
            value={value}
            onChange={setValue}
            placeholder={property.placeholder}
          />
        </Field>
      );

    case "select":
      return (
        <Field label={property.label}>
          <SelectInput
            value={value}
            onChange={setValue}
            options={(property.options ?? []).map((option) => ({
              label: option.label,
              value: String(option.value),
            }))}
          />
        </Field>
      );

    case "switch":
      return (
        <ToggleInput
          label={property.label}
          checked={Boolean(value)}
          onChange={setValue}
        />
      );

    case "slider":
      return (
        <Field label={property.label} hint={property.unit}>
          <SliderWithInput
            value={value}
            onChange={setValue}
            min={property.min ?? 0}
            max={property.max ?? 100}
            step={property.step ?? 1}
            unit={property.unit ?? ""}
          />
        </Field>
      );

    case "number":
      return (
        <Field label={property.label}>
          <TextInput
            value={value}
            onChange={(next) => setValue(next === "" ? "" : Number(next))}
            placeholder={property.placeholder}
          />
        </Field>
      );

    case "color":
    case "image":
    case "url":
    case "text":
    default:
      return (
        <Field label={property.label}>
          <TextInput
            value={value}
            onChange={setValue}
            placeholder={property.placeholder}
          />
        </Field>
      );
  }
}

function getInspectorSchemaProperties(
  node: BuilderNode,
  properties: WidgetProperty[]
) {
  const manuallyHandledByType: Record<string, Set<string>> = {
    heading: new Set(["text", "level"]),
    text: new Set(["text"]),
    button: new Set(["text", "url"]),
    image: new Set(["src", "alt"]),
    video: new Set([
      "src",
      "poster",
      "mimeType",
      "controls",
      "autoplay",
      "muted",
      "loop",
      "playsInline",
    ]),
    icon: new Set(["glyph", "iconName", "ariaLabel", "decorative"]),
    spacer: new Set(["height"]),
    divider: new Set(["orientation", "lineStyle", "height", "width"]),
  };

  const skipped = manuallyHandledByType[node.type] ?? new Set<string>();

  return properties.filter((property) => {
    if (skipped.has(property.id)) return false;
    return [
      "content",
      "layout",
      "style",
      "advanced",
      "responsive",
    ].includes(property.category);
  });
}

function stripHtml(value: string) {
  if (typeof window === "undefined") return value;
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent ?? "";
}
