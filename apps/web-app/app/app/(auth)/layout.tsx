// /Users/kailash/buildez/apps/web-app/app/app/(auth)/layout.tsx

import ThemeToggle from "../components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-blue-bg min-h-screen w-full">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Centered Auth Content */}
      <div className="min-h-screen flex items-center justify-center px-4">
        {children}
      </div>

      <footer className="pb-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} BuildEZ ·
        <a href="/terms" className="ml-1 hover:underline">
          Terms
        </a>{" "}
        ·
        <a href="/privacy" className="ml-1 hover:underline">
          Privacy
        </a>
      </footer>
    </div>
  );
}
