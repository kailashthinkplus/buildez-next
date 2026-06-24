"use client";

import React, { useState } from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

// Field components (from Delivery 2)
import GroupCard from "./fields/GroupCard";
import NumberField from "./fields/NumberField";
import ColorField from "./fields/ColorField";
import SpacingField from "./fields/SpacingField";
import SelectField from "./fields/SelectField";
import SliderField from "./fields/SliderField";

export default function StylesTab({ node, config }: any) {
  const updateStyle = useBlueprintStore((s) => s.updateStyle);
  const updateEffects = useBlueprintStore((s) => s.updateEffects);

  const styleSchema = config?.tabs?.styles || [];
  const effectsSchema = config?.tabs?.effects || []; // optional tab

  const [activeDevice, setActiveDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  /* ------------------------------------------------------------------
      Get style object by device
  ------------------------------------------------------------------ */
  function getStyleForDevice() {
    if (activeDevice === "desktop") return node.style || {};
    return node.style?.responsive?.[activeDevice] || {};
  }

  function getEffectsForDevice() {
    if (activeDevice === "desktop") return node.effects || {};
    return node.effects?.responsive?.[activeDevice] || {};
  }

  function applyStyle(fieldKey: string, val: any) {
    updateStyle(node.id, { [fieldKey]: val }, activeDevice);
  }

  function applyEffects(fieldKey: string, val: any) {
    updateEffects(node.id, { [fieldKey]: val }, activeDevice);
  }

  const styleObj = getStyleForDevice();
  const effectsObj = getEffectsForDevice();

  /* ------------------------------------------------------------------
      Render a single style field
  ------------------------------------------------------------------ */
  function renderField(field: any) {
    const { key, label, type } = field;
    const value = styleObj[key];

    const onStyleChange = (val: any) => applyStyle(key, val);
    const onEffectsChange = (val: any) => applyEffects(key, val);

    switch (type) {
      case "spacing":
        return (
          <SpacingField
            label={label}
            value={value || { t: 0, r: 0, b: 0, l: 0 }}
            onChange={onStyleChange}
          />
        );

      case "color":
        return (
          <ColorField
            label={label}
            value={value}
            onChange={onStyleChange}
          />
        );

      case "number":
        return (
          <NumberField
            label={label}
            value={value ?? 0}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={onStyleChange}
          />
        );

      case "select":
        return (
          <SelectField
            label={label}
            options={field.options}
            value={value}
            onChange={onStyleChange}
          />
        );

      case "slider":
        return (
          <SliderField
            label={label}
            min={field.min}
            max={field.max}
            step={field.step}
            value={value ?? field.min}
            onChange={onStyleChange}
          />
        );

      case "effect-number":
        return (
          <NumberField
            label={label}
            value={effectsObj[key] ?? 0}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={onEffectsChange}
          />
        );

      case "effect-slider":
        return (
          <SliderField
            label={label}
            min={field.min}
            max={field.max}
            step={field.step}
            value={effectsObj[key] ?? field.min}
            onChange={onEffectsChange}
          />
        );

      default:
        return (
          <div className="text-xs text-red-400">
            Unknown style field: {type}
          </div>
        );
    }
  }

  /* ------------------------------------------------------------------
      Render section (group card)
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
      Responsive device selector (Framer-style chips)
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

  return (
    <div className="space-y-4">
      {deviceChips}

      {styleSchema.map((section: any, i: number) => renderSection(section, i))}

      {/* Optional Effects Section */}
      {effectsSchema?.length > 0 &&
        effectsSchema.map((section: any, i: number) => (
          <GroupCard key={`effects-${i}`} title={section.label}>
            {section.fields?.map((field: any, idx: number) => (
              <div key={idx} className="mb-4 last:mb-0">
                {renderField(field)}
              </div>
            ))}
          </GroupCard>
        ))}
    </div>
  );
}
