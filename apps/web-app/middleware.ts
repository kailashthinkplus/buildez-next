import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ==========================================================
   1) PUBLIC ROUTES — NO AUTH REQUIRED
   ========================================================== */
const PUBLIC_ROUTES = [
  "/app/login",
  "/app/verify-otp",
  "/api/auth/login",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/api/auth/recovery-login",
  "/super/login",
  "/api/plans",
  "/api/razorpay/order",
  "/api/razorpay/verify",
  "/api/razorpay",
  "/api/billing/activate",
  "/api/billing",
  "/preview",
  "/api/preview",
];

/* ==========================================================
   2) ONBOARDING ROUTES
   ========================================================== */
const ONBOARDING_ROUTES = [
  "/app/onboarding",
  "/api/onboarding/status",
  "/api/onboarding/account-type",
  "/api/onboarding/business-details",
  "/api/onboarding/choose-plan",
  "/api/onboarding/save-domain",
  "/api/onboarding/create-tenant",
  "/api/onboarding/finish",
  "/api/tenant/me",
];

/* ==========================================================
   3) MIDDLEWARE
   ========================================================== */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
    pathname.startsWith("/.well-known")
  ) {
    console.log("⛔ ABSOLUTE EXCLUDE → ALLOW");
    return NextResponse.next();
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

// Runtime pages must have at least:
// /siteSlug/pageSlug
// Example:
//   /acme/home
//   /acme/products/chair
const isRuntime =
  parts.length >= 2 &&
  !pathname.startsWith("/app") &&
  !pathname.startsWith("/preview") &&
  !pathname.startsWith("/api");

console.log("🔎 isRuntime?", isRuntime);

if (isRuntime) {
  const url = req.nextUrl.clone();
  url.pathname = `/api/render/${parts.join("/")}`;

  console.log("🚀 RUNTIME RESOLVE");
  console.log("➡️ FROM:", pathname);
  console.log("➡️ TO:", url.pathname);

  return NextResponse.rewrite(url);
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
    return NextResponse.redirect(new URL("/app/login", req.url));
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

  const obRes = await fetch(new URL("/api/onboarding/status", req.url), {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  console.log("📡 ONBOARDING STATUS:", obRes.status);

  if (!obRes.ok) {
    console.log("❌ ONBOARDING STATUS FAILED → LOGIN");
    return NextResponse.redirect(new URL("/app/login", req.url));
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
      return NextResponse.redirect(new URL("/app/onboarding", req.url));
    }
    return NextResponse.next();
  }

  /* ---------------------------------------------------------
     G) FETCH TENANT
  --------------------------------------------------------- */
  console.log("📡 FETCH TENANT");

  const tenantRes = await fetch(new URL("/api/tenant/me", req.url), {
    headers: { cookie: req.headers.get("cookie") || "" },
    cache: "no-store",
  });

  console.log("📡 TENANT STATUS:", tenantRes.status);

  if (!tenantRes.ok) {
    console.log("❌ TENANT FETCH FAILED → LOGIN");
    return NextResponse.redirect(new URL("/app/login", req.url));
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
      return NextResponse.redirect(new URL("/app/onboarding", req.url));
    }
    return NextResponse.next();
  }

  /* ---------------------------------------------------------
     I) BLOCK /app/onboarding
  --------------------------------------------------------- */
  if (pathname.startsWith("/app/onboarding")) {
    console.log("🚫 BLOCK ONBOARDING → DASHBOARD");
    return NextResponse.redirect(new URL("/app/dashboard", req.url));
  }

  /* ---------------------------------------------------------
     J) FINAL PASS
  --------------------------------------------------------- */
  console.log("✅ FINAL NEXT()");

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  res.cookies.set("tenant-id", tenant.id, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
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
