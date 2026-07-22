"use client";
import { useEffect } from "react";

const endpoint = "/api/public/analytics/events";
function id(key: string) { let value = localStorage.getItem(key); if (!value) { value = crypto.randomUUID(); localStorage.setItem(key, value); } return value; }
export function trackAnalyticsEvent(siteId: string, eventType: "click" | "conversion", metadata?: Record<string, unknown>) {
  const visitorId = id("buildez_visitor_id"), sessionKey = "buildez_analytics_session";
  const sessionId = sessionStorage.getItem(sessionKey) || crypto.randomUUID(); sessionStorage.setItem(sessionKey, sessionId);
  const payload = JSON.stringify({ siteId, eventType, visitorId, sessionId, domain: location.hostname, path: location.pathname + location.search, referrer: document.referrer, metadata });
  if (navigator.sendBeacon) navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
  else void fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
}
export function AnalyticsTracker({ siteId }: { siteId: string }) {
  useEffect(() => {
    const visitorId = id("buildez_visitor_id"); const sessionKey = "buildez_analytics_session"; const raw = sessionStorage.getItem(sessionKey); const sessionId = raw || crypto.randomUUID(); if (!raw) sessionStorage.setItem(sessionKey, sessionId);
    const send = (eventType: string, metadata?: Record<string, unknown>) => { const payload = JSON.stringify({ siteId, eventType, visitorId, sessionId, domain: location.hostname, path: location.pathname + location.search, referrer: document.referrer, metadata }); if (navigator.sendBeacon) navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" })); else void fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }); };
    send("pageview");
    const click = (event: MouseEvent) => { const element = (event.target as HTMLElement).closest("a,button,[role=button]") as HTMLElement | null; if (!element) return; send("click", { tag: element.tagName.toLowerCase(), text: (element.innerText || element.getAttribute("aria-label") || "").trim().slice(0, 120), href: element instanceof HTMLAnchorElement ? element.href : undefined, xPercent: Math.round((event.clientX / Math.max(1, window.innerWidth)) * 1000) / 10, yPercent: Math.round(((event.clientY + window.scrollY) / Math.max(1, document.documentElement.scrollHeight)) * 1000) / 10, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight }); };
    document.addEventListener("click", click, { capture: true }); const heartbeat = window.setInterval(() => send("heartbeat", { visible: !document.hidden }), 30000);
    return () => { document.removeEventListener("click", click, { capture: true }); window.clearInterval(heartbeat); };
  }, [siteId]);
  return null;
}
