import Link from "next/link";

type SocialName = "linkedin" | "x" | "instagram" | "youtube";

function SocialIcon({ name }: { name: SocialName }) {
  if (name === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.2H3.2V21h3.3V8.2ZM4.85 3A1.92 1.92 0 1 0 4.84 6.84 1.92 1.92 0 0 0 4.85 3ZM21 13.65c0-3.86-2.06-5.66-4.81-5.66a4.15 4.15 0 0 0-3.75 2.06V8.2H9.13V21h3.31v-6.34c0-1.67.32-3.29 2.39-3.29 2.04 0 2.06 1.91 2.06 3.4V21H21v-7.35Z" /></svg>;
  if (name === "x") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-6.4L6.45 22H3.33l7.27-8.31L2.95 2h6.41l4.43 5.86L18.9 2Zm-1.1 17.84h1.73L8.42 4.05H6.57L17.8 19.84Z" /></svg>;
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.3 2h9.4A5.3 5.3 0 0 1 22 7.3v9.4a5.3 5.3 0 0 1-5.3 5.3H7.3A5.3 5.3 0 0 1 2 16.7V7.3A5.3 5.3 0 0 1 7.3 2Zm-.18 2A3.12 3.12 0 0 0 4 7.12v9.76A3.12 3.12 0 0 0 7.12 20h9.76A3.12 3.12 0 0 0 20 16.88V7.12A3.12 3.12 0 0 0 16.88 4H7.12Zm10.13 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.37.51A3.02 3.02 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.62V8.38L15.86 12 9.6 15.62Z" /></svg>;
}

export function MarketingFooter({ forceDark = false }: { forceDark?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link href="/" className="brand" aria-label="BuildEzy home">
          {forceDark ? (
            <img className="official-logo" src="/buildez-logo-dark.svg" alt="BuildEzy" />
          ) : (
            <>
              <img className="official-logo dark:hidden" src="/buildez-logo-light.svg" alt="BuildEzy" />
              <img className="official-logo hidden dark:block" src="/buildez-logo-dark.svg" alt="" />
            </>
          )}
        </Link>
        <p>Design. Launch. Sell. Grow.<br />One connected place to build.</p>
        <div className="social-links" aria-label="Social media">
          <a href="https://www.linkedin.com/company/build-ezy-india/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a>
          <a href="https://x.com/getbuildezy" target="_blank" rel="noopener noreferrer" aria-label="X"><SocialIcon name="x" /></a>
          <a href="https://www.instagram.com/buildezy.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><SocialIcon name="instagram" /></a>
        </div>
      </div>
      <div className="footer-column"><h3>Product</h3><Link href="/#platform">Platform</Link><Link href="/pricing">Pricing</Link><Link href="/changelog">Changelog</Link><Link href="/blog">Blogs</Link><Link href="/affiliates">Affiliate Page</Link></div>
      <div className="footer-column"><h3>Support</h3><Link href="/faq">Help Center</Link><Link href="/report-bugs">Report Bugs</Link><Link href="/report-abuse">Report Abuse Contact</Link></div>
      <div className="footer-column"><h3>Legal</h3><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link><Link href="/refunds">Cancellations &amp; Refunds</Link><Link href="/cookies">Cookies</Link><Link href="/dpa">DPA</Link></div>
      <div className="footer-bottom"><span>© 2026 BuildEzy. A product of Appwire LLP.</span><span>Made in India 🇮🇳</span></div>
    </footer>
  );
}
