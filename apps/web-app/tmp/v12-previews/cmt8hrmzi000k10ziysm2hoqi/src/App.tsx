import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SiteShell } from './components/SiteShell';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { CraftsmanshipPage } from './pages/CraftsmanshipPage';
import { ViewingPage } from './pages/ViewingPage';
function ScrollReset() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}
export default function App() {
    return (<SiteShell>
      <ScrollReset />
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/collection" element={<CollectionPage />}/>
        <Route path="/craftsmanship" element={<CraftsmanshipPage />}/>
        <Route path="/private-viewing" element={<ViewingPage />}/>
        <Route path="*" element={<HomePage />}/>
      </Routes>
    </SiteShell>);
}
