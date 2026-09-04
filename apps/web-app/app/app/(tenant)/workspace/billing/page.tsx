"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Coins,
  CreditCard,
  Crown,
  Download,
  FileText,
  Globe2,
  LifeBuoy,
  Loader2,
  MoreHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import UpgradePlanModal from "./components/UpgradePlanModal";
import { useDisplayCurrency } from "@/lib/useDisplayCurrency";
import { DashboardModalPortal } from "../../components/ui/DashboardModalPortal";

type Plan = {
  code: string;
  name: string;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
  priceMonthly: number | null;
  priceYearly: number | null;
  features: string[];
};
type Subscription = {
  planCode?: string;
  billingCycle?: string;
  status?: string;
  paymentStatus?: string;
  amountPaid?: number;
  currency?: string;
  billingAccountId?: string;
  subscriptionReference?: string;
  checkoutReference?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  paidAt?: string;
  Plan?: Plan;
};
type TenantData = {
  sites: Array<{ id: string }>;
  plan: Subscription | null;
  usage: Array<{ key: string; used: number }>;
};
type CreditPack = {
  key: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
};
type CreditData = {
  balance: {
    included: { limit: number; used: number; remaining: number };
    topUp: { remaining: number };
    totalRemaining: number;
  };
  canPurchase: boolean;
  packs: CreditPack[];
};
type BillingTransaction = {
  id: string;
  reference: string;
  description: string;
  planCode?: string | null;
  billingCycle?: string | null;
  amountMinor: number;
  currency: string;
  status: string;
  paidAt?: string | null;
  createdAt: string;
  invoiceUrl?: string | null;
};
type LatestPayment = {
  amountMinor: number;
  currency: string;
  paidAt?: string | null;
  reference: string;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(true),
    [showUpgrade, setShowUpgrade] = useState(false),
    [portalLoading, setPortalLoading] = useState(false),
    [buyingCredits, setBuyingCredits] = useState<string | null>(null),
    [showCancelConfirm, setShowCancelConfirm] = useState(false),
    [cancelling, setCancelling] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData | null>(null),
    [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null),
    [plans, setPlans] = useState<Plan[]>([]),
    [creditData, setCreditData] = useState<CreditData | null>(null),
    [transactions, setTransactions] = useState<BillingTransaction[]>([]),
    [latestPayment, setLatestPayment] = useState<LatestPayment | null>(null),
    [error, setError] = useState(""),
    [billingActionError, setBillingActionError] = useState("");
  const { priceFor } = useDisplayCurrency();
  useEffect(() => {
    async function loadBilling() {
      try {
        // Current billing synchronizes the latest provider payment. Fetch the
        // history afterwards so a newly captured payment appears immediately.
        const currentResponse = await fetch("/api/billing/current", {
          cache: "no-store",
        });
        const currentPayload = await currentResponse.json();
        const [
          tenantResponse,
          plansResponse,
          creditsResponse,
          transactionsResponse,
        ] = await Promise.all([
          fetch("/api/tenant/me", { cache: "no-store" }),
          fetch("/api/plans?active=true&public=true", { cache: "no-store" }),
          fetch("/api/billing/credits", { cache: "no-store" }),
          fetch("/api/billing/transactions", { cache: "no-store" }),
        ]);
          const tenantPayload = await tenantResponse.json(),
            plansPayload = await plansResponse.json(),
            creditsPayload = await creditsResponse.json(),
            transactionsPayload = await transactionsResponse.json();
          if (!tenantResponse.ok)
            throw new Error(
              tenantPayload.error || "Billing could not be loaded.",
            );
          if (!plansResponse.ok) throw new Error("Plans could not be loaded.");
          if (!creditsResponse.ok)
            throw new Error(
              creditsPayload.error || "Credit balance could not be loaded.",
            );
          if (!transactionsResponse.ok)
            throw new Error(
              transactionsPayload.error || "Transactions could not be loaded.",
            );
          setTenantData(tenantPayload.data);
          setPlans(Array.isArray(plansPayload) ? plansPayload : []);
          setCreditData(creditsPayload);
          setTransactions(
            Array.isArray(transactionsPayload.transactions)
              ? transactionsPayload.transactions
              : [],
          );
          setLatestPayment(
            currentResponse.ok ? currentPayload.latestPayment || null : null,
          );
          setCurrentSubscription(
            currentResponse.ok ? currentPayload.subscription || null : null,
          );
          return currentPayload.subscription || null;
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Billing could not be loaded.",
        );
        return null;
      } finally {
        setLoading(false);
      }
    }

    let cancelled = false;

    async function initialize() {
      await loadBilling();
      if (new URLSearchParams(window.location.search).get("upgrade") === "1")
        setShowUpgrade(true);

      const params = new URLSearchParams(window.location.search);
      const result = params.get("checkout");
      const planChange = params.get("planChange");
      if (result === "cancelled") {
        sessionStorage.removeItem("pending-plan-code");
        history.replaceState(null, "", "/app/workspace/billing");
        return;
      }
      if (result !== "success" && planChange !== "processing") return;
      const expectedPlan = sessionStorage.getItem("pending-plan-code");
      if (!expectedPlan) return;

      for (let attempt = 0; attempt < 15 && !cancelled; attempt += 1) {
        const confirmation = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode: expectedPlan }),
        });
        const confirmationPayload = await confirmation.json().catch(() => ({}));
        if (confirmation.ok && confirmationPayload.activated) {
          const subscription = await loadBilling();
          if (!cancelled && subscription?.planCode?.toUpperCase() === expectedPlan.toUpperCase()) {
            sessionStorage.removeItem("pending-plan-code");
            history.replaceState(null, "", "/app/workspace/billing");
            return;
          }
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
      }
    }

    void initialize();
    return () => { cancelled = true; };
  }, []);
  const subscription = currentSubscription || tenantData?.plan,
    currentCode = (
      subscription?.planCode ||
      subscription?.Plan?.code ||
      "FREE"
    ).toUpperCase();
  const currentPlan =
    plans.find((plan) => plan.code.toUpperCase() === currentCode) ||
    subscription?.Plan;
  const highestPlan = useMemo(
    () =>
      plans.find((candidate) =>
        plans.every(
          (other) =>
            candidate.maxSites >= other.maxSites &&
            candidate.maxPages >= other.maxPages &&
            candidate.aiCredits >= other.aiCredits &&
            candidate.teamMembers >= other.teamMembers,
        ),
      ),
    [plans],
  );
  const canUpgrade = Boolean(
    highestPlan && highestPlan.code.toUpperCase() !== currentCode,
  );
  async function openBillingPortal() {
    setPortalLoading(true);
    setBillingActionError("");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" }),
        payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.portalUrl)
        throw new Error(payload.error || "Billing portal could not be opened.");
      window.location.assign(payload.portalUrl);
    } catch (reason) {
      setBillingActionError(
        reason instanceof Error
          ? reason.message
          : "Billing portal could not be opened.",
      );
      setPortalLoading(false);
    }
  }
  async function cancelPlan() {
    setCancelling(true);
    setBillingActionError("");
    try {
      const response = await fetch("/api/billing/cancel", { method: "POST" }),
        payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Your plan could not be cancelled.");
      setCurrentSubscription((current) => current ? { ...current, cancelAtPeriodEnd: true, currentPeriodEnd: payload.currentPeriodEnd || current.currentPeriodEnd } : current);
      setShowCancelConfirm(false);
    } catch (reason) {
      setBillingActionError(reason instanceof Error ? reason.message : "Your plan could not be cancelled.");
    } finally {
      setCancelling(false);
    }
  }
  async function buyCredits(packKey: string) {
    setBuyingCredits(packKey);
    setBillingActionError("");
    try {
      const response = await fetch("/api/billing/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packKey }),
        }),
        payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.checkoutUrl)
        throw new Error(
          payload.error || "Credit checkout could not be opened.",
        );
      window.location.assign(payload.checkoutUrl);
    } catch (reason) {
      setBillingActionError(
        reason instanceof Error
          ? reason.message
          : "Credit checkout could not be opened.",
      );
      setBuyingCredits(null);
    }
  }
  if (loading)
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <Loader2 className="animate-spin dashboard-muted" />
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-500">
        {error}
      </div>
    );
  const usageMap = new Map(
    (tenantData?.usage || []).map((item) => [
      item.key.toLowerCase(),
      item.used,
    ]),
  );
  return (
    <>
      <UpgradePlanModal
        open={showUpgrade}
        onClose={() => {
          setShowUpgrade(false);
          history.replaceState(null, "", "/app/workspace/billing");
        }}
        currentPlan={currentCode}
      />
      {showCancelConfirm ? (
        <DashboardModalPortal onClose={() => !cancelling && setShowCancelConfirm(false)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={() => !cancelling && setShowCancelConfirm(false)} />
            <div className="dashboard-modal-surface border dashboard-border relative w-full max-w-md rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold">Cancel your plan?</h2>
              <p className="mt-3 text-sm dashboard-muted">
                You&apos;ll keep full access until{" "}
                {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "the end of your current billing period"}
                . You won&apos;t be charged again after that, and this can&apos;t be undone from here — contact support if you change your mind.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  disabled={cancelling}
                  onClick={() => setShowCancelConfirm(false)}
                  className="rounded-xl border dashboard-border px-4 py-2.5 text-sm font-semibold dashboard-hover disabled:opacity-60"
                >
                  Keep plan
                </button>
                <button
                  disabled={cancelling}
                  onClick={() => void cancelPlan()}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Cancel plan"}
                </button>
              </div>
            </div>
          </div>
        </DashboardModalPortal>
      ) : null}
      <div className="mx-auto max-w-6xl pb-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Plans & payments
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">
              Billing
            </h1>
            <p className="mt-2 text-sm dashboard-muted">
              Understand your plan, usage and payment history in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {subscription?.billingAccountId ? (
              <button
                disabled={portalLoading}
                onClick={() => void openBillingPortal()}
                className="rounded-xl border dashboard-border px-4 py-2.5 text-sm font-semibold dashboard-hover disabled:opacity-60"
              >
                {portalLoading ? "Opening…" : "Manage subscription"}
              </button>
            ) : null}
            {subscription?.subscriptionReference && subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="rounded-xl border border-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
              >
                Cancel plan
              </button>
            ) : null}
            {canUpgrade ? (
              <button
                onClick={() => setShowUpgrade(true)}
                className="dashboard-primary-button flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Crown size={16} /> Upgrade plan
              </button>
            ) : (
              <span className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} /> Highest plan active
              </span>
            )}
          </div>
        </header>
        {billingActionError ? (
          <p className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
            {billingActionError}
          </p>
        ) : null}
        {subscription?.cancelAtPeriodEnd ? (
          <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Your plan will end{subscription.currentPeriodEnd ? ` on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : ""}. You&apos;ll keep access until then and won&apos;t be charged again.
          </p>
        ) : null}
        <section className="relative mt-6 overflow-hidden rounded-3xl border dashboard-border bg-[#07182c] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1 text-xs text-cyan-100">
                <Sparkles size={13} /> Current subscription
              </span>
              <h2 className="mt-4 text-3xl font-semibold">
                {currentPlan?.name || currentCode}
              </h2>
              <p className="mt-2 text-sm text-white/55">
                {subscription?.billingCycle
                  ? `${capitalize(subscription.billingCycle)} billing`
                  : "Free workspace plan"}{" "}
                · {subscription?.status || "ACTIVE"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-white/45">
                Latest payment
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {latestPayment
                  ? formatMoneyMinor(
                      latestPayment.amountMinor,
                      latestPayment.currency,
                    )
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {latestPayment?.paidAt
                  ? `Paid ${new Date(latestPayment.paidAt).toLocaleDateString()}`
                  : "No captured Dodo payment yet"}
              </p>
            </div>
          </div>
        </section>
        <section className="mt-6">
          <h2 className="font-semibold">Plan usage</h2>
          <p className="mt-1 text-xs dashboard-muted">Current billing period</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UsageCard
              icon={Globe2}
              label="Websites"
              used={tenantData?.sites.length || 0}
              total={currentPlan?.maxSites || 1}
            />
            <UsageCard
              icon={FileText}
              label="Pages"
              used={usageMap.get("pages") || 0}
              total={currentPlan?.maxPages || 5}
            />
            <UsageCard
              icon={Bot}
              label="AI credits"
              used={usageMap.get("ai") || usageMap.get("ai_credits") || 0}
              total={currentPlan?.aiCredits || 100}
            />
            <UsageCard
              icon={Users}
              label="Team seats"
              used={usageMap.get("team") || 1}
              total={currentPlan?.teamMembers || 1}
            />
          </div>
        </section>
        <section id="ai-credits" className="dashboard-card mt-6 scroll-mt-24 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                <Coins size={18} />
              </span>
              <div>
                <h2 className="font-semibold">AI credit top-ups</h2>
                <p className="mt-0.5 text-xs dashboard-muted">
                  Purchased credits never expire with your billing cycle.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs dashboard-faint">Available now</p>
              <p className="mt-1 text-xl font-semibold">
                {(creditData?.balance.totalRemaining || 0).toLocaleString()}{" "}
                credits
              </p>
              <p className="mt-0.5 text-xs dashboard-muted">
                {(creditData?.balance.topUp.remaining || 0).toLocaleString()}{" "}
                purchased
              </p>
            </div>
          </div>
          {creditData?.packs.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {creditData.packs.map((pack) => (
                <article
                  key={pack.key}
                  className="rounded-2xl border dashboard-border p-4"
                >
                  <p className="font-semibold">{pack.name}</p>
                  <p className="mt-1 text-sm dashboard-muted">
                    {priceFor(pack.price, pack.currency)} one-time
                  </p>
                  <button
                    disabled={!creditData.canPurchase || Boolean(buyingCredits)}
                    onClick={() => void buyCredits(pack.key)}
                    className="dashboard-primary-button mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {buyingCredits === pack.key
                      ? "Opening checkout…"
                      : "Buy credits"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border dashboard-border px-4 py-3 text-sm dashboard-muted">
              Credit packs are currently unavailable.
            </p>
          )}
        </section>
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="dashboard-card rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <CreditCard size={18} />
              </span>
              <div>
                <h2 className="font-semibold">Payment details</h2>
                <p className="mt-0.5 text-xs dashboard-muted">
                  Secure subscription management
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Detail
                label="Payment status"
                value={subscription?.paymentStatus || "No payment"}
              />
              <Detail
                label="Billing cycle"
                value={capitalize(subscription?.billingCycle || "—")}
              />
              <Detail
                label="Subscription ID"
                value={subscription?.subscriptionReference || "—"}
                mono
              />
              <Detail
                label="Next renewal"
                value={
                  subscription?.currentPeriodEnd
                    ? new Date(
                        subscription.currentPeriodEnd,
                      ).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          </div>
          <div className="dashboard-card rounded-3xl p-5 sm:p-6">
            <h2 className="font-semibold">Included in your plan</h2>
            <div className="mt-4 space-y-3">
              {(currentPlan?.features || []).slice(0, 6).map((feature) => (
                <p key={feature} className="flex gap-2 text-sm dashboard-muted">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  {feature}
                </p>
              ))}
              {!currentPlan?.features?.length ? (
                <p className="text-sm dashboard-muted">
                  Core website building and publishing features.
                </p>
              ) : null}
            </div>
            {canUpgrade ? (
              <button
                onClick={() => setShowUpgrade(true)}
                className="mt-6 w-full rounded-xl border dashboard-border px-4 py-2.5 text-sm font-semibold dashboard-hover"
              >
                Compare upgrade plans
              </button>
            ) : null}
          </div>
        </section>
        <section className="dashboard-card mt-6 overflow-visible rounded-3xl">
          <div className="flex items-center justify-between border-b dashboard-border p-5 sm:p-6">
            <div>
              <h2 className="font-semibold">Transactions</h2>
              <p className="mt-1 text-xs dashboard-muted">
              Payment history
              </p>
            </div>
            <CreditCard size={18} className="dashboard-muted" />
          </div>
          <div className="overflow-x-auto rounded-b-3xl">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="dashboard-subtle text-[10px] font-semibold uppercase tracking-[.12em] dashboard-faint">
                <tr>
                  <th className="px-5 py-3">Transaction</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id} className="border-t dashboard-border">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs">{item.reference}</p>
                      <p className="mt-1 text-xs dashboard-muted">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-5 py-4 dashboard-muted">
                      {item.planCode || "—"}
                      {item.billingCycle ? (
                        <span className="block text-xs dashboard-faint">
                          {capitalize(item.billingCycle)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 dashboard-muted">
                      {new Date(
                        item.paidAt || item.createdAt,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {formatMoneyMinor(item.amountMinor, item.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <TransactionStatus value={item.status} />
                    </td>
                    <td className="px-3 py-4">
                      <TransactionMenu item={item} />
                    </td>
                  </tr>
                ))}
                {!transactions.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm dashboard-muted"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
function UsageCard({
  icon: Icon,
  label,
  used,
  total,
}: {
  icon: typeof Globe2;
  label: string;
  used: number;
  total: number;
}) {
  const percent = Math.min(100, total ? Math.round((used / total) * 100) : 0);
  return (
    <div className="dashboard-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
          <Icon size={17} />
        </span>
        <span className="text-xs dashboard-muted">{percent}%</span>
      </div>
      <p className="mt-4 text-xl font-semibold">
        {used.toLocaleString()}{" "}
        <span className="text-sm font-normal dashboard-faint">
          / {total.toLocaleString()}
        </span>
      </p>
      <p className="mt-1 text-xs dashboard-muted">{label}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/[.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1349A3] to-[#0891B2]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs dashboard-faint">{label}</p>
      <p
        className={`mt-1 truncate text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function capitalize(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}
function formatMoneyMinor(amountMinor: number, currency: string) {
  const zeroDecimal = [
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ].includes(currency.toUpperCase());
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(amountMinor / (zeroDecimal ? 1 : 100));
}
function TransactionStatus({ value }: { value: string }) {
  const success = /paid|succeeded|active/i.test(value);
  const failed = /failed|cancel/i.test(value);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${success ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : failed ? "bg-rose-500/10 text-rose-600 dark:text-rose-300" : "bg-amber-500/10 text-amber-600 dark:text-amber-300"}`}
    >
      {value}
    </span>
  );
}
function TransactionMenu({ item }: { item: BillingTransaction }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const supportMessage = `I need billing support for transaction ${item.reference}, ${item.planCode || item.description}, ${formatMoneyMinor(item.amountMinor, item.currency)}, status ${item.status}.`;

  useEffect(() => {
    if (!open) return;

    function closeMenu(event?: KeyboardEvent) {
      if (!event || event.key === "Escape") setOpen(false);
    }
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    document.addEventListener("keydown", closeMenu);
    return () => {
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      document.removeEventListener("keydown", closeMenu);
    };
  }, [open]);

  function toggleMenu() {
    if (!open && buttonRef.current) {
      const bounds = buttonRef.current.getBoundingClientRect();
      const menuWidth = 224;
      const menuHeight = 112;
      setPosition({
        left: Math.max(
          12,
          Math.min(window.innerWidth - menuWidth - 12, bounds.right - menuWidth),
        ),
        top: bounds.bottom + menuHeight + 6 > window.innerHeight
          ? Math.max(12, bounds.top - menuHeight - 6)
          : bounds.bottom + 6,
      });
    }
    setOpen((value) => !value);
  }

  const dropdown =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[49990]"
            />
            <div
              role="menu"
              className="dashboard-modal-surface fixed z-[50000] w-56 rounded-xl border dashboard-border p-1.5 shadow-xl"
              style={position}
            >
              {item.invoiceUrl ? (
                <a
                  href={item.invoiceUrl}
                  download={`invoice-${item.reference}.pdf`}
                  role="menuitem"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold dashboard-hover"
                >
                  <Download size={14} />
                  Download PDF invoice
                </a>
              ) : (
                <span className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2.5 text-xs dashboard-faint">
                  <Download size={14} />
                  Invoice unavailable
                </span>
              )}
              <Link
                href={`/app/help?send=1&message=${encodeURIComponent(supportMessage)}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold dashboard-hover"
              >
                <LifeBuoy size={14} />
                Request billing support
              </Link>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-label={`Actions for ${item.reference}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-lg p-2 dashboard-hover"
      >
        <MoreHorizontal size={17} />
      </button>
      {dropdown}
    </div>
  );
}
