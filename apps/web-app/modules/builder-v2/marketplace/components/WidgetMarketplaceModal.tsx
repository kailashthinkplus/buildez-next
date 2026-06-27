"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Check,
  Crown,
  Layers,
  PackagePlus,
  Search,
  Sparkles,
  Store,
  X,
} from "lucide-react";

import type { NodeType } from "../../types/blueprint";
import {
  ElementMarketplaceRegistry,
  type ElementCatalogItem,
  type ElementTier,
} from "../index";

type CategoryFilter = ElementCatalogItem["category"] | "all";
type TierFilter = ElementTier | "all";

const categoryLabels: Record<CategoryFilter, string> = {
  all: "All",
  layout: "Layout",
  content: "Content",
  media: "Media",
  conversion: "Conversion",
  commerce: "Commerce",
  data: "Data",
};

const categoryOrder: CategoryFilter[] = [
  "all",
  "layout",
  "content",
  "media",
  "conversion",
  "commerce",
  "data",
];

const tierFilters: { label: string; value: TierFilter }[] = [
  { label: "All", value: "all" },
  { label: "Default", value: "default" },
  { label: "Premium", value: "premium" },
];

const catalog = ElementMarketplaceRegistry.getAll();

export default function WidgetMarketplaceModal({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose(): void;
  onInsert?(type: NodeType): void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [tier, setTier] = useState<TierFilter>("premium");

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();

    return catalog.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesTier = tier === "all" || item.tier === tier;
      const matchesSearch =
        !query ||
        [
          item.name,
          item.description,
          item.marketplaceCategory,
          item.source,
          item.category,
          item.tier,
          ...item.tags,
          ...item.industryTags,
          ...item.styleTags,
          ...item.aiUseCases,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesTier && matchesSearch;
    });
  }, [category, search, tier]);

  if (!open || typeof document === "undefined") return null;

  const defaultCount = catalog.filter((item) => item.tier === "default").length;
  const premiumCount = catalog.filter((item) => item.tier === "premium").length;
  const aiReadyCount = catalog.filter((item) => item.ai.canGenerate).length;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f14] text-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
              <Store className="h-3.5 w-3.5" />
              Widget Marketplace
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              Builder-native widget catalog
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Premium widgets are available inside Blocks and ready for AI selection.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/65 hover:bg-white/10 hover:text-white"
            aria-label="Close marketplace"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          <section className="grid gap-3 sm:grid-cols-3">
            <Metric icon={Layers} label="Default" value={defaultCount} />
            <Metric icon={Crown} label="Premium" value={premiumCount} />
            <Metric icon={Bot} label="AI-ready" value={aiReadyCount} />
          </section>

          <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search widgets, industries, styles..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {tierFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTier(item.value)}
                    className={`h-10 rounded-xl px-3 text-sm font-medium transition ${
                      tier === item.value
                        ? "bg-blue-600 text-white"
                        : "border border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categoryOrder.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`h-9 shrink-0 rounded-lg px-3 text-sm font-medium transition ${
                    category === item
                      ? "bg-blue-600 text-white"
                      : "border border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10"
                  }`}
                >
                  {categoryLabels[item]}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-4 flex items-center justify-between text-sm text-white/55">
            <span>
              Showing {filteredCatalog.length} of {catalog.length} widgets
            </span>
            <span>Registered premium nodes appear in Blocks</span>
          </div>

          {filteredCatalog.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-12 text-center text-white/55">
              No widgets match this search.
            </div>
          ) : (
            <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCatalog.map((item) => (
                <WidgetCard
                  key={item.id}
                  item={item}
                  onInsert={onInsert}
                  onClose={onClose}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function WidgetCard({
  item,
  onInsert,
  onClose,
}: {
  item: ElementCatalogItem;
  onInsert?(type: NodeType): void;
  onClose(): void;
}) {
  const isPremium = item.tier === "premium";
  const chipTags = Array.from(
    new Set([item.category, item.type, ...item.tags])
  ).slice(0, 5);

  return (
    <article className="flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200">
          {isPremium ? (
            <Crown className="h-5 w-5" />
          ) : (
            <PackagePlus className="h-5 w-5" />
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
            isPremium
              ? "bg-amber-500/15 text-amber-200"
              : "bg-green-600/15 text-green-200"
          }`}
        >
          <Check className="h-3 w-3" />
          {isPremium ? "Premium" : "Default"}
        </span>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold uppercase text-white/40">
          {item.marketplaceCategory}
        </div>
        <h3 className="mt-1 text-lg font-semibold">{item.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/58">
          {item.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chipTags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/55"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-black/20 p-3 text-xs leading-5 text-white/58">
        <div className="mb-1 flex items-center gap-2 font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          AI use
        </div>
        {item.aiUseCases[0] || item.ai.guidance}
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={() => {
            onInsert?.(item.type);
            onClose();
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <PackagePlus className="h-4 w-4" />
          Insert widget
        </button>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="flex items-center gap-2 text-white/55">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
