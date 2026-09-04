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
      <footer className="fixed bottom-4 right-7 z-40 text-xs opacity-60">
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
