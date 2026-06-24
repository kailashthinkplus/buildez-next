"use client";

import Image from "next/image";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthBodyBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass glass-hover p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/buildez-logo-dark.svg"
              alt="BuildEZ"
              width={150}
              height={42}
              priority
              className="dark:hidden"
            />
            <Image
              src="/buildez-logo-light.svg"
              alt="BuildEZ"
              width={150}
              height={42}
              priority
              className="hidden dark:block"
            />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
