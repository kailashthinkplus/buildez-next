"use client";

import React, { useState } from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

// Field components
import GroupCard from "./fields/GroupCard";
import SelectField from "./fields/SelectField";
import NumberField from "./fields/NumberField";
import SliderField from "./fields/SliderField";

export default function LayoutTab({ node, config }: any) {
  const updateLayout = useBlueprintStore((s) => s.updateLayout);

  const layoutSchema = config?.tabs?.layout || [];

  const [activeDevice, setActiveDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  /* ------------------------------------------------------------------
      Get layout for selected device
  ------------------------------------------------------------------ */
  function getLayoutForDevice() {
    if (activeDevice === "desktop") return node.layout || {};
    return node.layout?.responsive?.[activeDevice] || {};
  }

  function applyLayout(key: string, val: any) {
    updateLayout(node.id, { [key]: val }, activeDevice);
  }

  const layoutObj = getLayoutForDevice();

  /* ------------------------------------------------------------------
      Render a single layout field
  ------------------------------------------------------------------ */
  function renderField(field: any) {
    const value = layoutObj[field.key];

    const onChange = (val: any) => applyLayout(field.key, val);

    switch (field.type) {
      case "select":
        return (
          <SelectField
            label={field.label}
            options={field.options}
            value={value}
            onChange={onChange}
          />
        );

      case "number":
        return (
          <NumberField
            label={field.label}
            value={value ?? 0}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={onChange}
          />
        );

      case "slider":
        return (
          <SliderField
            label={field.label}
            min={field.min}
            max={field.max}
            step={field.step}
            value={value ?? field.min}
            onChange={onChange}
          />
        );

      default:
        return (
          <div className="text-xs text-red-400">
            Unknown layout field: {field.type}
          </div>
        );
    }
  }

  /* ------------------------------------------------------------------
      Render a schema section
  ------------------------------------------------------------------ */
  function renderSection(section: any, idx: number) {
    return (
      <GroupCard key={idx} title={section.label}>
        {section.fields?.map((field: any, i: number) => (
          <div key={i} className="mb-4 last:mb-0">
            {renderField(field)}
          </div>
        ))}
      </GroupCard>
    );
  }

  /* ------------------------------------------------------------------
      Responsive device selector
  ------------------------------------------------------------------ */
  const deviceChips = (
    <div className="flex gap-2 mb-2">
      {(["desktop", "tablet", "mobile"] as const).map((d) => (
        <button
          key={d}
          onClick={() => setActiveDevice(d)}
          className={`
            px-3 py-1.5 rounded-lg text-xs transition
            ${
              activeDevice === d
                ? "bg-white/15 text-white shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }
          `}
        >
          {d.toUpperCase()}
        </button>
      ))}
    </div>
  );

  /* ------------------------------------------------------------------
      Main render
  ------------------------------------------------------------------ */
  if (!layoutSchema.length) {
    return (
      <div className="text-white/70 text-sm">
        No layout configuration for this element.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deviceChips}

      {layoutSchema.map((section: any, idx: number) =>
        renderSection(section, idx)
      )}
    </div>
  );
}
