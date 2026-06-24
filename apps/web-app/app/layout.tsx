// /Users/kailash/buildez/apps/web-app/app/layout.tsx

import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import Script from "next/script";

export const metadata = {
  title: "BuildEZ",
  description: "AI-powered Website Builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="theme-transition">

        {/* ⭐ Load Razorpay Checkout (Fixes: window.Razorpay is not a constructor) */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

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
