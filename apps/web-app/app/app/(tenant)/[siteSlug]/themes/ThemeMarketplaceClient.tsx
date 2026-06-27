"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Eye, LayoutTemplate, Palette, Sparkles, X } from "lucide-react";

import { firstPartyThemePresets } from "@/modules/builder-v2/theme/themePresets";
import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";
import {
  createDefaultSiteThemeLayout,
  type SiteThemeLayout,
} from "@/modules/builder-v2/theme/siteLayout";
import { SiteThemeFrame } from "@/modules/builder-v2/theme/SiteThemeFrame";

type Props = {
  siteId: string;
  siteName: string;
  initialDesignTokens: Record<string, unknown> | null;
  initialLayout: SiteThemeLayout;
};

function getInitialPresetId(tokens: Record<string, unknown> | null) {
  return typeof tokens?.themePresetId === "string"
    ? tokens.themePresetId
    : "buildez-default";
}

function createDesignTokens(presetId: string, tokens: BuilderThemeTokens) {
  const preset = firstPartyThemePresets.find((item) => item.id === presetId);

  return {
    themePresetId: presetId,
    themeName: preset?.name ?? presetId,
    themeVersion: 1,
    ...tokens,
  };
}

export default function ThemeMarketplaceClient({
  siteId,
  siteName,
  initialDesignTokens,
  initialLayout,
}: Props) {
  const [activePresetId, setActivePresetId] = useState(
    getInitialPresetId(initialDesignTokens)
  );
  const [selectedPresetId, setSelectedPresetId] = useState(activePresetId);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [layout, setLayout] = useState<SiteThemeLayout>(initialLayout);
  const [savingAction, setSavingAction] = useState<{
    presetId: string;
    mode: "theme" | "demo";
  } | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activePreset = useMemo(
    () =>
      firstPartyThemePresets.find((preset) => preset.id === activePresetId) ??
      firstPartyThemePresets[0],
    [activePresetId]
  );
  const selectedPreset = useMemo(
    () =>
      firstPartyThemePresets.find((preset) => preset.id === selectedPresetId) ??
      firstPartyThemePresets[0],
    [selectedPresetId]
  );

  async function applyTheme(presetId: string, seedDemoBlueprints: boolean) {
    const preset = firstPartyThemePresets.find((item) => item.id === presetId);
    if (!preset) return;

    setSavingAction({
      presetId,
      mode: seedDemoBlueprints ? "demo" : "theme",
    });
    setMessage(null);
    const nextLayout = {
      ...createDefaultSiteThemeLayout({
        siteName,
        tokens: preset.tokens,
        presetId: preset.id,
      }),
      header: {
        ...layout.header,
        brandLabel: layout.header.brandLabel || siteName,
      },
      footer: {
        ...layout.footer,
        brandLabel: layout.footer.brandLabel || siteName,
      },
    };

    try {
      const [tokensRes, layoutRes] = await Promise.all([
        fetch(`/api/sites/${siteId}/design-tokens`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            designTokens: createDesignTokens(preset.id, preset.tokens),
            seedDemoBlueprints,
          }),
        }),
        fetch(`/api/sites/${siteId}/layout`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nextLayout),
        }),
      ]);

      if (!tokensRes.ok) {
        throw new Error((await tokensRes.text()) || "Failed to apply theme");
      }

      if (!layoutRes.ok) {
        throw new Error((await layoutRes.text()) || "Failed to save layout");
      }

      setActivePresetId(preset.id);
      setSelectedPresetId(preset.id);
      setLayout(nextLayout);
      const tokensJson = (await tokensRes.json().catch(() => null)) as {
        demoBlueprintsUpdated?: number;
        demoBlueprintsSkipped?: number;
        demoPagesCreated?: number;
      } | null;
      const updatedCount = tokensJson?.demoBlueprintsUpdated ?? 0;
      const skippedCount = tokensJson?.demoBlueprintsSkipped ?? 0;
      const createdCount = tokensJson?.demoPagesCreated ?? 0;
      const demoMessage = seedDemoBlueprints
        ? createdCount > 0 || updatedCount > 0
          ? ` Created ${createdCount} demo page${createdCount === 1 ? "" : "s"} and updated ${updatedCount} builder page${updatedCount === 1 ? "" : "s"}.`
          : skippedCount > 0
            ? " Existing custom pages were left unchanged."
            : " No blank or demo-generated pages needed updates."
        : " Demo content was not changed.";

      setMessage(`${preset.name} applied to ${siteName}.${demoMessage}`);
    } catch (error) {
      console.error("[THEMES] Failed to apply theme", error);
      setMessage("Could not apply the theme. Please try again.");
    } finally {
      setSavingAction(null);
    }
  }

  function updateHeader(patch: Partial<SiteThemeLayout["header"]>) {
    setLayout((current) => ({
      ...current,
      header: {
        ...current.header,
        ...patch,
      },
    }));
  }

  function updateFooter(patch: Partial<SiteThemeLayout["footer"]>) {
    setLayout((current) => ({
      ...current,
      footer: {
        ...current.footer,
        ...patch,
      },
    }));
  }

  async function saveLayout() {
    setSavingLayout(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/sites/${siteId}/layout`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(layout),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to save layout");
      }

      setMessage("Header and footer saved for all pages.");
    } catch (error) {
      console.error("[THEMES] Failed to save layout", error);
      setMessage("Could not save header and footer. Please try again.");
    } finally {
      setSavingLayout(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide dashboard-muted">
              Site theme
            </p>
            <h1 className="text-2xl font-semibold">Themes for {siteName}</h1>
            <p className="mt-2 max-w-2xl text-sm dashboard-muted">
              Apply just the visual theme, or add safe demo content to blank
              and theme-generated builder pages.
            </p>
          </div>

          <div className="rounded-lg dashboard-card px-4 py-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Palette className="h-4 w-4" />
              {activePreset.name}
            </div>
            <div className="mt-1 dashboard-muted">Currently applied</div>
          </div>
        </div>

        {message && (
          <div className="rounded-lg dashboard-card px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {firstPartyThemePresets.map((preset) => {
            const isActive = preset.id === activePresetId;
            const isSelected = preset.id === selectedPresetId;
            const isSavingTheme =
              savingAction?.presetId === preset.id && savingAction.mode === "theme";
            const isSavingDemo =
              savingAction?.presetId === preset.id && savingAction.mode === "demo";
            const isSavingPreset = savingAction?.presetId === preset.id;
            const { typography, radius } = preset.tokens;
            const demoData = preset.demoData;

            return (
              <article
                key={preset.id}
                className={`overflow-hidden rounded-lg border dashboard-card ${
                  isActive || isSelected ? "border-blue-500" : "dashboard-border"
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden border-b dashboard-border">
                  {preset.previewImageUrl ? (
                    <Image
                      src={preset.previewImageUrl}
                      alt={`${preset.name} theme preview thumbnail`}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <ThemePreviewFallback presetName={preset.name} tokens={preset.tokens} />
                  )}
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold">{preset.name}</h2>
                      <span className="rounded-full dashboard-subtle px-2 py-1 text-xs capitalize">
                        {demoData?.category ?? preset.tone}
                      </span>
                    </div>
                    <p className="mt-2 text-sm dashboard-muted">
                      {demoData?.description ??
                        `${typography.headingFont} headings, ${typography.bodyFont} body, ${radius.card}px cards.`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setDetailsOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border dashboard-border px-4 py-2 text-sm font-medium dashboard-hover"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>

                  <button
                    type="button"
                    disabled={isSavingPreset || isActive}
                    onClick={() => applyTheme(preset.id, false)}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "bg-[var(--brand)] text-white hover:brightness-110 disabled:opacity-60"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="h-4 w-4" />
                        Theme Applied
                      </>
                    ) : isSavingTheme ? (
                      "Applying Theme..."
                    ) : (
                      "Apply Theme Only"
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSavingPreset}
                    onClick={() => applyTheme(preset.id, true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--brand)] px-4 py-2 text-sm font-medium text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isSavingDemo
                      ? "Adding Demo..."
                      : isActive
                        ? "Rebuild Demo Content"
                        : "Apply + Demo Content"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {detailsOpen && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-details-title"
          >
            <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg border dashboard-border dashboard-card shadow-2xl">
              <div className="flex items-center justify-between border-b dashboard-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  <h2 id="theme-details-title" className="font-semibold">
                    {selectedPreset.name} Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-lg p-2 dashboard-hover"
                  aria-label="Close theme details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid max-h-[calc(90vh-65px)] grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-5">
                  {selectedPreset.demoData && (
                    <div className="rounded-lg border dashboard-border p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide dashboard-muted">
                        Demo Template
                      </div>
                      <div className="mt-2 font-medium">
                        {selectedPreset.demoData.category}
                      </div>
                      <p className="mt-2 text-sm dashboard-muted">
                        {selectedPreset.demoData.audience}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedPreset.demoData.sections.map((section) => (
                          <span
                            key={section}
                            className="rounded-full dashboard-subtle px-2 py-1 text-xs"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide dashboard-muted">
                      Palette
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(selectedPreset.tokens.colors).map(([name, color]) => (
                        <div key={name} className="rounded-lg border dashboard-border p-2">
                          <div
                            className="h-8 rounded-md border dashboard-border"
                            style={{ background: color }}
                          />
                          <div className="mt-2 truncate text-[11px] dashboard-muted">
                            {name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Detail label="Heading" value={selectedPreset.tokens.typography.headingFont} />
                    <Detail label="Body" value={selectedPreset.tokens.typography.bodyFont} />
                    <Detail label="Button Radius" value={`${selectedPreset.tokens.radius.button}px`} />
                    <Detail label="Card Radius" value={`${selectedPreset.tokens.radius.card}px`} />
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide dashboard-muted">
                      Global Header
                    </div>
                    <label className="flex items-center justify-between gap-3 text-sm">
                      <span>Show header on all pages</span>
                      <input
                        type="checkbox"
                        checked={layout.header.enabled}
                        onChange={(event) => updateHeader({ enabled: event.target.checked })}
                      />
                    </label>
                    <TextInput
                      label="Brand Label"
                      value={layout.header.brandLabel}
                      onChange={(value) => updateHeader({ brandLabel: value })}
                    />
                    <TextInput
                      label="CTA Label"
                      value={layout.header.ctaLabel}
                      onChange={(value) => updateHeader({ ctaLabel: value })}
                    />
                    <select
                      value={layout.header.variant}
                      onChange={(event) =>
                        updateHeader({
                          variant: event.target.value as SiteThemeLayout["header"]["variant"],
                        })
                      }
                      className="w-full rounded-lg dashboard-input px-3 py-2 text-sm"
                    >
                      <option value="solid">Solid</option>
                      <option value="soft">Soft</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide dashboard-muted">
                      Global Footer
                    </div>
                    <label className="flex items-center justify-between gap-3 text-sm">
                      <span>Show footer on all pages</span>
                      <input
                        type="checkbox"
                        checked={layout.footer.enabled}
                        onChange={(event) => updateFooter({ enabled: event.target.checked })}
                      />
                    </label>
                    <TextInput
                      label="Footer Text"
                      value={layout.footer.body}
                      onChange={(value) => updateFooter({ body: value })}
                    />
                    <select
                      value={layout.footer.variant}
                      onChange={(event) =>
                        updateFooter({
                          variant: event.target.value as SiteThemeLayout["footer"]["variant"],
                        })
                      }
                      className="w-full rounded-lg dashboard-input px-3 py-2 text-sm"
                    >
                      <option value="solid">Solid</option>
                      <option value="soft">Soft</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={savingLayout}
                    onClick={saveLayout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {savingLayout ? "Saving..." : "Save Header & Footer"}
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border dashboard-border dashboard-card">
                  <SiteThemeFrame
                    layout={layout}
                    tokens={selectedPreset.tokens}
                    mode="canvas"
                  >
                    <main
                      style={{
                        minHeight: 280,
                        padding: `${selectedPreset.tokens.spacing.sectionY / 2}px ${selectedPreset.tokens.spacing.containerX}px`,
                      }}
                    >
                      <div
                        style={{
                          margin: "0 auto",
                          maxWidth: 980,
                        }}
                      >
                        <p
                          style={{
                            color: selectedPreset.tokens.colors.primary,
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: 0,
                            margin: 0,
                          }}
                        >
                          {selectedPreset.demoData?.category ?? "Theme preview"}
                        </p>
                        <h2
                          style={{
                            color: selectedPreset.tokens.colors.textPrimary,
                            fontFamily: selectedPreset.tokens.typography.headingFont,
                            fontSize: 40,
                            lineHeight: 1.05,
                            margin: "12px 0",
                          }}
                        >
                          {selectedPreset.name}
                        </h2>
                        <p
                          style={{
                            color: selectedPreset.tokens.colors.textSecondary,
                            fontSize: 16,
                            lineHeight: 1.7,
                            maxWidth: 620,
                          }}
                        >
                          {selectedPreset.demoData?.description ??
                            "This header, page surface, buttons, cards, and footer use the selected theme tokens and will carry into the builder canvas."}
                        </p>
                        <button
                          type="button"
                          style={{
                            background: selectedPreset.tokens.buttons.primary.backgroundColor,
                            border: 0,
                            borderRadius: selectedPreset.tokens.buttons.primary.borderRadius,
                            color: selectedPreset.tokens.buttons.primary.color,
                            fontWeight: 700,
                            marginTop: 18,
                            padding: "12px 18px",
                          }}
                        >
                          Primary Action
                        </button>
                      </div>
                    </main>
                  </SiteThemeFrame>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border dashboard-border p-3">
      <div className="text-xs dashboard-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function ThemePreviewFallback({
  presetName,
  tokens,
}: {
  presetName: string;
  tokens: BuilderThemeTokens;
}) {
  const { colors, typography, radius } = tokens;

  return (
    <div
      className="h-full p-4"
      style={{
        background: colors.background,
        color: colors.textPrimary,
        fontFamily: typography.bodyFont,
      }}
    >
      <div
        className="h-full rounded-md border p-4"
        style={{
          background: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.card,
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="text-lg font-semibold"
            style={{ fontFamily: typography.headingFont }}
          >
            {presetName}
          </div>
          <Sparkles className="h-4 w-4" style={{ color: colors.accent }} />
        </div>
        <div
          className="mt-3 h-2 w-24 rounded-full"
          style={{ background: colors.primary }}
        />
        <div className="mt-4 flex gap-2">
          {[colors.primary, colors.accent, colors.surfaceAlt].map((color) => (
            <span
              key={color}
              className="h-6 w-6 rounded-full border"
              style={{ background: color, borderColor: colors.border }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block dashboard-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg dashboard-input px-3 py-2 text-sm"
      />
    </label>
  );
}
