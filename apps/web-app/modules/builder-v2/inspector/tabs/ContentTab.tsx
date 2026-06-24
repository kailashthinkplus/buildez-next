"use client";

import { useMemo, useState } from "react";
import type { BuilderNode } from "../../types/blueprint";
import GoogleFontsPicker from "../components/GoogleFontsPicker";

interface ContentTabProps {
  node: BuilderNode;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
}

export default function ContentTab({
  node,
  onUpdateNode,
}: ContentTabProps) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const contentValue = useMemo(() => {
    if (node.type === "button") {
      return String(node.props?.label ?? node.props?.text ?? "");
    }
    return String(node.props?.text ?? node.props?.content ?? node.props?.html ?? "");
  }, [node]);

  const onChangeText = (value: string) => {
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

      const res = await fetch("/api/builder-v2/assets/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await res.json();
      onUpdateNode(node.id, {
        props: { ...node.props, src: url },
      });
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {(node.type === "heading" || node.type === "text" || node.type === "button") && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-white/70">Text content</label>
            <textarea
              value={contentValue}
              onChange={(e) => onChangeText(e.target.value)}
              className="w-full min-h-24 rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder:text-white/40"
              placeholder="Enter text..."
            />
          </div>

          {(node.type === "heading" || node.type === "text") && (
            <div className="space-y-2">
              <label className="text-xs text-white/70">Font family</label>
              <GoogleFontsPicker
                value={String(node.style?.fontFamily ?? "system-ui")}
                onChange={(font) =>
                  onUpdateNode(node.id, {
                    style: { ...node.style, fontFamily: font },
                  })
                }
              />
            </div>
          )}
        </>
      )}

      {node.type === "heading" && (
        <div className="space-y-2">
          <label className="text-xs text-white/70">Heading level</label>
          <select
            value={String(node.props?.level ?? "h2")}
            onChange={(e) =>
              onUpdateNode(node.id, {
                props: { ...node.props, level: e.target.value },
              })
            }
            className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white"
          >
            <option value="h1">H1 - Large heading</option>
            <option value="h2">H2 - Medium heading</option>
            <option value="h3">H3 - Subheading</option>
            <option value="h4">H4 - Small heading</option>
            <option value="h5">H5 - Extra small</option>
            <option value="h6">H6 - Tiny heading</option>
          </select>
        </div>
      )}

      {node.type === "button" && (
        <div className="space-y-2">
          <label className="text-xs text-white/70">Link URL</label>
          <input
            value={String(node.props?.url ?? node.props?.href ?? "")}
            onChange={(e) =>
              onUpdateNode(node.id, {
                props: {
                  ...node.props,
                  url: e.target.value,
                  href: e.target.value,
                },
              })
            }
            placeholder="https://example.com"
            className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder:text-white/40"
          />
        </div>
      )}

      {node.type === "image" && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-white/70">Image</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={uploadingImage}
                className="flex-1 px-3 py-2 rounded bg-white/5 border border-white/10 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white"
              />
            </div>
            {uploadingImage && (
              <p className="text-xs text-white/50">Uploading...</p>
            )}
            {node.props?.src && (
              <img
                src={String(node.props.src)}
                alt="preview"
                className="w-full h-32 object-cover rounded bg-white/5"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/70">Alt text</label>
            <input
              value={String(node.props?.alt ?? "")}
              onChange={(e) =>
                onUpdateNode(node.id, {
                  props: { ...node.props, alt: e.target.value },
                })
              }
              placeholder="Describe the image..."
              className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder:text-white/40"
            />
          </div>
        </>
      )}

      {node.type === "video" && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-white/70">Video URL</label>
            <input
              value={String(node.props?.src ?? "")}
              onChange={(e) =>
                onUpdateNode(node.id, {
                  props: { ...node.props, src: e.target.value },
                })
              }
              placeholder="https://example.com/video.mp4"
              className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/70">Poster image</label>
            <input
              value={String(node.props?.poster ?? "")}
              onChange={(e) =>
                onUpdateNode(node.id, {
                  props: { ...node.props, poster: e.target.value },
                })
              }
              placeholder="https://example.com/poster.jpg"
              className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={node.props?.autoplay ?? false}
                onChange={(e) =>
                  onUpdateNode(node.id, {
                    props: { ...node.props, autoplay: e.target.checked },
                  })
                }
                className="rounded"
              />
              Autoplay
            </label>
            <label className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={node.props?.controls ?? true}
                onChange={(e) =>
                  onUpdateNode(node.id, {
                    props: { ...node.props, controls: e.target.checked },
                  })
                }
                className="rounded"
              />
              Show controls
            </label>
            <label className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={node.props?.loop ?? false}
                onChange={(e) =>
                  onUpdateNode(node.id, {
                    props: { ...node.props, loop: e.target.checked },
                  })
                }
                className="rounded"
              />
              Loop
            </label>
          </div>
        </>
      )}

      {node.type === "icon" && (
        <div className="space-y-2">
          <label className="text-xs text-white/70">Icon character</label>
          <input
            value={String(node.props?.char ?? "")}
            onChange={(e) =>
              onUpdateNode(node.id, {
                props: { ...node.props, char: e.target.value },
              })
            }
            placeholder="⭐"
            className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder:text-white/40 text-center text-xl"
          />
        </div>
      )}
    </div>
  );
}