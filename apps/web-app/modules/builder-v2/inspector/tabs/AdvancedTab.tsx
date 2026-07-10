"use client";

import type { BuilderNode } from "../../types/blueprint";
import { useCanvasStore } from "../../store/useCanvasStore";
import { Activity } from "lucide-react";
import {
  DeviceSwitcher,
  Field,
  Section,
  SelectInput,
  SliderWithInput,
  TextArea,
  TextInput,
  ToggleInput,
  getAdvanced,
  setAdvancedGroupValue,
  setAdvancedValue,
} from "./InspectorControls";
import { MOTION_INSPECTOR_GROUPS, buildDefaultMotionMetadata } from "../motion/motionInspectorMetadata";
import { MOTION_PRESETS } from "../motion/motionPresets";

interface AdvancedTabProps {
  node: BuilderNode;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
}

export default function AdvancedTab({
  node,
  onUpdateNode,
}: AdvancedTabProps) {
  const device = useCanvasStore((state) => state.device);
  const setDevice = useCanvasStore((state) => state.setDevice);
  const advanced = getAdvanced(node);
  const responsiveVisibility =
    node.props?.__responsiveVisibility &&
    typeof node.props.__responsiveVisibility === "object"
      ? (node.props.__responsiveVisibility as Record<string, boolean>)
      : {};

  const motion = group(advanced.motion);
  const visibility = group(advanced.visibility);
  const accessibility = group(advanced.accessibility);
  const seo = group(advanced.seo);
  const responsive = group(advanced.responsive);

  return (
    <div className="space-y-3 pb-8">
      <Section title="Visibility" description="Hide, lock and conditional display" defaultOpen>
        <ToggleInput
          label="Hide element"
          checked={Boolean(node.hidden)}
          onChange={(checked) => {
            onUpdateNode(node.id, { hidden: checked });
          }}
        />
        <ToggleInput
          label="Lock editing"
          checked={Boolean(node.locked)}
          onChange={(checked) => {
            onUpdateNode(node.id, { locked: checked });
          }}
        />
        <Field label="Show condition">
          <SelectInput
            value={visibility.condition ?? "always"}
            onChange={(value) => setAdvancedGroupValue(node, "visibility", "condition", value, onUpdateNode)}
            options={[
              { value: "always", label: "Always" },
              { value: "logged-in", label: "Logged-in visitors" },
              { value: "logged-out", label: "Logged-out visitors" },
              { value: "scheduled", label: "Scheduled" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Responsive" description="Per-device behavior and overrides">
        <DeviceSwitcher
          value={device}
          onChange={setDevice}
          inheritedLabel={`${device} controls edit the active canvas breakpoint`}
        />
        <ToggleInput
          label={`Visible on ${device}`}
          checked={responsiveVisibility[device] !== false}
          onChange={(checked) => {
            onUpdateNode(node.id, {
              props: {
                ...node.props,
                __responsiveVisibility: {
                  ...responsiveVisibility,
                  [device]: checked,
                },
              },
            });
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Breakpoint note">
            <TextInput
              value={responsive[`${device}Note`] ?? ""}
              onChange={(value) =>
                setAdvancedGroupValue(node, "responsive", `${device}Note`, value, onUpdateNode)
              }
              placeholder="Stack columns here"
            />
          </Field>
          <Field label="Override mode">
            <SelectInput
              value={responsive[`${device}Mode`] ?? "inherit"}
              onChange={(value) =>
                setAdvancedGroupValue(node, "responsive", `${device}Mode`, value, onUpdateNode)
              }
              options={[
                { value: "inherit", label: "Inherit" },
                { value: "custom", label: "Custom" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          </Field>
        </div>
      </Section>

      <Section title="Motion" description="Live CSS motion applied on the canvas.">
        <Field label="Motion engine">
          <SelectInput
            value={motion.engine ?? "css"}
            onChange={(value) => {
              setAdvancedValue(node, "motion", { ...buildDefaultMotionMetadata(), ...motion, engine: value }, onUpdateNode);
            }}
            options={[
              { value: "css", label: "CSS motion" },
              { value: "none", label: "Disabled" },
            ]}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Preset">
            <SelectInput
              value={motion.preset ?? "none"}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "preset", value, onUpdateNode)}
              options={[
                { value: "none", label: "None" },
                ...MOTION_PRESETS.map((preset) => ({
                  value: preset.id,
                  label: preset.label,
                })),
              ]}
            />
          </Field>
          <Field label="Ease">
            <SelectInput
              value={motion.ease ?? "power2.out"}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "ease", value, onUpdateNode)}
              options={[
                { value: "linear", label: "Linear" },
                { value: "ease", label: "CSS ease" },
                { value: "power2.out", label: "Power out" },
                { value: "power3.inOut", label: "Power in-out" },
                { value: "back.out", label: "Back out" },
                { value: "elastic.out", label: "Elastic" },
              ]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Duration">
            <SliderWithInput
              value={motion.duration ?? 0.6}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "duration", value, onUpdateNode)}
              min={0}
              max={5}
              step={0.1}
              unit="s"
            />
          </Field>
          <Field label="Delay">
            <SliderWithInput
              value={motion.delay ?? 0}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "delay", value, onUpdateNode)}
              min={0}
              max={5}
              step={0.1}
              unit="s"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Parallax speed">
            <SliderWithInput
              value={motion.parallaxSpeed ?? 0}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "parallaxSpeed", value, onUpdateNode)}
              min={-2}
              max={2}
              step={0.1}
              unit=""
            />
          </Field>
          <Field label="Horizontal parallax">
            <SliderWithInput
              value={motion.parallaxHorizontal ?? 0}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "parallaxHorizontal", value, onUpdateNode)}
              min={-2}
              max={2}
              step={0.1}
              unit=""
            />
          </Field>
          <Field label="Vertical parallax">
            <SliderWithInput
              value={motion.parallaxVertical ?? motion.parallaxSpeed ?? 0}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "parallaxVertical", value, onUpdateNode)}
              min={-2}
              max={2}
              step={0.1}
              unit=""
            />
          </Field>
          <Field label="Stagger">
            <SliderWithInput
              value={motion.stagger ?? 0}
              onChange={(value) => setAdvancedGroupValue(node, "motion", "stagger", value, onUpdateNode)}
              min={0}
              max={1}
              step={0.05}
              unit="s"
            />
          </Field>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
            Motion groups
          </div>
          <div className="grid grid-cols-1 gap-2">
            {MOTION_INSPECTOR_GROUPS.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() =>
                  setAdvancedGroupValue(node, "motion", "activeGroup", group.id, onUpdateNode)
                }
                className={`flex items-center gap-2 rounded border px-2 py-2 text-left text-[11px] transition ${
                  motion.activeGroup === group.id
                    ? "border-blue-400/50 bg-blue-500/20 text-white"
                    : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Activity size={14} aria-hidden />
                {group.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Timeline notes">
          <TextArea
            rows={4}
            value={motion.timelineNotes ?? ""}
            onChange={(value) => setAdvancedGroupValue(node, "motion", "timelineNotes", value, onUpdateNode)}
            placeholder="Notes for the motion timeline."
          />
        </Field>
      </Section>

      <Section title="Accessibility" description="Screen reader and keyboard metadata">
        <Field label="ARIA label">
          <TextInput
            value={accessibility.ariaLabel ?? ""}
            onChange={(value) => setAdvancedGroupValue(node, "accessibility", "ariaLabel", value, onUpdateNode)}
            placeholder="Describe this element"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <TextInput
              value={accessibility.role ?? ""}
              onChange={(value) => setAdvancedGroupValue(node, "accessibility", "role", value, onUpdateNode)}
              placeholder="button"
            />
          </Field>
          <Field label="Tab index">
            <TextInput
              value={accessibility.tabIndex ?? ""}
              onChange={(value) => setAdvancedGroupValue(node, "accessibility", "tabIndex", value, onUpdateNode)}
              placeholder="0"
            />
          </Field>
        </div>
      </Section>

      <Section title="SEO" description="Search and social metadata for meaningful elements">
        <Field label="SEO title">
          <TextInput
            value={seo.title ?? ""}
            onChange={(value) => setAdvancedGroupValue(node, "seo", "title", value, onUpdateNode)}
            placeholder="Search title"
          />
        </Field>
        <Field label="SEO description">
          <TextArea
            rows={3}
            value={seo.description ?? ""}
            onChange={(value) => setAdvancedGroupValue(node, "seo", "description", value, onUpdateNode)}
            placeholder="Short description"
          />
        </Field>
        <Field label="Schema hint">
          <SelectInput
            value={seo.schema ?? "none"}
            onChange={(value) => setAdvancedGroupValue(node, "seo", "schema", value, onUpdateNode)}
            options={[
              { value: "none", label: "None" },
              { value: "article", label: "Article" },
              { value: "product", label: "Product" },
              { value: "faq", label: "FAQ" },
              { value: "local-business", label: "Local business" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Custom CSS" description="CSS hooks and custom declarations">
        <div className="grid grid-cols-2 gap-3">
          <Field label="CSS ID">
            <TextInput
              value={advanced.cssId ?? ""}
              onChange={(value) => setAdvancedValue(node, "cssId", value, onUpdateNode)}
              placeholder="hero-title"
            />
          </Field>
          <Field label="CSS class">
            <TextInput
              value={advanced.className ?? node.props?.className ?? ""}
              onChange={(value) => {
                onUpdateNode(node.id, {
                  props: {
                    ...node.props,
                    className: value,
                    advanced: {
                      ...advanced,
                      className: value,
                    },
                  },
                });
              }}
              placeholder="section-large"
            />
          </Field>
        </div>
        <Field label="Custom CSS">
          <TextArea
            rows={5}
            value={advanced.customCss ?? ""}
            onChange={(value) => setAdvancedValue(node, "customCss", value, onUpdateNode)}
            placeholder="box-shadow: 0 20px 60px rgba(0,0,0,.2);"
          />
        </Field>
      </Section>
    </div>
  );
}

function group(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
}
