"use client";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Code2,
  ExternalLink,
  MapPin,
  Menu,
  MessageCircle,
  HeartHandshake,
  Play,
  Quote,
  Sparkles,
  ShieldCheck,
  Zap,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import ModernCarouselView from "./ModernCarouselView";

type WidgetTheme = {
  primary: string; primaryContrast: string; surface: string; surfaceAlt: string;
  textPrimary: string; textSecondary: string; border: string; accent: string;
  cardRadius: number; buttonRadius: number; cardShadow: string;
};
type Props = {
  type: string; eyebrow?: unknown; title?: unknown; body?: unknown; primaryCta?: unknown;
  secondaryCta?: unknown; items?: unknown; style?: CSSProperties; theme?: WidgetTheme;
  [key: string]: unknown;
};
type Data = { eyebrow: string; title: string; body: string; primaryCta: string; secondaryCta: string; items: string[]; nested: Record<string, unknown> };

const DEFAULT_MEDIA = [
  "/theme-previews/demo-images/premium-studio.jpg",
  "/theme-previews/demo-images/modern-saas.jpg",
  "/theme-previews/demo-images/local-business.jpg",
  "/theme-previews/demo-images/editorial-minimal.jpg",
  "/theme-previews/demo-images/buildez-default.jpg",
  "/theme-previews/demo-images/bold-launch.jpg",
];
const FEATURE_ICONS = [Sparkles, ShieldCheck, Zap, HeartHandshake, BadgeCheck, Building2];

export default function ProductionWidgetView(props: Props) {
  const data = normalizeData(props.type, props);
  const style = themeStyle(props.style, props.theme);
  const views: Record<string, ReactNode> = {
    smartHeader: <Header data={data} style={style} />,
    hero: <Hero data={data} style={style} />,
    leadForm: <Form data={data} style={style} lead />,
    contactForm: <Form data={data} style={style} />,
    cardGrid: <FeatureGrid data={data} style={style} variant="cards" />,
    featureGrid: <FeatureGrid data={data} style={style} variant="icons" />,
    features: <FeatureStory data={data} style={style} />,
    galleryLightbox: <Gallery data={data} style={style} lightbox />,
    gallery: <Gallery data={data} style={style} />,
    masonryGallery: <Gallery data={data} style={style} masonry />,
    faq: <Accordion data={data} style={style} />,
    accordion: <Accordion data={data} style={style} />,
    testimonials: <Testimonials data={data} style={style} />,
    pricing: <Pricing data={data} style={style} />,
    offerGrid: <OfferGrid data={data} style={style} />,
    floatingWhatsApp: <FloatingContact data={data} style={style} />,
    locationMap: <Location data={data} style={style} />,
    smartFooter: <Footer data={data} style={style} />,
    cta: <Cta data={data} style={style} />,
    tabs: <Tabs data={data} style={style} />,
    statsCounter: <Stats data={data} style={style} />,
    logoCloud: <LogoCloud data={data} style={style} />,
    team: <Team data={data} style={style} />,
    portfolio: <Portfolio data={data} style={style} />,
    timeline: <Timeline data={data} style={style} />,
    socialLinks: <SocialLinks data={data} style={style} />,
    carousel: <ModernCarouselView kind="content" data={data} config={props} style={style} />,
    productCarousel: <ModernCarouselView kind="products" data={data} config={props} style={style} />,
    beforeAfter: <BeforeAfter data={data} style={style} />,
    table: <ComparisonTable data={data} style={style} />,
    countdown: <Countdown data={data} style={style} />,
    codeBlock: <SafeCode data={data} style={style} />,
    embed: <SafeCode data={data} style={style} restricted />,
    blogGrid: <Editorial data={data} style={style} mode="grid" />,
    postList: <Editorial data={data} style={style} mode="list" />,
    categoryList: <Categories data={data} style={style} />,
    popupModal: <Popup data={data} style={style} />,
  };
  return <>{views[props.type] ?? <FeatureGrid data={data} style={style} variant="cards" />}</>;
}

function Shell({ data, style, children, center = false }: { data: Data; style?: CSSProperties; children: ReactNode; center?: boolean }) {
  return <section style={{ border: "1px solid var(--w-border)", background: "var(--w-surface)", color: "var(--w-text)", borderRadius: "var(--w-card-radius)", boxShadow: "var(--w-card-shadow)", ...style }} className="w-full p-5 sm:p-7 lg:p-8">
    <div className={center ? "mx-auto mb-7 max-w-2xl text-center" : "mb-7 max-w-2xl"}>
      <div className="uppercase tracking-[.18em]" style={{ color: "var(--w-eyebrow-color)", fontFamily: "var(--w-eyebrow-font)", fontSize: "var(--w-eyebrow-size)", fontWeight: "var(--w-eyebrow-weight)" }}>{data.eyebrow}</div>
      <h2 className="mt-2 tracking-tight" style={{ color: "var(--w-title-color)", fontFamily: "var(--w-title-font)", fontSize: "var(--w-title-size)", fontWeight: "var(--w-title-weight)", lineHeight: 1.15 }}>{data.title}</h2>
      <p className="mt-3" style={{ color: "var(--w-body-color)", fontFamily: "var(--w-body-font)", fontSize: "var(--w-body-size)", lineHeight: "var(--w-body-line-height)" }}>{data.body}</p>
    </div>{children}
  </section>;
}
function Button({ children, secondary = false }: { children: ReactNode; secondary?: boolean }) {
  return <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 px-5 font-semibold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ borderRadius: "var(--w-cta-radius)", background: secondary ? "transparent" : "var(--w-cta-background)", color: secondary ? "var(--w-text)" : "var(--w-cta-color)", border: secondary ? "1px solid var(--w-border)" : "1px solid transparent", outlineColor: "var(--w-primary)", fontFamily: "var(--w-cta-font)", fontSize: "var(--w-cta-size)" }}>{children}</button>;
}
function Card({ title, index = 0 }: { title: string; index?: number }) {
  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
  return <article className="p-5 transition hover:-translate-y-1" style={{ border: "1px solid var(--w-element-border)", background: "var(--w-card-background)", color: "var(--w-card-text)", borderRadius: "var(--w-card-radius)" }}>
    <div className="mb-4 flex h-11 w-11 items-center justify-center" style={{ background: "color-mix(in srgb, var(--w-card-icon) 15%, var(--w-surface))", color: "var(--w-card-icon)", borderRadius: "var(--w-button-radius)" }}><Icon size={21} strokeWidth={1.8}/></div>
    <h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6" style={{ color: "var(--w-body-color)" }}>Add a clear, specific supporting detail that helps visitors make a decision.</p>
  </article>;
}

function Header({ data, style }: ViewProps) {
  const [open, setOpen] = useState(false);
  return <header style={{ background: "var(--w-surface)", color: "var(--w-text)", border: "1px solid var(--w-border)", borderRadius: "var(--w-card-radius)", ...style }} className="w-full px-4 py-3 sm:px-5">
    <div className="flex items-center justify-between gap-4"><a href="#" className="flex items-center gap-3 font-bold" onClick={prevent}><span className="flex h-10 w-10 items-center justify-center" style={{ background: "var(--w-primary)", color: "var(--w-primary-contrast)", borderRadius: "var(--w-button-radius)" }}>BZ</span>{data.title}</a>
      <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">{data.items.slice(0, 4).map(i => <a key={i} href="#" onClick={prevent} className="text-sm font-medium hover:opacity-70">{i}</a>)}</nav>
      <div className="hidden md:block"><Button>{data.primaryCta}</Button></div><button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(v => !v)} className="p-2 md:hidden">{open ? <X /> : <Menu />}</button>
    </div>{open && <nav aria-label="Mobile navigation" className="mt-4 grid gap-2 border-t pt-4 md:hidden" style={{ borderColor: "var(--w-border)" }}>{data.items.slice(0, 4).map(i => <a key={i} href="#" onClick={prevent} className="rounded-lg px-3 py-2 text-sm">{i}</a>)}<Button>{data.primaryCta}</Button></nav>}
  </header>;
}
function Hero({ data, style }: ViewProps) {
  return <section style={{ background: "linear-gradient(135deg, var(--w-surface), var(--w-surface-alt))", color: "var(--w-text)", borderRadius: "var(--w-card-radius)", ...style }} className="grid min-h-[430px] items-center gap-8 overflow-hidden p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
    <div><div className="uppercase tracking-[.2em]" style={{ color: "var(--w-eyebrow-color)", fontFamily: "var(--w-eyebrow-font)", fontSize: "var(--w-eyebrow-size)", fontWeight: "var(--w-eyebrow-weight)" }}>{data.eyebrow}</div><h1 className="mt-4 leading-tight tracking-[-.035em]" style={{ color: "var(--w-title-color)", fontFamily: "var(--w-title-font)", fontSize: "var(--w-title-size)", fontWeight: "var(--w-title-weight)" }}>{data.title}</h1><p className="mt-5 max-w-xl" style={{ color: "var(--w-body-color)", fontFamily: "var(--w-body-font)", fontSize: "var(--w-body-size)", lineHeight: "var(--w-body-line-height)" }}>{data.body}</p><div className="mt-7 flex flex-wrap gap-3"><Button>{data.primaryCta}<ArrowRight size={16} /></Button><Button secondary>{data.secondaryCta}</Button></div><div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold" style={{ color: "var(--w-body-color)" }}>{data.items.slice(0, 3).map(i => <span key={i} className="flex items-center gap-1.5"><Check size={14} style={{ color: "var(--w-primary)" }} />{i}</span>)}</div></div>
    <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: "var(--w-media-radius)" }}><MediaImage src={mediaSource(style,1,data)} alt={mediaAlt(data)}/><div className="absolute inset-x-5 bottom-5 flex items-center gap-3 p-4 backdrop-blur-md" style={{ borderRadius: "var(--w-card-radius)", background: "color-mix(in srgb, var(--w-surface) 88%, transparent)", color: "var(--w-text)" }}><span className="grid h-10 w-10 place-items-center rounded-full" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)"}}><Play size={17} fill="currentColor"/></span><div><p className="text-xs font-bold uppercase" style={{color:"var(--w-primary)"}}>See it in action</p><p className="font-semibold">A polished visual story, ready to customize</p></div></div></div>
  </section>;
}
function FeatureGrid({ data, style, variant }: ViewProps & { variant: "cards" | "icons" }) { return <Shell data={data} style={style}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.slice(0, 6).map((i,n) => <Card key={i} title={i} index={variant === "icons" ? n : 0} />)}</div></Shell>; }
function FeatureStory({ data, style }: ViewProps) { return <Shell data={data} style={style}><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="relative min-h-72 overflow-hidden" style={{ borderRadius: "var(--w-card-radius)" }}><MediaImage src={DEFAULT_MEDIA[0]} alt={data.items[0]}/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/><h3 className="absolute bottom-0 p-6 text-2xl font-semibold text-white">{data.items[0]}</h3></div><div className="grid gap-3">{data.items.slice(1,5).map((i,n)=><Card key={i} title={i} index={n+1}/>)}</div></div></Shell>; }
function Form({ data, style, lead = false }: ViewProps & { lead?: boolean }) {
  const [sent,setSent]=useState(false);
  return <Shell data={data} style={style}><form onSubmit={e=>{e.preventDefault();setSent(true)}} className="grid gap-4 p-5" style={{ background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)" }}>{sent ? <div role="status" className="py-10 text-center"><Check className="mx-auto" size={32} style={{color:"var(--w-primary)"}}/><h3 className="mt-3 text-xl font-semibold">Thank you — your request is ready.</h3><p className="mt-2 text-sm" style={{color:"var(--w-muted)"}}>Connect this form to your approved submission workflow.</p><button type="button" onClick={()=>setSent(false)} className="mt-5 min-h-11 px-5 font-semibold" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"var(--w-button-radius)"}}>Send another</button></div> : <><div className="grid gap-4 sm:grid-cols-2"><Field label="Name" auto="name"/><Field label="Email" type="email" auto="email"/></div>{lead && <Field label="Phone" type="tel" auto="tel"/ >}<Field label={lead ? "What are you interested in?" : "Message"} area/><button type="submit" className="min-h-12 px-5 font-semibold" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"var(--w-button-radius)"}}>{data.primaryCta}</button></>}</form></Shell>;
}
function Field({label,type="text",auto,area=false}:{label:string;type?:string;auto?:string;area?:boolean}) { const cls="w-full border bg-[var(--w-surface)] px-3 py-2.5 outline-none focus:border-[var(--w-primary)]"; return <label className="grid gap-1.5 text-sm font-semibold"><span>{label}</span>{area?<textarea required rows={4} className={cls} style={{borderColor:"var(--w-border)",borderRadius:"var(--w-button-radius)"}}/>:<input required type={type} autoComplete={auto} className={cls} style={{borderColor:"var(--w-border)",borderRadius:"var(--w-button-radius)"}}/>}</label>; }
function Accordion({data,style}:ViewProps){return <Shell data={data} style={style}>{data.items.slice(0,6).map((i,n)=><details key={i} open={n===0} className="mb-3 border p-4" style={{borderColor:"var(--w-border)",borderRadius:"var(--w-button-radius)",background:"var(--w-surface-alt)"}}><summary className="cursor-pointer font-semibold">{i}</summary><p className="mt-3 text-sm leading-6" style={{color:"var(--w-muted)"}}>Add a direct, helpful answer with the information visitors need to continue confidently.</p></details>)}</Shell>}
function Tabs({data,style}:ViewProps){const [active,setActive]=useState(0);const id=useId();return <Shell data={data} style={style}><div role="tablist" aria-label={data.title} className="flex gap-2 overflow-x-auto">{data.items.slice(0,5).map((i,n)=><button key={i} role="tab" id={`${id}-tab-${n}`} aria-selected={active===n} aria-controls={`${id}-panel-${n}`} onClick={()=>setActive(n)} className="shrink-0 px-4 py-2 text-sm font-semibold" style={{background:active===n?"var(--w-primary)":"var(--w-surface-alt)",color:active===n?"var(--w-primary-contrast)":"var(--w-text)",borderRadius:"var(--w-button-radius)"}}>{i}</button>)}</div><div role="tabpanel" id={`${id}-panel-${active}`} aria-labelledby={`${id}-tab-${active}`} className="mt-4 p-5" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><h3 className="font-semibold">{data.items[active]}</h3><p className="mt-2 text-sm leading-6" style={{color:"var(--w-muted)"}}>{data.body}</p></div></Shell>}
function Gallery({data,style,lightbox=false,masonry=false}:ViewProps&{lightbox?:boolean;masonry?:boolean}){const [selected,setSelected]=useState<number|null>(null);return <Shell data={data} style={style}><div className={masonry?"columns-2 gap-3 md:columns-3":"grid grid-cols-2 gap-3 md:grid-cols-3"}>{data.items.slice(0,6).map((i,n)=><button type="button" key={i} onClick={()=>lightbox&&setSelected(n)} className={`group relative mb-3 w-full overflow-hidden text-left ${masonry&&n%2?"aspect-[3/4]":"aspect-[4/3]"}`} style={{borderRadius:"var(--w-card-radius)"}}><MediaImage src={mediaSource(style,n,data)} alt={i}/><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-10 text-sm font-semibold text-white">{i}</span></button>)}</div>{selected!==null&&<div role="dialog" aria-modal="true" aria-label={data.items[selected]} className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-5" onClick={()=>setSelected(null)}><div className="relative aspect-video w-full max-w-4xl overflow-hidden" style={{background:"var(--w-surface)",color:"var(--w-text)",borderRadius:"var(--w-card-radius)"}} onClick={e=>e.stopPropagation()}><MediaImage src={mediaSource(style,selected,data)} alt={data.items[selected]}/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-lg font-semibold text-white">{data.items[selected]}</div><button autoFocus aria-label="Close lightbox" onClick={()=>setSelected(null)} className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"><X/></button></div></div>}</Shell>}
function Testimonials({data,style}:ViewProps){return <Shell data={data} style={style} center><div className="grid gap-4 md:grid-cols-3">{data.items.slice(0,3).map(i=><figure key={i} className="p-5 text-left" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><Quote style={{color:"var(--w-primary)"}}/><blockquote className="mt-4 text-sm leading-6">“{i}”</blockquote><figcaption className="mt-5 text-xs font-semibold" style={{color:"var(--w-muted)"}}>Customer name · Verified client</figcaption></figure>)}</div></Shell>}
function Pricing({data,style}:ViewProps){return <Shell data={data} style={style} center><div className="grid gap-4 md:grid-cols-3">{data.items.slice(0,3).map((i,n)=><article key={i} className="relative p-5 text-left" style={{border:n===1?"2px solid var(--w-primary)":"1px solid var(--w-border)",borderRadius:"var(--w-card-radius)",background:"var(--w-surface)"}}>{n===1&&<span className="absolute -top-3 left-4 px-2 py-1 text-xs font-bold" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"var(--w-button-radius)"}}>Most popular</span>}<h3 className="font-semibold">{i}</h3><p className="mt-2 text-sm" style={{color:"var(--w-muted)"}}>Add your price and billing period</p><ul className="my-5 grid gap-2 text-sm">{["Core features","Email support","Easy setup"].map(x=><li key={x} className="flex gap-2"><Check size={16} style={{color:"var(--w-primary)"}}/>{x}</li>)}</ul><Button>{data.primaryCta}</Button></article>)}</div></Shell>}
function OfferGrid({data,style}:ViewProps){return <Shell data={data} style={style}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.slice(0,6).map((i,n)=><article key={i} className="overflow-hidden border transition hover:-translate-y-1" style={{borderColor:"var(--w-border)",borderRadius:"var(--w-card-radius)",boxShadow:"var(--w-card-shadow)"}}><div className="aspect-[4/3] overflow-hidden"><MediaImage src={DEFAULT_MEDIA[(n+2)%DEFAULT_MEDIA.length]} alt={i}/></div><div className="p-4"><div className="text-xs font-bold uppercase" style={{color:"var(--w-primary)"}}>Featured option</div><h3 className="mt-1 font-semibold">{i}</h3><p className="mt-2 text-sm" style={{color:"var(--w-muted)"}}>Add key details, availability, and a clear next step.</p><a href="#" onClick={prevent} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{color:"var(--w-primary)"}}>View details <ArrowRight size={14}/></a></div></article>)}</div></Shell>}
function Stats({data,style}:ViewProps){return <Shell data={data} style={style} center><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.items.slice(0,4).map((i,n)=><div key={i} className="p-5 text-center" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><strong className="text-3xl" style={{color:"var(--w-primary)"}}>{["120+","48h","97%","12"][n]}</strong><div className="mt-2 text-sm" style={{color:"var(--w-muted)"}}>{i}</div></div>)}</div></Shell>}
function LogoCloud({data,style}:ViewProps){return <Shell data={data} style={style} center><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{data.items.slice(0,6).map(i=><div key={i} className="grid min-h-20 place-items-center border px-3 text-sm font-bold" style={{borderColor:"var(--w-border)",borderRadius:"var(--w-button-radius)",color:"var(--w-muted)"}}>{i}</div>)}</div></Shell>}
function Team({data,style}:ViewProps){return <Shell data={data} style={style}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.items.slice(0,4).map((i,n)=><article key={i} className="overflow-hidden text-center" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><div className="aspect-[4/3] overflow-hidden"><MediaImage src={DEFAULT_MEDIA[(n+3)%DEFAULT_MEDIA.length]} alt={i.split(" - ")[0]}/></div><div className="p-4"><h3 className="font-semibold">{i.split(" - ")[0]}</h3><p className="text-sm" style={{color:"var(--w-muted)"}}>{i.split(" - ")[1]||"Team member"}</p></div></article>)}</div></Shell>}
function Portfolio({data,style}:ViewProps){return <Shell data={data} style={style}><div className="grid gap-4 md:grid-cols-2">{data.items.slice(0,4).map((i,n)=><article key={i} className="group relative aspect-[16/10] overflow-hidden" style={{borderRadius:"var(--w-card-radius)"}}><MediaImage src={DEFAULT_MEDIA[(n+1)%DEFAULT_MEDIA.length]} alt={i}/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"/><div className="absolute bottom-0 p-6 text-white"><span className="text-xs font-bold uppercase text-white/70">Case study</span><h3 className="mt-1 text-xl font-semibold">{i}</h3><a href="#" onClick={prevent} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">View project <ArrowRight size={14}/></a></div></article>)}</div></Shell>}
function Timeline({data,style}:ViewProps){return <Shell data={data} style={style}><ol className="grid gap-4 lg:grid-cols-5">{data.items.slice(0,5).map((i,n)=><li key={i} className="relative p-4" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><span className="grid h-9 w-9 place-items-center font-bold" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"50%"}}>{n+1}</span><h3 className="mt-4 font-semibold">{i}</h3><p className="mt-2 text-xs leading-5" style={{color:"var(--w-muted)"}}>Describe this step and the outcome visitors can expect.</p></li>)}</ol></Shell>}
function Carousel({data,style}:ViewProps){const slides=data.items.slice(0,5);const [active,setActive]=useState(0);return <Shell data={data} style={style}><div aria-roledescription="carousel"><div className="relative min-h-64 overflow-hidden sm:min-h-80" style={{borderRadius:"var(--w-card-radius)"}}><MediaImage src={mediaSource(style,active,data)} alt={slides[active]}/><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"/><div className="absolute bottom-0 p-6 text-left text-white"><h3 className="text-2xl font-semibold">{slides[active]}</h3><p className="mt-2 text-sm text-white/75">Slide {active+1} of {slides.length}</p></div></div><div className="mt-4 flex items-center justify-between"><button aria-label="Previous slide" onClick={()=>setActive((active-1+slides.length)%slides.length)} className="p-2"><ArrowLeft/></button><div className="flex gap-2">{slides.map((_,n)=><button key={n} aria-label={`Go to slide ${n+1}`} onClick={()=>setActive(n)} className="h-2.5 w-2.5 rounded-full" style={{background:n===active?"var(--w-primary)":"var(--w-border)"}}/>)}</div><button aria-label="Next slide" onClick={()=>setActive((active+1)%slides.length)} className="p-2"><ArrowRight/></button></div></div></Shell>}
function BeforeAfter({data,style}:ViewProps){const [value,setValue]=useState(50);return <Shell data={data} style={style}><div className="relative aspect-[16/9] overflow-hidden" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><div className="absolute inset-0 grid place-items-center"><span className="font-semibold">{data.items[1]||"After"}</span></div><div className="absolute inset-y-0 left-0 grid place-items-center overflow-hidden" style={{width:`${value}%`,background:"color-mix(in srgb,var(--w-primary) 22%,var(--w-surface))"}}><span className="font-semibold">{data.items[0]||"Before"}</span></div><div className="absolute inset-y-0 w-0.5" style={{left:`${value}%`,background:"var(--w-primary)"}}/></div><label className="mt-4 block text-sm font-semibold">Comparison position<input aria-label="Before and after comparison" type="range" min="0" max="100" value={value} onChange={e=>setValue(Number(e.target.value))} className="mt-2 w-full" style={{accentColor:"var(--w-primary)"}}/></label></Shell>}
function ComparisonTable({data,style}:ViewProps){return <Shell data={data} style={style}><div className="overflow-x-auto border" style={{borderColor:"var(--w-border)",borderRadius:"var(--w-card-radius)"}}><table className="w-full min-w-[560px] text-left text-sm"><caption className="sr-only">{data.title}</caption><thead style={{background:"var(--w-surface-alt)"}}><tr><th className="p-4">Feature</th><th className="p-4">Standard</th><th className="p-4">Premium</th></tr></thead><tbody>{data.items.slice(0,6).map(i=>{const [a,b,c]=i.split("|").map(x=>x.trim());return <tr key={i} className="border-t" style={{borderColor:"var(--w-border)"}}><th scope="row" className="p-4 font-semibold">{a}</th><td className="p-4" style={{color:"var(--w-muted)"}}>{b||"Included"}</td><td className="p-4">{c||<Check style={{color:"var(--w-primary)"}}/>}</td></tr>})}</tbody></table></div></Shell>}
function Countdown({data,style}:ViewProps){const [remaining,setRemaining]=useState(3*86400+8*3600+44*60+20);useEffect(()=>{const id=setInterval(()=>setRemaining(v=>Math.max(0,v-1)),1000);return()=>clearInterval(id)},[]);const values=[Math.floor(remaining/86400),Math.floor(remaining%86400/3600),Math.floor(remaining%3600/60),remaining%60];return <Shell data={data} style={style} center><div className="grid grid-cols-4 gap-2">{["Days","Hours","Minutes","Seconds"].map((i,n)=><div key={i} className="p-3 text-center sm:p-5" style={{background:"var(--w-surface-alt)",borderRadius:"var(--w-card-radius)"}}><strong className="text-2xl sm:text-4xl">{String(values[n]).padStart(2,"0")}</strong><div className="mt-1 text-[10px] uppercase tracking-wide sm:text-xs" style={{color:"var(--w-muted)"}}>{i}</div></div>)}</div><div className="mt-6"><Button>{data.primaryCta}</Button></div></Shell>}
function Location({data,style}:ViewProps){return <Shell data={data} style={style}><div className="grid overflow-hidden lg:grid-cols-[1.4fr_.6fr]" style={{borderRadius:"var(--w-card-radius)"}}><div className="grid min-h-72 place-items-center" style={{background:"var(--w-surface-alt)"}}><div className="text-center"><MapPin className="mx-auto" size={38} style={{color:"var(--w-primary)"}}/><p className="mt-3 text-sm">{data.items[0]||"Add your address"}</p></div></div><aside className="p-6" style={{background:"color-mix(in srgb,var(--w-primary) 10%,var(--w-surface))"}}><h3 className="font-semibold">Visit us</h3>{data.items.slice(0,4).map(i=><p key={i} className="mt-3 text-sm" style={{color:"var(--w-muted)"}}>{i}</p>)}<div className="mt-6"><Button>{data.primaryCta}<ExternalLink size={14}/></Button></div></aside></div></Shell>}
function SocialLinks({data,style}:ViewProps){return <Shell data={data} style={style}><nav aria-label="Social profiles" className="flex flex-wrap gap-3">{data.items.slice(0,6).map(i=><a href="#" onClick={prevent} key={i} className="inline-flex min-h-11 items-center gap-2 border px-4 text-sm font-semibold" style={{borderColor:"var(--w-border)",borderRadius:"var(--w-button-radius)"}}><ExternalLink size={15}/>{i}</a>)}</nav></Shell>}
function FloatingContact({data,style}:ViewProps){return <div style={{...style}} className="flex w-full justify-end"><a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 px-5 font-semibold shadow-lg" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"999px"}} aria-label={data.primaryCta}><MessageCircle/>{data.primaryCta}</a></div>}
function Cta({data,style}:ViewProps){return <section className="overflow-hidden p-7 text-center sm:p-10" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"var(--w-card-radius)",...style}}><div className="mx-auto max-w-2xl"><div className="text-xs font-bold uppercase tracking-[.2em] opacity-75">{data.eyebrow}</div><h2 className="mt-3 text-3xl font-semibold">{data.title}</h2><p className="mt-3 opacity-80">{data.body}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="min-h-11 px-5 font-semibold" style={{background:"var(--w-surface)",color:"var(--w-text)",borderRadius:"var(--w-button-radius)"}}>{data.primaryCta}</button><button className="min-h-11 border border-current px-5 font-semibold" style={{borderRadius:"var(--w-button-radius)"}}>{data.secondaryCta}</button></div></div></section>}
function Footer({data,style}:ViewProps){return <footer className="relative overflow-hidden p-6 sm:p-9" style={{background:"color-mix(in srgb,var(--w-primary) 22%,var(--w-surface))",color:"var(--w-text)",border:"1px solid var(--w-border)",borderRadius:"var(--w-card-radius)",...style}}><div className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{background:"var(--w-primary)"}}/><div className="relative grid gap-8 md:grid-cols-3"><div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center font-bold" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"var(--w-button-radius)"}}>BZ</span><h2 className="text-xl font-semibold">{data.title}</h2></div><p className="mt-3 text-sm leading-6" style={{color:"var(--w-muted)"}}>{data.body}</p></div><FooterLinks title="Explore" items={data.items.slice(0,4)}/><FooterLinks title="Company" items={["About","Contact","Privacy","Terms"]}/></div><div className="relative mt-8 border-t pt-5 text-xs" style={{borderColor:"var(--w-border)",color:"var(--w-muted)"}}>© {new Date().getFullYear()} Your company. All rights reserved.</div></footer>}
function FooterLinks({title,items}:{title:string;items:string[]}){return <nav aria-label={title}><h3 className="font-semibold">{title}</h3><div className="mt-3 grid gap-2 text-sm opacity-70">{items.map(i=><a href="#" onClick={prevent} key={i}>{i}</a>)}</div></nav>}
function SafeCode({data,style,restricted=false}:ViewProps&{restricted?:boolean}){return <Shell data={data} style={style}><div className="overflow-hidden" style={{borderRadius:"var(--w-card-radius)",background:"var(--w-text)",color:"var(--w-surface)"}}><div className="flex items-center gap-2 border-b px-4 py-3 text-xs opacity-70"><Code2 size={15}/>{restricted?"Restricted provider embed":"Code example"}</div><pre className="overflow-auto p-5 text-xs leading-6"><code>{restricted?"Safe provider URL and sandbox metadata only. Scripts and opaque HTML are blocked.":data.items.join("\n")}</code></pre></div></Shell>}
function Editorial({data,style,mode}:ViewProps&{mode:"grid"|"list"}){return <Shell data={data} style={style}><div className={mode==="grid"?"grid gap-4 md:grid-cols-3":"grid gap-3"}>{data.items.slice(0,6).map((i,n)=><article key={i} className={mode==="list"?"flex items-center gap-4 border-b py-4":"overflow-hidden border"} style={{borderColor:"var(--w-border)",borderRadius:mode==="grid"?"var(--w-card-radius)":undefined}}><div className={mode==="grid"?"aspect-video overflow-hidden":"h-20 w-28 shrink-0 overflow-hidden"} style={{borderRadius:"var(--w-button-radius)"}}><MediaImage src={DEFAULT_MEDIA[(n+3)%DEFAULT_MEDIA.length]} alt={i}/></div><div className={mode==="grid"?"p-4":"flex-1"}><div className="text-xs font-bold uppercase" style={{color:"var(--w-primary)"}}>Article · {n+1}</div><h3 className="mt-1 font-semibold">{i}</h3><p className="mt-2 text-sm" style={{color:"var(--w-muted)"}}>Add a concise excerpt that earns the reader’s next click.</p></div><ArrowRight className="mr-4 shrink-0"/></article>)}</div></Shell>}
function Categories({data,style}:ViewProps){return <Shell data={data} style={style}><nav aria-label="Content categories" className="grid gap-3 sm:grid-cols-2">{data.items.slice(0,8).map((i,n)=><a href="#" onClick={prevent} key={i} className="flex items-center justify-between border p-4 font-semibold transition hover:-translate-y-0.5" style={{borderColor:"var(--w-border)",borderRadius:"var(--w-button-radius)",background:"var(--w-surface-alt)"}}><span>{i}</span><span className="text-sm" style={{color:"var(--w-muted)"}}>{String((n+1)*6).padStart(2,"0")} <ArrowRight className="ml-2 inline" size={14}/></span></a>)}</nav></Shell>}
function Popup({data,style}:ViewProps){const [open,setOpen]=useState(false);useEffect(()=>{if(!open)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[open]);return <Shell data={data} style={style}><button type="button" onClick={()=>setOpen(true)} className="inline-flex min-h-11 items-center px-5 font-semibold" style={{background:"var(--w-primary)",color:"var(--w-primary-contrast)",borderRadius:"var(--w-button-radius)"}}>Open {data.title}</button>{open&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-5" role="presentation" onMouseDown={()=>setOpen(false)}><div role="dialog" aria-modal="true" aria-labelledby="premium-popup-title" onMouseDown={e=>e.stopPropagation()} className="relative w-full max-w-lg p-7" style={{background:"var(--w-surface)",color:"var(--w-text)",borderRadius:"var(--w-card-radius)"}}><button autoFocus aria-label="Close dialog" onClick={()=>setOpen(false)} className="absolute right-3 top-3 p-2"><X/></button><div className="text-xs font-bold uppercase" style={{color:"var(--w-primary)"}}>{data.eyebrow}</div><h2 id="premium-popup-title" className="mt-2 text-2xl font-semibold">{data.title}</h2><p className="mt-3" style={{color:"var(--w-muted)"}}>{data.body}</p><div className="mt-6"><Button>{data.primaryCta}</Button></div></div></div>}</Shell>}

type ViewProps={data:Data;style?:CSSProperties};
function normalizeData(type:string,p:Props):Data{const nestedItems=Array.isArray(p.slides)?p.slides:Array.isArray(p.galleryItems)?p.galleryItems:Array.isArray(p.questions)?p.questions:Array.isArray(p.steps)?p.steps:undefined;const derived=nestedItems?.map((item)=>{const value=item as Record<string,unknown>;return toText(value.title)||toText(value.question)||toText(value.label)}).filter(Boolean)??[];const items=derived.length?derived:toItems(p.items);const label=type.replace(/([A-Z])/g," $1").replace(/^./,c=>c.toUpperCase());return{eyebrow:toText(p.eyebrow)||label,title:toText(p.title)||`${label} section`,body:toText(p.body)||"Present useful information with a clear hierarchy and a confident next step.",primaryCta:toText(p.primaryCta)||"Get started",secondaryCta:toText(p.secondaryCta)||"Learn more",items:items.length?items:["First item","Second item","Third item","Fourth item"],nested:p}}
function toText(v:unknown){if(typeof v==="string"||typeof v==="number")return String(v).trim();return""}
function toItems(v:unknown){if(Array.isArray(v))return v.map(toText).filter(Boolean);if(typeof v==="string")return v.split(/\n|,/).map(x=>x.trim()).filter(Boolean);return[]}
function themeStyle(style?:CSSProperties,t?:WidgetTheme):CSSProperties{
  const source = { ...(style ?? {}) } as Record<string, unknown>;
  const take = (key:string,fallback:unknown) => {
    const next = source[key] ?? fallback;
    delete source[key];
    return next;
  };
  const primary=t?.primary??"#2563eb",surface=t?.surface??"#ffffff",text=t?.textPrimary??"#0f172a";
  return {
    ...source,
    "--w-primary":primary,
    "--w-primary-contrast":t?.primaryContrast??"#ffffff",
    "--w-surface":surface,
    "--w-surface-alt":t?.surfaceAlt??"#f1f5f9",
    "--w-text":text,
    "--w-muted":t?.textSecondary??"#475569",
    "--w-border":t?.border??"#dbe3ef",
    "--w-accent":t?.accent??"#f97316",
    "--w-card-radius":`${t?.cardRadius??12}px`,
    "--w-button-radius":`${t?.buttonRadius??10}px`,
    "--w-card-shadow":t?.cardShadow??"0 16px 42px rgba(15,23,42,.08)",
    "--w-element-border":take("elementBorderColor",t?.border??"#dbe3ef"),
    "--w-eyebrow-color":take("eyebrowColor",primary),
    "--w-eyebrow-font":take("eyebrowFontFamily","Inter"),
    "--w-eyebrow-size":cssSize(take("eyebrowFontSize",12)),
    "--w-eyebrow-weight":take("eyebrowFontWeight",700),
    "--w-title-color":take("titleColor",text),
    "--w-title-font":take("titleFontFamily","Inter"),
    "--w-title-size":cssSize(take("titleFontSize",30)),
    "--w-title-weight":take("titleFontWeight",600),
    "--w-body-color":take("bodyColor",t?.textSecondary??"#475569"),
    "--w-body-font":take("bodyFontFamily","Inter"),
    "--w-body-size":cssSize(take("bodyFontSize",16)),
    "--w-body-line-height":take("bodyLineHeight",1.6),
    "--w-cta-background":take("ctaBackgroundColor",primary),
    "--w-cta-color":take("ctaColor",t?.primaryContrast??"#ffffff"),
    "--w-cta-font":take("ctaFontFamily","Inter"),
    "--w-cta-size":cssSize(take("ctaFontSize",14)),
    "--w-cta-radius":cssSize(take("ctaBorderRadius",t?.buttonRadius??10)),
    "--w-media-url":take("mediaUrl",""),
    "--w-media-position":take("mediaObjectPosition","center center"),
    "--w-media-radius":cssSize(take("mediaBorderRadius",t?.cardRadius??12)),
    "--w-card-background":take("cardBackgroundColor",t?.surfaceAlt??"#f1f5f9"),
    "--w-card-text":take("cardTextColor",text),
    "--w-card-icon":take("cardIconColor",primary),
  } as CSSProperties;
}
function prevent(e:{preventDefault():void}){e.preventDefault()}
function MediaImage({src,alt}:{src:string;alt:string}){return <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" style={{objectPosition:"var(--w-media-position)"}}/>}
function mediaSource(style:CSSProperties|undefined,index:number,data?:Data){const nested=data?.nested;const list=(nested?.slides??nested?.galleryItems) as Record<string,unknown>[]|undefined;const media=nested?.media as Record<string,unknown>|undefined;const nestedSource=toText(list?.[index]?.src)||toText(media?.src);const custom=(style as Record<string,unknown>|undefined)?.["--w-media-url"]??(style as Record<string,unknown>|undefined)?.mediaUrl;return nestedSource||(typeof custom==="string"&&custom.trim()?custom:DEFAULT_MEDIA[index%DEFAULT_MEDIA.length])}
function mediaAlt(data:Data,index=0){const list=(data.nested.slides??data.nested.galleryItems) as Record<string,unknown>[]|undefined;const media=data.nested.media as Record<string,unknown>|undefined;return toText(list?.[index]?.alt)||toText(media?.alt)||data.items[index]||data.title}
function cssSize(value:unknown){return typeof value==="number"?`${value}px`:String(value)}
