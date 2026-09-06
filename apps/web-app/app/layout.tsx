// /Users/kailash/buildez/apps/web-app/app/layout.tsx

import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://getbuildezy.com"),
  title: "Build Ezy - Your idea. Built alive.",
  description: "Design, launch, sell, and grow from one beautifully connected website platform.",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.png"],
  },
  openGraph: {
    title: "Build Ezy - Your idea. Built alive.",
    description: "Design. Launch. Sell. Grow—from one connected platform.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Build Ezy - Your idea. Built alive." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Ezy - Your idea. Built alive.",
    description: "Design. Launch. Sell. Grow—from one connected platform.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="theme-transition">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
