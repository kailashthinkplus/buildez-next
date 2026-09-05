"use client";

import { Check, Minus, X } from "lucide-react";

export type ComparisonPlan = {
  code: string;
  name: string;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  currency: string;
  isCustom: boolean;
  popular?: boolean;
  featureTable: Array<{ key: string; label: string; value: string; included: boolean; priority: number }>;
};

/**
 * Full side-by-side plan comparison, opened from a "Show all features"
 * link under the (deliberately short) feature list on each plan card.
 * Shared by the onboarding plan step and the dashboard plans page so
 * both present the same comparison.
 */
export default function PlanComparisonModal({
  open,
  onClose,
  plans,
  billing,
  selectedCode,
  priceFor,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  plans: ComparisonPlan[];
  billing: "monthly" | "yearly";
  selectedCode?: string | null;
  priceFor: (amount: number, currency: string) => string;
  onSelect: (planCode: string) => void;
}) {
  if (!open) return null;

  const rowLabels = new Map<string, string>();
  const rowPriorities = new Map<string, number>();
  for (const feature of plans.flatMap((plan) => plan.featureTable)) {
    if (!rowLabels.has(feature.key)) {
      rowLabels.set(feature.key, feature.label);
      rowPriorities.set(feature.key, feature.priority);
    }
  }
  const rowOrder = [...rowLabels.keys()].sort((left, right) => (rowPriorities.get(left) ?? 99) - (rowPriorities.get(right) ?? 99));

  return (
    <div className="dashboard-modal-root flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <button aria-label="Close comparison" className="absolute inset-0" onClick={onClose} />
      <div className="dashboard-modal-surface relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-5 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold">Compare plans</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/55">Every feature, side by side.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl p-2 text-slate-500 hover:bg-slate-900/5 dark:text-white/60 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-inherit">
              <tr>
                <th className="w-56 border-b border-black/5 px-6 py-4 text-left align-bottom font-medium text-slate-500 dark:border-white/10 dark:text-white/55">Feature</th>
                {plans.map((plan) => {
                  const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
                  return (
                    <th key={plan.code} className={`border-b border-black/5 px-4 py-4 text-left align-bottom dark:border-white/10 ${plan.popular ? "bg-blue-500/5" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">{plan.name}</span>
                        {plan.popular ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Popular</span> : null}
                      </div>
                      <p className="mt-1 text-xs font-normal text-slate-500 dark:text-white/55">
                        {plan.isCustom ? "Custom pricing" : price === null || price === undefined ? "Not offered" : `${priceFor(price, plan.currency)} / ${billing === "monthly" ? "mo" : "yr"}`}
                      </p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rowOrder.map((key) => (
                <tr key={key} className="odd:bg-slate-900/[0.015] dark:odd:bg-white/[0.02]">
                  <td className="px-6 py-3 text-slate-700 dark:text-white/75">{rowLabels.get(key)}</td>
                  {plans.map((plan) => {
                    const feature = plan.featureTable.find((entry) => entry.key === key);
                    const included = feature?.included ?? false;
                    return (
                      <td key={plan.code} className={`px-4 py-3 ${plan.popular ? "bg-blue-500/5" : ""}`}>
                        {included ? (
                          <span className="flex items-center gap-1.5 text-slate-700 dark:text-white/85">
                            <Check size={15} className="shrink-0 text-emerald-500" />
                            {feature && feature.value !== feature.label ? feature.value : null}
                          </span>
                        ) : (
                          <Minus size={15} className="text-slate-300 dark:text-white/20" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-black/5 px-6 py-4 dark:border-white/10">
          {plans.map((plan) => (
            <button
              key={plan.code}
              type="button"
              onClick={() => { onSelect(plan.code); onClose(); }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                selectedCode === plan.code
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-slate-900/5 text-slate-900 hover:bg-slate-900/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              }`}
            >
              {selectedCode === plan.code ? `${plan.name} ✓` : `Choose ${plan.name}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
