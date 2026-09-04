import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="marketing-standard-header">
      <Link href="/" className="marketing-standard-brand" aria-label="BuildEzy home">
        <img src="/buildez-logo-light.svg" alt="BuildEzy" className="dark:hidden" />
        <img src="/buildez-logo-dark.svg" alt="" className="hidden dark:block" />
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#platform">Platform</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">Support</Link>
      </nav>
      <div className="marketing-standard-actions">
        <Link href="/app/login" className="marketing-standard-login">Log in</Link>
        <Link href="/app/signup" className="marketing-standard-cta">Signup</Link>
      </div>
    </header>
  );
}
