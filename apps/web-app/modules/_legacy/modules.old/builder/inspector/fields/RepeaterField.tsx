"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";

import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import ToggleField from "./ToggleField";
import ColorField from "./ColorField";
import ImageField from "./ImageField";
import SliderField from "./SliderField";
import SpacingField from "./SpacingField";

export default function RepeaterField({
  label,
  items,
  fieldSchema,
  onChange,
}: {
  label: string;
  items: any[];
  fieldSchema: any[]; // schema for each item
  onChange: (v: any[]) => void;
}) {
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setOpenIndexes((prev) => ({ ...prev, [i]: !prev[i] }));

  const addItem = () => {
    // Generate empty object based on schema
    const newItem: any = {};
    fieldSchema.forEach((f) => {
      newItem[f.key] = f.default ?? "";
    });

    onChange([...(items || []), newItem]);
  };

  const removeItem = (i: number) => {
    const copy = [...items];
    copy.splice(i, 1);
    onChange(copy);
  };

  const updateField = (i: number, key: string, val: any) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [key]: val };
    onChange(copy);
  };

  /* -----------------------------------------------
     Render one field based on schema
  ----------------------------------------------- */
  function renderField(field: any, i: number, item: any) {
    const value = item[field.key];

    const handle = (val: any) => updateField(i, field.key, val);

    switch (field.type) {
      case "text":
        return (
          <TextField
            label={field.label}
            value={value || ""}
            onChange={handle}
            placeholder={field.placeholder}
          />
        );

      case "textarea":
        return (
          <TextAreaField
            label={field.label}
            value={value || ""}
            onChange={handle}
            placeholder={field.placeholder}
          />
        );

      case "number":
        return (
          <NumberField
            label={field.label}
            value={value ?? 0}
            onChange={handle}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case "select":
        return (
          <SelectField
            label={field.label}
            value={value}
            options={field.options}
            onChange={handle}
          />
        );

      case "toggle":
        return (
          <ToggleField
            label={field.label}
            value={!!value}
            onChange={handle}
          />
        );

      case "color":
        return (
          <ColorField
            label={field.label}
            value={value}
            onChange={handle}
          />
        );

      case "image":
        return (
          <ImageField
            label={field.label}
            value={value}
            onChange={handle}
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
            onChange={handle}
          />
        );

      case "spacing":
        return (
          <SpacingField
            label={field.label}
            value={value || { t: 0, r: 0, b: 0, l: 0 }}
            onChange={handle}
          />
        );

      default:
        return (
          <div className="text-red-400 text-xs">
            Unknown field type: {field.type}
          </div>
        );
    }
  }

  /* -----------------------------------------------
     MAIN
  ----------------------------------------------- */
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-white/60">{label}</label>

        <button
          onClick={addItem}
          className="
            flex items-center gap-1
            px-2 py-1
            text-xs text-blue-300
            bg-white/10 border border-white/10
            rounded-md hover:bg-white/15 transition
          "
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {items?.map((item, i) => {
          const isOpen = !!openIndexes[i];

          return (
            <div
              key={i}
              className="
                bg-white/[0.04]
                border border-white/10
                rounded-xl p-3
                backdrop-blur-lg
                transition
              "
            >
              {/* Header */}
              <div
                className="
                  flex items-center justify-between
                  cursor-pointer select-none
                "
                onClick={() => toggle(i)}
              >
                <span className="text-sm text-white/80">
                  Item {i + 1}
                </span>

                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronUp size={16} className="text-white/60" />
                  ) : (
                    <ChevronDown size={16} className="text-white/60" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(i);
                    }}
                    className="p-1 hover:bg-white/10 rounded-md"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Fields inside */}
              {isOpen && (
                <div className="mt-3 space-y-4">
                  {fieldSchema.map((field, idx) => (
                    <div key={idx}>{renderField(field, i, item)}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {(!items || items.length === 0) && (
          <div className="text-white/40 text-xs py-2 px-2">
            No items yet. Click “Add” to create one.
          </div>
        )}
      </div>
    </div>
  );
}
