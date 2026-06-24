export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-[rgb(var(--be-bg))] text-white">
      {children}
    </div>
  );
}
