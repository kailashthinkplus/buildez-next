// app/(runtime)/layout.tsx

export const dynamic = "force-static";
export const revalidate = false;

export default function RuntimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🚫 NO html
  // 🚫 NO body
  // 🚫 NO ThemeProvider
  // 🚫 NO scripts
  // 🚫 NO CSS
  // 🚫 NO Razorpay

  return children;
}
