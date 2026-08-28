import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
const links = [
    ['Collection', '/collection'],
    ['Craftsmanship', '/craftsmanship'],
    ['Private viewing', '/private-viewing']
];
export function SiteShell({ children }: {
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    useEffect(() => { setOpen(false); }, [location.pathname]);
    return (<div className="site-shell" data-buildez-id="be-ed1495d5e9eb61" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="469" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
      <a className="skip-link" href="#main" data-buildez-id="be-409051eaa4e42e" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="504" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="60">Skip to content</a>
      <header className="site-header" data-buildez-id="be-6aaa6e9c7719e5" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="568" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
        <Link to="/" className="wordmark" aria-label="Aeternum home">AETERNUM</Link>
        <button className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)} data-buildez-id="be-66fb9359b850cd" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="694" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography,link,accessibility" data-buildez-revision="60">
          <span data-buildez-id="be-9eead0a84a37aa" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="814" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60">{open ? 'Close' : 'Menu'}</span><i data-buildez-id="be-c88c570d5f722c" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="852" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"/>
        </button>
        <nav id="main-nav" className={open ? 'nav open' : 'nav'} aria-label="Primary navigation" data-buildez-id="be-1da74c29d8ee6f" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="884" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
          {links.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
      </header>
      <main id="main" data-buildez-id="be-6d4ac4e663ff4c" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="1095" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">{children}</main>
      <footer className="site-footer" data-buildez-id="be-d11011a7492ae7" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="1135" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">
        <div data-buildez-id="be-b51cc1c6a3e437" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="1176" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60"><Link to="/" className="wordmark">AETERNUM</Link><p data-buildez-id="be-d2617245563c1b" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="1230" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60">Time, considered beyond measure.</p></div>
        <nav aria-label="Footer navigation" data-buildez-id="be-bf4861f3f04442" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="1284" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural" data-buildez-revision="60">{links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}</nav>
        <p className="footer-note" data-buildez-id="be-a5e240a03a21f2" data-buildez-kind="element" data-buildez-source-file="src/components/SiteShell.tsx" data-buildez-source-anchor="1402" data-buildez-capabilities="data,spacing,layout,background,border,responsive,structural,text,typography" data-buildez-revision="60">A cinematic concept in contemporary horology.</p>
      </footer>
    </div>);
}
