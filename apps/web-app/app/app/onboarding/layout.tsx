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
        overflow-x-hidden
      "
    >
      {/* DESKTOP SIDEBAR (FULL HEIGHT AUTOMATICALLY) */}
      <OnboardingSidebar
        activeStep={step}
        accountType={accountType}
        className="hidden md:block"   /* hide on mobile */
      />

      {/* MAIN PANEL */}
      {/*
        min-w-0 overrides the flex default of min-width: auto — without
        it, this flex item refuses to shrink below its content's
        intrinsic width, so any inner content even a pixel too wide
        (a carousel row, a long label) pushes the whole panel — and the
        viewport itself — wider instead of being contained/scrolled
        internally. This is what "gutters on all sides"/"viewport is
        still off" was actually describing.
      */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <OnboardingHeader />

        <main
          className="
            min-w-0 flex-1
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
