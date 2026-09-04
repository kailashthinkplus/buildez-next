import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRedirectUrl, internalFetchUrl } from "@/lib/runtime/requestOrigin";

/* ==========================================================
   1) PUBLIC ROUTES — NO AUTH REQUIRED
   ========================================================== */
const PUBLIC_ROUTES = [
  "/app/login",
  "/app/signup",
  "/app/verify-otp",
  "/app/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/forgot-password",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/api/auth/recovery-login",
  "/super/login",
  "/api/super/auth",
  "/api/plans",
  "/api/billing/activate",
  "/api/public",
  // NOTE: "/preview" and "/api/preview" are intentionally NOT public — they
  // render a page's live/unpublished draft content and are gated by
  // getUser() + tenant-ownership checks inside the route/page themselves.
  "/api/runtime/v12",
  "/api/geo/consent-region",
  "/api/cron/publish-scheduled", // Own shared-secret auth (CRON_SECRET) — see route.ts. Called by external cron with no user session.
];

/* ==========================================================
   2) ONBOARDING ROUTES
   ========================================================== */
const ONBOARDING_ROUTES = [
  "/app/onboarding",
  "/app/profile",
  "/app/help",
  "/api/profile",
  "/api/onboarding/status",
  "/api/onboarding/account-type",
  "/api/onboarding/business-details",
  "/api/onboarding/choose-plan",
  "/api/onboarding/save-domain",
  "/api/onboarding/create-tenant",
  "/api/onboarding/finish",
  "/api/tenant/me",
];

function hasRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function internalRewriteUrl(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;

  // Behind TLS-terminating Nginx, Next builds nextUrl from the public HTTPS
  // scheme even though the private Next listener is HTTP. Without correcting
  // that internal hop, Next tries to TLS-proxy to its own HTTP port.
  if (url.protocol === "https:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    url.protocol = "http:";
  }
  return url;
}

/* ==========================================================
   3) MIDDLEWARE
   ========================================================== */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();

  console.log("\n==============================");
  console.log("🧭 MIDDLEWARE HIT");
  console.log("➡️ PATHNAME:", pathname);

  /* ---------------------------------------------------------
     🚨 ABSOLUTE EXCLUSIONS (CRITICAL FIX)
     NEVER rewrite, auth-check, or touch these
  --------------------------------------------------------- */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/llms.txt") ||
    pathname.startsWith("/.well-known")
  ) {
    console.log("⛔ ABSOLUTE EXCLUDE → ALLOW");
    return NextResponse.next();
  }

  // Custom domains are resolved by the storefront itself. Keep platform and
  // local hosts on their normal routes and rewrite all tenant-domain pages.
  const platformDomain = process.env.PLATFORM_DOMAIN || "getbuildezy.com";
  const isPlatformHost = !host || host === "localhost" || host.endsWith(".localhost") || host === platformDomain || host.endsWith(`.${platformDomain}`);
  const platformLabel = host.endsWith(`.${platformDomain}`) ? host.slice(0, -(platformDomain.length + 1)) : "";
  const isTenantPlatformSubdomain = Boolean(platformLabel) && !new Set(["app", "www", "admin", "api"]).has(platformLabel);
  const isPublicMarketingHome = pathname === "/" && isPlatformHost && (!platformLabel || platformLabel === "www") && host !== `app.${platformDomain}`;
  if (isPublicMarketingHome) {
    return NextResponse.next();
  }
  if (isTenantPlatformSubdomain && !hasRoutePrefix(pathname, "/api") && !hasRoutePrefix(pathname, "/app") && !hasRoutePrefix(pathname, "/_next")) {
    return NextResponse.rewrite(internalRewriteUrl(req, `/${platformLabel}${pathname === "/" ? "" : pathname}`));
  }
  if (!isPlatformHost && !hasRoutePrefix(pathname, "/api") && !hasRoutePrefix(pathname, "/app") && !hasRoutePrefix(pathname, "/_next")) {
    return NextResponse.rewrite(internalRewriteUrl(req, `/domain-runtime/${host}${pathname === "/" ? "" : pathname}`));
  }

  /* ---------------------------------------------------------
     A) STATIC ASSETS
  --------------------------------------------------------- */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|gif|ico|css|js|woff|woff2)$/)
  ) {
    console.log("✅ STATIC ASSET → ALLOW");
    return NextResponse.next();
  }

/* ---------------------------------------------------------
   🔥 PUBLISHED RUNTIME RESOLVER (HTML ONLY)
--------------------------------------------------------- */

// Split URL into path segments once
const parts = pathname.split("/").filter(Boolean);

// Public runtime pages use:
// /siteSlug
// /siteSlug/pageSlug
// Example:
//   /acme/home
//   /acme/products/chair
const isRuntime =
  parts.length >= 1 &&
  !hasRoutePrefix(pathname, "/app") &&
  !hasRoutePrefix(pathname, "/preview") &&
  !hasRoutePrefix(pathname, "/api");

console.log("🔎 isRuntime?", isRuntime);

if (isRuntime) {
  console.log("🚀 RUNTIME PAGE → ALLOW APP ROUTER");
  return NextResponse.next();
}

  /* ---------------------------------------------------------
     B) PUBLIC ROUTES
  --------------------------------------------------------- */
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    console.log("🟢 PUBLIC ROUTE → ALLOW");
    return NextResponse.next();
  }

   /* ---------------------------------------------------------
     C) CHECK SESSION
  --------------------------------------------------------- */
  const session =
    req.cookies.get("session")?.value ||
    req.cookies.get("__Secure-session")?.value;

  console.log("🔐 SESSION EXISTS?", Boolean(session));

  if (!session) {
    if (pathname.startsWith("/api")) {
      console.log("❌ API WITHOUT SESSION → 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("❌ NO SESSION → REDIRECT LOGIN");
    return NextResponse.redirect(publicRedirectUrl(req, "/app/login"));
  }

  /* ---------------------------------------------------------
     D) ONBOARDING ROUTES
  --------------------------------------------------------- */
  if (ONBOARDING_ROUTES.some((route) => pathname.startsWith(route))) {
    console.log("🟡 ONBOARDING ROUTE → ALLOW");
    return NextResponse.next();
  }

  /* ---------------------------------------------------------
     E) FETCH ONBOARDING STATUS
  --------------------------------------------------------- */
  console.log("📡 FETCH ONBOARDING STATUS");

  const obRes = await fetch(internalFetchUrl("/api/onboarding/status"), {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  console.log("📡 ONBOARDING STATUS:", obRes.status);

  if (!obRes.ok) {
    if (obRes.status === 401 || obRes.status === 403) {
      console.log("❌ ONBOARDING SESSION REJECTED → LOGIN");
      return NextResponse.redirect(publicRedirectUrl(req, "/app/login"));
    }
    console.error("❌ ONBOARDING STATUS UNAVAILABLE → ALLOW PAGE ERROR UI", obRes.status);
    return NextResponse.next();
  }

  const obData = await obRes.json();
  const onboardingComplete = Boolean(obData?.completed);

  console.log("✅ ONBOARDING COMPLETE?", onboardingComplete);

  /* ---------------------------------------------------------
     F) FORCE ONBOARDING
  --------------------------------------------------------- */
  if (!onboardingComplete) {
    console.log("⛔ FORCE ONBOARDING");
    if (!pathname.startsWith("/app/onboarding")) {
      return NextResponse.redirect(publicRedirectUrl(req, "/app/onboarding"));
    }
    return NextResponse.next();
  }

  /* ---------------------------------------------------------
     G) FETCH TENANT
  --------------------------------------------------------- */
  console.log("📡 FETCH TENANT");

  const tenantRes = await fetch(internalFetchUrl("/api/tenant/me"), {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  console.log("📡 TENANT STATUS:", tenantRes.status);

  if (!tenantRes.ok) {
    if (tenantRes.status === 401 || tenantRes.status === 403) {
      console.log("❌ TENANT SESSION REJECTED → LOGIN");
      return NextResponse.redirect(publicRedirectUrl(req, "/app/login"));
    }
    console.error("❌ TENANT FETCH UNAVAILABLE → ALLOW PAGE ERROR UI", tenantRes.status);
    return NextResponse.next();
  }

  const tenantData = await tenantRes.json();
  const tenant = tenantData?.data?.tenant;

  console.log("🏢 TENANT:", tenant?.id);

  /* ---------------------------------------------------------
     H) NO TENANT
  --------------------------------------------------------- */
  if (!tenant) {
    console.log("❌ NO TENANT → FORCE ONBOARDING");
    if (!pathname.startsWith("/app/onboarding")) {
      return NextResponse.redirect(publicRedirectUrl(req, "/app/onboarding"));
    }
    return NextResponse.next();
  }

  /* ---------------------------------------------------------
     I) BLOCK /app/onboarding
  --------------------------------------------------------- */
  if (pathname.startsWith("/app/onboarding")) {
    console.log("🚫 BLOCK ONBOARDING → DASHBOARD");
    return NextResponse.redirect(publicRedirectUrl(req, "/app/dashboard"));
  }

  /* ---------------------------------------------------------
     J) FINAL PASS
  --------------------------------------------------------- */
  console.log("✅ FINAL NEXT()");

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  res.cookies.set("tenant-id", tenant.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

/* ==========================================================
   3) BUILDER V2 API ROUTES
========================================================== */

const BUILDER_V2_API_ROUTES = [
  "/api/builder-v2",
];

/* ==========================================================
   4) ROUTE MATCHER
========================================================== */
export const config = {
  matcher: [
    "/app/:path*",
    "/preview/:path*",
    "/api/:path*",
    "/((?!_next/|assets/|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp|.*\\.gif).*)",
  ],
};
