"use client";

import type { BuilderNode } from "../../types/blueprint";
import type { WidgetProperty } from "../../types/property";

import TextProperty from "../../inspector/properties/TextProperty";
import TextareaProperty from "../../inspector/properties/TextareaProperty";
import NumberProperty from "../../inspector/properties/NumberProperty";
import SelectProperty from "../../inspector/properties/SelectProperty";
import SwitchProperty from "../../inspector/properties/SwitchProperty";
import SliderProperty from "../../inspector/properties/SliderProperty";
import ColorProperty from "../../inspector/properties/ColorProperty";
import MediaProperty from "../../inspector/properties/MediaProperty";

/* ==========================================================
   TYPES
========================================================== */

interface PropertyRendererProps {
  node: BuilderNode;

  properties: WidgetProperty[];
}

/* ==========================================================
   PROPERTY RENDERER
========================================================== */

export default function PropertyRenderer({
  node,
  properties,
}: PropertyRendererProps) {
  return (
    <div className="space-y-6">
      {properties.map((property) => {
        switch (property.type) {
          case "text":
            return (
              <TextProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
                placeholder={property.placeholder}
              />
            );

          case "textarea":
            return (
              <TextareaProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
                placeholder={property.placeholder}
              />
            );

          case "number":
            return (
              <NumberProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
                placeholder={property.placeholder}
              />
            );

          case "select":
            return (
              <SelectProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
                options={property.options ?? []}
              />
            );

          case "switch":
            return (
              <SwitchProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
              />
            );

          case "slider":
            return (
              <SliderProperty
  key={property.id}
  node={node}
  property={property.id}
  label={property.label}
  target={property.target}
  min={property.min ?? 0}
  max={property.max ?? 100}
  step={property.step ?? 1}
  unit={property.unit}
/>
            );

          case "color":
            return (
              <ColorProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
              />
            );

          case "image":
            return (
              <MediaProperty
                key={property.id}
                node={node}
                property={property.id}
                label={property.label}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}