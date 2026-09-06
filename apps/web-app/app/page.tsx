import "./marketing.css";
import { HomeNav } from "@/components/marketing/home/HomeNav";
import { Hero } from "@/components/marketing/home/Hero";
import { BuildWithAI } from "@/components/marketing/home/BuildWithAI";
import { ProductJourney } from "@/components/marketing/home/ProductJourney";
import { ImmersiveShowcase } from "@/components/marketing/home/ImmersiveShowcase";
import { PlatformOrbit } from "@/components/marketing/home/PlatformOrbit";
import { CraftSection } from "@/components/marketing/home/CraftSection";
import { MadeForYourMoment } from "@/components/marketing/home/MadeForYourMoment";
import { BuildManageGrow } from "@/components/marketing/home/BuildManageGrow";
import { FinalCTA } from "@/components/marketing/home/FinalCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { AnalyticsConsent } from "@/components/marketing/home/AnalyticsConsent";

export default function Home() {
  return (
    <main className="buildezy-marketing site-shell">
      <HomeNav />
      <Hero />
      <BuildWithAI />
      <ProductJourney />
      <ImmersiveShowcase />
      <PlatformOrbit />
      <CraftSection />
      <MadeForYourMoment />
      <BuildManageGrow />
      <FinalCTA />
      <MarketingFooter forceDark />
      <AnalyticsConsent />
    </main>
  );
}
