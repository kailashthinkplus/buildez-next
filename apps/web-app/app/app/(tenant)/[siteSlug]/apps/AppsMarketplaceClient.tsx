"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Crown,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { DashboardModalPortal } from "../../components/ui/DashboardModalPortal";

type AppPlan = "Free" | "Premium";
type MarketplaceApp = {
  name: string;
  slug: string;
  category: string;
  description: string;
  plan: AppPlan;
  featured?: boolean;
};

const apps: MarketplaceApp[] = [
  { name: "Google Analytics", slug: "googleanalytics", category: "Analytics", description: "Understand visitors, conversions, and your best-performing pages.", plan: "Free", featured: true },
  { name: "Meta Pixel", slug: "meta", category: "Marketing", description: "Measure Meta ad performance and build remarketing audiences.", plan: "Free" },
  { name: "Hotjar", slug: "hotjar", category: "Analytics", description: "See heatmaps, recordings, and visitor feedback in one place.", plan: "Premium" },
  { name: "Microsoft Clarity", slug: "microsoftclarity", category: "Analytics", description: "Free session recordings and heatmaps from Microsoft.", plan: "Free" },
  { name: "Mailchimp", slug: "mailchimp", category: "Marketing", description: "Grow email lists and automate campaigns from your forms.", plan: "Free", featured: true },
  { name: "HubSpot", slug: "hubspot", category: "Marketing", description: "Send leads to your CRM and trigger sales workflows.", plan: "Premium" },
  { name: "Klaviyo", slug: "klaviyo", category: "Marketing", description: "Create personalized email and SMS journeys for customers.", plan: "Premium" },
  { name: "Brevo", slug: "brevo", category: "Marketing", description: "Sync contacts and power email, SMS, and WhatsApp campaigns.", plan: "Free" },
  { name: "Stripe", slug: "stripe", category: "Payments", description: "Accept secure card payments and subscriptions worldwide.", plan: "Premium", featured: true },
  { name: "Razorpay", slug: "razorpay", category: "Payments", description: "Collect payments with cards, UPI, wallets, and netbanking.", plan: "Premium" },
  { name: "PayPal", slug: "paypal", category: "Payments", description: "Add trusted PayPal checkout to your BuildEZ website.", plan: "Free" },
  { name: "Shopify", slug: "shopify", category: "Commerce", description: "Showcase Shopify products and send shoppers to checkout.", plan: "Premium" },
  { name: "WooCommerce", slug: "woocommerce", category: "Commerce", description: "Connect products, orders, and customer data from WooCommerce.", plan: "Premium" },
  { name: "Calendly", slug: "calendly", category: "Bookings", description: "Let visitors book meetings without leaving your site.", plan: "Free", featured: true },
  { name: "Google Calendar", slug: "googlecalendar", category: "Bookings", description: "Display availability and add bookings to your calendar.", plan: "Free" },
  { name: "Zoom", slug: "zoom", category: "Bookings", description: "Create meeting links automatically for scheduled sessions.", plan: "Premium" },
  { name: "WhatsApp", slug: "whatsapp", category: "Communication", description: "Turn website visits into WhatsApp conversations instantly.", plan: "Free", featured: true },
  { name: "Intercom", slug: "intercom", category: "Communication", description: "Add customer messaging, help desk, and support automation.", plan: "Premium" },
  { name: "Slack", slug: "slack", category: "Communication", description: "Send form submissions and site alerts to your team channels.", plan: "Free" },
  { name: "Crisp", slug: "crisp", category: "Communication", description: "Chat with visitors and manage support from a shared inbox.", plan: "Free" },
  { name: "Typeform", slug: "typeform", category: "Forms", description: "Embed conversational forms, surveys, and quizzes.", plan: "Free" },
  { name: "Google Forms", slug: "googleforms", category: "Forms", description: "Embed existing Google Forms with responsive sizing.", plan: "Free" },
  { name: "Zapier", slug: "zapier", category: "Automation", description: "Connect BuildEZ leads to thousands of apps and workflows.", plan: "Premium", featured: true },
  { name: "Make", slug: "make", category: "Automation", description: "Build visual automations across your favorite business tools.", plan: "Premium" },
  { name: "Notion", slug: "notion", category: "Content", description: "Publish Notion content and sync databases to your site.", plan: "Premium" },
  { name: "Airtable", slug: "airtable", category: "Content", description: "Turn Airtable records into dynamic website content.", plan: "Premium" },
  { name: "YouTube", slug: "youtube", category: "Media", description: "Embed responsive videos, playlists, and live streams.", plan: "Free" },
  { name: "Vimeo", slug: "vimeo", category: "Media", description: "Show beautiful, ad-free video embeds with player controls.", plan: "Free" },
  { name: "Instagram", slug: "instagram", category: "Social", description: "Bring posts and reels from Instagram into your website.", plan: "Premium" },
  { name: "LinkedIn", slug: "linkedin", category: "Social", description: "Add company updates and conversion tracking to your site.", plan: "Free" },
];

const categories = ["All", ...Array.from(new Set(apps.map((app) => app.category)))];

function logoUrl(slug: string) {
  return `https://cdn.simpleicons.org/${slug}`;
}

export default function AppsMarketplaceClient({ siteName }: { siteName: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [plan, setPlan] = useState<"All" | AppPlan>("All");
  const [installed, setInstalled] = useState<string[]>(["Google Analytics"]);
  const [selected, setSelected] = useState<MarketplaceApp | null>(null);

  const visibleApps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apps.filter((app) =>
      (category === "All" || app.category === category) &&
      (plan === "All" || app.plan === plan) &&
      (!needle || `${app.name} ${app.category} ${app.description}`.toLowerCase().includes(needle))
    );
  }, [query, category, plan]);

  function toggleApp(name: string) {
    setInstalled((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  return (
    <div className="relative px-1 py-2 md:px-2">
      <div className="pointer-events-none absolute left-[10%] top-0 h-80 w-80 rounded-full bg-[#1349A3]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-[8%] top-40 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />
      <div className="relative mx-auto max-w-[1400px] space-y-6">
        <section className="overflow-hidden rounded-[26px] border dashboard-border dashboard-card-strong">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1349A3]/10 px-3 py-1.5 text-xs font-semibold text-[#1349A3] dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" /> BuildEZ Apps Marketplace
              </div>
              <h1 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">Make {siteName} work with the tools you already love.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 dashboard-muted">Connect marketing, payments, analytics, bookings, automation and more. Start with free apps or unlock advanced premium integrations.</p>
            </div>
            <div className="flex gap-6 rounded-2xl dashboard-subtle px-5 py-4 text-sm">
              <div><div className="text-xl font-semibold">{apps.length}</div><div className="dashboard-muted">Apps</div></div>
              <div><div className="text-xl font-semibold">{apps.filter((app) => app.plan === "Free").length}</div><div className="dashboard-muted">Free</div></div>
              <div><div className="text-xl font-semibold">{installed.length}</div><div className="dashboard-muted">Connected</div></div>
            </div>
          </div>
        </section>

        <div className="sticky top-0 z-10 flex flex-col gap-3 rounded-2xl border dashboard-border dashboard-card-strong p-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="dashboard-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps and integrations" className="w-full rounded-xl border dashboard-border bg-transparent py-2.5 pl-10 pr-10 text-sm outline-none focus:border-[#3B82F6]" />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search" className="dashboard-muted absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4" /></button>}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[55%] lg:pb-0">
            {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition ${category === item ? "bg-[#1349A3] text-white" : "dashboard-subtle dashboard-hover"}`}>{item}</button>)}
          </div>
          <select value={plan} onChange={(event) => setPlan(event.target.value as "All" | AppPlan)} aria-label="Filter by plan" className="rounded-xl border dashboard-border bg-transparent px-3 py-2.5 text-xs font-medium outline-none">
            <option value="All">All plans</option><option value="Free">Free</option><option value="Premium">Premium</option>
          </select>
        </div>

        {visibleApps.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleApps.map((app) => {
              const isInstalled = installed.includes(app.name);
              return <article
                key={app.name}
                role="button"
                tabIndex={0}
                aria-label={`View ${app.name}`}
                onClick={() => setSelected(app)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(app);
                  }
                }}
                className="group relative flex min-h-[230px] cursor-pointer flex-col rounded-[22px] border dashboard-border dashboard-card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/60 hover:shadow-xl hover:shadow-[#1349A3]/5 focus:outline-none focus:ring-4 focus:ring-[#1349A3]/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                    {/* Brand marks are served by Simple Icons so they stay crisp at every size. */}
                    <img src={logoUrl(app.slug)} alt={`${app.name} logo`} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex items-center gap-2 pr-10">
                    {app.featured && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">Popular</span>}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${app.plan === "Free" ? "bg-emerald-500/10 text-emerald-600" : "bg-[#1349A3]/10 text-[#1349A3] dark:text-blue-300"}`}>{app.plan === "Premium" && <Crown className="h-3 w-3" />}{app.plan}</span>
                  </div>
                </div>
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#1349A3]/10 text-[#1349A3] transition group-hover:bg-[#1349A3] group-hover:text-white dark:text-blue-300" aria-hidden="true">
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <div className="mt-4 flex-1">
                  <div className="text-xs font-medium dashboard-muted">{app.category}</div>
                  <h2 className="mt-1 text-lg font-semibold">{app.name}</h2>
                  <p className="mt-2 text-sm leading-5 dashboard-muted">{app.description}</p>
                </div>
                {isInstalled && <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Connected</div>}
              </article>;
            })}
          </div>
        ) : (
          <div className="rounded-[22px] border dashboard-border dashboard-card py-20 text-center"><LayoutGrid className="dashboard-muted mx-auto h-8 w-8" /><h2 className="mt-3 font-semibold">No apps found</h2><p className="mt-1 text-sm dashboard-muted">Try another search, category, or plan.</p></div>
        )}
      </div>

      {selected && (
        <DashboardModalPortal onClose={() => setSelected(null)}>
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div role="dialog" aria-modal="true" aria-label={`${selected.name} integration details`} className="dashboard-modal-surface max-h-[100dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border dashboard-border p-6 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-3 shadow ring-1 ring-black/5"><img src={logoUrl(selected.slug)} alt={`${selected.name} logo`} className="h-full w-full object-contain" /></div><div><div className="text-xs dashboard-muted">{selected.category}</div><h2 className="text-xl font-semibold">{selected.name}</h2></div></div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="rounded-xl p-2 dashboard-hover"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-5 text-sm leading-6 dashboard-muted">{selected.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl dashboard-subtle p-3"><ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" /><div className="font-semibold">Secure connection</div><div className="mt-1 dashboard-muted">Your credentials stay protected</div></div><div className="rounded-xl dashboard-subtle p-3"><Zap className="mb-2 h-4 w-4 text-amber-500" /><div className="font-semibold">Quick setup</div><div className="mt-1 dashboard-muted">Connect in just a few steps</div></div></div>
            <button onClick={() => { toggleApp(selected.name); setSelected(null); }} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${installed.includes(selected.name) ? "dashboard-subtle" : "bg-[#1349A3] text-white hover:bg-[#1D5FC7]"}`}>{installed.includes(selected.name) ? "Disconnect app" : selected.plan === "Free" ? "Connect for free" : "Add premium app"}</button>
          </div>
        </div>
        </DashboardModalPortal>
      )}
    </div>
  );
}
