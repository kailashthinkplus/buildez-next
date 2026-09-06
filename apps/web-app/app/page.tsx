import "./marketing.css";
import type { Metadata } from "next";
import { HomeNav } from "@/components/marketing/home/HomeNav";
import { Hero } from "@/components/marketing/home/Hero";
import { BuildWithAI } from "@/components/marketing/home/BuildWithAI";
import { ProductJourney } from "@/components/marketing/home/ProductJourney";
import { ImmersiveShowcase } from "@/components/marketing/home/ImmersiveShowcase";
import { PlatformOrbit } from "@/components/marketing/home/PlatformOrbit";
import { CraftSection } from "@/components/marketing/home/CraftSection";
import { MadeForYourMoment } from "@/components/marketing/home/MadeForYourMoment";
import { BuildManageGrow } from "@/components/marketing/home/BuildManageGrow";
import { SearchReadySummary } from "@/components/marketing/home/SearchReadySummary";
import { FinalCTA } from "@/components/marketing/home/FinalCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { AnalyticsConsent } from "@/components/marketing/home/AnalyticsConsent";

export const metadata: Metadata = {
  title: "Build Ezy: AI Website Builder for Modern Businesses",
  description:
    "Build a professional website with AI, visual editing, commerce, CRM, domains, publishing, and analytics in one connected platform. No code required.",
  applicationName: "Build Ezy",
  creator: "Build Ezy",
  publisher: "Build Ezy",
  category: "Website builder",
  alternates: { canonical: "https://getbuildezy.com/" },
  openGraph: {
    type: "website",
    url: "https://getbuildezy.com/",
    siteName: "Build Ezy",
    title: "Build Ezy: AI Website Builder for Modern Businesses",
    description:
      "Design, launch, sell, and grow with AI, visual editing, commerce, CRM, domains, publishing, and analytics in one connected platform.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Build Ezy AI website builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Ezy: AI Website Builder for Modern Businesses",
    description: "Design, launch, sell, and grow from one connected AI-powered website platform.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://getbuildezy.com/#organization",
      name: "Build Ezy",
      url: "https://getbuildezy.com",
      logo: "https://getbuildezy.com/buildez-logo-dark.svg",
      sameAs: [
        "https://www.linkedin.com/company/build-ezy-india/",
        "https://x.com/getbuildezy",
        "https://www.instagram.com/buildezy.ai/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://getbuildezy.com/#website",
      url: "https://getbuildezy.com",
      name: "Build Ezy",
      alternateName: "BuildEzy",
      description: "AI-powered website builder and business operating system.",
      inLanguage: "en",
      publisher: { "@id": "https://getbuildezy.com/#organization" },
    },
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": "https://getbuildezy.com/#software",
      url: "https://getbuildezy.com/",
      name: "Build Ezy",
      alternateName: "BuildEzy",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern web browser",
      isAccessibleForFree: true,
      description:
        "An AI-powered website operating system for designing, launching, selling, and growing a business online—visual builder, ecommerce, CRM, analytics, and AI agents in one connected platform.",
      offers: { "@type": "Offer", priceCurrency: "USD", price: "0", description: "Free plan available" },
      featureList: [
        "AI website generation",
        "Visual responsive page builder",
        "Website publishing and custom domains",
        "Connected commerce and payments",
        "Customer relationship management",
        "Website analytics and business intelligence",
      ],
      potentialAction: {
        "@type": "RegisterAction",
        target: "https://getbuildezy.com/app/signup",
        name: "Create a Build Ezy account",
      },
      publisher: { "@id": "https://getbuildezy.com/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": "https://getbuildezy.com/#webpage",
      url: "https://getbuildezy.com/",
      name: "Build Ezy: AI Website Builder for Modern Businesses",
      description:
        "Build a professional website with AI, visual editing, commerce, CRM, domains, publishing, and analytics in one connected platform.",
      isPartOf: { "@id": "https://getbuildezy.com/#website" },
      about: { "@id": "https://getbuildezy.com/#software" },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://assets.getbuildez.com/marketing/homepage/hero/developer-building.png",
        width: 1536,
        height: 1024,
      },
      inLanguage: "en",
    },
  ],
};

export default function Home() {
  return (
    <main className="buildezy-marketing site-shell">
      <link rel="preconnect" href="https://assets.getbuildez.com" />
      <link rel="dns-prefetch" href="https://assets.getbuildez.com" />
      <link
        rel="preload"
        as="image"
        href="https://assets.getbuildez.com/marketing/homepage/hero/developer-building.avif?v=20260906-3"
        type="image/avif"
        fetchPriority="high"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <HomeNav />
      <Hero />
      <BuildWithAI />
      <ProductJourney />
      <ImmersiveShowcase />
      <PlatformOrbit />
      <CraftSection />
      <MadeForYourMoment />
      <BuildManageGrow />
      <SearchReadySummary />
      <FinalCTA />
      <MarketingFooter forceDark />
      <AnalyticsConsent />
    </main>
  );
}
