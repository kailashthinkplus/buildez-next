import {
  ArrowRight,
  Check,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

type PreviewProps = {
  type: string;
  eyebrow?: unknown;
  title?: unknown;
  body?: unknown;
  primaryCta?: unknown;
  secondaryCta?: unknown;
  items?: unknown;
  style?: CSSProperties;
};

export default function PremiumWidgetPreview({
  type,
  eyebrow,
  title,
  body,
  primaryCta,
  secondaryCta,
  items = [],
  style,
}: PreviewProps) {
  const data = getPreviewData(type, {
    eyebrow: toText(eyebrow),
    title: toText(title),
    body: toText(body),
    primaryCta: toText(primaryCta),
    secondaryCta: toText(secondaryCta),
    items: toItems(items),
  });

  if (type === "smartHeader") {
    return (
      <header
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 shadow-sm"
        style={style}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            BZ
          </div>
          <div>
            <div className="text-sm font-semibold">BuildEZ Site</div>
            <div className="text-xs text-slate-500">Smart navigation</div>
          </div>
        </div>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <span>Home</span>
          <span>Services</span>
          <span>Work</span>
          <span>Contact</span>
        </nav>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          {data.primaryCta}
        </button>
      </header>
    );
  }

  if (type === "floatingWhatsApp") {
    return (
      <div
        className="inline-flex items-center gap-3 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        style={style}
      >
        <MessageCircle className="h-4 w-4" />
        {data.primaryCta}
      </div>
    );
  }

  if (type === "smartFooter") {
    return (
      <footer
        className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"
        style={style}
      >
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="text-lg font-semibold">{data.title}</div>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
              {data.body}
            </p>
          </div>
          <LinkColumn title="Company" links={["About", "Services", "Work"]} />
          <LinkColumn title="Contact" links={["Email", "LinkedIn", "Privacy"]} />
        </div>
      </footer>
    );
  }

  if (type === "locationMap") {
    return (
      <section
        className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm md:grid-cols-[1fr_1.2fr]"
        style={style}
      >
        <div className="space-y-4 p-6">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h3 className="text-2xl font-semibold">{data.title}</h3>
          <p className="text-sm leading-6 text-slate-600">{data.body}</p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            <MapPin className="h-4 w-4" />
            {data.primaryCta}
          </button>
        </div>
        <div className="relative flex min-h-56 items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,.06)_1px,transparent_1px),linear-gradient(rgba(15,23,42,.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="relative rounded-full bg-blue-600 p-3 text-white shadow-lg">
            <MapPin className="h-5 w-5" />
          </div>
        </div>
      </section>
    );
  }

  if (type === "leadForm") {
    return (
      <Shell data={data} style={style}>
        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4">
          {["Name", "Email", "Message"].map((label) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500"
            >
              {label}
            </div>
          ))}
          <button className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
            {data.primaryCta}
          </button>
        </div>
      </Shell>
    );
  }

  if (type === "galleryLightbox" || type === "gallery") {
    return (
      <Shell data={data} style={style}>
        <div className="grid grid-cols-2 gap-3">
          {[
            "bg-[linear-gradient(135deg,#dbeafe,#f8fafc)]",
            "bg-[linear-gradient(135deg,#dcfce7,#f8fafc)]",
            "bg-[linear-gradient(135deg,#fef3c7,#f8fafc)]",
            "bg-[linear-gradient(135deg,#ede9fe,#f8fafc)]",
          ].map(
            (color, index) => (
              <div
                key={color}
                className={`aspect-[4/3] rounded-xl ${color} flex items-end p-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70`}
              >
                {data.items[index] || `Image ${index + 1}`}
              </div>
            )
          )}
        </div>
      </Shell>
    );
  }

  if (type === "features") {
    return (
      <Shell data={data} style={style}>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.slice(0, 4).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Check className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-slate-950">{item}</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Clear, editable proof point with enough context to guide the visitor.
              </p>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (type === "faq") {
    return (
      <Shell data={data} style={style}>
        <div className="space-y-3">
          {data.items.slice(0, 4).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                {item}
                <span className="text-blue-600">+</span>
              </div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (type === "pricing") {
    return (
      <Shell data={data} style={style}>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.slice(0, 4).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="text-sm font-semibold text-slate-900">{item}</div>
              <div className="mt-2 text-2xl font-bold">${index === 0 ? 19 : 49}</div>
              <div className="mt-2 text-xs text-slate-500">Per month</div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (type === "testimonials") {
    return (
      <Shell data={data} style={style}>
        <div className="grid gap-3">
          {data.items.slice(0, 3).map((item, index) => (
            <div key={`${item}-${index}`} className="rounded-xl bg-slate-50 p-4">
              <div className="flex gap-1 text-amber-400">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-600">&ldquo;{item}&rdquo;</p>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (type === "offerGrid" || type === "cardGrid") {
    return (
      <Shell data={data} style={style}>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.slice(0, 4).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 h-16 rounded-lg bg-[linear-gradient(135deg,#eff6ff,#ffffff)] ring-1 ring-slate-200/80" />
              <div className="text-sm font-semibold text-slate-900">{item}</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Useful detail, proof, and next-step context for this item.
              </p>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (type === "cta") {
    return (
      <section
        className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm"
        style={style}
      >
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {data.eyebrow}
            </p>
            <h3 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">
              {data.title}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              {data.body}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              {data.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </button>
            {data.secondaryCta && (
              <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white">
                {data.secondaryCta}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <Shell data={data} style={style}>
      <Checklist items={data.items} />
    </Shell>
  );
}

function Shell({
  data,
  style,
  children,
}: {
  data: ResolvedPreviewData;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm"
      style={style}
    >
      <div className="grid gap-6 p-6 md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h3 className="text-2xl font-semibold tracking-tight">{data.title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            {data.body}
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {data.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </button>
            {data.secondaryCta && (
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                {data.secondaryCta}
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.slice(0, 4).map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
        >
          <Check className="mt-0.5 h-4 w-4 text-blue-600" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
      {children}
    </p>
  );
}

function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 grid gap-2 text-sm text-slate-300">
        {links.map((link) => (
          <span key={link}>{link}</span>
        ))}
      </div>
    </div>
  );
}

type ResolvedPreviewData = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: string;
  secondaryCta?: string;
  items: string[];
};

function toText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of [
    "label",
    "text",
    "title",
    "heading",
    "name",
    "question",
    "body",
    "description",
    "content",
    "caption",
    "value",
  ]) {
    const result = toText(record[key]);
    if (result) return result;
  }
  return "";
}

function toItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(toText).filter(Boolean);
}

function getPreviewData(
  type: string,
  override: Partial<ResolvedPreviewData>
): ResolvedPreviewData {
  const defaults: Record<string, ResolvedPreviewData> = {
    smartHeader: {
      eyebrow: "Navigation",
      title: "Smart Header",
      body: "Responsive navigation with logo, menu links, CTA, and mobile drawer behavior.",
      primaryCta: "Book a call",
      secondaryCta: "View pages",
      items: ["Logo area", "Menu links", "Primary CTA", "Mobile drawer"],
    },
    hero: {
      eyebrow: "Premium launch",
      title: "A sharper first impression with proof built in",
      body: "A cinematic opening section with a clear promise, decision cues, and an immediate next step.",
      primaryCta: "Plan the next step",
      secondaryCta: "Explore proof",
      items: ["Location fit", "Construction proof", "Visit path", "Project clarity"],
    },
    leadForm: {
      eyebrow: "Enquiry",
      title: "Make the next step feel effortless",
      body: "A focused contact path for visitors who are ready to ask, book, reserve, or compare options.",
      primaryCta: "Send enquiry",
      items: ["Name", "Email", "Phone", "Message"],
    },
    cardGrid: {
      eyebrow: "Decision cues",
      title: "Show the details visitors compare first",
      body: "Repeatable proof cards for benefits, services, project details, amenities, or buying criteria.",
      primaryCta: "Compare options",
      items: ["Site-visit readiness", "Delivery context", "Project comparison", "Enquiry route"],
    },
    galleryLightbox: {
      eyebrow: "Visual proof",
      title: "Let visitors inspect the experience",
      body: "A gallery section for real images, captions, categories, and inspection-ready visual storytelling.",
      primaryCta: "View gallery",
      items: ["Exterior approach", "Arrival court", "Interior finish", "Amenity view"],
    },
    features: {
      eyebrow: "Why it matters",
      title: "Proof points that make the decision easier",
      body: "A premium feature grid for benefits, process, trust, materials, amenities, or service depth.",
      primaryCta: "Explore details",
      secondaryCta: "Ask a question",
      items: ["Built-area context", "Construction method", "Location decision", "Site visit path"],
    },
    gallery: {
      eyebrow: "Visual proof",
      title: "A closer look at the experience",
      body: "A polished image-led section for projects, places, products, or portfolio moments.",
      primaryCta: "View gallery",
      secondaryCta: "Book a visit",
      items: ["Wide exterior", "Landscape detail", "Amenity area", "Finish detail"],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Answer common questions",
      body: "Expandable answers for objections, support questions, and SEO coverage.",
      primaryCta: "Ask a question",
      items: ["Pricing", "Timeline", "Process", "Support"],
    },
    testimonials: {
      eyebrow: "Trust",
      title: "Confidence signals without forcing fake quotes",
      body: "A proof section for verified reviews, outcomes, ratings, logos, or trust-led statements.",
      primaryCta: "View proof",
      items: ["Delivered work", "Ongoing pipeline", "Buyer guidance", "Commitment clarity"],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Choose the right plan",
      body: "Plan comparison with features, highlights, and conversion routing.",
      primaryCta: "Choose plan",
      items: ["Starter", "Pro", "Business", "Custom"],
    },
    offerGrid: {
      eyebrow: "Featured options",
      title: "Compare the most relevant offers",
      body: "A merchandising grid for listings, packages, projects, products, or service options.",
      primaryCta: "View options",
      items: ["Residential project", "Commercial brief", "Mixed-use enquiry", "Site visit option"],
    },
    cta: {
      eyebrow: "Next step",
      title: "Ready to move from browsing to a real conversation?",
      body: "Close the page with one clear action, a supportive alternative, and concise reassurance.",
      primaryCta: "Start the conversation",
      secondaryCta: "View details",
      items: ["Project details", "Site visit timing", "Callback support"],
    },
    floatingWhatsApp: {
      eyebrow: "Chat",
      title: "Floating WhatsApp",
      body: "Persistent WhatsApp contact action with mobile-first placement controls.",
      primaryCta: "Chat on WhatsApp",
      items: ["Mobile-first", "Fast contact", "Floating action"],
    },
    locationMap: {
      eyebrow: "Visit us",
      title: "Find our location",
      body: "Map section with address, opening hours, contact details, and route CTA.",
      primaryCta: "Get directions",
      items: ["Address", "Hours", "Directions", "Contact"],
    },
    smartFooter: {
      eyebrow: "Footer",
      title: "Smart Footer",
      body: "Site-wide footer with navigation, legal links, social links, and contact details.",
      primaryCta: "Contact us",
      secondaryCta: "Subscribe",
      items: ["Link columns", "Legal links", "Social links", "Newsletter"],
    },
  };

  const fallback = defaults.hero;

  return {
    ...fallback,
    ...(defaults[type] ?? {}),
    ...override,
    items: override.items?.length ? override.items : (defaults[type] ?? fallback).items,
  };
}
