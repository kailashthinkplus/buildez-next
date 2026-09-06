import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AuthSplitShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="auth-split-page">
      <section className="auth-visual" aria-label="Build Ezy product preview">
        <div className="auth-visual-mock" aria-hidden="true">
          <div className="auth-orb auth-orb-a" />
          <div className="auth-orb auth-orb-b" />
          <div className="auth-orb auth-orb-c" />
          <div className="auth-grid" />
          <div className="auth-panels">
            <div className="auth-panel auth-panel-1"><i /><i /><i /></div>
            <div className="auth-panel auth-panel-2"><i /><i /></div>
            <div className="auth-panel auth-panel-3"><i /></div>
            <div className="auth-panel auth-panel-4"><i /><i /><i /><i /></div>
          </div>
          <div className="auth-sparks">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <svg className="auth-links" viewBox="0 0 600 700" aria-hidden="true">
            <line x1="150" y1="180" x2="330" y2="120" />
            <line x1="330" y1="120" x2="470" y2="260" />
            <line x1="150" y1="180" x2="230" y2="330" />
            <line x1="230" y1="330" x2="470" y2="260" />
          </svg>
        </div>
        <div className="auth-visual-shade" />
        <div className="auth-visual-copy">
          <div className="auth-visual-logo">
            <Image src="/buildez-logo-light.svg" alt="BuildEZ" width={130} height={36} priority className="dark:hidden" />
            <Image src="/buildez-logo-dark.svg" alt="BuildEZ" width={130} height={36} priority className="hidden dark:block" />
          </div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="auth-proof"><i /> Design <b><ArrowRight size={14} aria-hidden="true" /></b> Launch <b><ArrowRight size={14} aria-hidden="true" /></b> Grow</div>
        </div>
      </section>
      <section className="auth-form-side auth-blue-bg">
        <div className="auth-form-glow" />
        <div className="auth-form-wrap">{children}</div>
      </section>
    </main>
  );
}
