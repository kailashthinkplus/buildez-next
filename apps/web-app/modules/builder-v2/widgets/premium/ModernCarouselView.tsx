"use client";

import { ArrowLeft, ArrowRight, Package, ShoppingBag } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type CarouselData = {
  eyebrow: string;
  title: string;
  body: string;
  primaryCta: string;
  items: string[];
  nested: Record<string, unknown>;
};

type Slide = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
  label: string;
};

type Product = {
  id: string;
  title: string;
  handle?: string;
  images?: Array<{ url?: string; alt?: string }>;
  variants?: Array<{ price?: string | number; compareAtPrice?: string | number }>;
  tags?: string[];
  collections?: Array<{ collectionId?: string }>;
};

type StoreResponse = {
  site?: { slug?: string };
  shop?: { currency?: string; products?: Product[]; collections?: Array<{ id?: string; products?: Array<{ productId?: string }> }> };
  error?: string;
};

export default function ModernCarouselView({
  kind,
  data,
  config,
  style,
}: {
  kind: "content" | "products";
  data: CarouselData;
  config: Record<string, unknown>;
  style?: CSSProperties;
}) {
  const [catalog, setCatalog] = useState<StoreResponse | null>(null);
  const [error, setError] = useState("");
  const source = text(config.source) || "shopez";
  const siteSlug = text(config.siteSlug);

  useEffect(() => {
    if (kind !== "products" || source !== "shopez") return;
    const inferredSlug = inferSiteSlug();
    const slug = siteSlug || inferredSlug;
    const query = slug
      ? `siteSlug=${encodeURIComponent(slug)}`
      : `domain=${encodeURIComponent(window.location.hostname)}`;
    const controller = new AbortController();
    setError("");
    fetch(`/api/public/shopez/store?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as StoreResponse;
        if (!response.ok) throw new Error(payload.error || "Unable to load products");
        setCatalog(payload);
      })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== "AbortError") {
          setError(reason instanceof Error ? reason.message : "Unable to load products");
        }
      });
    return () => controller.abort();
  }, [kind, siteSlug, source]);

  const slides = useMemo(() => {
    if (kind === "products" && source === "shopez") {
      return productSlides(catalog, config);
    }
    return contentSlides(data, config);
  }, [catalog, config, data, kind, source]);

  if (kind === "products" && source === "shopez" && !catalog && !error) {
    return <CarouselStatus data={data} style={style} message="Loading live Shopez products…" />;
  }
  if (kind === "products" && source === "shopez" && error) {
    return <CarouselStatus data={data} style={style} message={error} error />;
  }
  if (!slides.length) {
    return <CarouselStatus data={data} style={style} message={kind === "products" ? "No matching Shopez products yet." : "Add slides in the Content panel."} />;
  }

  return (
    <CarouselShell
      data={data}
      config={config}
      style={style}
      slides={slides}
      productMode={kind === "products"}
      currency={catalog?.shop?.currency || text(config.currency) || "USD"}
    />
  );
}

function CarouselShell({ data, config, style, slides, productMode, currency }: {
  data: CarouselData;
  config: Record<string, unknown>;
  style?: CSSProperties;
  slides: Slide[];
  productMode: boolean;
  currency: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const uid = useId().replace(/:/g, "");
  const gap = number(config.slideGap, 18, 0, 64);
  const desktop = number(config.itemsPerView, productMode ? 4 : 3, 1, 6);
  const tablet = number(config.tabletItemsPerView, Math.min(desktop, 2), 1, 4);
  const mobile = number(config.mobileItemsPerView, 1, 1, 2);
  const showArrows = boolean(config.showArrows, true);
  const showDots = boolean(config.showDots, true);
  const autoplay = boolean(config.autoplay, false);
  const delay = number(config.autoplayDelay, 5000, 1500, 20000);
  const variant = text(config.variant) || (productMode ? "commerce" : "editorial");
  const move = useCallback((direction: number) => {
    const element = viewport.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.82, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!autoplay || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => move(1), delay);
    return () => window.clearInterval(timer);
  }, [autoplay, delay, move, slides.length]);

  const onScroll = () => {
    const element = viewport.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    setActive(Math.max(0, Math.min(slides.length - 1, Math.round(element.scrollLeft / (first.offsetWidth + gap)))));
  };
  const goTo = (index: number) => {
    const element = viewport.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    element.scrollTo({ left: index * (first.offsetWidth + gap), behavior: "smooth" });
  };

  return <section className={`modern-carousel modern-carousel--${variant} w-full`} style={{ background: "var(--w-surface)", color: "var(--w-text)", borderRadius: "var(--w-card-radius)", boxShadow: "var(--w-card-shadow)", ...style }} aria-roledescription="carousel" aria-label={text(config.ariaLabel) || data.title}>
    <style>{`
      .${uid}-track{grid-auto-columns:calc((100% - ${(desktop - 1) * gap}px)/${desktop})}
      @media(max-width:1023px){.${uid}-track{grid-auto-columns:calc((100% - ${(tablet - 1) * gap}px)/${tablet})}}
      @media(max-width:639px){.${uid}-track{grid-auto-columns:calc((100% - ${(mobile - 1) * gap}px)/${mobile})}}
    `}</style>
    <div className="flex items-end justify-between gap-5">
      <div className="max-w-2xl">
        {data.eyebrow && <div className="text-xs font-bold uppercase tracking-[.2em]" style={{ color: "var(--w-eyebrow-color)" }}>{data.eyebrow}</div>}
        <h2 className="mt-2 leading-tight" style={{ color: "var(--w-title-color)", fontFamily: "var(--w-title-font)", fontSize: "var(--w-title-size)", fontWeight: "var(--w-title-weight)" }}>{data.title}</h2>
        {data.body && <p className="mt-2" style={{ color: "var(--w-body-color)" }}>{data.body}</p>}
      </div>
      {showArrows && <div className="flex shrink-0 gap-2">
        <NavButton label="Previous slides" onClick={() => move(-1)}><ArrowLeft size={18}/></NavButton>
        <NavButton label="Next slides" onClick={() => move(1)}><ArrowRight size={18}/></NavButton>
      </div>}
    </div>
    <div ref={viewport} onScroll={onScroll} className={`${uid}-track mt-7 grid snap-x snap-mandatory grid-flow-col overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} style={{ gap }}>
      {slides.map((slide, index) => productMode
        ? <ProductCard key={slide.id} slide={slide} currency={currency} config={config}/>
        : <ContentCard key={slide.id} slide={slide} index={index} variant={variant}/>)}
    </div>
    {showDots && slides.length > 1 && <div className="mt-4 flex justify-center gap-2" aria-label="Choose a slide">
      {slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => goTo(index)} aria-label={`Go to slide ${index + 1}`} aria-current={active === index ? "true" : undefined} className="h-2 rounded-full transition-all" style={{ width: active === index ? 28 : 8, background: active === index ? "var(--w-primary)" : "var(--w-border)" }}/>) }
    </div>}
  </section>;
}

function ContentCard({ slide, index, variant }: { slide: Slide; index: number; variant: string }) {
  const content = <><div className={`relative overflow-hidden bg-[var(--w-surface-alt)] ${variant === "fullBleed" ? "aspect-[16/9]" : variant === "logo" ? "aspect-[3/2]" : "aspect-[4/3]"}`} style={{ borderRadius: "var(--w-media-radius)" }}>
    {slide.image ? <img src={slide.image} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} className={`h-full w-full ${variant === "logo" ? "object-contain p-8" : "object-cover"}`}/> : <div className="grid h-full place-items-center p-8 text-center text-sm" style={{ color: "var(--w-muted)" }}>{slide.title}</div>}
  </div><div className="pt-4"><h3 className="text-lg font-semibold">{slide.title}</h3>{slide.description && <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--w-muted)" }}>{slide.description}</p>}{slide.label && <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--w-primary)" }}>{slide.label}<ArrowRight size={14}/></span>}</div></>;
  return slide.href ? <a className="block min-w-0 snap-start" href={slide.href}>{content}</a> : <article className="min-w-0 snap-start">{content}</article>;
}

function ProductCard({ slide, currency, config }: { slide: Slide; currency: string; config: Record<string, unknown> }) {
  return <article className="group min-w-0 snap-start">
    <a href={slide.href} className="block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--w-surface-alt)]" style={{ borderRadius: "var(--w-media-radius)" }}>
        {slide.image ? <img src={slide.image} alt={slide.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <Package className="absolute inset-0 m-auto h-14 w-14 opacity-25"/>}
        {boolean(config.showQuickShop, true) && <span className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full shadow-lg" style={{ background: "var(--w-surface)", color: "var(--w-text)" }} aria-label={`View ${slide.title}`}><ShoppingBag size={17}/></span>}
      </div>
      <h3 className="mt-4 font-semibold">{slide.title}</h3>
      {boolean(config.showPrice, true) && <p className="mt-1 text-sm font-semibold" style={{ color: "var(--w-primary)" }}>{currency} {slide.description}</p>}
    </a>
  </article>;
}

function NavButton({ label, onClick, children }: { label: string; onClick(): void; children: ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className="grid h-11 w-11 place-items-center rounded-full border transition hover:-translate-y-0.5" style={{ borderColor: "var(--w-border)", background: "var(--w-surface)" }}>{children}</button>;
}

function CarouselStatus({ data, style, message, error = false }: { data: CarouselData; style?: CSSProperties; message: string; error?: boolean }) {
  return <section className="w-full p-6 sm:p-8" style={{ background: "var(--w-surface)", color: "var(--w-text)", border: "1px solid var(--w-border)", borderRadius: "var(--w-card-radius)", ...style }}><div className="text-xs font-bold uppercase tracking-[.2em]" style={{ color: "var(--w-primary)" }}>{data.eyebrow}</div><h2 className="mt-2 text-2xl font-semibold">{data.title}</h2><div className="mt-6 grid min-h-36 place-items-center rounded-xl border border-dashed p-6 text-center text-sm" style={{ borderColor: error ? "#ef4444" : "var(--w-border)", color: error ? "#dc2626" : "var(--w-muted)" }}>{message}</div></section>;
}

function contentSlides(data: CarouselData, config: Record<string, unknown>): Slide[] {
  const raw = Array.isArray(config.slides) ? config.slides : [];
  if (raw.length) return raw.map((entry, index) => slideFrom(entry, index)).filter((slide) => slide.title || slide.image);
  return data.items.map((title, index) => ({ id: `item-${index}`, title, description: "", image: "", alt: title, href: "", label: "" }));
}

function productSlides(catalog: StoreResponse | null, config: Record<string, unknown>): Slide[] {
  const tag = text(config.tag).toLowerCase();
  const collectionId = text(config.collectionId);
  const limit = number(config.productLimit, 12, 1, 30);
  const collectionProductIds = collectionId
    ? new Set(catalog?.shop?.collections?.find((collection) => collection.id === collectionId)?.products?.map((item) => item.productId).filter(Boolean))
    : null;
  return (catalog?.shop?.products || [])
    .filter((product) => !tag || product.tags?.some((value) => value.toLowerCase() === tag))
    .filter((product) => !collectionProductIds || collectionProductIds.has(product.id))
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      title: product.title,
      description: formatPrice(product.variants?.[0]?.price),
      image: product.images?.[0]?.url || "",
      alt: product.images?.[0]?.alt || product.title,
      href: storefrontHref(catalog?.site?.slug || text(config.siteSlug), config),
      label: "",
    }));
}

function slideFrom(value: unknown, index: number): Slide {
  const entry = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const media = entry.media && typeof entry.media === "object" ? entry.media as Record<string, unknown> : {};
  const title = text(entry.title) || text(entry.label);
  return { id: text(entry.id) || `slide-${index}`, title, description: text(entry.description) || text(entry.body), image: text(entry.src) || text(entry.image) || text(media.src), alt: text(entry.alt) || text(media.alt) || title, href: safeHref(entry.href), label: text(entry.ctaLabel) };
}

function inferSiteSlug() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "preview" || parts[0] === "app") return parts[1] || "";
  return parts[0] || "";
}
function storefrontHref(siteSlug: string, config: Record<string, unknown>) {
  const configured = safeHref(config.storefrontUrl);
  if (configured) return configured;
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const tenantRoute = parts[0] === "preview" || parts[0] === "app" || parts[0] === siteSlug;
    if (!tenantRoute) return "/shop#products";
  }
  return `/store/${encodeURIComponent(siteSlug)}#products`;
}
function safeHref(value: unknown) { const href = text(value); return /^(\/|#|https?:\/\/)/.test(href) ? href : ""; }
function formatPrice(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed.toLocaleString() : "0"; }
function text(value: unknown) { return typeof value === "string" || typeof value === "number" ? String(value).trim() : ""; }
function boolean(value: unknown, fallback: boolean) { return typeof value === "boolean" ? value : fallback; }
function number(value: unknown, fallback: number, min: number, max: number) { const parsed = Number(value); return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : fallback; }
