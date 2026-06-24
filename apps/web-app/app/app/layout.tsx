// /Users/kailash/buildez/apps/web-app/app/app/layout.tsx

export default function AppGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // IMPORTANT:
  // This layout must stay a pure Server Component.
  // No redirect(), no DB calls, no client hooks.
  // It simply provides the wrapping <div> for the /app/* UI.

  return <>{children}</>;
}
