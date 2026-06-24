"use client";

import OnboardingSidebar from "./components/OnboardingSidebar";
import OnboardingHeader from "./components/OnboardingHeader";

export default function OnboardingClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[280px] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl">
        <OnboardingSidebar />
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex flex-1 flex-col">
        {/* HEADER */}
        <header className="h-16 shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <OnboardingHeader />
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#060B1A] via-[#0B1226] to-[#060B1A] px-12 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
