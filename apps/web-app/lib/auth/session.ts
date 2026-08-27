// /apps/web-app/lib/auth/session.ts
import { cookies } from "next/headers";
import { AuthProvider, prisma } from "@buildez/db";

const isProd = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = isProd ? "__Secure-session" : "session";
export const SESSION_COOKIE_NAMES = ["__Secure-session", "session"] as const;

function sessionIdsFromRequest(req?: Request) {
  if (!req) return [] as string[];
  const values = new Map<string, string>();
  for (const item of (req.headers.get("cookie") || "").split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    values.set(item.slice(0, separator).trim(), item.slice(separator + 1).trim());
  }
  return SESSION_COOKIE_NAMES.flatMap((name) => {
    const value = values.get(name);
    return value ? [value] : [];
  });
}

async function currentSessionIds(req?: Request) {
  if (req) return [...new Set(sessionIdsFromRequest(req))];
  const cookieStore = await cookies();
  return [...new Set(SESSION_COOKIE_NAMES.flatMap((name) => {
    const value = cookieStore.get(name)?.value;
    return value ? [value] : [];
  }))];
}

/* ======================
   CREATE SESSION
====================== */
export async function createSession({
  user,
  provider,
  ttlHours = 24,
}: {
  user: any;
  provider: AuthProvider;
  ttlHours?: number;
}) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const cookieStore = await cookies();

  // Account switching must invalidate every session presented by this browser.
  const previousSessionIds = await currentSessionIds();
  if (previousSessionIds.length) {
    await prisma.session.updateMany({
      where: { id: { in: previousSessionIds } },
      data: { revoked: true },
    });
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      provider,
      expiresAt,
      ipAddress: "",
      userAgent: "",
    },
  });

  cookieStore.set({
    name: SESSION_COOKIE,
    value: session.id,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  for (const name of SESSION_COOKIE_NAMES) {
    if (name === SESSION_COOKIE) continue;
    cookieStore.set({
      name,
      value: "",
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
    });
  }

  for (const name of ["tenant-id", "tenant-user-id", "tenantId", "buildez_tenant", "workspaceId"]) {
    cookieStore.set({
      name,
      value: "",
      path: "/",
      expires: new Date(0),
      secure: isProd,
      sameSite: "lax",
    });
  }

  return session;
}

/* ======================
   DELETE SESSION
====================== */
export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionIds = await currentSessionIds();

  if (sessionIds.length) {
    await prisma.session.updateMany({
      where: { id: { in: sessionIds } },
      data: { revoked: true },
    });
  }

  for (const name of [
    ...SESSION_COOKIE_NAMES,
    "tenant-id",
    "tenant-user-id",
    "tenantId",
    "buildez_tenant",
    "workspaceId",
    "onboarding",
  ]) {
    cookieStore.set({
      name,
      value: "",
      path: "/",
      expires: new Date(0),
      secure: isProd,
      sameSite: "lax",
      ...(SESSION_COOKIE_NAMES.includes(name as (typeof SESSION_COOKIE_NAMES)[number])
        ? { httpOnly: true }
        : {}),
    });
  }
}

/* ======================
   GET CURRENT USER
====================== */
export async function getCurrentUser(req?: Request) {
  const sessionIds = await currentSessionIds(req);
  if (!sessionIds.length) return null;

  const sessions = await prisma.session.findMany({
    where: {
      id: { in: sessionIds },
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          ownedTenants: true,  // tenants where user is OWNER
          tenantUsers: true,   // tenants where user is MEMBER
          teamMemberships: {
            include: {
              team: true,
            },
          },
        },
      },
    },
  });

  if (!sessions.length) return null;

  // Two cookies resolving to different users is an unsafe, ambiguous identity.
  // Fail closed instead of displaying either user's data.
  if (new Set(sessions.map((session) => session.userId)).size !== 1) return null;

  return sessions[0].user;
}

export async function getCurrentSession(req?: Request) {
  const sessionIds = await currentSessionIds(req);
  if (!sessionIds.length) return null;
  const sessions = await prisma.session.findMany({
    where: {
      id: { in: sessionIds },
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!sessions.length) return null;
  if (new Set(sessions.map((session) => session.userId)).size !== 1) return null;
  return sessions[0];
}

export const getSessionUser = getCurrentUser;

/* ======================
   REQUIRE USER
====================== */
export async function requireUser(req?: Request) {
  const user = await getCurrentUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}
