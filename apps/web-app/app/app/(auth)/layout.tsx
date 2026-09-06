// /Users/kailash/buildez/apps/web-app/app/app/(auth)/layout.tsx

import ThemeToggle from "../components/ThemeToggle";
import "./auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
