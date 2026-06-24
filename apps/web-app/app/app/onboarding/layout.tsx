"use client";

import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import OnboardingSidebar from "./components/OnboardingSidebar";
import OnboardingHeader from "./components/OnboardingHeader";

/* -------------------------------------------------------------
   Inner layout (fully responsive, keeps sidebar full-height)
------------------------------------------------------------- */
function OnboardingInnerLayout({ children }: { children: React.ReactNode }) {
  const { step, accountType } = useOnboarding();

  return (
    <div
      className="
        bez-bg
        min-h-screen
        flex 
        flex-col md:flex-row        /* mobile stacks, desktop side-by-side */
      "
    >
      {/* DESKTOP SIDEBAR (FULL HEIGHT AUTOMATICALLY) */}
      <OnboardingSidebar
        activeStep={step}
        accountType={accountType}
        className="hidden md:block"   /* hide on mobile */
      />

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col min-h-screen">
        <OnboardingHeader />

        <main
          className="
            flex-1
            px-4 py-6               /* mobile */
            sm:px-6 sm:py-8
            md:px-12 md:py-10       /* desktop */
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   Provider wrapper
------------------------------------------------------------- */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <OnboardingInnerLayout>{children}</OnboardingInnerLayout>
    </OnboardingProvider>
  );
}
