import Link from "next/link";

const footerLinks = [
  { label: "Help Center", href: "/app/help" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function DashboardFooter() {
  return (
    <footer className="mt-8 flex flex-col gap-2 border-t dashboard-border pt-4 pb-1 text-xs dashboard-faint sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} BuildEZ. All rights reserved.</p>
      <nav aria-label="Dashboard footer" className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-[var(--dashboard-text)]">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
