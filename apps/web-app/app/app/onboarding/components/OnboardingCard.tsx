"use client";

export default function OnboardingCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-3xl glass-strong px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      {children}
    </div>
  );
}
