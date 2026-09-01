"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type PublicIntegrations = {
  googleAnalytics: { measurementId: string } | null;
  meta: { pixelId: string } | null;
  hotjar: { siteId: string } | null;
  microsoftClarity: { projectId: string } | null;
  linkedin: { partnerId: string } | null;
};

// Defense in depth: config is already validated server-side before it is stored, but since
// these values are interpolated directly into inline <script> tags, re-check the shape here
// too before ever letting a value reach a template literal.
const PATTERNS = {
  measurementId: /^G-[A-Z0-9]{6,12}$/i,
  pixelId: /^[0-9]{10,20}$/,
  hotjarSiteId: /^[0-9]{5,10}$/,
  clarityProjectId: /^[a-z0-9]{6,20}$/i,
  linkedinPartnerId: /^[0-9]{4,10}$/,
};

export function SiteIntegrationsScripts({ siteId }: { siteId: string }) {
  const [config, setConfig] = useState<PublicIntegrations | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/site-integrations/${encodeURIComponent(siteId)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => { if (!cancelled) setConfig(payload); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [siteId]);

  if (!config) return null;

  const ga = config.googleAnalytics?.measurementId && PATTERNS.measurementId.test(config.googleAnalytics.measurementId)
    ? config.googleAnalytics.measurementId : null;
  const pixelId = config.meta?.pixelId && PATTERNS.pixelId.test(config.meta.pixelId) ? config.meta.pixelId : null;
  const hotjarId = config.hotjar?.siteId && PATTERNS.hotjarSiteId.test(config.hotjar.siteId) ? config.hotjar.siteId : null;
  const clarityId = config.microsoftClarity?.projectId && PATTERNS.clarityProjectId.test(config.microsoftClarity.projectId)
    ? config.microsoftClarity.projectId : null;
  const linkedinId = config.linkedin?.partnerId && PATTERNS.linkedinPartnerId.test(config.linkedin.partnerId)
    ? config.linkedin.partnerId : null;

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="buildez-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {pixelId && (
        <Script id="buildez-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {hotjarId && (
        <Script id="buildez-hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${Number(hotjarId)},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      )}
      {clarityId && (
        <Script id="buildez-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}
      {linkedinId && (
        <>
          <Script id="buildez-linkedin-insight" strategy="afterInteractive">
            {`_linkedin_partner_id='${linkedinId}';window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);`}
          </Script>
          <Script id="buildez-linkedin-insight-src" strategy="afterInteractive" src="https://snap.licdn.com/li.lms-analytics/insight.min.js" />
          <noscript>
            <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://px.ads.linkedin.com/collect/?pid=${linkedinId}&fmt=gif`} />
          </noscript>
        </>
      )}
    </>
  );
}
