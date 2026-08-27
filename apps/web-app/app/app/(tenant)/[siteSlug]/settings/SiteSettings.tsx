"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileSearch,
  Globe2,
  Languages,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Save,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import { R2ImageUpload } from "@/components/media/R2ImageUpload";

type Site = { id: string; name: string; slug: string; status: string };
type Domain = {
  id: string;
  domain: string;
  status: string;
  cnameTarget: string;
};
type PageOption = { id: string; title: string; slug: string; status: string };
type Form = Site & {
  logoUrl: string;
  language: string;
  timezone: string;
  dateFormat: string;
  contactEmail: string;
  contactPhone: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  allowIndexing: boolean;
  socialImageUrl: string;
  twitterHandle: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  cookieBannerEnabled: boolean;
  cookieMessage: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  frontPageId: string;
  notFoundPageId: string;
  maintenanceMode: boolean;
  showPoweredBy: boolean;
  trailingSlash: boolean;
  redirectToWww: boolean;
};
const initial = (site: Site): Form => ({
  ...site,
  logoUrl: "",
  language: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  contactEmail: "",
  contactPhone: "",
  faviconUrl: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  allowIndexing: true,
  socialImageUrl: "",
  twitterHandle: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  metaPixelId: "",
  cookieBannerEnabled: true,
  cookieMessage: "We use cookies to improve your experience.",
  privacyPolicyUrl: "",
  termsUrl: "",
  frontPageId: "",
  notFoundPageId: "",
  maintenanceMode: false,
  showPoweredBy: true,
  trailingSlash: false,
  redirectToWww: false,
});
const tabs = [
  ["general", "General", Settings],
  ["localization", "Localization", Languages],
  ["seo", "SEO", FileSearch],
  ["social", "Social sharing", Share2],
  ["domains", "Domains", Globe2],
  ["analytics", "Analytics", BarChart3],
  ["privacy", "Privacy", LockKeyhole],
  ["publishing", "Publishing", Eye],
  ["danger", "Delete website", Trash2],
] as const;

export default function SiteSettings({ site }: { site: Site }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("general"),
    [form, setForm] = useState<Form>(initial(site)),
    [pages, setPages] = useState<PageOption[]>([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/sites/${site.id}/settings`),
      b = await r.json();
    if (r.ok) {
      setForm({ ...initial(site), ...b.site, ...b.site.settings });
      setPages(Array.isArray(b.pages) ? b.pages : []);
    } else setError(b.error);
    setLoading(false);
  }, [site]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  async function save(next?: Partial<Form>) {
    setSaving(true);
    setError("");
    const payload = { ...form, ...next };
    const r = await fetch(`/api/sites/${site.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      b = await r.json();
    setSaving(false);
    if (!r.ok) return setError(b.error || "Could not save settings");
    setForm({ ...payload, ...b.site, ...b.site.settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }
  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  return (
    <div className="mx-auto max-w-[1400px] pb-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Settings size={16} /> SITE SETTINGS
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">
            Control every site-level setting.
          </h1>
          <p className="mt-2 text-sm dashboard-muted">
            Identity, page routing, discovery, measurement, privacy, domains,
            and publishing for {form.name}.
          </p>
        </div>
        <button
          disabled={saving || tab === "danger"}
          onClick={() => void save()}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}{" "}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </header>
      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-500">
          {error}
        </div>
      )}
      <div className="grid gap-5 xl:grid-cols-[230px_1fr]">
        <nav className="dashboard-card h-fit rounded-2xl p-2">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${tab === id ? "bg-blue-600 text-white" : id === "danger" ? "text-rose-500 dashboard-hover" : "dashboard-muted dashboard-hover"}`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <main>
          {tab === "general" && (
            <General form={form} set={setForm} pages={pages} />
          )}{" "}
          {tab === "localization" && <Localization form={form} set={setForm} />}{" "}
          {tab === "seo" && <Seo form={form} set={setForm} />}{" "}
          {tab === "social" && <Social form={form} set={setForm} />}{" "}
          {tab === "domains" && <Domains site={site} />}{" "}
          {tab === "analytics" && <Analytics form={form} set={setForm} />}{" "}
          {tab === "privacy" && <Privacy form={form} set={setForm} />}{" "}
          {tab === "publishing" && <Publishing form={form} save={save} />}{" "}
          {tab === "danger" && (
            <DangerZone
              site={site}
              onDeleted={() => router.push("/app/workspace/websites")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function General({
  form,
  set,
  pages,
}: {
  form: Form;
  set: (x: Form) => void;
  pages: PageOption[];
}) {
  const pageOptions: [string, string][] = [
    ["", "Automatic (home or first published page)"],
    ...pages.map(
      (page) =>
        [
          page.id,
          `${page.title} · /${page.slug}${page.status === "PUBLISHED" ? "" : " · Draft"}`,
        ] as [string, string],
    ),
  ];
  return (
    <div className="space-y-5">
      <Card
        title="Site identity"
        hint="Used across the dashboard, browser, search, and published site."
      >
        <Field
          label="Site name"
          value={form.name}
          set={(name) => set({ ...form, name })}
        />
        <Field
          label="Site URL slug"
          value={form.slug}
          set={(slug) => set({ ...form, slug })}
          prefix="/"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <R2ImageUpload
            siteId={form.id}
            label="Website logo"
            value={form.logoUrl}
            onChange={(logoUrl) => set({ ...form, logoUrl })}
            purpose="logo"
            endpoint={`/api/sites/${form.id}/branding/logo`}
            responseKey="logoUrl"
            accept="image/png,image/jpeg,image/webp"
            help="PNG, JPG, or WebP. Uploading a logo can also update the site colour palette."
          />
          <R2ImageUpload
            siteId={form.id}
            label="Browser favicon"
            value={form.faviconUrl}
            onChange={(faviconUrl) => set({ ...form, faviconUrl })}
            purpose="favicon"
            accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
            help="Use a square PNG, SVG, or ICO file."
          />
        </div>
      </Card>
      <Card
        title="Page routing"
        hint="Choose which pages visitors see for your root address and missing links."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Select home page"
            value={form.frontPageId}
            set={(frontPageId) => set({ ...form, frontPageId })}
            options={pageOptions}
          />
          <Select
            label="404 page"
            value={form.notFoundPageId}
            set={(notFoundPageId) => set({ ...form, notFoundPageId })}
            options={[["", "Default BuildEZ 404"], ...pageOptions.slice(1)]}
          />
        </div>
        <Toggle
          checked={form.maintenanceMode}
          set={(maintenanceMode) => set({ ...form, maintenanceMode })}
          title="Maintenance mode"
          hint="Temporarily hide the public website while editors continue working."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle
            checked={form.showPoweredBy}
            set={(showPoweredBy) => set({ ...form, showPoweredBy })}
            title="BuildEZ badge"
            hint="Show the platform credit."
          />
          <Toggle
            checked={form.trailingSlash}
            set={(trailingSlash) => set({ ...form, trailingSlash })}
            title="Trailing slash"
            hint="Use canonical URLs ending in /."
          />
          <Toggle
            checked={form.redirectToWww}
            set={(redirectToWww) => set({ ...form, redirectToWww })}
            title="Prefer www"
            hint="Redirect the root domain to www."
          />
        </div>
      </Card>
      <Card
        title="Business contact"
        hint="Default contact details for site integrations and visitor communication."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Contact email"
            type="email"
            value={form.contactEmail}
            set={(contactEmail) => set({ ...form, contactEmail })}
          />
          <Field
            label="Contact phone"
            type="tel"
            value={form.contactPhone}
            set={(contactPhone) => set({ ...form, contactPhone })}
          />
        </div>
      </Card>
    </div>
  );
}
function Localization({ form, set }: { form: Form; set: (x: Form) => void }) {
  return (
    <Card
      title="Language and region"
      hint="Controls formatting defaults across your published website."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Default language"
          value={form.language}
          set={(language) => set({ ...form, language })}
          options={[
            ["en", "English"],
            ["hi", "Hindi"],
            ["es", "Spanish"],
            ["fr", "French"],
            ["de", "German"],
            ["ar", "Arabic"],
          ]}
        />
        <Select
          label="Timezone"
          value={form.timezone}
          set={(timezone) => set({ ...form, timezone })}
          options={[
            ["Asia/Kolkata", "India Standard Time"],
            ["UTC", "UTC"],
            ["America/New_York", "Eastern Time"],
            ["Europe/London", "London"],
            ["Asia/Dubai", "Dubai"],
            ["Asia/Singapore", "Singapore"],
          ]}
        />
        <Select
          label="Date format"
          value={form.dateFormat}
          set={(dateFormat) => set({ ...form, dateFormat })}
          options={[
            ["DD/MM/YYYY", "DD/MM/YYYY"],
            ["MM/DD/YYYY", "MM/DD/YYYY"],
            ["YYYY-MM-DD", "YYYY-MM-DD"],
          ]}
        />
      </div>
    </Card>
  );
}
function Seo({ form, set }: { form: Form; set: (x: Form) => void }) {
  return (
    <div className="space-y-5">
      <Card
        title="Search defaults"
        hint="Page-specific SEO can override these site-wide defaults."
      >
        <Field
          label="Default search title"
          value={form.seoTitle}
          set={(seoTitle) => set({ ...form, seoTitle })}
          max={70}
        />
        <Area
          label="Meta description"
          value={form.seoDescription}
          set={(seoDescription) => set({ ...form, seoDescription })}
          max={170}
        />
        <Field
          label="Keywords"
          value={form.seoKeywords}
          set={(seoKeywords) => set({ ...form, seoKeywords })}
          placeholder="design, consulting, Bengaluru"
        />
        <Field
          label="Canonical site URL"
          value={form.canonicalUrl}
          set={(canonicalUrl) => set({ ...form, canonicalUrl })}
          placeholder="https://www.yourdomain.com"
        />
        <Toggle
          checked={form.allowIndexing}
          set={(allowIndexing) => set({ ...form, allowIndexing })}
          title="Allow search engine indexing"
          hint="Disable this for staging or private sites."
        />
      </Card>
      <article className="rounded-2xl border dashboard-border bg-white p-5 dark:bg-white/[.03]">
        <p className="text-sm text-blue-600">
          {form.canonicalUrl || `https://${form.slug}.buildez.app`}
        </p>
        <h3 className="mt-1 text-xl text-[#1a0dab]">
          {form.seoTitle || form.name}
        </h3>
        <p className="mt-1 text-sm text-emerald-700">
          {form.seoDescription ||
            "Your default search description will preview here."}
        </p>
      </article>
    </div>
  );
}
function Social({ form, set }: { form: Form; set: (x: Form) => void }) {
  return (
    <div className="space-y-5">
      <Card
        title="Social preview"
        hint="Default Open Graph image and account information."
      >
        <R2ImageUpload
          siteId={form.id}
          label="Social share image"
          value={form.socialImageUrl}
          onChange={(socialImageUrl) => set({ ...form, socialImageUrl })}
          purpose="social-share"
          accept="image/png,image/jpeg,image/webp"
          help="Recommended size: 1200 × 630 pixels."
        />
        <Field
          label="X / Twitter handle"
          value={form.twitterHandle}
          set={(twitterHandle) => set({ ...form, twitterHandle })}
          placeholder="@yourbrand"
        />
      </Card>
      <Card title="Social profiles">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Facebook"
            value={form.facebookUrl}
            set={(facebookUrl) => set({ ...form, facebookUrl })}
          />
          <Field
            label="Instagram"
            value={form.instagramUrl}
            set={(instagramUrl) => set({ ...form, instagramUrl })}
          />
          <Field
            label="LinkedIn"
            value={form.linkedinUrl}
            set={(linkedinUrl) => set({ ...form, linkedinUrl })}
          />
        </div>
      </Card>
    </div>
  );
}
function Analytics({ form, set }: { form: Form; set: (x: Form) => void }) {
  return (
    <Card
      title="Tracking integrations"
      hint="IDs are injected only on the published website. Consent requirements still apply."
    >
      <div className="grid gap-4">
        <Field
          label="Google Analytics measurement ID"
          value={form.googleAnalyticsId}
          set={(googleAnalyticsId) => set({ ...form, googleAnalyticsId })}
          placeholder="G-XXXXXXXXXX"
        />
        <Field
          label="Google Tag Manager container"
          value={form.googleTagManagerId}
          set={(googleTagManagerId) => set({ ...form, googleTagManagerId })}
          placeholder="GTM-XXXXXXX"
        />
        <Field
          label="Meta Pixel ID"
          value={form.metaPixelId}
          set={(metaPixelId) => set({ ...form, metaPixelId })}
        />
      </div>
    </Card>
  );
}
function Privacy({ form, set }: { form: Form; set: (x: Form) => void }) {
  return (
    <div className="space-y-5">
      <Card title="Cookie consent">
        <Toggle
          checked={form.cookieBannerEnabled}
          set={(cookieBannerEnabled) => set({ ...form, cookieBannerEnabled })}
          title="Show cookie consent banner"
          hint="Recommended when analytics or advertising trackers are enabled."
        />
        <Area
          label="Cookie message"
          value={form.cookieMessage}
          set={(cookieMessage) => set({ ...form, cookieMessage })}
          max={300}
        />
      </Card>
      <Card title="Legal links">
        <Field
          label="Privacy policy URL"
          value={form.privacyPolicyUrl}
          set={(privacyPolicyUrl) => set({ ...form, privacyPolicyUrl })}
        />
        <Field
          label="Terms and conditions URL"
          value={form.termsUrl}
          set={(termsUrl) => set({ ...form, termsUrl })}
        />
      </Card>
    </div>
  );
}
function Publishing({
  form,
  save,
}: {
  form: Form;
  save: (x?: Partial<Form>) => Promise<void>;
}) {
  const live = form.status === "PUBLISHED";
  return (
    <div className="space-y-5">
      <article
        className={`rounded-2xl border p-6 ${live ? "border-emerald-500/25 bg-emerald-500/10" : "border-amber-500/25 bg-amber-500/10"}`}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${live ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}
          >
            {live ? <CheckCircle2 /> : <Eye />}
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              {live ? "Site is published" : "Site is in draft"}
            </h2>
            <p className="mt-1 text-sm dashboard-muted">
              {live
                ? "Visitors can access published pages through platform and verified custom domains."
                : "Publish at least one page, then make the complete site available."}
            </p>
          </div>
        </div>
        <button
          onClick={() => void save({ status: live ? "DRAFT" : "PUBLISHED" })}
          className={`mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${live ? "bg-slate-700" : "bg-emerald-600"}`}
        >
          {live ? "Unpublish site" : "Publish site"}
        </button>
      </article>
      <Card title="Publishing checklist">
        <Checklist ok={Boolean(form.name)} text="Site identity configured" />
        <Checklist
          ok={Boolean(form.seoTitle && form.seoDescription)}
          text="Search title and description added"
        />
        <Checklist
          ok={Boolean(form.privacyPolicyUrl)}
          text="Privacy policy linked"
        />
        <Checklist ok={form.allowIndexing} text="Search indexing enabled" />
      </Card>
    </div>
  );
}
function Domains({ site }: { site: Site }) {
  const [domains, setDomains] = useState<Domain[]>([]),
    [platformUrl, setPlatformUrl] = useState(""),
    [domain, setDomain] = useState(""),
    [working, setWorking] = useState(""),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    const r = await fetch(`/api/sites/${site.id}/domains`),
      b = await r.json();
    if (r.ok) {
      setDomains(b.domains);
      setPlatformUrl(b.platformUrl);
    } else setError(b.error);
  }, [site.id]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  async function add() {
    setWorking("add");
    setError("");
    const r = await fetch(`/api/sites/${site.id}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      }),
      b = await r.json();
    if (!r.ok) setError(`${b.error}${b.detail ? `: ${b.detail}` : ""}`);
    else setDomain("");
    await load();
    setWorking("");
  }
  async function verify(id: string) {
    setWorking(id);
    const r = await fetch(`/api/sites/${site.id}/domains`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id }),
      }),
      b = await r.json();
    if (!r.ok) setError(`${b.error}${b.detail ? `: ${b.detail}` : ""}`);
    await load();
    setWorking("");
  }
  async function remove(id: string) {
    setWorking(id);
    const r = await fetch(`/api/sites/${site.id}/domains?domainId=${id}`, {
        method: "DELETE",
      }),
      b = await r.json();
    if (!r.ok) setError(b.error);
    await load();
    setWorking("");
  }
  return (
    <div className="space-y-5">
      <Card
        title="Connect a custom domain"
        hint="BuildEZ automatically provisions the production Nginx site after you add the domain."
      >
        <div className="rounded-xl bg-blue-500/10 p-4 text-sm">
          At your DNS provider, add an <strong>A record</strong> pointing to{" "}
          <code className="font-semibold text-blue-600">206.189.129.113</code>.
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="www.yourbrand.com"
            className="dashboard-input min-w-0 flex-1 rounded-xl p-3"
          />
          <button
            disabled={!domain || working === "add"}
            onClick={() => void add()}
            className="rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white"
          >
            {working === "add" ? "Adding…" : "Add domain"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        <p className="mt-3 text-xs dashboard-muted">
          Platform address: {platformUrl}
        </p>
      </Card>
      {domains.map((x) => (
        <article key={x.id} className="dashboard-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Globe2 className="text-blue-500" />
            <div>
              <p className="font-semibold">{x.domain}</p>
              <p className="text-xs dashboard-muted">
                A → 206.189.129.113 · Shopez at /shop
              </p>
            </div>
            <span
              className={`ml-auto rounded-full px-2 py-1 text-xs ${x.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}
            >
              {x.status}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() =>
                void navigator.clipboard.writeText("206.189.129.113")
              }
              className="rounded-xl border dashboard-border p-2"
              aria-label="Copy server IP"
            >
              <Copy size={14} />
            </button>
            <button
              disabled={working === x.id}
              onClick={() => void verify(x.id)}
              className="flex items-center gap-2 rounded-xl border dashboard-border px-3 text-xs"
            >
              <RefreshCw
                size={13}
                className={working === x.id ? "animate-spin" : ""}
              />
              Verify
            </button>
            {x.status === "VERIFIED" && (
              <a
                href={`https://${x.domain}`}
                target="_blank"
                className="flex items-center gap-2 rounded-xl border dashboard-border px-3 text-xs"
              >
                <ExternalLink size={13} />
                Open
              </a>
            )}
            <button
              disabled={working === x.id}
              onClick={() => void remove(x.id)}
              className="ml-auto p-2 text-rose-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function DangerZone({
  site,
  onDeleted,
}: {
  site: Site;
  onDeleted: () => void;
}) {
  const [confirmation, setConfirmation] = useState(""),
    [deleting, setDeleting] = useState(false),
    [error, setError] = useState("");
  async function remove() {
    if (confirmation !== site.name || deleting) return;
    setDeleting(true);
    setError("");
    const response = await fetch(`/api/sites/${site.id}/settings`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });
    const payload = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      setError(payload.error || "Website could not be deleted");
      return;
    }
    onDeleted();
  }
  return (
    <article className="rounded-2xl border border-rose-500/25 bg-rose-500/[.06] p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-500 text-white">
          <Trash2 size={19} />
        </span>
        <div>
          <h2 className="font-semibold text-rose-600 dark:text-rose-300">
            Delete website
          </h2>
          <p className="mt-1 text-sm leading-6 dashboard-muted">
            This removes the website from the workspace and takes its public
            pages offline. Your data remains soft-deleted for administrative
            recovery.
          </p>
        </div>
      </div>
      <label className="mt-6 block text-xs font-medium dashboard-muted">
        Type <strong className="text-current">{site.name}</strong> to confirm
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          className="dashboard-input mt-2 w-full rounded-xl p-3"
        />
      </label>
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      <button
        disabled={confirmation !== site.name || deleting}
        onClick={() => void remove()}
        className="mt-5 flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {deleting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Trash2 size={15} />
        )}{" "}
        {deleting ? "Deleting…" : "Delete website"}
      </button>
    </article>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="dashboard-card rounded-2xl p-6">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-xs dashboard-muted">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
function Field({
  label,
  value,
  set,
  type = "text",
  placeholder,
  prefix,
  max,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
  max?: number;
}) {
  return (
    <label className="block text-xs font-medium dashboard-muted">
      {label}
      <div className="mt-1.5 flex rounded-xl border dashboard-border focus-within:border-blue-500">
        {prefix && <span className="px-3 py-3">{prefix}</span>}
        <input
          type={type}
          maxLength={max}
          value={value ?? ""}
          onChange={(e) => set(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent p-3 outline-none"
        />
      </div>
      {max && (
        <span className="mt-1 block text-right text-[10px]">
          {(value ?? "").length}/{max}
        </span>
      )}
    </label>
  );
}
function Area({
  label,
  value,
  set,
  max,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  max: number;
}) {
  return (
    <label className="block text-xs font-medium dashboard-muted">
      {label}
      <textarea
        rows={4}
        maxLength={max}
        value={value ?? ""}
        onChange={(e) => set(e.target.value)}
        className="dashboard-input mt-1.5 w-full rounded-xl p-3"
      />
      <span className="block text-right text-[10px]">
        {(value ?? "").length}/{max}
      </span>
    </label>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="text-xs font-medium dashboard-muted">
      {label}
      <select
        value={value ?? ""}
        onChange={(e) => set(e.target.value)}
        className="dashboard-input mt-1.5 w-full rounded-xl p-3"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
function Toggle({
  checked,
  set,
  title,
  hint,
}: {
  checked: boolean;
  set: (v: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <label className="flex items-center gap-4 rounded-xl dashboard-subtle p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => set(e.target.checked)}
        className="h-4 w-4"
      />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs dashboard-muted">{hint}</p>
      </div>
    </label>
  );
}
function Checklist({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full ${ok ? "bg-emerald-500 text-white" : "dashboard-subtle dashboard-muted"}`}
      >
        {ok && <Check size={13} />}
      </span>
      {text}
    </div>
  );
}
