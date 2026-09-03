"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  Coins,
  CreditCard,
  Gauge,
  Globe2,
  Image as ImageIcon,
  Layers3,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
  Sparkles,
  Timer,
  Users,
  Video,
  Box,
  Figma,
} from "lucide-react";

type PlanFeature = {
  id?: string;
  planCode?: string;
  key: string;
  value: string;
  type?: string | null;
};

type PlanPrice = {
  billingCycle: string;
  currency: string;
  amount: number;
};

type Plan = {
  id: string;
  code: string;
  name: string;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
  isPublic: boolean;
  aiAgentRunLimitPerHour: number;
  aiAgentFollowupLimitPerHour: number;
  builderAgentLimitPerHour: number;
  uploadRateLimitPerHour: number;
  maxDailyUploads: number;
  features?: PlanFeature[];
  pricing?: PlanPrice[];
  _count?: {
    subscriptions?: number;
    siteSubscriptions?: number;
  };
};

type Payload = {
  title?: string;
  subtitle?: string;
  type?: string;
  record?: Record<string, unknown>;
};

type ResolvedPolicy = {
  planCode: string;
  frontierGeneration: true;

  models: {
    design: string;
    implementation: string;
    vision: string;
    economy: string;
    image: string;
  };

  maxAutomaticRepairs: number;
  maxConcurrentGenerations: number;

  allowMultiPage: boolean;
  allowGeneratedImages: boolean;
  allowVideo: boolean;
  allow3D: boolean;
  allowFigma: boolean;
  allowDesignReferences: boolean;

  qaTier: "BASIC" | "STANDARD" | "ADVANCED";
  contextTier: "LIMITED" | "STANDARD" | "EXTENDED";
};

type FormState = {
  name: string;
  maxSites: number;
  maxPages: number;
  aiCredits: number;
  teamMembers: number;
  isPublic: boolean;
  priceMonthly: number;
  priceYearly: number;
  currency: string;

  aiAgentRunLimitPerHour: number;
  aiAgentFollowupLimitPerHour: number;
  builderAgentLimitPerHour: number;
  uploadRateLimitPerHour: number;
  maxDailyUploads: number;

  maxAutomaticRepairs: number;
  maxConcurrency: number;

  allowMultiPage: boolean;
  allowImages: boolean;
  allowVideo: boolean;
  allow3D: boolean;
  allowFigma: boolean;
  allowDesignReferences: boolean;

  qaTier: "BASIC" | "STANDARD" | "ADVANCED";
  contextTier: "LIMITED" | "STANDARD" | "EXTENDED";
};

const DEFAULT_FORM: FormState = {
  name: "",
  maxSites: 1,
  maxPages: 5,
  aiCredits: 100,
  teamMembers: 1,

  isPublic: true,
  priceMonthly: 0,
  priceYearly: 0,
  currency: "INR",

  aiAgentRunLimitPerHour: 20,
  aiAgentFollowupLimitPerHour: 40,
  builderAgentLimitPerHour: 30,
  uploadRateLimitPerHour: 30,
  maxDailyUploads: 50,

  maxAutomaticRepairs: 0,
  maxConcurrency: 1,

  allowMultiPage: true,
  allowImages: true,

  allowVideo: false,
  allow3D: false,
  allowFigma: false,

  allowDesignReferences: true,

  qaTier: "BASIC",
  contextTier: "LIMITED",
};

function featureMap(features?: PlanFeature[]) {
  return new Map(
    (features || []).map((feature) => [
      feature.key.toLowerCase(),
      feature.value,
    ]),
  );
}

function featureBoolean(
  map: Map<string, string>,
  key: string,
  fallback: boolean,
) {
  const value = map.get(key.toLowerCase());

  if (value === undefined) return fallback;

  return ["true", "1", "yes", "enabled", "on"].includes(
    String(value).trim().toLowerCase(),
  );
}

function featureInteger(
  map: Map<string, string>,
  key: string,
  fallback: number,
) {
  const parsed = Number.parseInt(
    map.get(key.toLowerCase()) || "",
    10,
  );

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function featureEnum<T extends string>(
  map: Map<string, string>,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = String(
    map.get(key.toLowerCase()) || "",
  ).toUpperCase() as T;

  return allowed.includes(value)
    ? value
    : fallback;
}

function planToForm(plan: Plan): FormState {
  const features = featureMap(plan.features);
  const monthly = plan.pricing?.find((price) => price.billingCycle === "monthly");
  const yearly = plan.pricing?.find((price) => price.billingCycle === "yearly");

  return {
    name: plan.name,
    maxSites: plan.maxSites,
    maxPages: plan.maxPages,
    aiCredits: plan.aiCredits,
    teamMembers: plan.teamMembers,
    isPublic: plan.isPublic,
    priceMonthly: monthly?.amount ?? 0,
    priceYearly: yearly?.amount ?? 0,
    currency: monthly?.currency ?? yearly?.currency ?? "INR",

    aiAgentRunLimitPerHour: plan.aiAgentRunLimitPerHour,
    aiAgentFollowupLimitPerHour: plan.aiAgentFollowupLimitPerHour,
    builderAgentLimitPerHour: plan.builderAgentLimitPerHour,
    uploadRateLimitPerHour: plan.uploadRateLimitPerHour,
    maxDailyUploads: plan.maxDailyUploads,

    maxAutomaticRepairs:
      featureInteger(
        features,
        "v12.max_auto_repairs",
        0,
      ),

    maxConcurrency:
      featureInteger(
        features,
        "v12.max_concurrency",
        1,
      ),

    allowMultiPage:
      featureBoolean(
        features,
        "v12.allow_multipage",
        true,
      ),

    allowImages:
      featureBoolean(
        features,
        "v12.allow_images",
        true,
      ),

    allowVideo:
      featureBoolean(
        features,
        "v12.allow_video",
        false,
      ),

    allow3D:
      featureBoolean(
        features,
        "v12.allow_3d",
        false,
      ),

    allowFigma:
      featureBoolean(
        features,
        "v12.allow_figma",
        false,
      ),

    allowDesignReferences:
      featureBoolean(
        features,
        "v12.allow_design_references",
        true,
      ),

    qaTier:
      featureEnum(
        features,
        "v12.qa_tier",
        ["BASIC", "STANDARD", "ADVANCED"] as const,
        "BASIC",
      ),

    contextTier:
      featureEnum(
        features,
        "v12.context_tier",
        ["LIMITED", "STANDARD", "EXTENDED"] as const,
        "LIMITED",
      ),
  };
}

function extractPlan(payload: Payload): Plan {
  if (!payload.record) {
    throw new Error("Plan record was not returned");
  }

  return payload.record as unknown as Plan;
}

export default function PlanEditor({
  id,
}: {
  id: string;
}) {
  const [plan, setPlan] =
    useState<Plan | null>(null);

  const [form, setForm] =
    useState<FormState>(DEFAULT_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  const [resolvedPolicy, setResolvedPolicy] =
    useState<ResolvedPolicy | null>(null);

  const [policyLoading, setPolicyLoading] =
    useState(false);

  async function loadResolvedPolicy(
    planCode: string,
  ) {
    setPolicyLoading(true);

    try {
      const response = await fetch(
        `/api/super/plans/policy?code=${encodeURIComponent(planCode)}`,
        {
          cache: "no-store",
        },
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error ||
          "Unable to resolve AI policy",
        );
      }

      setResolvedPolicy(
        body.policy as ResolvedPolicy,
      );
    } catch (reason) {
      console.error(
        "Unable to load resolved V12 policy:",
        reason,
      );

      setResolvedPolicy(null);
    } finally {
      setPolicyLoading(false);
    }
  }

  async function loadPlan() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/super/details/plans/${encodeURIComponent(id)}`,
        {
          cache: "no-store",
        },
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error || "Unable to load plan",
        );
      }

      const nextPlan =
        extractPlan(body as Payload);

      setPlan(nextPlan);
      setForm(planToForm(nextPlan));

      await loadResolvedPolicy(
        nextPlan.code,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load plan",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, [id]);

  const dirty = useMemo(() => {
    if (!plan) return false;

    return (
      JSON.stringify(form) !==
      JSON.stringify(planToForm(plan))
    );
  }, [form, plan]);

  async function save() {
    if (!plan || saving) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(
        "/api/super/plans",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: plan.code,

            name: form.name,
            maxSites: form.maxSites,
            maxPages: form.maxPages,
            aiCredits: form.aiCredits,
            teamMembers: form.teamMembers,
            isPublic: form.isPublic,
            aiAgentRunLimitPerHour: form.aiAgentRunLimitPerHour,
            aiAgentFollowupLimitPerHour: form.aiAgentFollowupLimitPerHour,
            builderAgentLimitPerHour: form.builderAgentLimitPerHour,
            uploadRateLimitPerHour: form.uploadRateLimitPerHour,
            maxDailyUploads: form.maxDailyUploads,
            priceMonthly:
              plan.pricing?.some((price) => price.billingCycle === "monthly") || form.priceMonthly > 0
                ? form.priceMonthly
                : undefined,
            priceYearly:
              plan.pricing?.some((price) => price.billingCycle === "yearly") || form.priceYearly > 0
                ? form.priceYearly
                : undefined,
            currency: form.currency,

            v12Features: {
              "v12.max_auto_repairs":
                form.maxAutomaticRepairs,

              "v12.max_concurrency":
                form.maxConcurrency,

              "v12.allow_multipage":
                form.allowMultiPage,

              "v12.allow_images":
                form.allowImages,

              "v12.allow_video":
                form.allowVideo,

              "v12.allow_3d":
                form.allow3D,

              "v12.allow_figma":
                form.allowFigma,

              "v12.allow_design_references":
                form.allowDesignReferences,

              "v12.qa_tier":
                form.qaTier,

              "v12.context_tier":
                form.contextTier,
            },
          }),
        },
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error || "Unable to save plan",
        );
      }

      const nextPlan =
        body.plan as Plan;

      setPlan(nextPlan);
      setForm(planToForm(nextPlan));

      await loadResolvedPolicy(
        nextPlan.code,
      );

      setSaved(true);

      window.setTimeout(
        () => setSaved(false),
        2500,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to save plan",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-card flex h-64 items-center justify-center rounded-3xl">
        <Loader2 className="animate-spin dashboard-muted" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-600 dark:text-rose-300">
        {error || "Plan not found"}
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/super/plans"
          className="inline-flex items-center gap-2 text-sm font-semibold dashboard-muted hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to plans
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadPlan()}
            disabled={saving}
            className="dashboard-card inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Reset
          </button>

          <button
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}

            {saving
              ? "Saving..."
              : saved
                ? "Saved"
                : "Save changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[30px] border dashboard-border bg-[#07101d] p-7 text-white shadow-xl sm:p-9">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-violet-500/10" />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 backdrop-blur-md">
                <Sparkles size={13} />
                BuildEZ plan configuration
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
                {form.name}
              </h1>

              <p className="mt-2 text-sm text-white/55">
                {plan.code}
              </p>
            </div>

            <StatusPill
              enabled={form.isPublic}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  isPublic:
                    !current.isPublic,
                }))
              }
            />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
        <div className="space-y-6">
          <Section
            icon={<Settings2 size={18} />}
            eyebrow="Plan"
            title="General configuration"
            description="Commercial limits and availability for this plan."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Plan name">
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="dashboard-input w-full rounded-xl px-3 py-2.5 text-sm"
                />
              </Field>

              <Field label="Plan code">
                <input
                  value={plan.code}
                  disabled
                  className="dashboard-input w-full rounded-xl px-3 py-2.5 text-sm opacity-60"
                />
              </Field>

              <NumberField
                label="Maximum websites"
                icon={<Globe2 size={15} />}
                value={form.maxSites}
                minimum={1}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    maxSites: value,
                  }))
                }
              />

              <NumberField
                label="Maximum pages"
                icon={<Layers3 size={15} />}
                value={form.maxPages}
                minimum={1}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    maxPages: value,
                  }))
                }
              />

              <NumberField
                label="AI credits"
                icon={<Coins size={15} />}
                value={form.aiCredits}
                minimum={0}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    aiCredits: value,
                  }))
                }
              />

              <NumberField
                label="Team members"
                icon={<Users size={15} />}
                value={form.teamMembers}
                minimum={1}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    teamMembers: value,
                  }))
                }
              />
            </div>
          </Section>

          <Section
            icon={<CreditCard size={18} />}
            eyebrow="Billing"
            title="Plan pricing"
            description="Set the prices shown on the plan page and during onboarding."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                label="Monthly price"
                icon={<CreditCard size={15} />}
                value={form.priceMonthly}
                minimum={0}
                onChange={(value) => setForm((current) => ({ ...current, priceMonthly: value }))}
              />
              <NumberField
                label="Yearly price"
                icon={<CreditCard size={15} />}
                value={form.priceYearly}
                minimum={0}
                onChange={(value) => setForm((current) => ({ ...current, priceYearly: value }))}
              />
              <Field label="Currency">
                <input
                  value={form.currency}
                  maxLength={3}
                  onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                  className="dashboard-input w-full rounded-xl px-3 py-2.5 text-sm uppercase"
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={<Bot size={18} />}
            eyebrow="V12"
            title="AI generation"
            description="Control execution depth and generation capabilities independently of the plan name."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Automatic repair passes"
                icon={<RefreshCw size={15} />}
                value={
                  form.maxAutomaticRepairs
                }
                minimum={0}
                maximum={10}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    maxAutomaticRepairs:
                      value,
                  }))
                }
              />

              <NumberField
                label="Concurrent generations"
                icon={<Gauge size={15} />}
                value={form.maxConcurrency}
                minimum={1}
                maximum={20}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    maxConcurrency: value,
                  }))
                }
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CapabilityToggle
                title="Multi-page generation"
                description="Allow complete websites with inner pages."
                icon={<Layers3 size={17} />}
                value={form.allowMultiPage}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    allowMultiPage: value,
                  }))
                }
              />

              <CapabilityToggle
                title="Generated images"
                description="Allow AI-generated website imagery."
                icon={<ImageIcon size={17} />}
                value={form.allowImages}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    allowImages: value,
                  }))
                }
              />

              <CapabilityToggle
                title="Video generation"
                description="Allow generated video assets."
                icon={<Video size={17} />}
                value={form.allowVideo}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    allowVideo: value,
                  }))
                }
              />

              <CapabilityToggle
                title="3D generation"
                description="Allow advanced 3D experiences."
                icon={<Box size={17} />}
                value={form.allow3D}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    allow3D: value,
                  }))
                }
              />

              <CapabilityToggle
                title="Figma"
                description="Allow Figma-assisted workflows."
                icon={<Figma size={17} />}
                value={form.allowFigma}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    allowFigma: value,
                  }))
                }
              />

              <CapabilityToggle
                title="Design references"
                description="Allow reference-driven visual generation."
                icon={<Sparkles size={17} />}
                value={
                  form.allowDesignReferences
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    allowDesignReferences:
                      value,
                  }))
                }
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="QA tier">
                <select
                  value={form.qaTier}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      qaTier:
                        event.target.value as FormState["qaTier"],
                    }))
                  }
                  className="dashboard-input w-full rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="BASIC">
                    Basic
                  </option>
                  <option value="STANDARD">
                    Standard
                  </option>
                  <option value="ADVANCED">
                    Advanced
                  </option>
                </select>
              </Field>

              <Field label="Context tier">
                <select
                  value={form.contextTier}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      contextTier:
                        event.target.value as FormState["contextTier"],
                    }))
                  }
                  className="dashboard-input w-full rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="LIMITED">
                    Limited
                  </option>
                  <option value="STANDARD">
                    Standard
                  </option>
                  <option value="EXTENDED">
                    Extended
                  </option>
                </select>
              </Field>
            </div>
          </Section>

          <Section
            icon={<Timer size={18} />}
            eyebrow="Guardrails"
            title="AI rate limits"
            description="Maximum AI Agent and Builder AI requests per hour, per user, on this plan."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                label="Agent runs / hour"
                icon={<Timer size={15} />}
                value={form.aiAgentRunLimitPerHour}
                minimum={0}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    aiAgentRunLimitPerHour: value,
                  }))
                }
              />

              <NumberField
                label="Agent follow-ups / hour"
                icon={<Timer size={15} />}
                value={form.aiAgentFollowupLimitPerHour}
                minimum={0}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    aiAgentFollowupLimitPerHour: value,
                  }))
                }
              />

              <NumberField
                label="Builder AI requests / hour"
                icon={<Timer size={15} />}
                value={form.builderAgentLimitPerHour}
                minimum={0}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    builderAgentLimitPerHour: value,
                  }))
                }
              />
            </div>
          </Section>

          <Section
            icon={<Timer size={18} />}
            eyebrow="Guardrails"
            title="Upload limits"
            description="Maximum media/image uploads per hour and per rolling 24 hours, per user, on this plan."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Uploads / hour"
                icon={<Timer size={15} />}
                value={form.uploadRateLimitPerHour}
                minimum={0}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    uploadRateLimitPerHour: value,
                  }))
                }
              />

              <NumberField
                label="Uploads / day"
                icon={<Timer size={15} />}
                value={form.maxDailyUploads}
                minimum={0}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    maxDailyUploads: value,
                  }))
                }
              />
            </div>
          </Section>
        </div>

        <div className="xl:sticky xl:top-5 xl:self-start">
          <PolicyPreview
            plan={plan}
            form={form}
            resolvedPolicy={resolvedPolicy}
            loading={policyLoading}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="dashboard-card rounded-3xl p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-semibold">
            {title}
          </h2>

          <p className="mt-1 text-sm dashboard-muted">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold dashboard-muted">
        {label}
      </span>

      {children}
    </label>
  );
}

function NumberField({
  label,
  icon,
  value,
  minimum,
  maximum,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  minimum: number;
  maximum?: number;
  onChange(value: number): void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 dashboard-faint">
          {icon}
        </span>

        <input
          type="number"
          min={minimum}
          max={maximum}
          value={value}
          onChange={(event) => {
            const parsed =
              Number.parseInt(
                event.target.value,
                10,
              );

            onChange(
              Number.isFinite(parsed)
                ? parsed
                : minimum,
            );
          }}
          className="dashboard-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm"
        />
      </div>
    </Field>
  );
}

function CapabilityToggle({
  title,
  description,
  icon,
  value,
  onChange,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
  onChange(value: boolean): void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex min-h-[88px] items-center gap-3 rounded-2xl border dashboard-border bg-[var(--dashboard-surface)] p-4 text-left transition dashboard-hover"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 dashboard-muted">
          {description}
        </span>
      </span>

      <Toggle enabled={value} />
    </button>
  );
}

function Toggle({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        enabled
          ? "bg-blue-600"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          enabled
            ? "left-6"
            : "left-1"
        }`}
      />
    </span>
  );
}

function StatusPill({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick(): void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur-md ${
        enabled
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
          : "border-white/15 bg-white/5 text-white/60"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          enabled
            ? "bg-emerald-400"
            : "bg-white/35"
        }`}
      />

      {enabled
        ? "Public plan"
        : "Private plan"}
    </button>
  );
}

function PolicyPreview({
  plan,
  form,
  resolvedPolicy,
  loading,
}: {
  plan: Plan;
  form: FormState;
  resolvedPolicy: ResolvedPolicy | null;
  loading: boolean;
}) {
  const policy =
    resolvedPolicy;

  const rows = policy
    ? [
        [
          "Initial generation",
          policy.frontierGeneration
            ? "Frontier"
            : "Restricted",
        ],
        [
          "Automatic repairs",
          String(
            policy.maxAutomaticRepairs,
          ),
        ],
        [
          "Concurrency",
          String(
            policy.maxConcurrentGenerations,
          ),
        ],
        [
          "Multi-page",
          policy.allowMultiPage
            ? "Enabled"
            : "Disabled",
        ],
        [
          "Generated images",
          policy.allowGeneratedImages
            ? "Enabled"
            : "Disabled",
        ],
        [
          "Video",
          policy.allowVideo
            ? "Enabled"
            : "Disabled",
        ],
        [
          "3D",
          policy.allow3D
            ? "Enabled"
            : "Disabled",
        ],
        [
          "Figma",
          policy.allowFigma
            ? "Enabled"
            : "Disabled",
        ],
        [
          "Design references",
          policy.allowDesignReferences
            ? "Enabled"
            : "Disabled",
        ],
        [
          "QA",
          policy.qaTier,
        ],
        [
          "Context",
          policy.contextTier,
        ],
        [
          "Monthly AI credits",
          form.aiCredits.toLocaleString(),
        ],
      ]
    : [];

  return (
    <section className="dashboard-card overflow-hidden rounded-3xl">
      <div className="border-b dashboard-border p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
            <Sparkles size={18} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] dashboard-faint">
              Runtime
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Resolved AI policy
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 dashboard-muted">
          Effective server-side V12 policy for{" "}
          <span className="font-semibold">
            {plan.code}
          </span>
          .
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2
            size={20}
            className="animate-spin dashboard-muted"
          />
        </div>
      ) : policy ? (
        <>
          <div className="divide-y dashboard-border">
            {rows.map(
              ([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6"
                >
                  <span className="text-xs dashboard-muted">
                    {label}
                  </span>

                  <span className="text-xs font-semibold">
                    {value}
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="border-t dashboard-border bg-blue-500/[.04] p-5">
            <p className="text-xs leading-5 dashboard-muted">
              This preview is returned by the same
              V12 execution-policy resolver used
              during live generation.
            </p>
          </div>
        </>
      ) : (
        <div className="p-6 text-sm dashboard-muted">
          Unable to resolve the current policy.
        </div>
      )}
    </section>
  );
}
