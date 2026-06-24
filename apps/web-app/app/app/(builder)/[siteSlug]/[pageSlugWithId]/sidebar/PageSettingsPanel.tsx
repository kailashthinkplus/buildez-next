"use client";

import { useCallback } from "react";
import { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

interface Props {
  blueprint: BlueprintNode;
  onUpdateNode(id: string, patch: Partial<BlueprintNode>): void;
}

export default function PageSettingsPanel({
  blueprint,
  onUpdateNode,
}: Props) {
  const pageSettings = blueprint.props?.pageSettings ?? {};

  const update = useCallback(
    (partial: any) => {
      onUpdateNode(blueprint.id, {
        props: {
          ...blueprint.props,
          pageSettings: {
            ...pageSettings,
            ...partial,
          },
        },
      });
    },
    [blueprint, pageSettings, onUpdateNode]
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <h2 className="text-lg font-semibold text-white">
        Page Settings
      </h2>

      {/* ================= SEO ================= */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-300">
          SEO
        </h3>

        <Input
          label="Page Title"
          value={pageSettings.seo?.title}
          onChange={(v) =>
            update({ seo: { ...pageSettings.seo, title: v } })
          }
        />

        <Textarea
          label="Meta Description"
          value={pageSettings.seo?.description}
          onChange={(v) =>
            update({
              seo: { ...pageSettings.seo, description: v },
            })
          }
        />

        <Input
          label="Keywords"
          value={pageSettings.seo?.keywords}
          onChange={(v) =>
            update({
              seo: { ...pageSettings.seo, keywords: v },
            })
          }
        />
      </section>

      {/* ================= SOCIAL ================= */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-300">
          Social (OG)
        </h3>

        <Input
          label="OG Title"
          value={pageSettings.social?.ogTitle}
          onChange={(v) =>
            update({
              social: { ...pageSettings.social, ogTitle: v },
            })
          }
        />

        <Textarea
          label="OG Description"
          value={pageSettings.social?.ogDescription}
          onChange={(v) =>
            update({
              social: {
                ...pageSettings.social,
                ogDescription: v,
              },
            })
          }
        />

        <Input
          label="OG Image URL"
          value={pageSettings.social?.ogImage}
          onChange={(v) =>
            update({
              social: { ...pageSettings.social, ogImage: v },
            })
          }
        />
      </section>

      {/* ================= ADVANCED ================= */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-300">
          Advanced
        </h3>

        <Textarea
          label="Custom <head> HTML"
          value={pageSettings.advanced?.headHTML}
          onChange={(v) =>
            update({
              advanced: {
                ...pageSettings.advanced,
                headHTML: v,
              },
            })
          }
        />
      </section>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange(v: string): void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-neutral-400">{label}</span>
      <input
        className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange(v: string): void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-neutral-400">{label}</span>
      <textarea
        rows={3}
        className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
