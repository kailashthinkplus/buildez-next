"use client";

import React from "react";
import { useBlueprintStore } from "@/modules/builder/state/useBlueprintStore";

// Field components (coming in Delivery 2)
import GroupCard from "./fields/GroupCard";
import TextField from "./fields/TextField";
import TextAreaField from "./fields/TextAreaField";
import NumberField from "./fields/NumberField";
import SelectField from "./fields/SelectField";
import ToggleField from "./fields/ToggleField";
import ColorField from "./fields/ColorField";
import ImageField from "./fields/ImageField";
import SliderField from "./fields/SliderField";
import RepeaterField from "./fields/RepeaterField";

export default function ContentTab({ node, config }: any) {
  const updateProps = useBlueprintStore((s) => s.updateProps);

  const contentSchema = config?.tabs?.content || [];

  if (!contentSchema.length) {
    return (
      <div className="text-white/70 text-sm">
        No editable content fields for this element.
      </div>
    );
  }

  /* -----------------------
   Field Renderer
  ------------------------ */
  function renderField(field: any) {
    const value = node.props?.[field.key];

    const onChange = (val: any) => {
      updateProps(node.id, { [field.key]: val });
    };

    switch (field.type) {
      case "text":
        return (
          <TextField
            label={field.label}
            value={value || ""}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        );

      case "textarea":
        return (
          <TextAreaField
            label={field.label}
            value={value || ""}
            onChange={onChange}
            placeholder={field.placeholder}
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

      case "select":
        return (
          <SelectField
            label={field.label}
            options={field.options}
            value={value}
            onChange={onChange}
          />
        );

      case "toggle":
        return (
          <ToggleField
            label={field.label}
            value={!!value}
            onChange={onChange}
          />
        );

      case "color":
        return (
          <ColorField
            label={field.label}
            value={value}
            onChange={onChange}
          />
        );

      case "image":
        return (
          <ImageField
            label={field.label}
            value={value}
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

      case "repeater":
        return (
          <RepeaterField
            label={field.label}
            items={value || []}
            fieldSchema={field.fields}
            onChange={onChange}
          />
        );

      default:
        return (
          <div className="text-xs text-red-400">
            Unknown field type: {field.type}
          </div>
        );
    }
  }

  /* -----------------------
   SECTION RENDERER
  ------------------------ */
  function renderSection(section: any, index: number) {
    return (
      <GroupCard key={index} title={section.label}>
        {section.fields?.map((field: any, i: number) => (
          <div key={i} className="mb-4 last:mb-0">
            {renderField(field)}
          </div>
        ))}
      </GroupCard>
    );
  }

  return (
    <div className="space-y-4">
      {contentSchema.map((section: any, i: number) =>
        renderSection(section, i)
      )}
    </div>
  );
}
