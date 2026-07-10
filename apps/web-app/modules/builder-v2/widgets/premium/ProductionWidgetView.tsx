import {
  ArrowRight,
  Check,
  Clock,
  Code2,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Star,
  Users,
} from "lucide-react";
import type React from "react";
import type { CSSProperties } from "react";

type ProductionWidgetViewProps = {
  type: string;
  eyebrow?: unknown;
  title?: unknown;
  body?: unknown;
  primaryCta?: unknown;
  secondaryCta?: unknown;
  items?: unknown;
  style?: CSSProperties;
};

type ViewData = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  items: string[];
};

export default function ProductionWidgetView({
  type,
  eyebrow,
  title,
  body,
  primaryCta,
  secondaryCta,
  items,
  style,
}: ProductionWidgetViewProps) {
  const data = normalizeData(type, {
    eyebrow: toText(eyebrow),
    title: toText(title),
    body: toText(body),
    primaryCta: toText(primaryCta),
    secondaryCta: toText(secondaryCta),
    items: toItems(items),
  });

  if (type === "smartHeader") return <HeaderView data={data} style={style} />;
  if (type === "smartFooter") return <FooterView data={data} style={style} />;
  if (type === "floatingWhatsApp" || type === "socialLinks") return <SocialView data={data} style={style} />;
  if (type === "locationMap") return <MapView data={data} style={style} />;
  if (type === "leadForm" || type === "contactForm" || type === "form") return <FormView data={data} style={style} />;
  if (type === "galleryLightbox" || type === "gallery" || type === "masonryGallery" || type === "portfolio") return <GalleryView data={data} style={style} />;
  if (type === "faq" || type === "accordion") return <AccordionView data={data} style={style} />;
  if (type === "pricing") return <PricingView data={data} style={style} />;
  if (type === "testimonials" || type === "testimonial") return <TestimonialsView data={data} style={style} />;
  if (type === "timeline") return <TimelineView data={data} style={style} />;
  if (type === "statsCounter") return <StatsView data={data} style={style} />;
  if (type === "logoCloud") return <LogoCloudView data={data} style={style} />;
  if (type === "team") return <TeamView data={data} style={style} />;
  if (type === "tabs") return <TabsView data={data} style={style} />;
  if (type === "carousel") return <CarouselView data={data} style={style} />;
  if (type === "beforeAfter") return <BeforeAfterView data={data} style={style} />;
  if (type === "table") return <TableView data={data} style={style} />;
  if (type === "countdown") return <CountdownView data={data} style={style} />;
  if (type === "codeBlock" || type === "embed") return <SafeCodeView data={data} style={style} restricted={type === "embed"} />;
  if (type === "blogGrid" || type === "postList" || type === "categoryList") return <PostListView data={data} style={style} />;

  return <FeatureGridView data={data} style={style} />;
}

function HeaderView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <header className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 shadow-sm" style={style}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">BZ</div>
        <div>
          <div className="text-sm font-semibold">{data.title}</div>
          <div className="text-xs text-slate-500">{data.eyebrow}</div>
        </div>
      </div>
      <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
        {data.items.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
      </nav>
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{data.primaryCta}</button>
    </header>
  );
}

function FooterView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <footer className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm" style={style}>
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="text-lg font-semibold">{data.title}</div>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{data.body}</p>
        </div>
        <LinkColumn title="Company" links={data.items.slice(0, 4)} />
        <LinkColumn title="Contact" links={["Email", "LinkedIn", "Privacy"]} />
      </div>
    </footer>
  );
}

function Shell({ data, style, children }: { data: ViewData; style?: CSSProperties; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm" style={style}>
      <div className="mb-5 max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{data.eyebrow}</div>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">{data.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{data.body}</p>
      </div>
      {children}
    </section>
  );
}

function FeatureGridView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <Shell data={data} style={style}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.slice(0, 6).map((item) => <Card key={item} title={item} />)}
      </div>
    </Shell>
  );
}

function AccordionView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <Shell data={data} style={style}>
      <div className="space-y-3">
        {data.items.slice(0, 6).map((item, index) => (
          <details key={`${item}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4" open={index === 0}>
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item}</summary>
            <p className="mt-2 text-sm leading-6 text-slate-600">Editable answer content for {item.toLowerCase()}.</p>
          </details>
        ))}
      </div>
    </Shell>
  );
}

function TabsView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  const tabs = data.items.slice(0, 4);
  return (
    <Shell data={data} style={style}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item, index) => <span key={item} className={`rounded-full px-4 py-2 text-sm font-medium ${index === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{item}</span>)}
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Editable tab panel content.</div>
    </Shell>
  );
}

function TestimonialsView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <Shell data={data} style={style}>
      <div className="grid gap-3 md:grid-cols-3">
        {data.items.slice(0, 3).map((item) => (
          <div key={item} className="rounded-xl bg-slate-50 p-4">
            <div className="flex gap-1 text-amber-400">{[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}</div>
            <p className="mt-3 text-sm text-slate-600">&ldquo;{item}&rdquo;</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function PricingView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <Shell data={data} style={style}>
      <div className="grid gap-3 md:grid-cols-3">
        {data.items.slice(0, 3).map((item, index) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">{item}</div>
            <div className="mt-2 text-3xl font-bold">${[19, 49, 99][index]}</div>
            <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{data.primaryCta}</button>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function StatsView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return (
    <Shell data={data} style={style}>
      <div className="grid gap-3 sm:grid-cols-3">
        {data.items.slice(0, 3).map((item, index) => <div key={item} className="rounded-xl bg-blue-50 p-5 text-center"><div className="text-3xl font-bold text-blue-700">{[120, 48, 96][index]}+</div><div className="mt-1 text-sm text-slate-600">{item}</div></div>)}
      </div>
    </Shell>
  );
}

function LogoCloudView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid gap-3 sm:grid-cols-3 md:grid-cols-5">{data.items.slice(0, 5).map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-500">{item}</div>)}</div></Shell>;
}

function GalleryView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{data.items.slice(0, 6).map((item, index) => <div key={item} className={`flex aspect-[4/3] items-end rounded-xl bg-gradient-to-br ${index % 2 ? "from-emerald-100" : "from-blue-100"} to-white p-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200`}>{item}</div>)}</div></Shell>;
}

function TeamView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid gap-3 md:grid-cols-3">{data.items.slice(0, 3).map((item) => <div key={item} className="rounded-xl bg-slate-50 p-4 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Users className="h-5 w-5" /></div><div className="font-semibold">{item}</div><div className="text-xs text-slate-500">Editable role</div></div>)}</div></Shell>;
}

function TimelineView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="space-y-3">{data.items.slice(0, 5).map((item, index) => <div key={item} className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</div><div><div className="text-sm font-semibold">{item}</div><p className="text-xs text-slate-500">Editable process description.</p></div></div>)}</div></Shell>;
}

function FormView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid gap-3 rounded-2xl bg-slate-50 p-4">{["Name", "Email", "Message"].map((label) => <div key={label} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">{label}</div>)}<button className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white">{data.primaryCta}</button></div></Shell>;
}

function MapView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="relative flex min-h-56 items-center justify-center rounded-xl bg-slate-100"><MapPin className="h-8 w-8 text-blue-600" /><span className="ml-2 text-sm text-slate-500">{data.items[0] ?? "Editable address"}</span></div></Shell>;
}

function SocialView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <div className="inline-flex flex-wrap items-center gap-3 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg" style={style}>{data.items.slice(0, 4).map((item) => <span key={item} className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" />{item}</span>)}</div>;
}

function CarouselView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="overflow-hidden rounded-xl bg-slate-50 p-3"><div className="flex gap-3">{data.items.slice(0, 3).map((item) => <div key={item} className="min-w-48 rounded-lg bg-white p-4 shadow-sm"><ImageIcon className="mb-3 h-5 w-5 text-blue-600" />{item}</div>)}</div></div></Shell>;
}

function BeforeAfterView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid overflow-hidden rounded-xl border border-slate-200 md:grid-cols-2"><div className="bg-slate-100 p-8 text-center text-sm text-slate-500">Before</div><div className="bg-blue-50 p-8 text-center text-sm text-blue-700">After</div></div></Shell>;
}

function TableView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><tbody>{data.items.slice(0, 4).map((item) => <tr key={item} className="border-t border-slate-200"><th className="p-3 font-semibold">{item}</th><td className="p-3 text-slate-500">Editable value</td></tr>)}</tbody></table></div></Shell>;
}

function CountdownView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid grid-cols-4 gap-2">{["Days", "Hours", "Min", "Sec"].map((item, index) => <div key={item} className="rounded-xl bg-slate-950 p-4 text-center text-white"><Clock className="mx-auto mb-2 h-4 w-4" /><div className="text-2xl font-bold">{[12, 8, 44, 20][index]}</div><div className="text-xs text-white/50">{item}</div></div>)}</div></Shell>;
}

function SafeCodeView({ data, style, restricted }: { data: ViewData; style?: CSSProperties; restricted?: boolean }) {
  return <Shell data={data} style={style}><pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100"><Code2 className="mb-3 h-4 w-4 text-blue-300" />{restricted ? "Restricted embed preview. Scripts do not execute in Builder." : data.body}</pre></Shell>;
}

function PostListView({ data, style }: { data: ViewData; style?: CSSProperties }) {
  return <Shell data={data} style={style}><div className="grid gap-3 md:grid-cols-3">{data.items.slice(0, 3).map((item) => <Card key={item} title={item} />)}</div></Shell>;
}

function Card({ title }: { title: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"><Check className="h-4 w-4" /></div><div className="text-sm font-semibold text-slate-950">{title}</div><p className="mt-1 text-xs leading-5 text-slate-500">Editable native content region.</p></div>;
}

function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return <div><div className="text-sm font-semibold">{title}</div><div className="mt-3 grid gap-2 text-sm text-slate-300">{links.map((link) => <span key={link}>{link}</span>)}</div></div>;
}

function normalizeData(type: string, data: ViewData): ViewData {
  return {
    eyebrow: data.eyebrow || defaultText(type, "eyebrow"),
    title: data.title || defaultText(type, "title"),
    body: data.body || defaultText(type, "body"),
    primaryCta: data.primaryCta || "Get started",
    secondaryCta: data.secondaryCta || "Learn more",
    items: data.items.length ? data.items : ["First item", "Second item", "Third item", "Fourth item"],
  };
}

function defaultText(type: string, field: "eyebrow" | "title" | "body") {
  const label = type.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
  if (field === "eyebrow") return label;
  if (field === "title") return `${label} section`;
  return "A fully editable native Builder widget with content, design, responsive, theme, and advanced controls.";
}

function toText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  return "";
}

function toItems(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(toText).filter(Boolean);
  if (typeof value === "string") return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}
