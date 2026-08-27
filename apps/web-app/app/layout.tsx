// /Users/kailash/buildez/apps/web-app/app/layout.tsx

import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";

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
