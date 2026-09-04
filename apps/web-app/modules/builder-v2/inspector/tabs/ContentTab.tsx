"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, ImagePlus, Sparkles, WandSparkles } from "lucide-react";
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

function cmsBindableProperties(node: BuilderNode) {
  if (node.type === "image") return ["src", "alt", "caption"];
  if (node.type === "button") return ["label", "text", "href"];
  if (node.type === "heading" || node.type === "text") return ["text", "html"];
  return ["title", "heading", "description", "text", "image", "src", "href", "items"];
}

export default function ContentTab({
  node,
  onUpdateNode,
  siteId,
}: ContentTabProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState("");
  const [generatingText, setGeneratingText] = useState(false);
  const [textGenerationError, setTextGenerationError] = useState("");
  const [cmsCollections, setCmsCollections] = useState<any[]>([]);
  const [cmsEntries, setCmsEntries] = useState<any[]>([]);
  const [cmsCollectionId, setCmsCollectionId] = useState("");
  const [cmsEntryId, setCmsEntryId] = useState("");
  useEffect(() => { fetch(`/api/cms/collections?siteId=${siteId}`).then(r => r.json()).then(b => setCmsCollections(b.collections || [])); }, [siteId]);
  useEffect(() => { if (!cmsCollectionId) return setCmsEntries([]); fetch(`/api/cms/entries?collectionId=${cmsCollectionId}`).then(r => r.json()).then(b => setCmsEntries((b.entries || []).filter((entry: any) => entry.status === "PUBLISHED"))); }, [cmsCollectionId]);
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
        ...(node.type === "text" ? { html: value } : {}),
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

  const handleGenerateImage = async () => {
    const prompt = String(
      node.props?.aiImagePrompt || node.props?.imagePrompt || node.props?.alt || ""
    ).trim();

    if (!prompt) {
      setImageGenerationError("Add an image prompt first.");
      return;
    }

    setGeneratingImage(true);
    setImageGenerationError("");

    try {
      const res = await fetch("/api/ai-v8/generate-images", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompts: [prompt],
          industry: String(node.props?.industry || "GENERIC"),
          size: "landscape",
          siteId,
        }),
      });
      const body = await res.json().catch(() => ({}));
      const generatedUrl =
        body?.images?.find?.((image: any) => typeof image?.url === "string" && image.url)?.url ||
        body?.url ||
        body?.image?.url;

      if (!res.ok || !generatedUrl) {
        throw new Error(body?.error || "Image generation failed.");
      }

      onUpdateNode(node.id, {
        hidden: false,
        props: {
          ...node.props,
          src: generatedUrl,
          aiImagePrompt: prompt,
          imagePrompt: prompt,
          alt:
            typeof node.props?.alt === "string" && node.props.alt.trim()
              ? node.props.alt
              : prompt.slice(0, 120),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image generation failed.";
      setImageGenerationError(message);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateText = async () => {
    const seed = contentValue.trim() ||
      (node.type === "heading"
        ? "Write a concise, specific website section heading."
        : "Write a concise, useful website paragraph for this section.");
    setGeneratingText(true);
    setTextGenerationError("");
    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: seed,
          tone: "professional",
          length: node.type === "heading" ? "shorter" : "same",
          audience: "website visitors",
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.text) throw new Error(body?.error || "Text generation failed");
      setText(String(body.text));
    } catch (error) {
      setTextGenerationError(error instanceof Error ? error.message : "Text generation failed");
    } finally {
      setGeneratingText(false);
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
      <Section title="CMS data" description="Populate this widget from a published CMS entry">
        <div className="space-y-2 rounded-lg border border-blue-400/20 bg-blue-500/[0.05] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-300"><Database size={14}/> Dynamic content binding</div>
          <select value={cmsCollectionId} onChange={(e) => { setCmsCollectionId(e.target.value); setCmsEntryId(""); }} className="w-full rounded-md border border-white/10 bg-[#181b22] px-2 py-2 text-xs text-white"><option value="">Choose collection</option>{cmsCollections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select value={cmsEntryId} onChange={(e) => setCmsEntryId(e.target.value)} disabled={!cmsCollectionId} className="w-full rounded-md border border-white/10 bg-[#181b22] px-2 py-2 text-xs text-white disabled:opacity-40"><option value="">Choose published entry</option>{cmsEntries.map((entry) => <option key={entry.id} value={entry.id}>{String(entry.data?.[cmsCollections.find(c => c.id === cmsCollectionId)?.fields?.[0]?.key] || "Untitled")}</option>)}</select>
          {cmsEntryId && <div className="space-y-2 pt-1">{cmsCollections.find(c => c.id === cmsCollectionId)?.fields?.map((field: any) => <div key={field.key} className="grid grid-cols-[1fr_1fr] items-center gap-2"><span className="truncate text-[11px] text-white/55">{field.name}</span><select defaultValue="" onChange={(e) => { const property = e.target.value; if (!property) return; const entry = cmsEntries.find(x => x.id === cmsEntryId); onUpdateNode(node.id, { props: { ...node.props, [property]: entry?.data?.[field.key], cmsBindings: { ...(node.props?.cmsBindings as object || {}), [property]: { collectionId: cmsCollectionId, entryId: cmsEntryId, fieldKey: field.key } } } }); }} className="rounded border border-white/10 bg-[#181b22] px-1.5 py-1.5 text-[11px]"><option value="">Bind to property…</option>{cmsBindableProperties(node).map(p => <option key={p} value={p}>{p}</option>)}</select></div>)}</div>}
          {Object.keys((node.props?.cmsBindings as object) || {}).length > 0 && <button type="button" onClick={() => onUpdateNode(node.id, { props: { ...node.props, cmsBindings: {} } })} className="text-left text-[11px] text-red-300">Clear all bindings</button>}
        </div>
      </Section>
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
          <button
            type="button"
            disabled={generatingText}
            onClick={() => void handleGenerateText()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-50"
          >
            <WandSparkles size={16} aria-hidden />
            {generatingText ? "Generating..." : "Generate AI content"}
          </button>
          {textGenerationError && <p className="text-xs text-red-300">{textGenerationError}</p>}
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
          {node.type === "heading" && (
            <button
              type="button"
              disabled={generatingText}
              onClick={() => void handleGenerateText()}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-50"
            >
              <WandSparkles size={16} aria-hidden />
              {generatingText ? "Generating..." : "Generate AI content"}
            </button>
          )}
          {textGenerationError && <p className="text-xs text-red-300">{textGenerationError}</p>}
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

          <Field label="AI image prompt">
            <TextArea
              rows={5}
              value={node.props?.aiImagePrompt ?? node.props?.imagePrompt ?? ""}
              onChange={(value) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    aiImagePrompt: value,
                    imagePrompt: value,
                  },
                });
              }}
              placeholder="Photorealistic commercial website photograph, natural daylight..."
            />
          </Field>

          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={generatingImage}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-400/30 bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus size={15} aria-hidden />
            {generatingImage ? "Generating image..." : "Generate Image with AI "}
          </button>
          {imageGenerationError && (
            <p className="text-xs text-red-300">{imageGenerationError}</p>
          )}

          {uploadingImage && <p className="text-xs text-white/45">Uploading...</p>}

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

      {["section", "container", "column"].includes(node.type) && (
        <Section
          title={labelize(node.type)}
          description="Content behavior and AI actions"
          defaultOpen
        >
          <Field label="Name">
            <TextInput
              value={String(node.props?.label ?? node.props?.name ?? "")}
              onChange={(value) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    label: value,
                    name: value,
                  },
                });
              }}
              placeholder={`${labelize(node.type)} name`}
            />
          </Field>

          {node.type === "section" && (
            <Field label="HTML anchor ID">
              <TextInput
                value={String(node.props?.anchorId ?? "")}
                onChange={(value) =>
                  setPropValue(node, "anchorId", value, onUpdateNode)
                }
                placeholder="hero-section"
              />
            </Field>
          )}

          <button
            type="button"
            onClick={() => {
              onUpdateNode(node.id, {
                props: {
                  ...node.props,
                  aiActionNote:
                    node.type === "section"
                      ? "AI section generation will connect in Phase 40D."
                      : node.type === "container"
                        ? "AI layout generation will connect in Phase 40D."
                        : "AI column fill will connect in Phase 40D.",
                },
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20"
          >
            <Sparkles size={16} aria-hidden />
            Generate with AI
          </button>
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

      {!["page", "section", "container", "column"].includes(node.type) && (
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
)}
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
    page: new Set(["backgroundColor", "backgroundImage", "width", "minHeight"]),
    section: new Set([
      "container",
      "maxWidth",
      "paddingTop",
      "paddingBottom",
      "backgroundColor",
      "backgroundImage",
      "backgroundSize",
      "backgroundPosition",
      "backgroundRepeat",
      "backgroundAttachment",
    ]),
    container: new Set([
      "layout",
      "direction",
      "justify",
      "align",
      "wrap",
      "width",
      "maxWidth",
      "gap",
      "padding",
      "margin",
      "backgroundColor",
      "backgroundImage",
    ]),
    column: new Set([
      "flex",
      "minWidth",
      "minHeight",
      "padding",
      "gap",
      "backgroundColor",
    ]),
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
    return ["content", "advanced", "responsive"].includes(property.category);
  });
}

function stripHtml(value: string) {
  if (typeof window === "undefined") return value;
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent ?? "";
}

function labelize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}
