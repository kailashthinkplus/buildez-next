import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getbuildezy.com"),
  title: "Build Ezy — Your idea. Built alive.",
  description: "Design, launch, sell, and grow from one beautifully connected website platform.",
  openGraph: {
    title: "Build Ezy — Your idea. Built alive.",
    description: "Design. Launch. Sell. Grow—from one connected platform.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Build Ezy — Your idea. Built alive." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Ezy — Your idea. Built alive.",
    description: "Design. Launch. Sell. Grow—from one connected platform.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
