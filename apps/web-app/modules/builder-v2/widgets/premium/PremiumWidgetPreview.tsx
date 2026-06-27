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
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryCta?: string;
  secondaryCta?: string;
  items?: string[];
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
    eyebrow,
    title,
    body,
    primaryCta,
    secondaryCta,
    items,
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

  if (type === "galleryLightbox") {
    return (
      <Shell data={data} style={style}>
        <div className="grid grid-cols-2 gap-3">
          {["bg-blue-100", "bg-slate-200", "bg-emerald-100", "bg-amber-100"].map(
            (color, index) => (
              <div
                key={color}
                className={`aspect-[4/3] rounded-xl ${color} flex items-end p-3 text-xs font-semibold text-slate-600`}
              >
                Image {index + 1}
              </div>
            )
          )}
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
              <div className="mb-3 h-16 rounded-lg bg-white" />
              <div className="text-sm font-semibold text-slate-900">{item}</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Editable marketplace content card
              </p>
            </div>
          ))}
        </div>
      </Shell>
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
      eyebrow: "Hero",
      title: "Launch a stronger website",
      body: "High-impact intro section with proof, messaging, media, and conversion actions.",
      primaryCta: "Get started",
      secondaryCta: "See examples",
      items: ["Outcome-led headline", "Trust proof", "CTA pair", "Media slot"],
    },
    leadForm: {
      eyebrow: "Lead capture",
      title: "Capture qualified leads",
      body: "Validated capture flow for inquiries, quotes, appointments, and waitlists.",
      primaryCta: "Submit request",
      items: ["Name", "Email", "Phone", "Message"],
    },
    cardGrid: {
      eyebrow: "Cards",
      title: "Show what makes you different",
      body: "Repeatable cards for services, benefits, programs, or feature sets.",
      primaryCta: "Explore services",
      items: ["Benefit card", "Service card", "Proof card", "Process card"],
    },
    galleryLightbox: {
      eyebrow: "Gallery",
      title: "Showcase visual proof",
      body: "Visual showcase with captions, categories, and immersive viewing.",
      primaryCta: "View gallery",
      items: ["Portfolio", "Properties", "Venues", "Products"],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Answer common questions",
      body: "Expandable answers for objections, support questions, and SEO coverage.",
      primaryCta: "Ask a question",
      items: ["Pricing", "Timeline", "Process", "Support"],
    },
    testimonials: {
      eyebrow: "Social proof",
      title: "Trusted by happy customers",
      body: "Trust-building reviews, quotes, ratings, logos, and outcomes.",
      primaryCta: "Read stories",
      items: ["Excellent results", "Fast launch", "Clear process", "Great support"],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Choose the right plan",
      body: "Plan comparison with features, highlights, and conversion routing.",
      primaryCta: "Choose plan",
      items: ["Starter", "Pro", "Business", "Custom"],
    },
    offerGrid: {
      eyebrow: "Catalog",
      title: "Browse featured offers",
      body: "Merchandising grid for products, listings, programs, or packages.",
      primaryCta: "View offers",
      items: ["Product card", "Package card", "Listing card", "Program card"],
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
