"use client";

export default function OnboardingCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto glass-strong rounded-3xl px-16 py-8">
      {children}
    </div>
  );
}
